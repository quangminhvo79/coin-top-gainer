import { IsString, IsEnum, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { AccountType } from '../../../entities/account.entity';

export class UpdateAccountDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(AccountType)
  type?: AccountType;

  @IsOptional()
  @IsNumber()
  totalBalance?: number;

  @IsOptional()
  @IsNumber()
  availableBalance?: number;

  @IsOptional()
  @IsNumber()
  lockedBalance?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
