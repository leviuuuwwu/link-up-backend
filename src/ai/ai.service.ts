import { Inject, Injectable } from '@nestjs/common';
import { z } from 'zod';
import { PlannerTaskSchema } from './schemas/planner-task.schema';

// Tipos fuertes (coinciden con el provider)
type Priority = 'low' | 'med' | 'high';

interface PlannerDefaults {
  durationMin: number;
  priority: Priority;
}

interface ExtractArgs {
  brief: string;
  timezone: string;
  todayISO: string;
  defaults: PlannerDefaults;
}

// Interfaz del provider para no usar `any`
interface AiPlannerProvider {
  extractTasks(args: ExtractArgs): Promise<unknown>;
}

@Injectable()
export class AiService {
  constructor(
    @Inject('AiPlannerProvider') private provider: AiPlannerProvider,
  ) {}

  async parseBrief(
    brief: string,
    timezone: string,
    defaults: { durationMin: number; priority: Priority },
  ) {
    // Si la IA está desactivada por ENV, no hacemos nada
    if (process.env.USE_AI_PLANNER !== 'true') return [];

    // Para simplificar, usamos el ISO UTC actual (no necesitamos date-fns-tz)
    const todayISO: string = new Date().toISOString();

    // Tipado estricto: la salida del provider es `unknown`
    const raw: unknown = await this.provider.extractTasks({
      brief,
      timezone,
      todayISO,
      defaults,
    });

    // Validamos y tipamos con Zod
    const tasks = z.array(PlannerTaskSchema).parse(raw);

    // Normalizamos valores por defecto
    return tasks.map((t) => ({
      ...t,
      durationMin: t.durationMin ?? defaults.durationMin,
      priority: t.priority ?? defaults.priority,
    }));
  }
}
