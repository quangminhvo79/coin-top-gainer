import { getRankColor, getRankGlow } from '../../utils/formatters';

/**
 * Presentational component for CoinCard
 * Pure UI component that receives all data and handlers as props
 */
function CoinCardPresentation({ coin, rank, delay, onTrade }) {
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

      {/* Trade Button */}
      <div className="mt-4 text-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:translate-y-0 translate-y-2 relative z-10">
        <button
          onClick={() => onTrade(coin.symbol)}
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

export default CoinCardPresentation;
