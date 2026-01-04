export class RsiResultDto {
  symbol: string;
  currentPrice: number;
  rsi: number;
  rsiStatus: 'oversold' | 'neutral' | 'overbought'; // RSI < 30: oversold, RSI > 70: overbought
  lastUpdated: Date;
  error?: string;
}

export class CheckRsiResponseDto {
  success: boolean;
  data: RsiResultDto[];
  timestamp: Date;
}
