import { IsNumber, IsBoolean, IsOptional, IsString, Min, Max } from 'class-validator';

export class UpdateFuturesSettingsDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(125)
  defaultLeverage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(100)
  defaultTakeProfitPercent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(100)
  defaultStopLossPercent?: number;

  @IsOptional()
  @IsBoolean()
  autoTpSl?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  defaultPositionSize?: number;

  @IsOptional()
  @IsString()
  defaultSymbol?: string;

  @IsOptional()
  @IsString()
  defaultOrderType?: string; // MARKET, LIMIT

  @IsOptional()
  @IsBoolean()
  confirmBeforePlacing?: boolean;
}
