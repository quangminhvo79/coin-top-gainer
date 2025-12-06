import { useState, useCallback } from 'react';
import { generateSparklineData } from '../utils/formatters';

/**
 * Custom hook for fetching and managing top gainers data
 */
export const useTopGainers = () => {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVolume: 0,
    avgGain: 0,
    topGainer: null
  });

  const fetchTopGainers = useCallback(async () => {
    try {
      // Only show loading state if we have no coins yet (initial load)
      if (coins.length === 0) {
        setLoading(true);
      }

      const response = await fetch('https://www.binance.com/fapi/v1/topMovers');
      const data = await response.json();

      // Filter USDT pairs and sort by price change percentage
      const usdtPairs = data
        .filter(coin =>
          coin.symbol.endsWith('USDT') &&
          parseFloat(coin.priceChange) > 0 &&
          (coin.period === "5m" || coin.period === "2h")
        )
        .slice(0, 60);

      // Enrich coins with additional data
      const enrichedCoins = usdtPairs.map(coin => ({
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

      setCoins(enrichedCoins);

      // Calculate stats
      const totalVol = enrichedCoins.reduce((sum, coin) => sum + coin.volume, 0);
      const avgChange = enrichedCoins.reduce((sum, coin) => sum + coin.change, 0) / enrichedCoins.length;

      setStats({
        totalVolume: totalVol,
        avgGain: avgChange,
        topGainer: enrichedCoins[0]
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  }, [coins.length]);

  return {
    coins,
    loading,
    stats,
    fetchTopGainers
  };
};
