// src/smart-planner/dto/itinerary.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ItinStateDto } from './itin-state.dto';

export class ItineraryDto {
  @ApiProperty({
    description: 'Estado mínimo para generar itinerario',
    type: ItinStateDto,
    example: {
      budget: 10000,
      people: 5,
      days: 7,
      originCity: 'San Salvador',
      hintDestination: 'Riviera Maya',
    },
  })
  @ValidateNested()
  @Type(() => ItinStateDto)
  state!: ItinStateDto;
}
