import { Body, Controller, Post, HttpCode } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SmartPlannerService } from './smart-planner.service';
import { ChatDto } from './dto/chat.dto';
import { ItineraryDto } from './dto/itinerary.dto';
import { ChatResponse, ItineraryResponse } from './types';

@ApiTags('Smart Planner')
@Controller('planner')
export class SmartPlannerController {
  constructor(private readonly planner: SmartPlannerService) {}

  @Post('chat')
  @HttpCode(200) // opcional, para que no sea 201
  @ApiOperation({
    summary: 'Chat con el asistente (follow-ups / propuesta / confirmación)',
  })
  @ApiBody({ type: ChatDto })
  async chat(@Body() body: ChatDto): Promise<ChatResponse> {
    return this.planner.chat(body); // devuelve Promise<ChatResponse>
  }

  @Post('itinerary')
  @HttpCode(200) // opcional
  @ApiOperation({ summary: 'Genera el itinerario por día/hora desde un state' })
  @ApiBody({ type: ItineraryDto })
  async itinerary(@Body() body: ItineraryDto): Promise<ItineraryResponse> {
    return this.planner.itinerary(body); // devuelve Promise<ItineraryResponse>
  }
}
