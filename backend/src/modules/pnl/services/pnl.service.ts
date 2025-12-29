import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { PnlRecord, PnlType } from '../../../entities/pnl-record.entity';
import { Account } from '../../../entities/account.entity';
import { CreatePnlDto } from '../dto/create-pnl.dto';
import { PnlQueryDto } from '../dto/pnl-query.dto';

@Injectable()
export class PnlService {
  constructor(
    @InjectRepository(PnlRecord)
    private pnlRepository: Repository<PnlRecord>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
  ) {}

  async create(userId: string, createPnlDto: CreatePnlDto): Promise<PnlRecord> {
    const account = await this.accountRepository.findOne({
      where: { id: createPnlDto.accountId, userId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const pnl = this.pnlRepository.create(createPnlDto);
    return this.pnlRepository.save(pnl);
  }

  async findAll(userId: string, query: PnlQueryDto): Promise<PnlRecord[]> {
    const where: FindOptionsWhere<PnlRecord> = {};

    if (query.accountId) {
      const account = await this.accountRepository.findOne({
        where: { id: query.accountId, userId },
      });
      if (!account) {
        throw new NotFoundException('Account not found');
      }
      where.accountId = query.accountId;
    }

    if (query.symbol) {
      where.symbol = query.symbol;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.startDate && query.endDate) {
      where.timestamp = Between(
        new Date(query.startDate),
        new Date(query.endDate),
      );
    }

    return this.pnlRepository.find({
      where,
      relations: ['account'],
      order: { timestamp: 'DESC' },
    });
  }

  async getAnalytics(userId: string, accountId?: string) {
    let accounts: Account[];

    if (accountId) {
      const account = await this.accountRepository.findOne({
        where: { id: accountId, userId },
      });
      if (!account) {
        throw new NotFoundException('Account not found');
      }
      accounts = [account];
    } else {
      accounts = await this.accountRepository.find({
        where: { userId },
      });
    }

    const accountIds = accounts.map((a) => a.id);

    const pnlRecords = await this.pnlRepository
      .createQueryBuilder('pnl')
      .where('pnl.accountId IN (:...accountIds)', { accountIds })
      .getMany();

    const totalRealized = pnlRecords
      .filter((p) => p.type === PnlType.REALIZED)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const totalUnrealized = pnlRecords
      .filter((p) => p.type === PnlType.UNREALIZED)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const winningTrades = pnlRecords.filter(
      (p) => p.type === PnlType.REALIZED && Number(p.amount) > 0,
    ).length;

    const losingTrades = pnlRecords.filter(
      (p) => p.type === PnlType.REALIZED && Number(p.amount) < 0,
    ).length;

    const winRate =
      winningTrades + losingTrades > 0
        ? (winningTrades / (winningTrades + losingTrades)) * 100
        : 0;

    const bySymbol = pnlRecords.reduce((acc, pnl) => {
      if (!acc[pnl.symbol]) {
        acc[pnl.symbol] = { realized: 0, unrealized: 0, trades: 0 };
      }
      if (pnl.type === PnlType.REALIZED) {
        acc[pnl.symbol].realized += Number(pnl.amount);
        acc[pnl.symbol].trades += 1;
      } else {
        acc[pnl.symbol].unrealized += Number(pnl.amount);
      }
      return acc;
    }, {} as Record<string, { realized: number; unrealized: number; trades: number }>);

    const byMonth = pnlRecords.reduce((acc, pnl) => {
      const month = new Date(pnl.timestamp).toISOString().slice(0, 7);
      if (!acc[month]) {
        acc[month] = { realized: 0, unrealized: 0 };
      }
      if (pnl.type === PnlType.REALIZED) {
        acc[month].realized += Number(pnl.amount);
      } else {
        acc[month].unrealized += Number(pnl.amount);
      }
      return acc;
    }, {} as Record<string, { realized: number; unrealized: number }>);

    return {
      summary: {
        totalRealized,
        totalUnrealized,
        totalPnl: totalRealized + totalUnrealized,
        winningTrades,
        losingTrades,
        totalTrades: winningTrades + losingTrades,
        winRate: Math.round(winRate * 100) / 100,
      },
      bySymbol,
      byMonth,
    };
  }

  async remove(id: string, userId: string): Promise<void> {
    const pnl = await this.pnlRepository.findOne({
      where: { id },
      relations: ['account'],
    });

    if (!pnl || pnl.account.userId !== userId) {
      throw new NotFoundException('PNL record not found');
    }

    await this.pnlRepository.remove(pnl);
  }
}
