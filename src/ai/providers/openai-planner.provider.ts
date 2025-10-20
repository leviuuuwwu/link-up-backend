import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

// ---- Tipos para evitar "any" ----
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

/**
 * Cliente OpenAI-compatible para Groq / Ollama / OpenAI.
 */
function makeClient() {
  const provider = process.env.AI_PROVIDER || 'groq';

  if (provider === 'groq') {
    return new OpenAI({
      apiKey: process.env.GROQ_API_KEY!,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }

  if (provider === 'ollama') {
    return new OpenAI({
      apiKey: 'ollama',
      baseURL: 'http://localhost:11434/v1',
    });
  }

  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
}

@Injectable()
export class OpenAiPlannerProvider {
  private client = makeClient();
  private model = process.env.AI_MODEL || 'llama-3.1-8b-instant';
  private temperature = Number(process.env.AI_TEMPERATURE ?? 0.2);

  /**
   * Devuelve SOLO un array JSON de tareas (validación posterior con Zod).
   */
  async extractTasks(
    { brief, timezone, todayISO, defaults }: ExtractArgs, // 👈 argumentos en líneas separadas (lo que te pedía el linter)
  ): Promise<unknown> {
    const system = `Eres un planificador experto. Devuelve SOLO un array JSON de tareas.
Campos: title, (opcional) description, (opcional) durationMin (min),
(opcional) priority ("low"|"med"|"high"), (opcional) deadlineISO,
(opcional) preferredWindow {start,end "HH:mm"},
(opcional) recurrence {freq:"DAILY"|"WEEKLY"|"MONTHLY", interval:number, byWeekday?: number[]}.
Timezone: ${timezone}. Hoy: ${todayISO}. Duración por defecto: ${String(defaults.durationMin)}.
No expliques nada, solo JSON.`;

    const user = `Brief del usuario:
"""
${brief}
"""
Devuelve EXCLUSIVAMENTE un array JSON válido (sin comentarios, sin texto extra).`;

    // Usamos Chat Completions (compat con Groq/Ollama)
    const completion = await this.client.chat.completions.create({
      model: this.model,
      temperature: this.temperature,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    });

    const msg = completion.choices?.[0]?.message;

    let text = '';

    const rawContent: unknown = msg?.content;

    if (typeof rawContent === 'string') {
      text = rawContent;
    } else if (Array.isArray(rawContent)) {
      const parts = rawContent as Array<unknown>;
      text = parts
        .map((part) => {
          if (typeof part === 'string') return part;
          const obj = part as { text?: unknown; content?: unknown };
          if (typeof obj.text === 'string') return obj.text;
          if (typeof obj.content === 'string') return obj.content;
          return '';
        })
        .join('');
    } else {
      text = '';
    }

    try {
      return JSON.parse(text);
    } catch {
      // Si el modelo no devolvió JSON válido, devolvemos array vacío.
      return [];
    }
  }
}
