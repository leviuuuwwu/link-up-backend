// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config'; // 👈 1. Importa ConfigModule

import { AppController } from './app.controller';
import { AppService } from './app.service';

// Módulos de tu aplicación
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { WalletModule } from './wallet/wallet.module';
import { FinancesModule } from './finances/finances.module';
import { PaymentsModule } from './payments/payments.module';
import { AiModule } from './ai/ai.module';
import { PlannerModule } from './planner/planner.module';
import { SmartPlannerModule } from './smart-planner'; // O donde sea que esté

@Module({
  imports: [
    // 2. ConfigModule debe ir primero y ser global
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    
    // 3. TypeOrmModule (usa process.env, ahora cargado por ConfigModule)
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
    
    // 4. Módulos de la aplicación (solo se listan una vez)
    AuthModule,
    UsersModule,
    EventsModule,
    WalletModule,
    FinancesModule,
    PaymentsModule,
    AiModule,
    PlannerModule,
    SmartPlannerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}