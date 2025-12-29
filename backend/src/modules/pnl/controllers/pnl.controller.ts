import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PnlService } from '../services/pnl.service';
import { CreatePnlDto } from '../dto/create-pnl.dto';
import { PnlQueryDto } from '../dto/pnl-query.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('pnl')
@UseGuards(JwtAuthGuard)
export class PnlController {
  constructor(private readonly pnlService: PnlService) {}

  @Post()
  create(@Request() req, @Body() createPnlDto: CreatePnlDto) {
    return this.pnlService.create(req.user.userId, createPnlDto);
  }

  @Get()
  findAll(@Request() req, @Query() query: PnlQueryDto) {
    return this.pnlService.findAll(req.user.userId, query);
  }

  @Get('analytics')
  getAnalytics(@Request() req, @Query('accountId') accountId?: string) {
    return this.pnlService.getAnalytics(req.user.userId, accountId);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.pnlService.remove(id, req.user.userId);
  }
}
