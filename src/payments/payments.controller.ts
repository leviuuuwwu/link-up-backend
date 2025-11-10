import { Body, Controller, Get, Param, Post, Delete } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  create(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.processPayment(dto);
  }

  @Get()
  getAll() {
    return this.paymentsService.findAll();
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.paymentsService.findOne(Number(id));
  }

  @Delete()
  clear() {
    return this.paymentsService.clearAll();
  }
}
