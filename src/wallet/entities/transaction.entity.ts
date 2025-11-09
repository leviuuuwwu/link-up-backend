import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') userId: string;
  @Column({ type: 'varchar' }) type: 'topup' | 'payment' | 'refund';
  @Column({ type: 'numeric', precision: 12, scale: 2 }) amount: string;
  @Column({ type: 'varchar', default: 'USD' }) currency: string;
  @Column({ type: 'varchar', default: 'succeeded' }) status:
    | 'pending'
    | 'succeeded'
    | 'failed'
    | 'refunded';
  @Column({ type: 'jsonb', nullable: true }) meta?: any;
  @CreateDateColumn() createdAt: Date;
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Wallet } from './wallet.entity';

export enum TransactionType {
  TOPUP = 'topup',
  WITHDRAW = 'withdraw'
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Wallet, (w) => w.transactions, { onDelete: 'CASCADE' })
  wallet: Wallet;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @CreateDateColumn()
  createdAt: Date;
}
