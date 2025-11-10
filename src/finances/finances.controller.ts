import { Body, Controller, Get, Post, Patch, Param } from '@nestjs/common';
import { FinancesService } from './finances.service';
import { CreatePaymentRequestDto } from './dto/create-payment-request.dto';
import { CreateSharedAccountDto } from './dto/create-shared-account.dto';
import { AddContributionDto } from './dto/add-contribution.dto';

@Controller('finances')
export class FinancesController {
  constructor(private readonly financesService: FinancesService) {}

  @Get('requests')
  getRequests() {
    return this.financesService.findAllRequests();
  }

  @Post('requests')
  addRequest(@Body() dto: CreatePaymentRequestDto) {
    return this.financesService.addRequest(dto.title, dto.from, dto.amount);
  }

  @Patch('requests/:id/pay')
  markAsPaid(@Param('id') id: string) {
    return this.financesService.markAsPaid(Number(id));
  }

  @Get('accounts')
  getAccounts() {
    return this.financesService.findAllAccounts();
  }

  @Post('accounts')
  addAccount(@Body() dto: CreateSharedAccountDto) {
    return this.financesService.addSharedAccount(
      dto.name,
      dto.members,
      dto.expected,
      dto.contributed ?? 0,
    );
  }

  @Patch('accounts/:id/contribute')
  addContribution(@Param('id') id: string, @Body() dto: AddContributionDto) {
    return this.financesService.addContribution(Number(id), dto.amount);
  }
}
