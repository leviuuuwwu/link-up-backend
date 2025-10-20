import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import * as dotenv from 'dotenv';
dotenv.config();
import { UsersModule } from './users/users.module';
/**import { EventsModule } from './events/events.module';
import { FinancesModule } from './finances/finances.module';
import { WalletModule } from './wallet/wallet.module';
import { ProfileModule } from './profile/profile.module';**/

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
    /**UsersModule,
    EventsModule,
    FinancesModule,
    WalletModule,
    ProfileModule**/
  ],
})
export class AppModule {}