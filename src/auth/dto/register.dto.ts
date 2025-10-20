import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(80)
  @Transform(({ value }) => String(value).trim())
  fullName: string;

  @IsEmail()
  @Transform(({ value }) => String(value).toLowerCase().trim())
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(64)
  @Transform(({ value }) => String(value).trim())
  password: string;

  // Si quisieras permitir rol desde el registro (opcional):
  // @IsOptional()
  // @IsIn(['user', 'ADMIN'])
  // role?: string;
}
