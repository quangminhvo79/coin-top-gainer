import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Balance } from './balance.entity';
import { PnlRecord } from './pnl-record.entity';

export enum AccountType {
  SPOT = 'spot',
  FUTURES = 'futures',
  MARGIN = 'margin',
}

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: AccountType,
    default: AccountType.SPOT,
  })
  type: AccountType;

  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 })
  totalBalance: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 })
  availableBalance: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 })
  lockedBalance: number;

  @Column({ nullable: true })
  currency: string;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.accounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Balance, (balance) => balance.account)
  balances: Balance[];

  @OneToMany(() => PnlRecord, (pnl) => pnl.account)
  pnlRecords: PnlRecord[];
}
