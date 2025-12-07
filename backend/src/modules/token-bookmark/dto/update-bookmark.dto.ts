import { IsString, IsOptional, IsObject } from 'class-validator';

export class UpdateBookmarkDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsObject()
  metadata?: {
    priceAlerts?: Array<{
      price: number;
      type: 'above' | 'below';
      enabled: boolean;
    }>;
    tags?: string[];
    customFields?: Record<string, any>;
  };
}
