import { Controller, Get, Put, Param, Body, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Get(':id/notifications')
  getNotifications(@Param('id') id: string) {
    return this.usersService.getNotifications(id);
  }

  @Post(':id/notifications')
  createNotification(@Param('id') id: string, @Body() dto: CreateNotificationDto) {
    return this.usersService.createNotification(id, dto);
  }
}