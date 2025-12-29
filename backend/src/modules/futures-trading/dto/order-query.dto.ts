import { IsOptional, IsEnum, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { OrderStatus } from '../../../entities/futures-order.entity';

export class OrderQueryDto {
  @IsOptional()
  @IsString()
  platformId?: string;

  @IsOptional()
  @Transform(({ value }) => {
    // Handle comma-separated string or array
    if (typeof value === 'string') {
      return value.split(',').map(s => s.trim());
    }
    return value;
  })
  status?: OrderStatus | OrderStatus[];

  @IsOptional()
  @IsString()
  symbol?: string;
}
