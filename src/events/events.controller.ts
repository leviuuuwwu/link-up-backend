import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly service: EventsService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Post()
  create(@Body() dto: CreateEventDto) { return this.service.create(dto); }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEventDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }

  // para demo: recibimos userId en el body; en real usarías JWT (current user)
  @Post(':id/join')
  join(@Param('id', ParseIntPipe) id: number, @Body('userId', ParseIntPipe) userId: string) {
    return this.service.join(id, userId);
  }

  @Post(':id/leave')
  leave(@Param('id', ParseIntPipe) id: number, @Body('userId', ParseIntPipe) userId: string) {
    return this.service.leave(id, userId);
  }
}
