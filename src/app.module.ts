import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

// Módulos existentes
import { AuthModule } from './auth/auth.module';

// 🔹 NUEVOS módulos que agregamos
import { AiModule } from './ai/ai.module';
import { PlannerModule } from './planner/planner.module';
import { WalletModule } from './wallet/wallet.module';
import { CalendarModule } from './calendar/calendar.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),

    // Módulos propios
    AuthModule,

    // 🔹 Añadidos (IA + Planner + Wallet + Calendar stub)
    AiModule,
    PlannerModule,
    WalletModule,
    CalendarModule,

    // Si más adelante reactivas estos, quita los comentarios:
    // UsersModule,
    // EventsModule,
    // FinancesModule,
    // ProfileModule,
  ],
})
export class AppModule {}
