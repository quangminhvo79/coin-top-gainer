import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { DerivativesTradingUsdsFutures } from '@binance/derivatives-trading-usds-futures';
import { TradingPlatform } from '../../../entities/trading-platform.entity';
import { OrderSide, PositionSide } from '../../../entities/futures-order.entity';

export interface BinanceOrderParams {
  symbol: string;
  side: OrderSide;
  type: 'LIMIT' | 'MARKET' | 'STOP_MARKET' | 'TAKE_PROFIT_MARKET';
  positionSide?: PositionSide;
  quantity: string;
  price?: string;
  stopPrice?: string;
  timeInForce?: 'GTC' | 'IOC' | 'FOK';
  newClientOrderId?: string;
  reduceOnly?: boolean;
}

@Injectable()
export class BinanceFuturesService {
  private readonly logger = new Logger(BinanceFuturesService.name);

  private createClient(platform: TradingPlatform): DerivativesTradingUsdsFutures {
    const configurationRestAPI: any = {
      apiKey: platform.apiKey,
      apiSecret: platform.apiSecret,
    };

    if (platform.isTestnet) {
      configurationRestAPI.baseURL = 'https://testnet.binancefuture.com';
    }

    return new DerivativesTradingUsdsFutures({ configurationRestAPI });
  }

  async setLeverage(
    platform: TradingPlatform,
    symbol: string,
    leverage: number,
  ): Promise<any> {
    try {
      const client = this.createClient(platform);
      const response = await client.restAPI.changeInitialLeverage({
        symbol,
        leverage,
      });

      const data = await response.data();
      this.logger.log(`Set leverage for ${symbol} to ${leverage}x: ${JSON.stringify(data)}`);
      return data;
    } catch (error) {
      this.logger.error(`Failed to set leverage: ${error.message}`);
      throw new HttpException(
        error.message || 'Failed to set leverage',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getCurrentPrice(
    platform: TradingPlatform,
    symbol: string,
  ): Promise<number> {
    try {
      const client = this.createClient(platform);
      const response = await client.restAPI.symbolPriceTicker({ symbol });
      const data = await response.data();

      this.logger.log(`Current price for ${symbol}: ${(data as any).price}`);
      return parseFloat((data as any).price);
    } catch (error) {
      this.logger.error(`Failed to get current price: ${error.message}`);
      throw new HttpException(
        error.message || 'Failed to get current price',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getAccountBalance(platform: TradingPlatform): Promise<any> {
    try {
      const client = this.createClient(platform);
      const response = await client.restAPI.futuresAccountBalanceV2();
      const data = await response.data();

      this.logger.log(`Account balance retrieved: ${data.length} assets`);
      return data;
    } catch (error) {
      this.logger.error(`Failed to get account balance: ${error.message}`);
      throw new HttpException(
        error.message || 'Failed to get account balance',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async placeOrder(
    platform: TradingPlatform,
    params: BinanceOrderParams,
  ): Promise<any> {
    try {
      const client = this.createClient(platform);

      const orderParams: any = {
        symbol: params.symbol,
        side: params.side,
        type: params.type,
      };

      if (params.positionSide) {
        orderParams.positionSide = params.positionSide;
      }

      if (params.quantity) {
        orderParams.quantity = params.quantity;
      }

      if (params.price) {
        orderParams.price = params.price;
      }

      if (params.stopPrice) {
        orderParams.stopPrice = params.stopPrice;
      }

      if (params.timeInForce) {
        orderParams.timeInForce = params.timeInForce;
      }

      if (params.newClientOrderId) {
        orderParams.newClientOrderId = params.newClientOrderId;
      }

      if (params.reduceOnly !== undefined) {
        orderParams.reduceOnly = params.reduceOnly;
      }

      const response = await client.restAPI.newOrder(orderParams);
      const data = await response.data();

      this.logger.log(`Order placed: ${JSON.stringify(data)}`);
      return data;
    } catch (error) {
      this.logger.error(`Failed to place order: ${error.message}`);
      throw new HttpException(
        error.message || 'Failed to place order',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async cancelOrder(
    platform: TradingPlatform,
    symbol: string,
    orderId: string,
  ): Promise<any> {
    try {
      const client = this.createClient(platform);
      const response = await client.restAPI.cancelOrder({
        symbol,
        orderId: parseInt(orderId),
      });
      const data = await response.data();

      this.logger.log(`Order cancelled: ${JSON.stringify(data)}`);
      return data;
    } catch (error) {
      this.logger.error(`Failed to cancel order: ${error.message}`);
      throw new HttpException(
        error.message || 'Failed to cancel order',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getOrderStatus(
    platform: TradingPlatform,
    symbol: string,
    orderId: string,
  ): Promise<any> {
    try {
      const client = this.createClient(platform);
      const response = await client.restAPI.queryOrder({
        symbol,
        orderId: parseInt(orderId),
      });
      const data = await response.data();

      return data;
    } catch (error) {
      this.logger.error(`Failed to query order status: ${error.message}`);
      throw new HttpException(
        error.message || 'Failed to query order status',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Get all current open orders from Binance
   * @param platform Trading platform with API credentials
   * @param symbol Optional symbol filter (e.g., 'BTCUSDT')
   * @returns Array of open orders from Binance
   */
  async getCurrentOpenOrders(
    platform: TradingPlatform,
    symbol?: string,
  ): Promise<any[]> {
    try {
      const client = this.createClient(platform);
      const response = await client.restAPI.currentAllOpenOrders({
        symbol: symbol || undefined,
      });
      const data = await response.data();

      console.log('Binance open orders data', data);

      // this.logger.log(`Retrieved ${data.length} open orders${symbol ? ` for ${symbol}` : ''}`);
      return data;
    } catch (error) {
      this.logger.error(`Failed to get open orders: ${error.message}`);
      throw new HttpException(
        error.message || 'Failed to get open orders',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
