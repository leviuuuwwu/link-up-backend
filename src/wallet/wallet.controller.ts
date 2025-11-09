import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UserDecorator } from '../common/decorators/user.decorators';
import { WalletService } from './wallet.service';

// ── Tipos (solo de tipo, por isolatedModules) ─────────────────────────────────
import type { RequestUser } from '../common/types/request-user';

// Entradas (DTOs ligeros; si quieres, muévelos a ./dto/)
type TopupDto = {
  amount: number;
  currency?: string;
  idempotencyKey: string;
};

type PayDto = {
  userId: string;
  method: 'wallet';
  amount: number;
  currency?: string;
  idempotencyKey: string;
  meta?: Record<string, unknown>;
};

type FinanceQuery = {
  limit?: number;
  cursor?: string;
  from?: string; // ISO
  to?: string; // ISO
};

// Salidas (ajústalas si tu WalletService retorna algo más específico)
type WalletSummary = {
  userId: string;
  balance: number;
  currency: string;
  updatedAt: string; // ISO
};

type TransactionRecord = {
  id: string;
  type: 'topup' | 'payment' | 'refund' | 'adjustment';
  amount: number;
  currency: string;
  createdAt: string; // ISO
  meta?: Record<string, unknown>;
};

type TopupResult = {
  success: true;
  balance: number;
  currency: string;
  transaction: TransactionRecord;
};

type PaymentResult = {
  success: boolean;
  paymentId: string;
  debited: number;
  currency: string;
  balance: number;
};

// ── helpers de mapeo/guards (evitan `any` y `as`) ─────────────────────────────
function isObj(x: unknown): x is Record<string, unknown> {
  return !!x && typeof x === 'object' && !Array.isArray(x);
}
function isArr(x: unknown): x is unknown[] {
  return Array.isArray(x);
}
function asString(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback;
}
function asNumber(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}
function asISODate(v: unknown): string {
  let d: Date;
  if (v instanceof Date) d = v;
  else if (typeof v === 'string' || typeof v === 'number') d = new Date(v);
  else d = new Date();
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}
function toTxType(v: unknown): TransactionRecord['type'] {
  const s = asString(v);
  return s === 'topup' ||
    s === 'payment' ||
    s === 'refund' ||
    s === 'adjustment'
    ? s
    : 'payment';
}

function parseWalletSummary(u: unknown, userIdFallback: string): WalletSummary {
  const r = isObj(u) ? u : {};
  return {
    userId: asString(r['userId'], userIdFallback),
    balance: asNumber(r['balance'], 0),
    currency: asString(r['currency'], 'USD'),
    updatedAt: asISODate(r['updatedAt'] ?? Date.now()),
  };
}

function parseTopupResult(u: unknown, body: TopupDto): TopupResult {
  const r = isObj(u) ? u : {};
  const tx = isObj(r['transaction']) ? r['transaction'] : {};
  return {
    success: true,
    balance: asNumber(r['balance'], 0),
    currency: asString(r['currency'], body.currency ?? 'USD'),
    transaction: {
      id: asString(tx['id']),
      type: toTxType(tx['type']),
      amount: asNumber(tx['amount'], body.amount),
      currency: asString(tx['currency'], body.currency ?? 'USD'),
      createdAt: asISODate(tx['createdAt'] ?? Date.now()),
      meta: isObj(tx['meta']) ? tx['meta'] : undefined,
    },
  };
}

function parseTransactionsResponse(u: unknown): {
  items: TransactionRecord[];
  nextCursor?: string;
} {
  const r = isObj(u) ? u : {};
  const rawItems = isArr(r['items']) ? r['items'] : [];
  const items: TransactionRecord[] = rawItems.map((it) => {
    const o = isObj(it) ? it : {};
    return {
      id: asString(o['id']),
      type: toTxType(o['type']),
      amount: asNumber(o['amount'], 0),
      currency: asString(o['currency'], 'USD'),
      createdAt: asISODate(o['createdAt'] ?? Date.now()),
      meta: isObj(o['meta']) ? o['meta'] : undefined,
    };
  });
  const nc = r['nextCursor'];
  const nextCursor = typeof nc === 'string' ? nc : undefined;
  return { items, nextCursor };
}

function parsePaymentResult(u: unknown, body: PayDto): PaymentResult {
  const r = isObj(u) ? u : {};
  return {
    success: typeof r['success'] === 'boolean' ? r['success'] : true,
    paymentId: asString(r['paymentId']),
    debited: asNumber(r['debited'] ?? body.amount, 0),
    currency: asString(r['currency'] ?? body.currency ?? 'USD'),
    balance: asNumber(r['balance'], 0),
  };
}

@UseGuards(JwtAuthGuard)
@Controller()
export class WalletController {
  constructor(private readonly wallet: WalletService) {}

  @Get('users/:userId/wallet')
  async getWallet(
    @Param('userId') userId: string,
    @UserDecorator() user: RequestUser,
  ): Promise<WalletSummary> {
    await this.wallet.ensureSameUserOrAdmin(userId, user);
    const raw: unknown = await this.wallet.getWallet(userId);
    return parseWalletSummary(raw, userId);
  }

  @Post('users/:userId/wallet/topup')
  async topup(
    @Param('userId') userId: string,
    @Body() body: TopupDto,
    @UserDecorator() user: RequestUser,
  ): Promise<TopupResult> {
    await this.wallet.ensureSameUserOrAdmin(userId, user);
    const raw: unknown = await this.wallet.topup(userId, body);
    return parseTopupResult(raw, body);
  }

  @Get('users/:userId/finances')
  async finances(
    @Param('userId') userId: string,
    @Query() q: FinanceQuery,
    @UserDecorator() user: RequestUser,
  ): Promise<{ items: TransactionRecord[]; nextCursor?: string }> {
    await this.wallet.ensureSameUserOrAdmin(userId, user);
    const raw: unknown = await this.wallet.listTransactions(userId, q);
    return parseTransactionsResponse(raw);
  }

  @Post('payments')
  async pay(
    @Body() body: PayDto,
    @UserDecorator() user: RequestUser,
  ): Promise<PaymentResult> {
    await this.wallet.ensureSameUserOrAdmin(body.userId, user);
    const raw: unknown = await this.wallet.payWithWallet(body);
    return parsePaymentResult(raw, body);
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
