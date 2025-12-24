import { IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';

export class UpdatePlatformDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsOptional()
  @IsString()
  apiSecret?: string;

  @IsOptional()
  @IsString()
  passphrase?: string;

  @IsOptional()
  @IsBoolean()
  isTestnet?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsObject()
  settings?: {
    permissions?: string[];
    rateLimits?: Record<string, number>;
    futuresConfig?: {
      defaultLeverage?: number;
      defaultTakeProfitPercent?: number;
      defaultStopLossPercent?: number;
      defaultPositionSizePercent?: number;
      autoTpSl?: boolean;
    };
  };
}
