import { IsString, IsEnum, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { OrderSide, PositionSide } from '../../../entities/futures-order.entity';

export class CreateOrderDto {
  @IsString()
  tradingPlatformId: string;

  @IsOptional()
  @IsString()
  accountId?: string;

  @IsString()
  symbol: string;

  @IsEnum(OrderSide)
  side: OrderSide;

  @IsOptional()
  @IsEnum(PositionSide)
  positionSide?: PositionSide;

  @IsNumber()
  @Min(0)
  totalCapital: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(125)
  leverage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(100)
  takeProfitPercent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(100)
  stopLossPercent?: number;
}
