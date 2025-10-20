// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
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
  }
}
