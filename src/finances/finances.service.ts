import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentRequest } from './entities/payment-request.entity';
import { SharedAccount } from './entities/share-account-entity';

@Injectable()
export class FinancesService {
  constructor(
    @InjectRepository(PaymentRequest)
    private requestRepo: Repository<PaymentRequest>,

    @InjectRepository(SharedAccount)
    private accountRepo: Repository<SharedAccount>,
  ) {}

  findAllRequests() {
    return this.requestRepo.find();
  }

  addRequest(title: string, from: string, amount: number) {
    const req = this.requestRepo.create({ title, from, amount });
    return this.requestRepo.save(req);
  }

  async markAsPaid(id: number) {
    const req = await this.requestRepo.findOneBy({ id });
    if (!req) throw new Error('Request not found');
    req.status = 'Paid';
    return this.requestRepo.save(req);
  }

  findAllAccounts() {
    return this.accountRepo.find();
  }

  addSharedAccount(name: string, members: number, expected: number, contributed = 0) {
    const acc = this.accountRepo.create({ name, members, expected, contributed });
    return this.accountRepo.save(acc);
  }

  async addContribution(id: number, amount: number) {
    const acc = await this.accountRepo.findOneBy({ id });
    if (!acc) throw new Error('Account not found');
    acc.contributed += amount;
    return this.accountRepo.save(acc);
  }

  async resetAll() {
    await this.requestRepo.delete({});
    await this.accountRepo.delete({});
    return { message: 'All finances reset' };
  }
}
