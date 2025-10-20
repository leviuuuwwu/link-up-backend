import { z } from 'zod';

export const PlannerTaskSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  durationMin: z.number().int().min(5).optional(),
  priority: z.enum(['low', 'med', 'high']).optional(),
  deadlineISO: z.string().datetime().optional(),
  preferredWindow: z.object({ start: z.string(), end: z.string() }).optional(), // "HH:mm"
  recurrence: z
    .object({
      freq: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
      interval: z.number().int().min(1),
      byWeekday: z.array(z.number().int().min(1).max(7)).optional(),
    })
    .optional(),
  dependencies: z.array(z.string()).optional(),
});
export type PlannerTask = z.infer<typeof PlannerTaskSchema>;
