import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class PaymentRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  from: string;

  @Column()
  amount: number;

  @Column({ default: 'Unpaid' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
