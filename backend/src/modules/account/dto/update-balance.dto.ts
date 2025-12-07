import { IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdateBalanceDto {
  @IsString()
  asset: string;

  @IsNumber()
  free: number;

  @IsNumber()
  locked: number;

  @IsOptional()
  @IsNumber()
  priceUsd?: number;
}
