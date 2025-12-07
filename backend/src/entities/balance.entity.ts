import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Account } from './account.entity';

@Entity('balances')
export class Balance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  asset: string;

  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 })
  free: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 })
  locked: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 })
  total: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  usdValue: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  priceUsd: number;

  @ManyToOne(() => Account, (account) => account.balances, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'accountId' })
  account: Account;

  @Column()
  accountId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
