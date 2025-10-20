import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { Transaction, TransactionType } from './entities/transaction.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet) private readonly walletRepo: Repository<Wallet>,
    @InjectRepository(Transaction) private readonly txRepo: Repository<Transaction>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async getWallet(userId: string) {
    const wallet = await this.walletRepo.findOne({ where: { user: { id: userId } } });
    if (!wallet) throw new NotFoundException('Wallet not found');
    return wallet;
  }

  async topup(userId: string, amount: number) {
    if (amount <= 0) throw new BadRequestException('Amount must be positive');
    let wallet = await this.walletRepo.findOne({ where: { user: { id: userId } } });

    if (!wallet) {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');
      wallet = this.walletRepo.create({ user, balance: 0 });
    }

    wallet.balance = Number(wallet.balance) + amount;
    await this.walletRepo.save(wallet);

    const tx = this.txRepo.create({ wallet, type: TransactionType.TOPUP, amount });
    await this.txRepo.save(tx);

    return { balance: wallet.balance };
  }

  async withdraw(userId: string, amount: number) {
    if (amount <= 0) throw new BadRequestException('Amount must be positive');
    const wallet = await this.walletRepo.findOne({ where: { user: { id: userId } } });
    if (!wallet) throw new NotFoundException('Wallet not found');
    if (wallet.balance < amount) throw new BadRequestException('Insufficient funds');

    wallet.balance = Number(wallet.balance) - amount;
    await this.walletRepo.save(wallet);

    const tx = this.txRepo.create({ wallet, type: TransactionType.WITHDRAW, amount });
    await this.txRepo.save(tx);

    return { balance: wallet.balance };
  }

  async history(userId: string) {
    const wallet = await this.walletRepo.findOne({
      where: { user: { id: userId } },
      relations: ['transactions'],
    });
    if (!wallet) throw new NotFoundException('Wallet not found');
    return wallet.transactions;
  }
}
