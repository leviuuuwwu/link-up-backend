import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SmartPlannerController } from './smart-planner.controller';
import { SmartPlannerService } from './smart-planner.service';

@Module({
  imports: [
    // con registro simple
    HttpModule,
    // o si quieres customizar timeout/retries:
    // HttpModule.register({ timeout: 15000, maxRedirects: 5 }),
  ],
  controllers: [SmartPlannerController],
  providers: [SmartPlannerService],
  exports: [SmartPlannerService], // opcional, si otro módulo lo usa
})
export class SmartPlannerModule {}
