import { Controller, Post, Body, Get, Query, Logger } from '@nestjs/common';
import { VnStockRsiService } from '../services/vn-stock-rsi.service';
import { CheckRsiDto } from '../dto/check-rsi.dto';
import { CheckRsiResponseDto } from '../dto/rsi-result.dto';

@Controller('api/vn-stock-rsi')
export class VnStockRsiController {
  private readonly logger = new Logger(VnStockRsiController.name);

  constructor(private readonly vnStockRsiService: VnStockRsiService) {}

  /**
   * Endpoint để kiểm tra RSI cho danh sách mã chứng khoán
   * POST /api/vn-stock-rsi/check
   * Body: { symbols: ['VNM', 'VIC', 'HPG'], period: 14, days: 30 }
   */
  @Post('check')
  async checkRsi(@Body() checkRsiDto: CheckRsiDto): Promise<CheckRsiResponseDto> {
    this.logger.log(`Nhận yêu cầu kiểm tra RSI cho ${checkRsiDto.symbols.length} mã`);

    try {
      const results = await this.vnStockRsiService.checkRsiForMultipleSymbols(
        checkRsiDto.symbols,
        checkRsiDto.period || 14,
        checkRsiDto.days || 30,
      );

      return {
        success: true,
        data: results,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Lỗi khi kiểm tra RSI: ${error.message}`);
      return {
        success: false,
        data: [],
        timestamp: new Date(),
      };
    }
  }

  /**
   * Endpoint để kiểm tra RSI cho một mã chứng khoán
   * GET /api/vn-stock-rsi/check-single?symbol=VNM&period=14&days=30
   */
  @Get('check-single')
  async checkSingleRsi(
    @Query('symbol') symbol: string,
    @Query('period') period?: number,
    @Query('days') days?: number,
  ): Promise<CheckRsiResponseDto> {
    if (!symbol) {
      return {
        success: false,
        data: [],
        timestamp: new Date(),
      };
    }

    this.logger.log(`Nhận yêu cầu kiểm tra RSI cho mã ${symbol}`);

    try {
      const result = await this.vnStockRsiService.checkRsiForSymbol(
        symbol,
        period || 14,
        days || 30,
      );

      return {
        success: true,
        data: [result],
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Lỗi khi kiểm tra RSI: ${error.message}`);
      return {
        success: false,
        data: [],
        timestamp: new Date(),
      };
    }
  }

  /**
   * Endpoint để lấy danh sách mã chứng khoán phổ biến
   * GET /api/vn-stock-rsi/popular-symbols
   */
  @Get('popular-symbols')
  async getPopularSymbols(): Promise<{ symbols: string[] }> {
    // Danh sách các mã chứng khoán phổ biến trên HOSE và HNX
    const popularSymbols = [
      // HOSE - Top blue chips
      'VNM', 'VIC', 'HPG', 'VHM', 'TCB', 'VPB', 'MWG', 'VJC',
      'GAS', 'MSN', 'PLX', 'VRE', 'VCB', 'BID', 'CTG',
      'POW', 'SAB', 'SSI', 'FPT', 'MBB',
      // HNX - Popular stocks
      'ACB', 'PVS', 'PVD', 'SHS', 'VCS',
    ];

    return { symbols: popularSymbols };
  }
}
