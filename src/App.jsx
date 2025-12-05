import { useState, useEffect } from 'react';
import CoinCard from './components/CoinCard';
import StatCard from './components/StatCard';
import Header from './components/Header';
import BackgroundEffect from './components/BackgroundEffect';
import TradingViewChart from './components/TradingViewChart';

function App() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVolume: 0,
    avgGain: 0,
    topGainer: null
  });

  useEffect(() => {
    fetchTopGainers();
    const interval = setInterval(fetchTopGainers, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchTopGainers = async () => {
    try {
      setLoading(true);

      // Fetch 24hr ticker price change statistics
      const response = await fetch('https://www.binance.com/fapi/v1/topMovers');
      const data = await response.json();

      // Filter USDT pairs and sort by price change percentage
      const usdtPairs = data
        .filter(coin =>
          coin.symbol.endsWith('USDT') &&
          parseFloat(coin.priceChange) > 0 &&
          (coin.period == "5m" || coin.period == "2h") // Min $1M volume
        )
        // .sort((a, b) => parseFloat(b.priceChange) - parseFloat(a.priceChange))
        .slice(0, 60); // Top 12 gainers

      // Fetch additional data for sparklines (simplified - using price trends)
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
        // Generate simple sparkline data
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
  };

  const generateSparklineData = (low, high, current) => {
    const points = 20;
    const data = [];
    const range = high - low;

    for (let i = 0; i < points; i++) {
      // Create a somewhat realistic price movement
      const variance = Math.random() * 0.6 + 0.2; // 0.2 to 0.8
      const trend = (i / points) * 0.7 + 0.15; // Upward trend
      const value = low + (range * variance * trend);
      data.push(value);
    }

    // Ensure last point is close to current price
    data[points - 1] = current;

    return data;
  };

  const formatVolume = (vol) => {
    if (vol >= 1e9) return `$${(vol / 1e9).toFixed(2)}B`;
    if (vol >= 1e6) return `$${(vol / 1e6).toFixed(2)}M`;
    return `$${vol.toFixed(2)}`;
  };

  const handleTrade = (symbol) => {
    // Detect if user is on mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // Remove USDT suffix if present to get base symbol
    const baseSymbol = symbol.replace('USDT', '');

    if (isMobile) {
      // For mobile: Try to open Binance app, fallback to mobile web
      // Binance app deep link format
      const appUrl = `binance://markets/trade/${baseSymbol}_USDT`;
      const fallbackUrl = `https://www.binance.com/en/futures/${baseSymbol}_USDT`;

      // Try to open app
      window.location.href = appUrl;

      // Fallback to web if app doesn't open (after 2 seconds)
      setTimeout(() => {
        window.location.href = fallbackUrl;
      }, 2000);
    } else {
      // For desktop: Open Binance website in new tab
      const webUrl = `https://www.binance.com/en/futures/${baseSymbol}_USDT`;
      window.open(webUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <BackgroundEffect />

      <div className="relative z-10">
        <Header onRefresh={fetchTopGainers} loading={loading} />

        <main className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-[fadeIn_0.6s_ease-out] hidden">
            <StatCard
              title="Total Volume"
              value={formatVolume(stats.totalVolume)}
              subtitle="24h Trading Volume"
              icon="💰"
              delay="0s"
            />
            <StatCard
              title="Average Gain"
              value={`+${stats.avgGain.toFixed(2)}%`}
              subtitle="Top 12 Average"
              icon="📈"
              delay="0.1s"
              highlight
            />
            <StatCard
              title="Top Gainer"
              value={stats.topGainer ? `${stats.topGainer.symbol}` : '-'}
              subtitle={stats.topGainer ? `+${stats.topGainer.change.toFixed(2)}%` : 'Loading...'}
              icon="🚀"
              delay="0.2s"
            />
          </div>

          {/* TradingView Charts for Top 6 */}
          {!loading && coins.length > 0 && (
            <div className="mb-16">
              <h2 className="text-3xl md:text-4xl font-bold orbitron mb-6 gradient-text">
                Top 6 Charts
              </h2>
              <p className="text-gray-400 mb-8 text-lg">
                Live candlestick charts with 15-minute intervals
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {coins.slice(0, 10).map((coin, index) => (
                  <div
                    key={coin.symbol}
                    className="animate-[fadeIn_0.6s_ease-out]"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="glass rounded-2xl p-4 hover-glow transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold orbitron text-white">
                            {coin.symbol.replace('USDT', '')} / USDT
                          </h3>
                          <p className="text-sm text-gray-400">{coin.period} Interval</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-400">
                            +{(coin.change * 100).toFixed(2)}%
                          </div>
                          <p className="text-xs text-orange-500">{coin.period}</p>
                        </div>
                      </div>
                      <TradingViewChart symbol={coin.symbol} interval={coin.period} />

                      <div className="mt-4 text-center group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleTrade(coin.symbol)}
                          className="text-xs text-black font-semibold font-mono px-10 py-2 border-yellow-400 bg-yellow-400 rounded-lg hover:bg-yellow-500 hover:scale-105 transition-all duration-200"
                        >
                          TRADE
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Gainers Grid */}
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold orbitron mb-6 gradient-text">
              All Top Gainers
            </h2>
            <p className="text-gray-400 mb-8 text-lg">
              Real-time tracking of the highest performing cryptocurrencies on Binance
            </p>
          </div>

          {loading && coins.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="glass rounded-2xl p-6 h-64 shimmer"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coins.map((coin, index) => (
                <CoinCard
                  key={coin.id}
                  coin={coin}
                  rank={index + 1}
                  delay={index * 0.05}
                />
              ))}
            </div>
          )}

          {/* Footer Info */}
          <div className="mt-16 text-center glass rounded-2xl p-8">
            <p className="text-gray-400 mb-2">
              Data updates every 30 seconds via Binance API
            </p>
            <p className="text-sm text-gray-500">
              Minimum volume filter: $1M USDT • Showing USDT pairs only
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
