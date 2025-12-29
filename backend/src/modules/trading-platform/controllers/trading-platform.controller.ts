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
import { TradingPlatformService } from '../services/trading-platform.service';
import { CreatePlatformDto } from '../dto/create-platform.dto';
import { UpdatePlatformDto } from '../dto/update-platform.dto';
import { UpdateFuturesSettingsDto } from '../../futures-trading/dto/update-futures-settings.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('platforms')
@UseGuards(JwtAuthGuard)
export class TradingPlatformController {
  constructor(private readonly platformService: TradingPlatformService) {}

  @Post()
  create(@Request() req, @Body() createPlatformDto: CreatePlatformDto) {
    return this.platformService.create(req.user.userId, createPlatformDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.platformService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.platformService.findOne(id, req.user.userId);
  }

  @Put(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updatePlatformDto: UpdatePlatformDto,
  ) {
    return this.platformService.update(id, req.user.userId, updatePlatformDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.platformService.remove(id, req.user.userId);
  }

  @Post(':id/sync')
  async syncBalances(@Request() req, @Param('id') id: string) {
    const result = await this.platformService.syncBalances(id, req.user.userId);
    await this.platformService.updateLastSynced(id, req.user.userId);
    return result;
  }

  @Put(':id/futures-settings')
  updateFuturesSettings(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateFuturesSettingsDto,
  ) {
    return this.platformService.updateFuturesSettings(id, req.user.userId, updateDto);
  }
}
