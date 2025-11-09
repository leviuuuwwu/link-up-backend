import { Injectable } from '@nestjs/common';

type ExternalEvent = {
  id: string;
  title: string;
  startAt?: Date;
  endAt?: Date;
};

type TaskToSync = {
  id: string;
  title: string;
  startAt?: Date;
  endAt?: Date;
};

@Injectable()
export class CalendarService {
  // Devolvemos Promise explícita y marcamos los args como usados con `void`
  listExternalEvents(
    _userId: string,
    _from?: string,
    _to?: string,
  ): Promise<ExternalEvent[]> {
    // Marcar parámetros como usados para contentar a TypeScript (noUnusedParameters)
    void _userId;
    void _from;
    void _to;

    // stub
    return Promise.resolve([]);
  }

  // Igual aquí
  syncTasksToExternalCalendar(
    _userId: string,
    _tasks: ReadonlyArray<TaskToSync>,
  ): Promise<void> {
    void _userId;
    void _tasks;

    // stub
    return Promise.resolve();
  }
}
