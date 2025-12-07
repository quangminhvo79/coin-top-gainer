import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PnlController } from './pnl.controller';
import { PnlService } from './pnl.service';
import { PnlRecord } from '../../entities/pnl-record.entity';
import { Account } from '../../entities/account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PnlRecord, Account])],
  controllers: [PnlController],
  providers: [PnlService],
  exports: [PnlService],
})
export class PnlModule {}
