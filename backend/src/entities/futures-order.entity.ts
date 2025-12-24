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
import { TradingPlatform } from './trading-platform.entity';
import { Account } from './account.entity';

export enum OrderSide {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum PositionSide {
  LONG = 'LONG',
  SHORT = 'SHORT',
  BOTH = 'BOTH',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  FILLED = 'FILLED',
  PARTIALLY_FILLED = 'PARTIALLY_FILLED',
  CANCELLED = 'CANCELLED',
  TP_TRIGGERED = 'TP_TRIGGERED',
  SL_TRIGGERED = 'SL_TRIGGERED',
  FAILED = 'FAILED',
}

@Entity('futures_orders')
export class FuturesOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Binance order IDs
  @Column({ type: 'bigint', nullable: true })
  mainOrderId: string;

  @Column({ type: 'bigint', nullable: true })
  takeProfitOrderId: string;

  @Column({ type: 'bigint', nullable: true })
  stopLossOrderId: string;

  // Client order IDs (for tracking)
  @Column({ unique: true })
  clientOrderId: string;

  @Column({ nullable: true })
  tpClientOrderId: string;

  @Column({ nullable: true })
  slClientOrderId: string;

  // Trading parameters
  @Column()
  symbol: string;

  @Column({
    type: 'enum',
    enum: OrderSide,
  })
  side: OrderSide;

  @Column({
    type: 'enum',
    enum: PositionSide,
    default: PositionSide.BOTH,
  })
  positionSide: PositionSide;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  quantity: number;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  leverage: number;

  // TP/SL prices
  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  takeProfitPrice: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  stopLossPrice: number;

  // TP/SL percentages (stored for reference)
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  takeProfitPercent: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  stopLossPercent: number;

  // Status tracking
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    totalCapital?: number;
    calculatedQuantity?: number;
    binanceResponse?: any;
    errorMessage?: string;
    cancelledOrderId?: string;
    tpSlError?: string;
  };

  // Relations
  @ManyToOne(() => TradingPlatform, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tradingPlatformId' })
  tradingPlatform: TradingPlatform;

  @Column()
  tradingPlatformId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Account, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'accountId' })
  account: Account;

  @Column({ nullable: true })
  accountId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  filledAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  closedAt: Date;
}
