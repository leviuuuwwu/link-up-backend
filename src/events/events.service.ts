import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { UserEvent } from './entities/user-event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event) private readonly eventRepo: Repository<Event>,
    @InjectRepository(UserEvent) private readonly userEventRepo: Repository<UserEvent>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  private validateDates(startAt: Date, endAt: Date) {
    if (endAt <= startAt) throw new BadRequestException('endAt must be after startAt');
    if (startAt < new Date()) throw new BadRequestException('startAt must be in the future');
  }

  async findAll() {
    // Podés añadir conteo de participantes
    const events = await this.eventRepo.find({ order: { startAt: 'ASC' } });
    return Promise.all(events.map(async e => ({
      ...e,
      enrolled: await this.userEventRepo.count({ where: { event: { id: e.id } } }),
    })));
  }

  async findOne(id: number) {
    const event = await this.eventRepo.findOne({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');

    const enrolled = await this.userEventRepo.count({ where: { event: { id } } });
    return { ...event, enrolled };
  }

  async create(dto: CreateEventDto) {
    const startAt = new Date(dto.startAt);
    const endAt = new Date(dto.endAt);
    this.validateDates(startAt, endAt);

    const event = this.eventRepo.create({ ...dto, startAt, endAt });
    return this.eventRepo.save(event);
  }

  async update(id: number, dto: UpdateEventDto) {
    const event = await this.eventRepo.findOne({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');

    // si vienen fechas, validar
    const startAt = dto.startAt ? new Date(dto.startAt) : event.startAt;
    const endAt   = dto.endAt ? new Date(dto.endAt) : event.endAt;
    this.validateDates(startAt, endAt);

    Object.assign(event, { ...dto, startAt, endAt });

    // si bajan capacity por debajo de inscritos, error
    if (dto.capacity) {
      const enrolled = await this.userEventRepo.count({ where: { event: { id } } });
      if (dto.capacity < enrolled) throw new BadRequestException('capacity cannot be less than current enrolled users');
    }

    return this.eventRepo.save(event);
  }

  async remove(id: number) {
    const event = await this.eventRepo.findOne({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    await this.eventRepo.remove(event);
    return { deleted: true };
  }

  /** Helpers para join/leave */

  private async getUser(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async join(eventId: number, userId: string) {
    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');

    if (event.endAt <= new Date()) throw new BadRequestException('Event already finished');

    const already = await this.userEventRepo.findOne({
      where: { event: { id: eventId }, user: { id: userId } },
    });
    if (already) throw new ConflictException('User already joined');

    const enrolled = await this.userEventRepo.count({ where: { event: { id: eventId } } });
    if (enrolled >= event.capacity) throw new BadRequestException('Event is full');

    const user = await this.getUser(userId);
    const ue = this.userEventRepo.create({ user, event });
    await this.userEventRepo.save(ue);
    return { joined: true };
  }

  async leave(eventId: number, userId: string) {
    const existing = await this.userEventRepo.findOne({
      where: { event: { id: eventId }, user: { id: userId } },
      relations: ['event', 'user'],
    });
    if (!existing) throw new NotFoundException('User is not in this event');

    await this.userEventRepo.remove(existing);
    return { left: true };
  }
}
