import { Body, Controller, Get, Post, Patch, Param } from '@nestjs/common';
import { FinancesService } from './finances.service';
import { CreatePaymentRequestDto } from './dto/create-payment-request.dto';
import { CreateSharedAccountDto } from './dto/create-shared-account.dto';
import { AddContributionDto } from './dto/add-contribution.dto';

@Controller('finances')
export class FinancesController {
  constructor(private readonly financesService: FinancesService) {}

  @Get('requests')
  async getRequests() {
    const data = await this.financesService.findAllRequests();
    return { success: true, data };
  }

  @Post('requests')
  async addRequest(@Body() dto: CreatePaymentRequestDto) {
    const data = await this.financesService.addRequest(dto.title, dto.from, dto.amount);
    return { success: true, message: 'Request created successfully', data };
  }

  @Patch('requests/:id/pay')
  async markAsPaid(@Param('id') id: string) {
    const data = await this.financesService.markAsPaid(Number(id));
    return { success: true, message: 'Payment marked as paid', data };
  }

  @Get('accounts')
  async getAccounts() {
    const data = await this.financesService.findAllAccounts();
    return { success: true, data };
  }

  @Post('accounts')
  async addAccount(@Body() dto: CreateSharedAccountDto) {
    const data = await this.financesService.addSharedAccount(
      dto.name,
      dto.members,
      dto.expected,
      dto.contributed ?? 0,
    );
    return { success: true, message: 'Shared account created successfully', data };
  }

  @Patch('accounts/:id/contribute')
  async addContribution(@Param('id') id: string, @Body() dto: AddContributionDto) {
    const data = await this.financesService.addContribution(Number(id), dto.amount);
    return { success: true, message: 'Contribution added', data };
  }
}
