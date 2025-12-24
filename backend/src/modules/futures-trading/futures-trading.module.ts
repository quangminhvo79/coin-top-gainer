import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FuturesTradingController } from './futures-trading.controller';
import { FuturesTradingService } from './futures-trading.service';
import { BinanceFuturesService } from './binance-futures.service';
import { OrderCalculatorService } from './order-calculator.service';
import { OrderMonitorService } from './order-monitor.service';
import { FuturesOrder } from '../../entities/futures-order.entity';
import { TradingPlatform } from '../../entities/trading-platform.entity';
import { Account } from '../../entities/account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FuturesOrder, TradingPlatform, Account]),
  ],
  controllers: [FuturesTradingController],
  providers: [
    FuturesTradingService,
    BinanceFuturesService,
    OrderCalculatorService,
    OrderMonitorService,
  ],
  exports: [FuturesTradingService],
})
export class FuturesTradingModule {}
