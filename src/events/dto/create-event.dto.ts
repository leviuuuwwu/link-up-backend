import { IsString, IsOptional, IsDateString, IsInt, Min, MaxLength } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @MaxLength(150)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  startAt: string; // ISO

  @IsDateString()
  endAt: string;   // ISO

  @IsInt()
  @Min(1)
  capacity: number;
}
