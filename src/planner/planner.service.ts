import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AiService } from '../ai/ai.service';
import { PlannerRequestDto } from './dto/planner-request.dto';
import { autoSchedule } from './utils/auto-scheduler';
import { Task } from './entities/task.entity';
import { RecurrenceRule } from './entities/recurrence-rule.entity';
import { CalendarService } from '../calendar/calendar.service';

// ── SOLO tipos (isolatedModules)
import type { RequestUser } from 'src/common/types/request-user';
import type { TaskIn, ScheduledTask } from './utils/auto-scheduler';

/** Resultado que devuelve la IA (equivalente al schema validado por Zod) */
type AiTask = {
  title: string;
  description?: string;
  durationMin?: number;
  priority?: 'low' | 'med' | 'high';
  deadlineISO?: string;
  preferredWindow?: { start: string; end: string };
  recurrence?: {
    freq: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    interval: number;
    byWeekday?: number[];
  };
};

/** Evento “externo” mínimo (para mezclar con Task en getCalendar) */
type ExternalEvent = {
  id?: string;
  title: string;
  startAt?: Date;
  endAt?: Date;
};

@Injectable()
export class PlannerService {
  constructor(
    private readonly ai: AiService,
    @InjectRepository(Task) private readonly tasksRepo: Repository<Task>,
    @InjectRepository(RecurrenceRule)
    private readonly recurRepo: Repository<RecurrenceRule>,
    private readonly calendar: CalendarService,
  ) {}

  ensureSameUserOrAdmin(userId: string, user: RequestUser): void {
    if (user.role !== 'ADMIN' && user.id !== userId) {
      throw new ForbiddenException('Forbidden');
    }
  }

  async createOrUpdatePlan(userId: string, dto: PlannerRequestDto) {
    const timezone =
      dto.constraints?.timezone ||
      process.env.PLANNER_TIMEZONE ||
      'America/El_Salvador';

    const defaults = {
      durationMin: Number(process.env.PLANNER_DEFAULT_TASK_MIN ?? 30),
      priority: 'med' as const,
    };

    // 1) tasksInput sin `any`
    let tasksInput: TaskIn[] = dto.tasks ?? [];

    if (dto.brief && process.env.USE_AI_PLANNER === 'true') {
      // Tipamos explícitamente lo que devuelve la IA
      const aiTasks: AiTask[] = await this.ai.parseBrief(
        dto.brief,
        timezone,
        defaults,
      );

      // Convertimos AiTask -> TaskIn
      const aiAsTaskIn: TaskIn[] = aiTasks.map((t) => ({
        title: t.title,
        description: t.description,
        durationMin: t.durationMin,
        priority: t.priority,
        deadlineISO: t.deadlineISO,
        preferredWindow: t.preferredWindow,
        recurrence: t.recurrence,
      }));

      tasksInput = tasksInput.concat(aiAsTaskIn);
    }

    // 2) Auto-schedule tipado (ScheduledTask incluye startAt/endAt)
    let scheduled: ScheduledTask[] = tasksInput as ScheduledTask[];

    if (dto.autoschedule) {
      scheduled = autoSchedule({
        tasks: tasksInput,
        constraints: {
          workingDays: dto.constraints?.workingDays ?? [1, 2, 3, 4, 5],
          workHours:
            dto.constraints?.workHours ??
            ({ start: '08:00', end: '18:00' } as const),
          horizonDays:
            dto.constraints?.horizonDays ??
            Number(process.env.PLANNER_RECURRENCE_HORIZON_DAYS ?? 30),
          noOverlap: dto.constraints?.noOverlap ?? true,
          timezone,
        },
        existing: await this.tasksRepo.find({ where: { userId } }),
      });
    }

    // 3) Persistencia sin `any`
    const toSave: Task[] = [];

    for (const t of scheduled) {
      let recurrenceRuleId: string | undefined;

      if (t.recurrence) {
        const rule = this.recurRepo.create({
          userId,
          freq: t.recurrence.freq,
          interval: t.recurrence.interval,
          byWeekday: t.recurrence.byWeekday,
          timezone,
        });
        const savedRule = await this.recurRepo.save(rule);
        recurrenceRuleId = savedRule.id;
      }

      const entity = this.tasksRepo.create({
        userId,
        title: t.title,
        description: t.description ?? undefined,
        status: 'todo',
        startAt: t.startAt, // ScheduledTask ya trae Date | undefined
        endAt: t.endAt,
        durationMin: t.durationMin,
        priority: t.priority ?? 'med',
        recurrenceRuleId,
        autoScheduled: !!dto.autoschedule,
      });

      toSave.push(entity);
    }

    const savedTasks = await this.tasksRepo.save(toSave);

    // 4) Sincronizar con calendario externo (si está habilitado)
    if (
      dto.syncToCalendar !== false &&
      typeof this.calendar?.syncTasksToExternalCalendar === 'function'
    ) {
      await this.calendar.syncTasksToExternalCalendar(userId, savedTasks);
    }

    // 5) Respuesta
    return {
      scheduled: savedTasks.map((s) => ({
        id: s.id,
        title: s.title,
        startAt: s.startAt,
        endAt: s.endAt,
        priority: s.priority,
      })),
      created: savedTasks.length,
      updated: 0,
      notes: [] as string[],
    };
  }

  async getCalendar(
    userId: string,
    opts: { from?: string; to?: string; includeExternal?: boolean },
  ): Promise<{ items: Array<Task | ExternalEvent> }> {
    const items = await this.tasksRepo
      .createQueryBuilder('t')
      .where('t.userId = :userId', { userId })
      .andWhere(opts.from ? 't.startAt >= :from' : '1=1', { from: opts.from })
      .andWhere(opts.to ? 't.startAt <= :to' : '1=1', { to: opts.to })
      .orderBy('t.startAt', 'ASC')
      .getMany();

    if (!opts.includeExternal || !this.calendar?.listExternalEvents) {
      return { items };
    }

    const external = await this.calendar.listExternalEvents(
      userId,
      opts.from,
      opts.to,
    );

    // external es un stub [], lo tipamos como ExternalEvent[]
    return { items: [...items, ...(external as ExternalEvent[])] };
  }
}
