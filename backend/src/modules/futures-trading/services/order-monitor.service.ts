import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { FuturesOrder, OrderStatus } from '../../../entities/futures-order.entity';
import { TradingPlatform } from '../../../entities/trading-platform.entity';
import { BinanceFuturesService } from './binance-futures.service';

@Injectable()
export class OrderMonitorService {
  private readonly logger = new Logger(OrderMonitorService.name);

  constructor(
    @InjectRepository(FuturesOrder)
    private ordersRepository: Repository<FuturesOrder>,
    @InjectRepository(TradingPlatform)
    private platformRepository: Repository<TradingPlatform>,
    private binanceService: BinanceFuturesService,
  ) {}

  // DISABLED: Auto-monitoring disabled to reduce database load
  // To enable, uncomment the @Cron decorator below
  // @Cron(CronExpression.EVERY_MINUTE)
  async monitorActiveOrders() {
    const activeOrders = await this.ordersRepository.find({
      where: {
        status: In([OrderStatus.PENDING, OrderStatus.PARTIALLY_FILLED, OrderStatus.FILLED]),
      },
      relations: ['tradingPlatform'],
    });

    if (activeOrders.length === 0) {
      this.logger.debug('No active orders to monitor');
      return;
    }

    this.logger.log(`Monitoring ${activeOrders.length} active orders`);

    for (const order of activeOrders) {
      try {
        await this.checkOrderStatus(order);
      } catch (error) {
        this.logger.error(
          `Failed to check order ${order.id}: ${error.message}`,
        );
      }
    }
  }

  private async checkOrderStatus(order: FuturesOrder): Promise<void> {
    const platform = order.tradingPlatform;

    // Check TP order
    if (order.takeProfitOrderId) {
      try {
        const tpStatus = await this.binanceService.getOrderStatus(
          platform,
          order.symbol,
          order.takeProfitOrderId,
        );

        if (tpStatus.status === 'FILLED') {
          // TP triggered - cancel SL and update order
          if (order.stopLossOrderId) {
            await this.binanceService
              .cancelOrder(platform, order.symbol, order.stopLossOrderId)
              .catch((err) =>
                this.logger.warn(`Failed to cancel SL after TP: ${err.message}`),
              );
          }

          await this.ordersRepository.update(order.id, {
            status: OrderStatus.TP_TRIGGERED,
            closedAt: new Date(),
          });

          this.logger.log(`Order ${order.id} - TP triggered`);
          return;
        }
      } catch (error) {
        this.logger.error(`Failed to check TP order: ${error.message}`);
      }
    }

    // Check SL order
    if (order.stopLossOrderId) {
      try {
        const slStatus = await this.binanceService.getOrderStatus(
          platform,
          order.symbol,
          order.stopLossOrderId,
        );

        if (slStatus.status === 'FILLED') {
          // SL triggered - cancel TP and update order
          if (order.takeProfitOrderId) {
            await this.binanceService
              .cancelOrder(platform, order.symbol, order.takeProfitOrderId)
              .catch((err) =>
                this.logger.warn(`Failed to cancel TP after SL: ${err.message}`),
              );
          }

          await this.ordersRepository.update(order.id, {
            status: OrderStatus.SL_TRIGGERED,
            closedAt: new Date(),
          });

          this.logger.log(`Order ${order.id} - SL triggered`);
          return;
        }
      } catch (error) {
        this.logger.error(`Failed to check SL order: ${error.message}`);
      }
    }

    // Check main order
    if (order.mainOrderId) {
      try {
        const mainStatus = await this.binanceService.getOrderStatus(
          platform,
          order.symbol,
          order.mainOrderId,
        );

        if (mainStatus.status === 'FILLED' && order.status !== OrderStatus.FILLED) {
          await this.ordersRepository.update(order.id, {
            status: OrderStatus.FILLED,
            filledAt: new Date(),
          });
          this.logger.log(`Order ${order.id} - Main order filled`);
        } else if (
          mainStatus.status === 'PARTIALLY_FILLED' &&
          order.status !== OrderStatus.PARTIALLY_FILLED
        ) {
          await this.ordersRepository.update(order.id, {
            status: OrderStatus.PARTIALLY_FILLED,
          });
          this.logger.log(`Order ${order.id} - Main order partially filled`);
        }
      } catch (error) {
        this.logger.error(`Failed to check main order: ${error.message}`);
      }
    }
  }
}
