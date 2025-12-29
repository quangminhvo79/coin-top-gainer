import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../../../entities/account.entity';
import { Balance } from '../../../entities/balance.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { UpdateBalanceDto } from './dto/update-balance.dto';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(Balance)
    private balanceRepository: Repository<Balance>,
  ) {}

  async create(userId: string, createAccountDto: CreateAccountDto): Promise<Account> {
    const account = this.accountRepository.create({
      ...createAccountDto,
      userId,
    });
    return this.accountRepository.save(account);
  }

  async findAll(userId: string): Promise<Account[]> {
    return this.accountRepository.find({
      where: { userId },
      relations: ['balances'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: { id, userId },
      relations: ['balances', 'pnlRecords'],
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return account;
  }

  async update(
    id: string,
    userId: string,
    updateAccountDto: UpdateAccountDto,
  ): Promise<Account> {
    const account = await this.findOne(id, userId);
    Object.assign(account, updateAccountDto);
    return this.accountRepository.save(account);
  }

  async remove(id: string, userId: string): Promise<void> {
    const account = await this.findOne(id, userId);
    await this.accountRepository.remove(account);
  }

  async updateBalance(
    accountId: string,
    userId: string,
    updateBalanceDto: UpdateBalanceDto,
  ): Promise<Balance> {
    const account = await this.findOne(accountId, userId);

    let balance = await this.balanceRepository.findOne({
      where: { accountId, asset: updateBalanceDto.asset },
    });

    const total = Number(updateBalanceDto.free) + Number(updateBalanceDto.locked);
    const usdValue = updateBalanceDto.priceUsd
      ? total * updateBalanceDto.priceUsd
      : undefined;

    if (balance) {
      Object.assign(balance, {
        ...updateBalanceDto,
        total,
        usdValue,
      });
    } else {
      balance = this.balanceRepository.create({
        accountId,
        ...updateBalanceDto,
        total,
        usdValue,
      });
    }

    const savedBalance = await this.balanceRepository.save(balance);

    await this.recalculateAccountBalance(accountId);

    return savedBalance;
  }

  async getBalances(accountId: string, userId: string): Promise<Balance[]> {
    await this.findOne(accountId, userId);
    return this.balanceRepository.find({
      where: { accountId },
      order: { usdValue: 'DESC' },
    });
  }

  private async recalculateAccountBalance(accountId: string): Promise<void> {
    const balances = await this.balanceRepository.find({
      where: { accountId },
    });

    const totalBalance = balances.reduce(
      (sum, b) => sum + (Number(b.usdValue) || 0),
      0,
    );
    const availableBalance = balances.reduce(
      (sum, b) => sum + (Number(b.free) * (Number(b.priceUsd) || 0)),
      0,
    );
    const lockedBalance = balances.reduce(
      (sum, b) => sum + (Number(b.locked) * (Number(b.priceUsd) || 0)),
      0,
    );

    await this.accountRepository.update(accountId, {
      totalBalance,
      availableBalance,
      lockedBalance,
    });
  }
}
