import { addMinutes, isBefore } from 'date-fns';

// ----------------- Tipos -----------------
export type Priority = 'low' | 'med' | 'high';

export type TaskIn = {
  title: string;
  description?: string;
  durationMin?: number;
  priority?: Priority;
  deadlineISO?: string;
  preferredWindow?: { start: string; end: string }; // "HH:mm"
  recurrence?: {
    freq: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    interval: number;
    byWeekday?: number[];
  };
};

type Constraints = {
  workingDays: number[]; // 1..7 (Lunes..Domingo)
  workHours: { start: string; end: string }; // "HH:mm"
  horizonDays: number;
  noOverlap: boolean;
  timezone: string; // p.ej. "America/El_Salvador"
};

type ExistingItem = { startAt?: Date; endAt?: Date };

export type ScheduledTask = TaskIn & {
  startAt?: Date;
  endAt?: Date;
  auto?: boolean;
};

// ----------------- Helpers TZ (sin date-fns-tz) -----------------
/**
 * Convierte un Date a la “misma hora” en otro timezone, retornando un Date en el runtime local.
 * No es perfecto para todos los calendarios, pero funciona bien para slots horarios.
 */
function toTZ(date: Date, tz: string): Date {
  const iso = date.toLocaleString('en-US', {
    timeZone: tz,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  // new Date() del string local — suficiente para nuestro uso de ventanas horarias
  return new Date(iso);
}

/**
 * Crea un Date “en tz” para y-m-d h:m y lo devuelve como Date nativo.
 */
function makeZonedDate(
  tz: string,
  y: number,
  m: number,
  d: number,
  h = 0,
  mm = 0,
): Date {
  // Creamos un UTC de referencia y lo “renderizamos” en tz
  const utcBase = new Date(Date.UTC(y, m, d, h, mm, 0));
  const localStr = utcBase.toLocaleString('en-US', {
    timeZone: tz,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  return new Date(localStr);
}

/** DOW 1..7 (L..D) desde un Date + tz */
function dow1to7(date: Date, tz: string): number {
  const d = toTZ(date, tz).getDay(); // 0..6 Dom..Sáb
  return d === 0 ? 7 : d;
}

/** Parse "HH:mm" seguro */
function parseHM(hm: string): { h: number; m: number } {
  const [h, m] = hm.split(':').map((n) => Number(n));
  return { h: isFinite(h) ? h : 0, m: isFinite(m) ? m : 0 };
}

/** ¿colisionan intervalos? */
function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && aEnd > bStart;
}

// ----------------- Auto-scheduler -----------------
export function autoSchedule({
  tasks,
  constraints,
  existing,
}: {
  tasks: TaskIn[];
  constraints: Constraints;
  existing: ExistingItem[];
}): ScheduledTask[] {
  const withDefaults: ScheduledTask[] = tasks.map((t) => ({
    ...t,
    durationMin: t.durationMin ?? 30,
    priority: t.priority ?? 'med',
  }));

  // Orden: prioridad alta → deadline más cercano → mayor duración
  const pr = (p?: Priority) => (p === 'high' ? 3 : p === 'med' ? 2 : 1);
  withDefaults.sort((a, b) => {
    const d1 = pr(b.priority) - pr(a.priority);
    if (d1 !== 0) return d1;
    const da = a.deadlineISO
      ? new Date(a.deadlineISO).getTime()
      : Number.POSITIVE_INFINITY;
    const db = b.deadlineISO
      ? new Date(b.deadlineISO).getTime()
      : Number.POSITIVE_INFINITY;
    if (da !== db) return da - db;
    return (b.durationMin ?? 0) - (a.durationMin ?? 0);
  });

  const scheduled: ScheduledTask[] = [];
  const tz = constraints.timezone;
  const now = new Date();

  function isFree(start: Date, end: Date): boolean {
    for (const e of existing) {
      if (!e.startAt || !e.endAt) continue;
      if (overlaps(start, end, e.startAt, e.endAt)) return false;
    }
    for (const s of scheduled) {
      if (!s.startAt || !s.endAt) continue;
      if (overlaps(start, end, s.startAt, s.endAt)) return false;
    }
    return true;
  }

  function nextSlotFor(
    day: Date,
    t: ScheduledTask,
  ): { startAt: Date; endAt: Date } | null {
    // Día en tz
    const localDay = toTZ(day, tz);

    // Ventanas de trabajo
    const [ws, we] = [constraints.workHours.start, constraints.workHours.end];
    const { h: sH, m: sM } = parseHM(t.preferredWindow?.start ?? ws);
    const { h: eH, m: eM } = parseHM(t.preferredWindow?.end ?? we);

    // Inicio / límite del día en tz
    let start = makeZonedDate(
      tz,
      localDay.getFullYear(),
      localDay.getMonth(),
      localDay.getDate(),
      sH,
      sM,
    );
    const limit = makeZonedDate(
      tz,
      localDay.getFullYear(),
      localDay.getMonth(),
      localDay.getDate(),
      eH,
      eM,
    );

    // Buscar hueco
    while (isBefore(addMinutes(start, t.durationMin ?? 30), limit)) {
      const end = addMinutes(start, t.durationMin ?? 30);
      if (!constraints.noOverlap || isFree(start, end)) {
        return { startAt: start, endAt: end };
      }
      start = addMinutes(start, 15);
    }
    return null;
  }

  for (const t of withDefaults) {
    let placed = false;
    for (let d = 0; d <= constraints.horizonDays; d++) {
      const day = new Date(now.getTime() + d * 86400000);
      const wday = dow1to7(day, tz);
      if (!constraints.workingDays.includes(wday)) continue;

      const slot = nextSlotFor(day, t);
      if (slot) {
        scheduled.push({ ...t, ...slot, auto: true });
        placed = true;
        break;
      }
    }
    if (!placed) {
      // No se pudo ubicar: guardar sin horario para que el cliente lo vea
      scheduled.push({ ...t });
    }
  }

  return scheduled;
}
