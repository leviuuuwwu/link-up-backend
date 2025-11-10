import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    UsersModule, 
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule], // Importa el ConfigModule aquí también
      useFactory: async (configService: ConfigService) => ({
        // Obtiene la clave de forma segura del servicio de configuración
        secret: configService.get<string>('JWT_SECRET'), 
        signOptions: { 
          expiresIn: configService.get('JWT_EXPIRES_IN') ?? '1d',
        },
      }),
      inject: [ConfigService], 
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
