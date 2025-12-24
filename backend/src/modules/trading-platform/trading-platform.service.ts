import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TradingPlatform } from '../../entities/trading-platform.entity';
import { CreatePlatformDto } from './dto/create-platform.dto';
import { UpdatePlatformDto } from './dto/update-platform.dto';
import { UpdateFuturesSettingsDto } from '../futures-trading/dto/update-futures-settings.dto';

@Injectable()
export class TradingPlatformService {
  constructor(
    @InjectRepository(TradingPlatform)
    private platformRepository: Repository<TradingPlatform>,
  ) {}

  async create(
    userId: string,
    createPlatformDto: CreatePlatformDto,
  ): Promise<TradingPlatform> {
    const platform = this.platformRepository.create({
      ...createPlatformDto,
      userId,
    });

    return this.platformRepository.save(platform);
  }

  async findAll(userId: string): Promise<TradingPlatform[]> {
    return this.platformRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<TradingPlatform> {
    const platform = await this.platformRepository.findOne({
      where: { id, userId },
    });

    if (!platform) {
      throw new NotFoundException('Trading platform not found');
    }

    return platform;
  }

  async update(
    id: string,
    userId: string,
    updatePlatformDto: UpdatePlatformDto,
  ): Promise<TradingPlatform> {
    const platform = await this.findOne(id, userId);
    Object.assign(platform, updatePlatformDto);
    return this.platformRepository.save(platform);
  }

  async remove(id: string, userId: string): Promise<void> {
    const platform = await this.findOne(id, userId);
    await this.platformRepository.remove(platform);
  }

  async syncBalances(id: string, userId: string): Promise<any> {
    const platform = await this.findOne(id, userId);

    // This is a placeholder for actual API integration
    // You would implement specific exchange API calls here
    switch (platform.platform) {
      case 'binance':
        return this.syncBinanceBalances(platform);
      case 'coinbase':
        return this.syncCoinbaseBalances(platform);
      case 'kraken':
        return this.syncKrakenBalances(platform);
      default:
        throw new Error('Platform not supported');
    }
  }

  private async syncBinanceBalances(platform: TradingPlatform): Promise<any> {
    // Implement Binance API integration
    // This is a placeholder - you'll need to install and use the binance-api-node package
    return {
      message: 'Binance sync not implemented yet',
      platform: platform.name,
    };
  }

  private async syncCoinbaseBalances(platform: TradingPlatform): Promise<any> {
    // Implement Coinbase API integration
    return {
      message: 'Coinbase sync not implemented yet',
      platform: platform.name,
    };
  }

  private async syncKrakenBalances(platform: TradingPlatform): Promise<any> {
    // Implement Kraken API integration
    return {
      message: 'Kraken sync not implemented yet',
      platform: platform.name,
    };
  }

  async updateLastSynced(id: string, userId: string): Promise<void> {
    const platform = await this.findOne(id, userId);
    platform.lastSyncedAt = new Date();
    await this.platformRepository.save(platform);
  }

  async updateFuturesSettings(
    id: string,
    userId: string,
    futuresSettings: UpdateFuturesSettingsDto,
  ): Promise<TradingPlatform> {
    const platform = await this.findOne(id, userId);

    platform.settings = {
      ...platform.settings,
      futuresConfig: {
        ...platform.settings?.futuresConfig,
        ...futuresSettings,
      },
    };

    return this.platformRepository.save(platform);
  }
}
