import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

// Usa import type por isolatedModules
import type { RequestUser, Role } from 'src/common/types/request-user';

interface JwtPayload {
  id: string;
  role: Role; // <- mismo union type que RequestUser.role
  email?: string; // opcional si lo incluyes al firmar el token
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev_fallback_secret',
    });
  }

  // validate puede ser sincrónico (no necesita async si no usas await)
  validate(payload: JwtPayload): RequestUser {
    return {
      id: payload.id,
      role: payload.role, // ya tipa como Role
      email: payload.email ?? '', // rellena si lo añadiste en el JWT
    };
  }
}
