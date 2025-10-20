import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PlannerService } from './planner.service';
import { PlannerRequestDto } from './dto/planner-request.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UserDecorator } from '../common/decorators/user.decorators';

@UseGuards(JwtAuthGuard)
@Controller('users/:userId')
export class PlannerController {
  constructor(private readonly planner: PlannerService) {}

  @Get('calendar')
  async getCalendar(
    @Param('userId') userId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('includeExternal') includeExternal?: string,
    @UserDecorator() user?: any,
  ) {
    await this.planner.ensureSameUserOrAdmin(userId, user);
    return this.planner.getCalendar(userId, {
      from,
      to,
      includeExternal: includeExternal === 'true',
    });
  }

  @Post('planner')
  async createOrUpdatePlan(
    @Param('userId') userId: string,
    @Body() dto: PlannerRequestDto,
    @UserDecorator() user?: any,
  ) {
    await this.planner.ensureSameUserOrAdmin(userId, user);
    return this.planner.createOrUpdatePlan(userId, dto);
  }
}
