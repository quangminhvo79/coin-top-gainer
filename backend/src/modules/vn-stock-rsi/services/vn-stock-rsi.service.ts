import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { RsiResultDto } from '../dto/rsi-result.dto';

interface StockPrice {
  date: string;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
}

@Injectable()
export class VnStockRsiService {
  private readonly logger = new Logger(VnStockRsiService.name);

  // Sử dụng API công khai của VND Direct hoặc SSI iBoard
  private readonly API_BASE_URL = 'https://finfo-api.vndirect.com.vn';

  /**
   * Tính toán RSI (Relative Strength Index)
   * @param prices - Mảng giá đóng cửa
   * @param period - Chu kỳ RSI (mặc định 14)
   * @returns Giá trị RSI
   */
  private calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) {
      throw new Error('Không đủ dữ liệu để tính RSI');
    }

    // Tính toán các thay đổi giá
    const changes: number[] = [];
    for (let i = 1; i < prices.length; i++) {
      changes.push(prices[i] - prices[i - 1]);
    }

    // Tính toán gains và losses
    const gains: number[] = changes.map(change => change > 0 ? change : 0);
    const losses: number[] = changes.map(change => change < 0 ? Math.abs(change) : 0);

    // Tính average gain và average loss cho period đầu tiên
    let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

    // Smoothed RSI calculation
    for (let i = period; i < changes.length; i++) {
      avgGain = ((avgGain * (period - 1)) + gains[i]) / period;
      avgLoss = ((avgLoss * (period - 1)) + losses[i]) / period;
    }

    if (avgLoss === 0) {
      return 100;
    }

    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));

    return Math.round(rsi * 100) / 100;
  }

  /**
   * Xác định trạng thái RSI
   */
  private getRsiStatus(rsi: number): 'oversold' | 'neutral' | 'overbought' {
    if (rsi < 30) {
      return 'oversold';
    } else if (rsi > 70) {
      return 'overbought';
    }
    return 'neutral';
  }

  /**
   * Lấy dữ liệu giá lịch sử của một mã chứng khoán
   */
  private async fetchStockHistory(symbol: string, days: number = 30): Promise<StockPrice[]> {
    try {
      const toDate = new Date();
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);

      const fromDateStr = fromDate.toISOString().split('T')[0];
      const toDateStr = toDate.toISOString().split('T')[0];

      // Sử dụng API VND Direct để lấy dữ liệu lịch sử
      const url = `${this.API_BASE_URL}/v4/stock_prices`;
      const response = await axios.get(url, {
        params: {
          sort: 'date',
          q: `code:${symbol}~date:gte:${fromDateStr}~date:lte:${toDateStr}`,
          size: days * 2, // Lấy nhiều hơn để đảm bảo đủ dữ liệu
        },
        timeout: 10000,
      });

      if (!response.data || !response.data.data) {
        throw new Error('Không nhận được dữ liệu từ API');
      }

      const prices: StockPrice[] = response.data.data.map((item: any) => ({
        date: item.date,
        close: item.close,
        open: item.open,
        high: item.high,
        low: item.low,
        volume: item.nmVolume || item.volume || 0,
      }));

      return prices.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } catch (error) {
      this.logger.error(`Lỗi khi lấy dữ liệu cho mã ${symbol}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Kiểm tra RSI cho một mã chứng khoán
   */
  async checkRsiForSymbol(
    symbol: string,
    period: number = 14,
    days: number = 30,
  ): Promise<RsiResultDto> {
    try {
      const symbolUpper = symbol.toUpperCase();
      this.logger.log(`Đang kiểm tra RSI cho mã ${symbolUpper}`);

      // Lấy dữ liệu giá lịch sử
      const priceHistory = await this.fetchStockHistory(symbolUpper, days);

      if (priceHistory.length < period + 1) {
        throw new Error(`Không đủ dữ liệu lịch sử (cần ít nhất ${period + 1} ngày)`);
      }

      // Lấy mảng giá đóng cửa
      const closePrices = priceHistory.map(p => p.close);

      // Tính RSI
      const rsi = this.calculateRSI(closePrices, period);

      // Lấy giá hiện tại (giá đóng cửa gần nhất)
      const currentPrice = closePrices[closePrices.length - 1];

      // Xác định trạng thái RSI
      const rsiStatus = this.getRsiStatus(rsi);

      return {
        symbol: symbolUpper,
        currentPrice,
        rsi,
        rsiStatus,
        lastUpdated: new Date(),
      };
    } catch (error) {
      this.logger.error(`Lỗi khi kiểm tra RSI cho ${symbol}: ${error.message}`);
      return {
        symbol: symbol.toUpperCase(),
        currentPrice: 0,
        rsi: 0,
        rsiStatus: 'neutral',
        lastUpdated: new Date(),
        error: error.message,
      };
    }
  }

  /**
   * Kiểm tra RSI cho nhiều mã chứng khoán
   */
  async checkRsiForMultipleSymbols(
    symbols: string[],
    period: number = 14,
    days: number = 30,
  ): Promise<RsiResultDto[]> {
    this.logger.log(`Đang kiểm tra RSI cho ${symbols.length} mã chứng khoán`);

    // Xử lý song song để tăng tốc độ
    const results = await Promise.all(
      symbols.map(symbol => this.checkRsiForSymbol(symbol, period, days)),
    );

    return results;
  }
}
