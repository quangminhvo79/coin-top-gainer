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
    if (rank === 1) return 'from-yellow-400 to-yellow-600';
    if (rank === 2) return 'from-gray-300 to-gray-500';
    if (rank === 3) return 'from-orange-400 to-orange-600';
    return 'from-purple-400 to-pink-500';
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
      className="glass rounded-2xl p-6 hover-glow transition-all duration-300 group animate-[slideUp_0.5s_ease-out]"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Header with Rank and Symbol */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getRankColor(rank)} flex items-center justify-center font-bold orbitron text-white shadow-lg`}>
            #{rank}
          </div>
          <div>
            <h3 className="text-xl font-bold orbitron text-white group-hover:gradient-text transition-all">
              {coin.symbol}
            </h3>
            <p className="text-md text-orange-500 font-mono">USDT</p>
          </div>
        </div>

        {/* Change Percentage */}
        <div className="text-right">
          <div className="text-2xl font-bold orbitron text-green-400">
            +{(coin.change * 100).toFixed(2)}%
          </div>
          <div className="text-md font-bold text-orange-500">{coin.period}</div>
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

      {/* Hover Indicator */}
      <div className="mt-4 text-center opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => handleTrade(coin.symbol) }
          className="text-xs text-black font-semibold font-mono px-10 py-2 border-yellow-400 bg-yellow-400 rounded-lg hover:bg-yellow-500 hover:scale-105 transition-all duration-200"
        >
          TRADE
        </button>
      </div>
    </div>
  );
}

export default CoinCard;
