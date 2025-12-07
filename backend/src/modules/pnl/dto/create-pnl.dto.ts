import { IsString, IsEnum, IsNumber, IsOptional, IsObject } from 'class-validator';
import { PnlType } from '../../../entities/pnl-record.entity';

export class CreatePnlDto {
  @IsString()
  accountId: string;

  @IsString()
  symbol: string;

  @IsEnum(PnlType)
  type: PnlType;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsNumber()
  percentage?: number;

  @IsOptional()
  @IsNumber()
  entryPrice?: number;

  @IsOptional()
  @IsNumber()
  exitPrice?: number;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsObject()
  metadata?: {
    tradingPair?: string;
    fees?: number;
    notes?: string;
  };
}
