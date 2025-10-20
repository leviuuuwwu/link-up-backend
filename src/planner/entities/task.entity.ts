import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') userId: string;
  @Column() title: string;
  @Column({ nullable: true }) description?: string;
  @Column({ type: 'varchar', default: 'todo' }) status:
    | 'todo'
    | 'doing'
    | 'done'
    | 'cancelled';
  @Column({ type: 'timestamptz', nullable: true }) startAt?: Date;
  @Column({ type: 'timestamptz', nullable: true }) endAt?: Date;
  @Column({ type: 'int', nullable: true }) durationMin?: number;
  @Column({ type: 'varchar', default: 'med' }) priority: 'low' | 'med' | 'high';
  @Column({ type: 'uuid', nullable: true }) recurrenceRuleId?: string;
  @Column({ type: 'boolean', default: false }) autoScheduled: boolean;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
