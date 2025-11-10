import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany, // Combined imports
} from 'typeorm';
import { UserEvent } from 'src/events/entities/user-event.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  fullName: string;

  @Column({ default: 'user' })
  role: string;

  @CreateDateColumn()
  createdAt: Date;

  // ✅ MOVED INSIDE THE CLASS
  @OneToMany(() => UserEvent, (ue) => ue.user)
  events: UserEvent[];
  
} 