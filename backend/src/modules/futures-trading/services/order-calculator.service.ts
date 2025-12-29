import { Injectable } from '@nestjs/common';
import { OrderSide } from '../../../entities/futures-order.entity';

export interface CalculationParams {
  currentPrice: number;
  totalCapital: number;
  takeProfitPercent: number;
  stopLossPercent: number;
  leverage: number;
  side: OrderSide;
}

export interface CalculationResult {
  quantity: number;
  entryPrice: number;
  takeProfitPrice: number;
  stopLossPrice: number;
  maxLoss: number;
  expectedProfit: number;
}

@Injectable()
export class OrderCalculatorService {
  /**
   * Calculate order quantity based on TP/SL percentages
   *
   * Formula explanation:
   * - stopLossPercent is based on total capital (e.g., 5% of $1000 = $50 max loss)
   * - With leverage, a small price movement = large % gain/loss
   * - Example: 10x leverage, 0.5% price move = 5% profit/loss
   * - We calculate quantity so that SL hit = exactly stopLossPercent of capital
   *
   * Calculation:
   * 1. Max loss in USD = totalCapital * (stopLossPercent / 100)
   * 2. SL price move % = stopLossPercent / leverage
   * 3. SL price = currentPrice * (1 ± SL price move % / 100)
   * 4. Price difference = |entryPrice - SL price|
   * 5. Quantity = maxLoss / priceDifference
   */
  calculateOrder(params: CalculationParams): CalculationResult {
    const {
      currentPrice,
      totalCapital,
      takeProfitPercent,
      stopLossPercent,
      leverage,
      side,
    } = params;

    // Max loss allowed in USD
    const maxLoss = totalCapital * (stopLossPercent / 100);

    // Calculate price movement percentage for SL/TP
    // With leverage, actual price movement = target % / leverage
    const slPriceMovementPercent = stopLossPercent / leverage;
    const tpPriceMovementPercent = takeProfitPercent / leverage;

    let stopLossPrice: number;
    let takeProfitPrice: number;

    if (side === OrderSide.BUY) {
      // LONG position
      // SL below entry, TP above entry
      stopLossPrice = currentPrice * (1 - slPriceMovementPercent / 100);
      takeProfitPrice = currentPrice * (1 + tpPriceMovementPercent / 100);
    } else {
      // SHORT position
      // SL above entry, TP below entry
      stopLossPrice = currentPrice * (1 + slPriceMovementPercent / 100);
      takeProfitPrice = currentPrice * (1 - tpPriceMovementPercent / 100);
    }

    // Calculate quantity so that SL hit = max loss
    const slPriceDifference = Math.abs(currentPrice - stopLossPrice);
    const quantity = maxLoss / slPriceDifference;

    // Calculate expected profit
    const tpPriceDifference = Math.abs(takeProfitPrice - currentPrice);
    const expectedProfit = quantity * tpPriceDifference;

    return {
      quantity: parseFloat(quantity.toFixed(8)),
      entryPrice: parseFloat(currentPrice.toFixed(8)),
      takeProfitPrice: parseFloat(takeProfitPrice.toFixed(8)),
      stopLossPrice: parseFloat(stopLossPrice.toFixed(8)),
      maxLoss: parseFloat(maxLoss.toFixed(2)),
      expectedProfit: parseFloat(expectedProfit.toFixed(2)),
    };
  }

  /**
   * Round quantity to Binance step size requirements
   * Each symbol has different precision requirements
   */
  roundQuantity(quantity: number, stepSize: number = 0.001): number {
    return Math.floor(quantity / stepSize) * stepSize;
  }
}
