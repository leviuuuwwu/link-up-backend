import { Injectable, ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { Transaction } from './entities/transaction.entity';
import { PaymentIdem } from './entities/payment-idempotency.entity';

// ── Tipos de apoyo (solo de tipo; no generan JS) ──────────────────────────────
import type { RequestUser } from '../common/types/request-user';

type TopupBody = {
  amount: number;
  currency?: string;
  idempotencyKey: string;
};

type PayBody = {
  userId: string;
  amount: number;
  currency?: string;
  idempotencyKey: string;
  meta?: Record<string, unknown>;
};

type FinanceQuery = {
  type?: 'topup' | 'payment' | 'refund' | 'adjustment';
  from?: string; // ISO
  to?: string; // ISO
  limit?: number;
  cursor?: string;
};

type WalletSummary = {
  userId: string;
  balance: number;
  currency: string;
  updatedAt: string; // ISO
};

type TxPublic = {
  id: string;
  type: Transaction['type'];
  amount: number;
  currency: string;
  status: string;
  createdAt: string; // ISO
};

type TopupResponse = {
  wallet: WalletSummary;
  transaction: TxPublic;
};

type PaymentResponse = {
  status: 'succeeded';
  payment: {
    id: string;
    method: 'wallet';
    amount: number;
    currency: string;
    createdAt: string; // ISO
  };
  wallet: { balance: number; currency: string };
};

// ── helpers locales ───────────────────────────────────────────────────────────
function nowISO(): string {
  return new Date().toISOString();
}
function toAmount2(n: number | string): string {
  const v = Number(n);
  return Number.isFinite(v) ? v.toFixed(2) : '0.00';
}
function toNumber(n: unknown, fallback = 0): number {
  const v = Number(n);
  return Number.isFinite(v) ? v : fallback;
}
function sanitizeISO(d?: string): string | undefined {
  if (!d) return undefined;
  const t = Date.parse(d);
  return Number.isFinite(t) ? new Date(t).toISOString() : undefined;
}

// Type-guard para `response` en PaymentIdem (que está tipado como unknown)
function hasIdemResponse<T>(
  x: PaymentIdem | null,
): x is PaymentIdem & { response: T } {
  return !!x && typeof x.response !== 'undefined' && x.response !== null;
}

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet) private readonly wallets: Repository<Wallet>,
    @InjectRepository(Transaction)
    private readonly txs: Repository<Transaction>,
    @InjectRepository(PaymentIdem)
    private readonly idem: Repository<PaymentIdem>,
  ) {}

  /** Valida que sea el mismo usuario o admin */
  ensureSameUserOrAdmin(userId: string, user: RequestUser): void {
    if (user.role !== 'ADMIN' && user.id !== userId) {
      throw new ForbiddenException('Forbidden');
    }
  }

  /** Crea (si no existía) y devuelve el estado de la wallet */
  async getWallet(userId: string): Promise<WalletSummary> {
    let w = await this.wallets.findOne({ where: { userId } });
    if (!w) {
      w = await this.wallets.save(
        this.wallets.create({
          userId,
          currency: process.env.CURRENCY ?? 'USD',
          balance: '0.00',
        }),
      );
    }
    return {
      userId,
      balance: toNumber(w.balance, 0),
      currency: w.currency,
      updatedAt:
        w.updatedAt instanceof Date ? w.updatedAt.toISOString() : nowISO(),
    };
  }

  /** Topup con idempotencia */
  async topup(userId: string, body: TopupBody): Promise<TopupResponse> {
    const currency = body.currency ?? process.env.CURRENCY ?? 'USD';

    // idempotencia
    const exists = await this.idem.findOne({
      where: { key: body.idempotencyKey },
    });
    if (hasIdemResponse<TopupResponse>(exists)) {
      return exists.response;
    }

    // wallet
    let w = await this.wallets.findOne({ where: { userId } });
    if (!w) {
      w = this.wallets.create({ userId, currency, balance: '0.00' });
    }
    w.balance = toAmount2(toNumber(w.balance) + body.amount);
    await this.wallets.save(w);

    // transacción (no existe entidad Payment; usamos Transaction)
    const tx = await this.txs.save(
      this.txs.create({
        userId,
        type: 'topup',
        amount: toAmount2(body.amount),
        currency,
        status: 'succeeded',
      }),
    );

    const response: TopupResponse = {
      wallet: {
        userId,
        balance: toNumber(w.balance, 0),
        currency,
        updatedAt:
          w.updatedAt instanceof Date ? w.updatedAt.toISOString() : nowISO(),
      },
      transaction: {
        id: tx.id,
        type: tx.type,
        amount: toNumber(tx.amount, body.amount),
        currency,
        status: tx.status,
        createdAt:
          tx.createdAt instanceof Date ? tx.createdAt.toISOString() : nowISO(),
      },
    };

    // guarda idempotencia
    await this.idem.save(
      this.idem.create({
        key: body.idempotencyKey,
        userId,
        route: '/users/:userId/wallet/topup',
        status: 200,
        response,
      }),
    );

    return response;
  }

  /** Pago con wallet (sin entidad Payment; registramos solo Transaction) */
  async payWithWallet(body: PayBody): Promise<PaymentResponse> {
    const currency = body.currency ?? process.env.CURRENCY ?? 'USD';

    // idempotencia
    const exists = await this.idem.findOne({
      where: { key: body.idempotencyKey },
    });
    if (hasIdemResponse<PaymentResponse>(exists)) {
      return exists.response;
    }

    // wallet
    const w = await this.wallets.findOne({ where: { userId: body.userId } });
    if (!w || toNumber(w.balance) < body.amount) {
      throw new Error('Saldo insuficiente');
    }
    w.balance = toAmount2(toNumber(w.balance) - body.amount);
    await this.wallets.save(w);

    // transacción de pago
    const tx = await this.txs.save(
      this.txs.create({
        userId: body.userId,
        type: 'payment',
        amount: toAmount2(body.amount),
        currency,
        status: 'succeeded',
        meta: { ...(body.meta ?? {}) },
      }),
    );

    const response: PaymentResponse = {
      status: 'succeeded',
      payment: {
        id: tx.id,
        method: 'wallet',
        amount: toNumber(tx.amount, body.amount),
        currency,
        createdAt:
          tx.createdAt instanceof Date ? tx.createdAt.toISOString() : nowISO(),
      },
      wallet: { balance: toNumber(w.balance, 0), currency },
    };

    await this.idem.save(
      this.idem.create({
        key: body.idempotencyKey,
        userId: body.userId,
        route: '/payments',
        status: 200,
        response,
      }),
    );

    return response;
  }

  /** Listado de transacciones con filtros básicos */
  async listTransactions(
    userId: string,
    q: FinanceQuery,
  ): Promise<{ items: TxPublic[]; total: number }> {
    const qb = this.txs
      .createQueryBuilder('t')
      .where('t.userId = :userId', { userId });

    if (q.type) qb.andWhere('t.type = :type', { type: q.type });

    const fromISO = sanitizeISO(q.from);
    if (fromISO) qb.andWhere('t.createdAt >= :from', { from: fromISO });

    const toISO = sanitizeISO(q.to);
    if (toISO) qb.andWhere('t.createdAt <= :to', { to: toISO });

    qb.orderBy('t.createdAt', 'DESC');

    const [rows, total] = await qb.getManyAndCount();
    const items: TxPublic[] = rows.map((t) => ({
      id: t.id,
      type: t.type,
      amount: toNumber(t.amount, 0),
      currency: t.currency,
      status: t.status,
      createdAt:
        t.createdAt instanceof Date ? t.createdAt.toISOString() : nowISO(),
    }));

    return { items, total };
  }
}
