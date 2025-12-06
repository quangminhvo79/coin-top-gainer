import MiniChart from './MiniChart';

function CoinCard({ coin, rank, delay }) {
  const formatPrice = (price) => {
    if (price >= 1) return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (price >= 0.01) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(6)}`;
  };

  const formatVolume = (vol) => {
    if (vol >= 1e9) return `$${(vol / 1e9).toFixed(2)}B`;
    if (vol >= 1e6) return `$${(vol / 1e6).toFixed(2)}M`;
    return `$${vol.toFixed(2)}`;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'from-[#00d4ff] to-[#00ff88]';
    if (rank === 2) return 'from-[#b794f6] to-[#00d4ff]';
    if (rank === 3) return 'from-[#ff6b35] to-[#ff0080]';
    return 'from-[#b794f6] to-[#00d4ff]';
  };

  const getRankGlow = (rank) => {
    if (rank === 1) return '0 0 20px rgba(0, 212, 255, 0.6), 0 0 40px rgba(0, 255, 136, 0.4)';
    if (rank === 2) return '0 0 20px rgba(183, 148, 246, 0.5), 0 0 40px rgba(0, 212, 255, 0.3)';
    if (rank === 3) return '0 0 20px rgba(255, 107, 53, 0.5), 0 0 40px rgba(255, 0, 128, 0.3)';
    return '0 0 15px rgba(183, 148, 246, 0.4)';
  };

  const handleTrade = (symbol) => {
    // Detect if user is on mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // Remove USDT suffix if present to get base symbol
    const baseSymbol = symbol.replace('USDT', '');

    if (isMobile) {
      // For mobile: Try to open Binance app, fallback to mobile web
      // Binance app deep link format
      const appUrl = `binance://markets/futures/${baseSymbol}_USDT`;
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
    <div
      className="frosted-card glow-border p-6 hover-glow transition-all duration-500 group animate-[fadeIn_0.6s_ease-out] relative overflow-hidden"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
        <div className={`absolute inset-0 bg-gradient-to-br ${getRankColor(rank)} blur-3xl`} />
      </div>

      {/* Header with Rank and Symbol */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex items-center space-x-3">
          <div
            className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getRankColor(rank)} flex items-center justify-center font-bold text-white shadow-lg relative overflow-hidden`}
            style={{ boxShadow: getRankGlow(rank) }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <span className="relative text-sm font-extrabold">#{rank}</span>
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white group-hover:gradient-text transition-all duration-500" style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em' }}>
              {coin.symbol.replace('USDT', '')}
            </h3>
            <p className="text-xs text-gray-400 mono-data font-light tracking-wider">/ USDT</p>
          </div>
        </div>

        {/* Change Percentage */}
        <div className="text-right">
          <div className="text-2xl font-extrabold text-[#00ff88] neon-accent mono-data" style={{ textShadow: '0 0 20px rgba(0, 255, 136, 0.5)' }}>
            +{(coin.change * 100).toFixed(2)}%
          </div>
          <div className="text-xs font-semibold text-[#00d4ff] mono-data mt-1 uppercase tracking-wider">{coin.period}</div>
        </div>
      </div>

      {/* Mini Chart
        <div className="mb-4 h-20 hidden">
          <MiniChart data={coin.sparkline} color="#10b981" />
        </div>
      */}

      {/* Price Info */}
      <div className="grid grid-cols-2 gap-4 mb-4 hidden">
        <div className="glass rounded-lg p-3">
          <p className="text-xs text-orange-500 mb-1">Price</p>
          <p className="text-sm font-mono font-semibold text-white">
            {formatPrice(coin.price)}
          </p>
        </div>
        <div className="glass rounded-lg p-3">
          <p className="text-xs text-orange-500 mb-1">Volume</p>
          <p className="text-sm font-mono font-semibold text-white">
            {formatVolume(coin.volume)}
          </p>
        </div>
      </div>

      {/* 24h Range */}
      <div className="glass rounded-lg p-3 hidden">
        <p className="text-xs text-orange-500 mb-2">24h Range</p>
        <div className="flex items-center justify-between text-xs font-mono mb-1">
          <span className="text-red-400">{formatPrice(coin.low)}</span>
          <span className="text-green-400">{formatPrice(coin.high)}</span>
        </div>
        <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
            style={{
              width: `${((coin.price - coin.low) / (coin.high - coin.low)) * 100}%`
            }}
          />
        </div>
      </div>

      {/* Trade Button */}
      <div className="mt-4 text-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:translate-y-0 translate-y-2 relative z-10">
        <button
          onClick={() => handleTrade(coin.symbol) }
          className="relative px-8 py-3 rounded-xl font-bold text-sm tracking-wider uppercase overflow-hidden group/btn transition-all duration-300 hover:scale-105"
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
  );
}

export default CoinCard;
