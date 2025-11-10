import { IsNotEmpty, IsString, IsInt, Min, Max } from 'class-validator';

export class CreateSharedAccountDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(2)
  @Max(10)
  members: number;

  @IsInt()
  @Min(1)
  expected: number;

  @IsInt()
  @Min(0)
  contributed?: number;
}
