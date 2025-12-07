import { IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { AccountType } from '../../../entities/account.entity';

export class CreateAccountDto {
  @IsString()
  name: string;

  @IsEnum(AccountType)
  type: AccountType;

  @IsOptional()
  @IsNumber()
  totalBalance?: number;

  @IsOptional()
  @IsString()
  currency?: string;
}
