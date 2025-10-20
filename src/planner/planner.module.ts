import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlannerService } from './planner.service';
import { PlannerController } from './planner.controller';
import { Task } from './entities/task.entity';
import { RecurrenceRule } from './entities/recurrence-rule.entity';
import { AiModule } from '../ai/ai.module';
import { CalendarModule } from '../calendar/calendar.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, RecurrenceRule]),
    AiModule,
    CalendarModule,
  ],
  controllers: [PlannerController],
  providers: [PlannerService],
})
export class PlannerModule {}
