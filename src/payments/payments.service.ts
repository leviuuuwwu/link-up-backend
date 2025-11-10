import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
  ) {}

async processPayment(dto: CreatePaymentDto) {
  await new Promise((r) => setTimeout(r, 500));

  const payment = this.paymentRepo.create({
    ...dto,
    status: 'success',
  });
    
  const saved = await this.paymentRepo.save(payment);

  return {
    success: true,
    message: 'Payment processed successfully',
    payment: saved,
  };
  }

  findAll() {
    return this.paymentRepo.find({ order: { id: 'DESC' } });
  }

  findOne(id: number) {
    return this.paymentRepo.findOneBy({ id });
  }

  async clearAll() {
    await this.paymentRepo.delete({});
    return { message: 'All payments cleared' };
  }
}
