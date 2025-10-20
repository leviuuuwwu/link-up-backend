// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';

// 👇 IMPORTACIÓN ***NORMAL*** (NO "type") PARA INYECCIÓN
import { UsersService } from 'src/users/users.service';

// Estas sí pueden ser import type (no se inyectan)
import type { User } from 'src/users/entities/user.entity';
import type { RegisterDto } from './dto/register.dto';
import type { LoginDto } from './dto/login.dto';

type SafeUser = Omit<User, 'password'>;
function toSafeUser(u: User): SafeUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...rest } = u;
  return rest as SafeUser;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService, // ← ahora Nest ve la clase
    private readonly jwtService: JwtService,
  ) {}

  async register(
    dto: RegisterDto,
  ): Promise<{ message: string; user: SafeUser }> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('El correo ya está registrado');

    const plainPassword = String(dto.password ?? '');
    const hashed = await bcrypt.hash(plainPassword, 10);

    const created = await this.usersService.create({
      email: dto.email,
      fullName: dto.fullName,
      role: 'user',
      password: hashed,
    });

    return {
      message: 'Usuario registrado correctamente',
      user: toSafeUser(created),
    };
  }

  async login(
    dto: LoginDto,
  ): Promise<{ access_token: string; user: SafeUser }> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const valid = await bcrypt.compare(
      String(dto.password ?? ''),
      user.password,
    );
    if (!valid) throw new UnauthorizedException('Credenciales inválidas');

    const payload = { id: user.id, role: user.role };
    const token = this.jwtService.sign(payload);

    return { access_token: token, user: toSafeUser(user) };
  }

  async validateUser(id: string) {
    return this.usersService.findById(id);
  }
}
