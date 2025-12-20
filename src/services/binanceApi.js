import { generateSparklineData } from '../utils/formatters';

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
      parseFloat(coin.priceChange) > 0
    )
    .slice(0, 60);

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

  // Calculate aggregate statistics
  const totalVolume = enrichedCoins.reduce((sum, coin) => sum + coin.volume, 0);
  const avgGain = enrichedCoins.reduce((sum, coin) => sum + coin.change, 0) / enrichedCoins.length;

  return {
    coins: enrichedCoins,
    periods,
    stats: {
      totalVolume,
      avgGain,
      topGainer: enrichedCoins[0] || null
    }
  };
};
