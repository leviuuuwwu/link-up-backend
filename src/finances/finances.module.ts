import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancesService } from './finances.service';
import { FinancesController } from './finances.controller';
import { PaymentRequest } from './entities/payment-request.entity';
import { SharedAccount } from './entities/share-account-entity';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentRequest, SharedAccount])],
  controllers: [FinancesController],
  providers: [FinancesService],
})
export class FinancesModule {}
