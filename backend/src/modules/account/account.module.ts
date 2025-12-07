import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { Account } from '../../entities/account.entity';
import { Balance } from '../../entities/balance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Account, Balance])],
  controllers: [AccountController],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}
