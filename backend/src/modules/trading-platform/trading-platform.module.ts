import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TradingPlatformController } from './trading-platform.controller';
import { TradingPlatformService } from './trading-platform.service';
import { TradingPlatform } from '../../entities/trading-platform.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TradingPlatform])],
  controllers: [TradingPlatformController],
  providers: [TradingPlatformService],
  exports: [TradingPlatformService],
})
export class TradingPlatformModule {}
