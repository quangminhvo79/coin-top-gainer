import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { PnlType } from '../../../entities/pnl-record.entity';

export class PnlQueryDto {
  @IsOptional()
  @IsString()
  accountId?: string;

  @IsOptional()
  @IsString()
  symbol?: string;

  @IsOptional()
  @IsEnum(PnlType)
  type?: PnlType;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
