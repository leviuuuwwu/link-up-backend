import { IsEmail, IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^[0-9]{8,15}$/, {
    message: 'Phone must be between 8 and 15 digits',
  })
  phone: string;

  @IsString()
  @Length(16, 16, { message: 'Card number must be exactly 16 digits' })
  cardNumber: string;
}
