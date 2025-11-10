import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class SharedAccount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  members: number;

  @Column()
  expected: number;

  @Column({ default: 0 })
  contributed: number;

  @CreateDateColumn()
  createdAt: Date;
}
