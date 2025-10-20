import { Controller, Get, Post, Param, Body, ParseUUIDPipe } from '@nestjs/common';
import { WalletService } from './wallet.service';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get(':userId')
  getWallet(@Param('userId', new ParseUUIDPipe()) userId: string) {
    return this.walletService.getWallet(userId);
  }

  @Post(':userId/topup')
  topup(@Param('userId', new ParseUUIDPipe()) userId: string, @Body('amount') amount: number) {
    return this.walletService.topup(userId, amount);
  }

  @Post(':userId/withdraw')
  withdraw(@Param('userId', new ParseUUIDPipe()) userId: string, @Body('amount') amount: number) {
    return this.walletService.withdraw(userId, amount);
  }

  @Get(':userId/history')
  history(@Param('userId', new ParseUUIDPipe()) userId: string) {
    return this.walletService.history(userId);
  }
}
