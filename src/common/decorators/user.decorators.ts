import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { RequestUser, Role } from '../types/request-user';

// Normaliza cualquier valor a Role ('ADMIN' | 'USER')
function asRole(v: unknown): Role {
  return v === 'ADMIN' || v === 'USER' ? v : 'USER';
}

export const UserDecorator = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestUser => {
    const req = ctx.switchToHttp().getRequest<Request & { user?: unknown }>();

    // trabajamos con un dict genérico para evitar 'any'
    const u = (req.user ?? {}) as Record<string, unknown>;

    return {
      id:
        typeof u.id === 'string'
          ? u.id
          : typeof u.id === 'number'
            ? String(u.id)
            : '',
      email: typeof u.email === 'string' ? u.email : '',
      role: asRole(u.role),
    };
  },
);
