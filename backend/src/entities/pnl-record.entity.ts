import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Account } from './account.entity';

export enum PnlType {
  REALIZED = 'realized',
  UNREALIZED = 'unrealized',
}

@Entity('pnl_records')
export class PnlRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  symbol: string;

  @Column({
    type: 'enum',
    enum: PnlType,
  })
  type: PnlType;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  amount: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  percentage: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  entryPrice: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  exitPrice: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  quantity: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    tradingPair?: string;
    fees?: number;
    notes?: string;
  };

  @ManyToOne(() => Account, (account) => account.pnlRecords, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'accountId' })
  account: Account;

  @Column()
  accountId: string;

  @CreateDateColumn()
  timestamp: Date;
}
