// src/smart-planner/dto/chat.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsIn,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ItinStateDto } from './itin-state.dto';

export class ChatDto {
  @ApiProperty({
    example:
      '5 personas, 7 días, 10000 USD, salimos de San Salvador. Elige tú la playa.',
  })
  @IsString()
  message!: string;

  @ApiProperty({ example: 'demo' })
  @IsString()
  sessionId!: string;

  @ApiPropertyOptional({ enum: ['mock', 'openai'], example: 'mock' })
  @IsOptional()
  @IsIn(['mock', 'openai'])
  forceMode?: 'mock' | 'openai';

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  confirmDestination?: boolean;

  @ApiPropertyOptional({
    type: ItinStateDto,
    description:
      'Estado conversacional opcional (si el front lo mantiene entre mensajes)',
    example: {
      budget: 10000,
      people: 5,
      days: 7,
      originCity: 'San Salvador',
      hintDestination: 'Riviera Maya',
      monthHint: 'julio',
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ItinStateDto)
  state?: ItinStateDto;
}
