// Resumen del "state" que maneja el planner
export type ItinState = {
  budget?: number;
  people?: number;
  days?: number;
  originCity?: string;
  hintDestination?: string;
  monthHint?: string;
};

// Ítems del timeline del itinerario
export type TimelineItem = {
  day: number;
  time: string; // "08:30"
  title: string; // "Check-in hotel"
  durationMin?: number;
};

export type DetailedItinerary = {
  destination?: string;
  timeline: TimelineItem[];
};

// Respuesta del /chat del planner
export type ChatResponse = {
  sessionId: string;
  reply: string;
  nextAction: 'ASK' | 'PROPOSE' | 'AUTO';
  state?: ItinState;
  // cuando nextAction === 'PROPOSE' puede venir un resumen de costos
  itinerary?: unknown;
  // cuando se confirma destino
  detailed?: DetailedItinerary;
};

// Respuesta del /itinerary directo
export type ItineraryResponse = {
  detailed: DetailedItinerary;
};
