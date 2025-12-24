import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum PlatformType {
  BINANCE = 'binance',
  COINBASE = 'coinbase',
  KRAKEN = 'kraken',
  BYBIT = 'bybit',
  OKX = 'okx',
  CUSTOM = 'custom',
}

@Entity('trading_platforms')
export class TradingPlatform {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: PlatformType,
  })
  platform: PlatformType;

  @Column()
  name: string;

  @Column()
  apiKey: string;

  @Column()
  apiSecret: string;

  @Column({ nullable: true })
  passphrase: string;

  @Column({ default: false })
  isTestnet: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  settings: {
    baseUrl?: string;
    permissions?: string[];
    rateLimits?: Record<string, number>;
    futuresConfig?: {
      defaultLeverage?: number;
      defaultTakeProfitPercent?: number;
      defaultStopLossPercent?: number;
      autoTpSl?: boolean;
    };
  };

  @ManyToOne(() => User, (user) => user.tradingPlatforms, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column({ type: 'timestamp', nullable: true })
  lastSyncedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
