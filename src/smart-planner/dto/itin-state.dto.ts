// src/smart-planner/dto/itin-state.dto.ts
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class ItinStateDto {
  @IsOptional()
  @IsNumber()
  budget?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  people?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  days?: number;

  @IsOptional()
  @IsString()
  originCity?: string;

  @IsOptional()
  @IsString()
  hintDestination?: string;

  @IsOptional()
  @IsString()
  monthHint?: string;
}
