import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Unique,
} from 'typeorm';

@Entity('payment_idempotency')
@Unique(['key'])
export class PaymentIdem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  key: string;

  @Column('uuid')
  userId: string;

  @Column()
  route: string;

  @Column({ type: 'int' })
  status: number;

  // 👇 importante: unknown (y opcional), NO any
  @Column({ type: 'jsonb', nullable: true })
  response?: unknown;

  @CreateDateColumn()
  createdAt: Date;
}
