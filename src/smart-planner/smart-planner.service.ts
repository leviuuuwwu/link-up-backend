// src/smart-planner/smart-planner.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import { ChatDto } from './dto/chat.dto';
import { ItineraryDto } from './dto/itinerary.dto';
import { ChatResponse, ItineraryResponse, ItinState } from './types';
import { mockChat, mockItinerary } from './planner.engine';

@Injectable()
export class SmartPlannerService {
  constructor(private readonly http: HttpService) {}

  private get baseUrl(): string {
    return process.env.PLANNER_BASE_URL || 'http://localhost:8080';
  }

  async chat(body: ChatDto): Promise<ChatResponse> {
    // Si quieres obligar mock desde .env, pon PLANNER_FORCE_MOCK=true
    const envForceMock =
      (process.env.PLANNER_FORCE_MOCK || '').toLowerCase() === 'true';
    const mode = (body.forceMode ?? '').toLowerCase(); // 'mock' | 'openai' | ''
    const useMock = envForceMock || mode === 'mock' || mode === '';

    if (useMock) {
      return mockChat(body.message, {
        sessionId: body.sessionId ?? 'session',
        state: body.state,
        confirmDestination: body.confirmDestination,
      });
    }

    // Si explícitamente piden upstream (openai) y falla, hacemos fallback a mock
    try {
      const { data } = await firstValueFrom(
        this.http.post<ChatResponse>(`${this.baseUrl}/api/planner/chat`, body, {
          headers: { 'Content-Type': 'application/json' },
        }),
      );
      return data;
    } catch {
      // Fallback a mock: nunca devolvemos 502
      return mockChat(body.message, {
        sessionId: body.sessionId ?? 'session',
        state: body.state,
        confirmDestination: body.confirmDestination,
      });
    }
  }

  async itinerary(body: ItineraryDto): Promise<ItineraryResponse> {
    // Generación local si ya viene el state
    if (body.state) {
      const s: ItinState = body.state ?? {};
      const destination =
        s.hintDestination ?? 'Riviera Maya – Playa del Carmen';
      return { detailed: mockItinerary(s, destination) };
    }

    // Intento upstream y, si falla, mock mínimo
    try {
      const { data } = await firstValueFrom(
        this.http.post<ItineraryResponse>(
          `${this.baseUrl}/api/planner/itinerary`,
          body,
          {
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      );
      return data;
    } catch {
      return {
        detailed: mockItinerary({}, 'Destino'),
      };
    }
  }
}
