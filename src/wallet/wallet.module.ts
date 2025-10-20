import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { Wallet } from './entities/wallet.entity';
import { Transaction } from './entities/transaction.entity';
import { PaymentIdem } from './entities/payment-idempotency.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, Transaction, PaymentIdem])],
  controllers: [WalletController],
  providers: [WalletService],
})
export class WalletModule {}
