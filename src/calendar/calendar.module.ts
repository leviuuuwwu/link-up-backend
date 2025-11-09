import { Module } from '@nestjs/common';
import { CalendarService } from './calendar.service';

@Module({
  providers: [CalendarService],
  exports: [CalendarService], // ¡exporta para que otros módulos lo inyecten!
})
export class CalendarModule {}
