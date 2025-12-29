import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountController } from './controllers/account.controller';
import { AccountService } from './services/account.service';
import { Account } from '../../entities/account.entity';
import { Balance } from '../../entities/balance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Account, Balance])],
  controllers: [AccountController],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}
