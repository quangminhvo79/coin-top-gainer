import { IsNumber, IsBoolean, IsOptional, Min, Max } from 'class-validator';

/**
 * DTO for updating futures trading settings in TradingPlatform.settings.futuresConfig
 * This corresponds to the futuresConfig object in TradingPlatform entity
 */
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
  @IsNumber()
  @Min(1)
  @Max(100)
  defaultPositionSizePercent?: number; // % of total capital to use per position (1-100%)

  @IsOptional()
  @IsBoolean()
  autoTpSl?: boolean;
}
