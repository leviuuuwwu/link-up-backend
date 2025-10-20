import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class PlannerTaskInputDto {
  @IsString() title: string;
  @IsOptional() @IsInt() durationMin?: number;
  @IsOptional() @IsIn(['low', 'med', 'high']) priority?: 'low' | 'med' | 'high';
  @IsOptional() recurrence?: {
    freq: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    interval: number;
    byWeekday?: number[];
  };
  @IsOptional() preferredWindow?: { start: string; end: string };
}

class PlannerConstraintsDto {
  @IsOptional() workingDays?: number[];
  @IsOptional() workHours?: { start: string; end: string };
  @IsOptional() noOverlap?: boolean;
  @IsOptional() timezone?: string;
  @IsOptional() @IsInt() horizonDays?: number;
}

export class PlannerRequestDto {
  @IsOptional() @IsString() brief?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlannerTaskInputDto)
  tasks?: PlannerTaskInputDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => PlannerConstraintsDto)
  constraints?: PlannerConstraintsDto;

  @IsOptional() @IsBoolean() autoschedule?: boolean;
  @IsOptional() @IsBoolean() syncToCalendar?: boolean;
}
