import { Module } from '@nestjs/common';
import { VnStockRsiController } from './controllers/vn-stock-rsi.controller';
import { VnStockRsiService } from './services/vn-stock-rsi.service';

@Module({
  controllers: [VnStockRsiController],
  providers: [VnStockRsiService],
  exports: [VnStockRsiService],
})
export class VnStockRsiModule {}
