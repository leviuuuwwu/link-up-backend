import { Entity, PrimaryGeneratedColumn, ManyToOne, Unique, CreateDateColumn } from 'typeorm';
import { Event } from './event.entity';
import { User } from '../../users/entities/user.entity';

// evita duplicados (un mismo usuario en el mismo evento)
@Unique(['user', 'event'])
@Entity('users_events')
export class UserEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, u => u.events, { eager: true, onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Event, e => e.participants, { eager: false, onDelete: 'CASCADE' })
  event: Event;

  @CreateDateColumn()
  joinedAt: Date;
}
