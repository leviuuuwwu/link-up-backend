// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';

import { AppController } from './app.controller';
import { AppService } from './app.service';

// Módulos existentes desde main
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';   // si existe en el repo

// Módulos nuevos que agregaste / ya estaban
import { AiModule } from './ai/ai.module';
import { PlannerModule } from './planner/planner.module';
import { SmartPlannerModule } from './smart-planner';

// Otros módulos que trae main (inclúyelos si existen en el repo)
import { UsersModule } from './users/users.module';
import { WalletModule } from './wallet/wallet.module';
// import { FinancesModule } from './finances/finances.module'; // solo si existe

dotenv.config();
/**import { EventsModule } from './events/events.module';
import { FinancesModule } from './finances/finances.module';
import { WalletModule } from './wallet/wallet.module';
import { ProfileModule } from './profile/profile.module';**/
import { FinancesModule } from './finances/finances.module';
import { PaymentsModule } from './payments/payments.module';

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
    AuthModule,
    EventsModule,
    UsersModule,
    WalletModule,
    FinancesModule,
    PaymentsModule,
    

    // 🔹 Módulos de negocio
    AuthModule,
    EventsModule,           // quítalo si no existe
    AiModule,
    PlannerModule,
    SmartPlannerModule,
    UsersModule,            // quítalo si no existe
    WalletModule,           // quítalo si no existe
    // FinancesModule,      // quítalo si no existe
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
