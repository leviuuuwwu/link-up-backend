import { Injectable } from '@nestjs/common';

@Injectable()
export class WalletService {
  // placeholder so nothing breaks if called
  async getWallet(userId: string) {
    return { userId, balance: 0, currency: 'USD', updatedAt: new Date().toISOString() };
  }

  async topup(userId: string, amount: number) {
    return { balance: 0, message: 'Wallet module disabled' };
  }

  async withdraw(userId: string, amount: number) {
    return { balance: 0, message: 'Wallet module disabled' };
  }

  async history(userId: string) {
    return [];
  }

  async listTransactions(userId: string, _q?: any) {
    return { items: [], total: 0 };
  }

  ensureSameUserOrAdmin(): void {
    // noop
  }
}
