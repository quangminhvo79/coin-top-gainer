import { IsString, IsEnum, IsOptional, IsBoolean, IsObject } from 'class-validator';
import { PlatformType } from '../../../entities/trading-platform.entity';

export class CreatePlatformDto {
  @IsEnum(PlatformType)
  platform: PlatformType;

  @IsString()
  name: string;

  @IsString()
  apiKey: string;

  @IsString()
  apiSecret: string;

  @IsOptional()
  @IsString()
  passphrase?: string;

  @IsOptional()
  @IsBoolean()
  isTestnet?: boolean;

  @IsOptional()
  @IsObject()
  settings?: {
    baseUrl?: string;
    permissions?: string[];
    rateLimits?: Record<string, number>;
  };
}
