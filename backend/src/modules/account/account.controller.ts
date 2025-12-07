import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { UpdateBalanceDto } from './dto/update-balance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('accounts')
@UseGuards(JwtAuthGuard)
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  create(@Request() req, @Body() createAccountDto: CreateAccountDto) {
    return this.accountService.create(req.user.userId, createAccountDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.accountService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.accountService.findOne(id, req.user.userId);
  }

  @Put(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return this.accountService.update(id, req.user.userId, updateAccountDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.accountService.remove(id, req.user.userId);
  }

  @Post(':id/balances')
  updateBalance(
    @Request() req,
    @Param('id') id: string,
    @Body() updateBalanceDto: UpdateBalanceDto,
  ) {
    return this.accountService.updateBalance(
      id,
      req.user.userId,
      updateBalanceDto,
    );
  }

  @Get(':id/balances')
  getBalances(@Request() req, @Param('id') id: string) {
    return this.accountService.getBalances(id, req.user.userId);
  }
}
