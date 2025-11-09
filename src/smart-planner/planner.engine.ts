import {
  ItinState,
  ChatResponse as PlannerReply,
  DetailedItinerary as ItineraryDetailed,
  TimelineItem as ItineraryItem,
} from './types';

const citiesByHint: Record<string, string[]> = {
  'riviera maya': ['Playa del Carmen', 'Tulum', 'Cancún'],
  'costa rica': ['Manuel Antonio', 'Tamarindo', 'Jaco'],
  hawai: ['Honolulu', 'Maui', 'Kauai'],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function mockChat(
  message: unknown,
  input: {
    sessionId: string;
    state?: ItinState;
    confirmDestination?: boolean;
  } = { sessionId: 'session' }, // 👈 default para evitar undefined
): PlannerReply {
  // Asegura string
  const text = typeof message === 'string' ? message : '';

  // Normaliza valores para no usar input?. en todos lados
  const sessionId = input.sessionId ?? 'session';
  const confirm = !!input.confirmDestination;
  const state: ItinState = { ...(input.state ?? {}) };

  // Si no hay texto y faltan datos mínimos => pedirlos
  if (!text.trim() && (!state.budget || !state.people || !state.days)) {
    return {
      sessionId,
      state,
      nextAction: 'ASK',
      reply:
        'Para armarte algo bueno, confirma: presupuesto total (USD), personas, días.',
    };
  }

  // Extracción ultra simple desde el texto
  const mBudget = text.match(/(\d[\d.,]+)/);
  if (mBudget && !state.budget) {
    state.budget = parseFloat(mBudget[1].replace(/[.,]/g, ''));
  }

  const mPeople = text.match(/(\d+)\s*(personas|people)/i);
  if (mPeople && !state.people) state.people = parseInt(mPeople[1]);

  const mDays = text.match(/(\d+)\s*(d[ií]as|days)/i);
  if (mDays && !state.days) state.days = parseInt(mDays[1]);

  if (/san salvador/i.test(text) && !state.originCity) {
    state.originCity = 'San Salvador';
  }

  if (/playa|beach|riviera/i.test(text) && !state.hintDestination) {
    state.hintDestination = /riviera/i.test(text) ? 'Riviera Maya' : 'Playa';
  }

  // Si faltan datos => preguntar
  if (!state.budget || !state.people || !state.days) {
    const missing = [
      !state.budget ? 'presupuesto total (USD)' : null,
      !state.people ? 'personas' : null,
      !state.days ? 'días' : null,
    ]
      .filter(Boolean)
      .join(', ');

    return {
      sessionId,
      state,
      nextAction: 'ASK',
      reply: `Para armarte algo bueno, confirma: ${missing}.`,
    };
  }

  // Propuesta con posible itinerario
  const destination =
    state.hintDestination && citiesByHint[state.hintDestination.toLowerCase()]
      ? `${state.hintDestination} – ${pick(
          citiesByHint[state.hintDestination.toLowerCase()],
        )}`
      : 'Riviera Maya – Playa del Carmen';

  const reply =
    `Con ${state.budget} USD para ${state.people} personas y ${state.days} días, ` +
    `te propongo **${destination}**. Puedo armarte hotel + vuelos + actividades dentro del presupuesto.` +
    (confirm
      ? ' Generando itinerario detallado...'
      : ' ¿Confirmas ese destino?');

  const base: PlannerReply = {
    sessionId,
    state,
    nextAction: confirm ? 'AUTO' : 'PROPOSE',
    reply,
  };

  if (confirm) {
    base.detailed = mockItinerary(state, destination);
  }

  return base;
}

export function mockItinerary(
  state: ItinState,
  destination: string,
): ItineraryDetailed {
  const days = state.days ?? 4;
  const items: ItineraryItem[] = [];

  for (let d = 1; d <= days; d++) {
    items.push({
      day: d,
      time: '08:00',
      title: 'Desayuno en hotel',
      durationMin: 60,
    });
    items.push({
      day: d,
      time: '10:00',
      title: 'Actividad guiada',
      durationMin: 180,
    });
    items.push({
      day: d,
      time: '15:00',
      title: 'Playa / Piscina',
      durationMin: 180,
    });
    items.push({
      day: d,
      time: '19:30',
      title: 'Cena recomendada',
      durationMin: 90,
    });
  }

  return { destination, timeline: items };
}
