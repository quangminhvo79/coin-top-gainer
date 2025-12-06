import { useState, useEffect } from 'react';
import CoinCard from './components/CoinCard';
import StatCard from './components/StatCard';
import Header from './components/Header';
import BackgroundEffect from './components/BackgroundEffect';
import TradingViewChart from './components/TradingViewChart';

function App() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(() => {
    // Load auto-refresh preference from localStorage, default to true
    const saved = localStorage.getItem('autoRefresh');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [stats, setStats] = useState({
    totalVolume: 0,
    avgGain: 0,
    topGainer: null
  });

  // Save auto-refresh preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('autoRefresh', JSON.stringify(autoRefresh));
  }, [autoRefresh]);

  useEffect(() => {
    fetchTopGainers();

    if (autoRefresh) {
      const interval = setInterval(fetchTopGainers, 30000); // Update every 30s
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchTopGainers = async () => {
    try {
      // Only show loading state if we have no coins yet (initial load)
      if (coins.length === 0) {
        setLoading(true);
      }

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
      const appUrl = `bnc://markets/trade/${baseSymbol}_USDT`;
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
        <Header
          onRefresh={fetchTopGainers}
          loading={loading}
          autoRefresh={autoRefresh}
          onToggleAutoRefresh={() => setAutoRefresh(!autoRefresh)}
        />
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

          {/* TradingView Charts for Top Performers */}
          {!loading && coins.length > 0 && (
            <div className="mb-20">
              <div className="mb-8">
                <h2 className="text-4xl md:text-5xl font-extrabold gradient-text mb-3"
                    style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.03em' }}>
                  Live Market Charts
                </h2>
                <p className="text-gray-400 text-lg mono-data">
                  Real-time candlestick analysis • 1-hour intervals
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {coins.slice(0, 10).map((coin, index) => (
                  <div
                    key={coin.symbol}
                    className="animate-[fadeIn_0.6s_ease-out]"
                    style={{ animationDelay: `${index * 0.08}s` }}
                  >
                    <div className="frosted-card glow-border p-5 hover-glow transition-all duration-500 group relative overflow-hidden">
                      {/* Decorative gradient overlay */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#00d4ff] to-[#00ff88] blur-3xl" />
                      </div>

                      <div className="flex items-center justify-between mb-4 relative z-10">
                        <div>
                          <h3 className="text-xl font-extrabold text-white"
                              style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em' }}>
                            {coin.symbol.replace('USDT', '')} <span className="text-gray-500 font-light text-base">/ USDT</span>
                          </h3>
                          <p className="text-xs text-gray-400 mono-data tracking-wider mt-0.5">1H TIMEFRAME</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-extrabold text-[#00ff88] mono-data neon-accent"
                               style={{ textShadow: '0 0 20px rgba(0, 255, 136, 0.5)' }}>
                            +{(coin.change * 100).toFixed(2)}%
                          </div>
                          <p className="text-xs text-[#00d4ff] mono-data font-semibold uppercase tracking-wider">{coin.period}</p>
                        </div>
                      </div>

                      <div className="relative z-10 rounded-xl overflow-hidden"
                           style={{
                             boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.3)',
                             border: '1px solid rgba(255, 255, 255, 0.05)'
                           }}>
                        <TradingViewChart symbol={coin.symbol} interval="1h" />
                      </div>

                      <div className="mt-4 text-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:translate-y-0 translate-y-2 relative z-10">
                        <button
                          onClick={() => handleTrade(coin.symbol)}
                          className="relative px-8 py-2.5 rounded-xl font-bold text-sm tracking-wider uppercase overflow-hidden group/btn transition-all duration-300 hover:scale-105"
                          style={{
                            background: 'linear-gradient(135deg, #00d4ff 0%, #00ff88 100%)',
                            boxShadow: '0 0 30px rgba(0, 212, 255, 0.4), 0 4px 20px rgba(0, 0, 0, 0.3)',
                            color: '#0a0a14'
                          }}
                        >
                          <span className="relative z-10 font-extrabold">Trade Now</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Gainers Grid */}
          <div className="mb-10">
            <h2 className="text-4xl md:text-5xl font-extrabold gradient-text mb-3"
                style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.03em' }}>
              All Top Gainers
            </h2>
            <p className="text-gray-400 text-lg mono-data">
              Complete list of highest performing assets • Live updates
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
          <div className="mt-20 text-center frosted-card p-10">
            <div className="inline-block mb-4">
              <div className="flex items-center space-x-2 text-[#00d4ff]">
                <div className="w-2 h-2 bg-[#00d4ff] rounded-full animate-pulse"
                     style={{ boxShadow: '0 0 10px rgba(0, 212, 255, 0.8)' }} />
                <p className="text-gray-300 mono-data font-medium tracking-wide">
                  Live Data Stream • Updated every 30s
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mono-data">
              Powered by Binance API • Minimum volume $1M USDT • USDT pairs only
            </p>
            <div className="mt-6 pt-6 border-t border-white/5">
              <p className="text-xs text-gray-600 mono-data tracking-wider">
                CRYSTAL EXCHANGE © 2024 • Real-time Cryptocurrency Analytics
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
