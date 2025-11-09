import { IsEnum, IsNumber, Min } from 'class-validator';
import { TransactionType } from '../entities/transaction.entity';

export class TransactionDto {
  @IsEnum(TransactionType)
  type: TransactionType;

  @IsNumber()
  @Min(0.01)
  amount: number;
}
