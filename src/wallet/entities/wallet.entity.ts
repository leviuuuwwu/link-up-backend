import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') userId: string;
  @Column({ type: 'varchar', default: 'USD' }) currency: string;
  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  balance: string;
  @UpdateDateColumn() updatedAt: Date;
}
