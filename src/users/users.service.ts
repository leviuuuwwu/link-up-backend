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