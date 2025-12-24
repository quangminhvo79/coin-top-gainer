import { IsOptional, IsEnum, IsString } from 'class-validator';
import { OrderStatus } from '../../../entities/futures-order.entity';

export class OrderQueryDto {
  @IsOptional()
  @IsString()
  platformId?: string;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsString()
  symbol?: string;
}
