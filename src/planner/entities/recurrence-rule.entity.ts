import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('recurrence_rules')
export class RecurrenceRule {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') userId: string;
  @Column({ type: 'varchar' }) freq: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  @Column({ type: 'int', default: 1 }) interval: number;
  @Column({ type: 'int', array: true, nullable: true }) byWeekday?: number[];
  @Column({ type: 'timestamptz', nullable: true }) until?: Date;
  @Column({ type: 'int', nullable: true }) count?: number;
  @Column({ type: 'varchar', default: 'America/El_Salvador' }) timezone: string;
  @CreateDateColumn() createdAt: Date;
}
