import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FuturesTradingService } from '../services/futures-trading.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderQueryDto } from '../dto/order-query.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('futures')
@UseGuards(JwtAuthGuard)
export class FuturesTradingController {
  constructor(private readonly futuresService: FuturesTradingService) {}

  @Post('orders')
  async placeOrder(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return this.futuresService.placeOrder(req.user.userId, createOrderDto);
  }

  @Get('orders')
  async getOrders(@Request() req, @Query() query: OrderQueryDto) {
    return this.futuresService.getOrders(
      req.user.userId,
      query.platformId,
      query.status,
    );
  }

  @Get('orders/:id')
  async getOrder(@Request() req, @Param('id') id: string) {
    return this.futuresService.getOrderById(id, req.user.userId);
  }

  @Delete('orders/:id')
  async cancelOrder(@Request() req, @Param('id') id: string) {
    await this.futuresService.cancelOrder(id, req.user.userId);
    return { message: 'Order cancelled successfully' };
  }

  @Get('sync-orders')
  async syncOrdersFromBinance(
    @Request() req,
    @Query('platformId') platformId: string,
  ) {
    return this.futuresService.syncOrdersFromBinance(
      req.user.userId,
      platformId,
    );
  }
}
