import { IsIn } from 'class-validator';

export class UpdatePaymentStatusDto {
  @IsIn(['Paid', 'Unpaid'])
  status: 'Paid' | 'Unpaid';
}
