import { generateSparklineData } from '../utils/formatters';

export const SUPPORTED_PERIODS = ['5m', '15m', '30m', '1h', '2h', '4h', '1d'];
export const SUPPORTED_EVENT_TYPES = [
  'DAY_DOWN_BREAKTHROUGH',
  'DAY_UP_BREAKTHROUGH',
  'PULLBACK',
  'RALLY',
  'UP_1',
  'UP_2',
  'UP_3',
  'RISE',
  'FALL',
  'NEW_HIGH',
  'NEW_LOW',
];
/**
 * Fetch top movers from Binance API
 * @returns {Promise<Object>} - Enriched coins data with periods and stats
 */
export const fetchTopMovers = async () => {
  const response = await fetch('https://www.binance.com/fapi/v1/topMovers');

  if (!response.ok) {
    throw new Error(`Binance API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  // Filter USDT pairs with positive price changes
  const usdtPairs = data
    .filter(coin =>
      coin.symbol.endsWith('USDT') &&
      parseFloat(coin.priceChange) > 0 &&
      SUPPORTED_PERIODS.includes(coin.period)
    );

  // Enrich coins with normalized data
  const enrichedCoins = usdtPairs.map(coin => ({
    ...coin,
    symbol: coin.symbol,
    price: parseFloat(coin.lastPrice),
    change: parseFloat(coin.priceChange),
    volume: parseFloat(coin.quoteVolume),
    high: parseFloat(coin.highPrice),
    low: parseFloat(coin.lowPrice),
    priceChange: parseFloat(coin.priceChange),
    trades: coin.count,
    period: coin.period,
    sparkline: generateSparklineData(
      parseFloat(coin.lowPrice),
      parseFloat(coin.highPrice),
      parseFloat(coin.lastPrice)
    )
  }));

  // Extract unique periods from the data
  const periods = [...new Set(enrichedCoins.map(coin => coin.period))].sort();
  const eventTypes = [...new Set(enrichedCoins.map(coin => coin.eventType))].sort();

  // Calculate aggregate statistics
  const totalVolume = enrichedCoins.reduce((sum, coin) => sum + coin.volume, 0);
  const avgGain = enrichedCoins.reduce((sum, coin) => sum + coin.change, 0) / enrichedCoins.length;

  return {
    coins: enrichedCoins,
    periods,
    eventTypes,
    stats: {
      totalVolume,
      avgGain,
      topGainer: enrichedCoins[0] || null
    }
  };
};
