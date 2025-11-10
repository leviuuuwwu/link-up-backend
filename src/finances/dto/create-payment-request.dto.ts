import { IsNotEmpty, IsString, IsInt, Min } from 'class-validator';

export class CreatePaymentRequestDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  from: string;

  @IsInt()
  @Min(1)
  amount: number;
}
