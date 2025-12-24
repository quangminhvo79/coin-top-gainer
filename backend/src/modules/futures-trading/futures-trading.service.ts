import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { FuturesOrder, OrderStatus, PositionSide } from '../../entities/futures-order.entity';
import { TradingPlatform } from '../../entities/trading-platform.entity';
import { Account } from '../../entities/account.entity';
import { BinanceFuturesService } from './binance-futures.service';
import { OrderCalculatorService } from './order-calculator.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class FuturesTradingService {
  private readonly logger = new Logger(FuturesTradingService.name);

  constructor(
    @InjectRepository(FuturesOrder)
    private ordersRepository: Repository<FuturesOrder>,
    @InjectRepository(TradingPlatform)
    private platformRepository: Repository<TradingPlatform>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    private binanceService: BinanceFuturesService,
    private calculator: OrderCalculatorService,
  ) {}

  async placeOrder(
    userId: string,
    createOrderDto: CreateOrderDto,
  ): Promise<FuturesOrder> {
    // 1. Validate trading platform
    const platform = await this.platformRepository.findOne({
      where: { id: createOrderDto.tradingPlatformId, userId },
    });

    if (!platform) {
      throw new NotFoundException('Trading platform not found');
    }

    if (platform.platform !== 'binance') {
      throw new BadRequestException('Only Binance futures trading is supported');
    }

    // 2. Get futures settings (use defaults if not provided in DTO)
    const futuresConfig = platform.settings?.futuresConfig || {};
    const leverage = createOrderDto.leverage || futuresConfig.defaultLeverage || 10;
    const tpPercent =
      createOrderDto.takeProfitPercent || futuresConfig.defaultTakeProfitPercent || 5;
    const slPercent =
      createOrderDto.stopLossPercent || futuresConfig.defaultStopLossPercent || 5;

    // 3. Get current price
    const currentPrice = await this.binanceService.getCurrentPrice(
      platform,
      createOrderDto.symbol,
    );

    // 4. Calculate order parameters
    const calculation = this.calculator.calculateOrder({
      currentPrice,
      totalCapital: createOrderDto.totalCapital,
      takeProfitPercent: tpPercent,
      stopLossPercent: slPercent,
      leverage,
      side: createOrderDto.side,
    });

    this.logger.log(`Order calculation: ${JSON.stringify(calculation)}`);

    // 5. Set leverage on Binance
    try {
      await this.binanceService.setLeverage(
        platform,
        createOrderDto.symbol,
        leverage,
      );
    } catch (error) {
      this.logger.warn(
        `Failed to set leverage (may already be set): ${error.message}`,
      );
    }

    // 6. Generate client order IDs
    const baseClientId = `CG_${uuidv4().substring(0, 8)}`;
    const mainClientId = `${baseClientId}_MAIN`;
    const tpClientId = `${baseClientId}_TP`;
    const slClientId = `${baseClientId}_SL`;

    // 7. Place main LIMIT order
    const mainOrderResponse = await this.binanceService.placeOrder(platform, {
      symbol: createOrderDto.symbol,
      side: createOrderDto.side,
      type: 'LIMIT',
      positionSide: createOrderDto.positionSide || PositionSide.BOTH,
      quantity: calculation.quantity.toString(),
      price: calculation.entryPrice.toString(),
      timeInForce: 'GTC',
      newClientOrderId: mainClientId,
    });

    this.logger.log(`Main order placed: ${JSON.stringify(mainOrderResponse)}`);

    // 8. Create database record
    const futuresOrder = this.ordersRepository.create({
      mainOrderId: mainOrderResponse.orderId?.toString(),
      clientOrderId: mainClientId,
      tpClientOrderId: tpClientId,
      slClientOrderId: slClientId,
      symbol: createOrderDto.symbol,
      side: createOrderDto.side,
      positionSide: createOrderDto.positionSide || PositionSide.BOTH,
      quantity: calculation.quantity,
      price: calculation.entryPrice,
      leverage,
      takeProfitPrice: calculation.takeProfitPrice,
      stopLossPrice: calculation.stopLossPrice,
      takeProfitPercent: tpPercent,
      stopLossPercent: slPercent,
      status: OrderStatus.PENDING,
      userId,
      tradingPlatformId: createOrderDto.tradingPlatformId,
      accountId: createOrderDto.accountId,
      metadata: {
        totalCapital: createOrderDto.totalCapital,
        calculatedQuantity: calculation.quantity,
        binanceResponse: mainOrderResponse,
      },
    });

    const savedOrder = await this.ordersRepository.save(futuresOrder);

    // 9. Place TP and SL orders asynchronously (don't block main order)
    this.placeTpSlOrders(platform, savedOrder, calculation).catch((error) => {
      this.logger.error(`Failed to place TP/SL orders: ${error.message}`);
      // Update order status to indicate TP/SL failure
      this.ordersRepository.update(savedOrder.id, {
        metadata: {
          ...savedOrder.metadata,
          tpSlError: error.message,
        },
      });
    });

    return savedOrder;
  }

  private async placeTpSlOrders(
    platform: TradingPlatform,
    order: FuturesOrder,
    calculation: any,
  ): Promise<void> {
    // Wait a bit for main order to be processed
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      // Place Take Profit order (TAKE_PROFIT_MARKET)
      const tpResponse = await this.binanceService.placeOrder(platform, {
        symbol: order.symbol,
        side: order.side === 'BUY' ? 'SELL' : 'BUY', // Opposite side
        type: 'TAKE_PROFIT_MARKET',
        positionSide: order.positionSide,
        quantity: order.quantity.toString(),
        stopPrice: calculation.takeProfitPrice.toString(),
        timeInForce: 'GTC',
        newClientOrderId: order.tpClientOrderId,
        reduceOnly: true,
      });

      await this.ordersRepository.update(order.id, {
        takeProfitOrderId: tpResponse.orderId?.toString(),
      });

      this.logger.log(`TP order placed: ${JSON.stringify(tpResponse)}`);
    } catch (error) {
      this.logger.error(`Failed to place TP order: ${error.message}`);
      throw error;
    }

    try {
      // Place Stop Loss order (STOP_MARKET)
      const slResponse = await this.binanceService.placeOrder(platform, {
        symbol: order.symbol,
        side: order.side === 'BUY' ? 'SELL' : 'BUY', // Opposite side
        type: 'STOP_MARKET',
        positionSide: order.positionSide,
        quantity: order.quantity.toString(),
        stopPrice: calculation.stopLossPrice.toString(),
        timeInForce: 'GTC',
        newClientOrderId: order.slClientOrderId,
        reduceOnly: true,
      });

      await this.ordersRepository.update(order.id, {
        stopLossOrderId: slResponse.orderId?.toString(),
      });

      this.logger.log(`SL order placed: ${JSON.stringify(slResponse)}`);
    } catch (error) {
      this.logger.error(`Failed to place SL order: ${error.message}`);
      throw error;
    }
  }

  async getOrders(
    userId: string,
    platformId?: string,
    status?: OrderStatus,
  ): Promise<FuturesOrder[]> {
    const where: any = { userId };
    if (platformId) {
      where.tradingPlatformId = platformId;
    }
    if (status) {
      where.status = status;
    }

    return this.ordersRepository.find({
      where,
      relations: ['tradingPlatform', 'account'],
      order: { createdAt: 'DESC' },
    });
  }

  async getOrderById(id: string, userId: string): Promise<FuturesOrder> {
    const order = await this.ordersRepository.findOne({
      where: { id, userId },
      relations: ['tradingPlatform', 'account'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async cancelOrder(id: string, userId: string): Promise<void> {
    const order = await this.getOrderById(id, userId);
    const platform = await this.platformRepository.findOne({
      where: { id: order.tradingPlatformId },
    });

    // Cancel all related orders
    const cancelPromises = [];

    if (order.mainOrderId) {
      cancelPromises.push(
        this.binanceService
          .cancelOrder(platform, order.symbol, order.mainOrderId)
          .catch((err) => this.logger.warn(`Failed to cancel main order: ${err.message}`)),
      );
    }
    if (order.takeProfitOrderId) {
      cancelPromises.push(
        this.binanceService
          .cancelOrder(platform, order.symbol, order.takeProfitOrderId)
          .catch((err) => this.logger.warn(`Failed to cancel TP order: ${err.message}`)),
      );
    }
    if (order.stopLossOrderId) {
      cancelPromises.push(
        this.binanceService
          .cancelOrder(platform, order.symbol, order.stopLossOrderId)
          .catch((err) => this.logger.warn(`Failed to cancel SL order: ${err.message}`)),
      );
    }

    await Promise.allSettled(cancelPromises);

    await this.ordersRepository.update(id, {
      status: OrderStatus.CANCELLED,
      closedAt: new Date(),
    });
  }

  // Webhook handler for order status updates
  async handleOrderUpdate(orderId: string, status: string): Promise<void> {
    const order = await this.ordersRepository.findOne({
      where: [
        { mainOrderId: orderId },
        { takeProfitOrderId: orderId },
        { stopLossOrderId: orderId },
      ],
      relations: ['tradingPlatform'],
    });

    if (!order) {
      this.logger.warn(`Order not found for Binance order ID: ${orderId}`);
      return;
    }

    const platform = order.tradingPlatform;

    // Handle TP/SL trigger - cancel the other order
    if (orderId === order.takeProfitOrderId && status === 'FILLED') {
      // TP triggered, cancel SL
      if (order.stopLossOrderId) {
        try {
          await this.binanceService.cancelOrder(
            platform,
            order.symbol,
            order.stopLossOrderId,
          );
        } catch (error) {
          this.logger.error(`Failed to cancel SL order: ${error.message}`);
        }
      }

      await this.ordersRepository.update(order.id, {
        status: OrderStatus.TP_TRIGGERED,
        closedAt: new Date(),
      });
    } else if (orderId === order.stopLossOrderId && status === 'FILLED') {
      // SL triggered, cancel TP
      if (order.takeProfitOrderId) {
        try {
          await this.binanceService.cancelOrder(
            platform,
            order.symbol,
            order.takeProfitOrderId,
          );
        } catch (error) {
          this.logger.error(`Failed to cancel TP order: ${error.message}`);
        }
      }

      await this.ordersRepository.update(order.id, {
        status: OrderStatus.SL_TRIGGERED,
        closedAt: new Date(),
      });
    } else if (orderId === order.mainOrderId) {
      // Main order status update
      const newStatus =
        status === 'FILLED'
          ? OrderStatus.FILLED
          : status === 'PARTIALLY_FILLED'
            ? OrderStatus.PARTIALLY_FILLED
            : order.status;

      await this.ordersRepository.update(order.id, {
        status: newStatus,
        filledAt: status === 'FILLED' ? new Date() : order.filledAt,
      });
    }
  }
}
