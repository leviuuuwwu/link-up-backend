import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Notification } from './entities/notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Notification])],
  providers: [UsersService],
  exports: [UsersService], // ✅ necesario para que AuthModule lo reciba
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}