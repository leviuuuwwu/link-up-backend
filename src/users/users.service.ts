// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Notification } from './entities/notification.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Notification) private notificationsRepo: Repository<Notification>,
  ) {}

  /** Busca un usuario por email (case-insensitive) */
  async findByEmail(email: string): Promise<User | null> {
    const normalized = String(email ?? '')
      .trim()
      .toLowerCase();
    if (!normalized) return null;
    return this.userRepo.findOne({ where: { email: normalized } });
  }

  /** Crea un usuario a partir de un subconjunto controlado de campos */
  async create(data: Partial<User>): Promise<User> {
    // Permitimos sólo los campos que la entidad espera crear desde fuera
    const toCreate: Partial<User> = {
      email: data.email?.trim().toLowerCase(),
      fullName: data.fullName,
      role: data.role, // si tu entidad tiene default, puedes omitirlo
      password: data.password, // ya debe venir hasheado desde AuthService
    };

    const user = this.userRepo.create(toCreate);
    return this.userRepo.save(user);
  }

  /** Busca por id */
  async findById(id: string): Promise<User | null> {
    const safeId = String(id ?? '').trim();
    if (!safeId) return null;
    return this.userRepo.findOne({ where: { id: safeId } });
  async findByEmail(email: string) {
    const user = await this.usersRepo.findOne({ where: { email } });
    return user;
  }

  async create(data: Partial<User>) {
    const user = this.usersRepo.create(data);
    return this.usersRepo.save(user);
  }

  async findById(id: string) {
    return this.usersRepo.findOne({ where: { id } });
  }

  // === MÉTODOS EXISTENTES ===
  async findOne(id: string) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.usersRepo.update(id, dto);
    return this.findOne(id);
  }

  async getNotifications(id: string) {
    return this.notificationsRepo.find({
      where: { user: { id } },
      order: { createdAt: 'DESC' },
    });
  }

  async createNotification(id: string, dto: CreateNotificationDto) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    const notification = this.notificationsRepo.create({ ...dto, user });
    return this.notificationsRepo.save(notification);
  }
}
