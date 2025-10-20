import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { OpenAiPlannerProvider } from './providers/openai-planner.provider';

@Module({
  providers: [
    AiService,
    { provide: 'AiPlannerProvider', useClass: OpenAiPlannerProvider },
  ],
  exports: [AiService],
})
export class AiModule {}
