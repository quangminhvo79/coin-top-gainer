import TradingViewChart from '../TradingViewChart';

/**
 * Presentational component for Chart Card
 * Displays TradingView chart with coin information
 */
function ChartCardPresentation({
  coin,
  index,
  onTrade,
  openChart,
  toggleChart,
}) {
  return (
    <div
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
            <div class="flex flex-row gap-2">
              <span className="text-xs text-gray-400">{coin.eventType}</span>
              <p className="text-xs text-[#00d4ff] mono-data font-semibold uppercase tracking-wider">{coin.period}</p>
            </div>
          </div>
        </div>

        {openChart && (<div className="relative z-10 rounded-xl overflow-hidden"
             style={{
               boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.3)',
               border: '1px solid rgba(255, 255, 255, 0.05)'
             }}>
          <TradingViewChart symbol={coin.symbol} interval="1h" />
        </div>)}

        <div className="flex flex-row items-center justify-center gap-3 mt-4 text-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:translate-y-0 translate-y-2 relative z-10">
          <button
            onClick={toggleChart}
            className="relative px-8 py-2.5 rounded-xl font-bold text-sm tracking-wider uppercase overflow-hidden group/btn transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #00d4ff 0%, #00ff88 100%)',
              boxShadow: '0 0 30px rgba(0, 212, 255, 0.4), 0 4px 20px rgba(0, 0, 0, 0.3)',
              color: '#0a0a14'
            }}
          >
            <span className="relative z-10 font-extrabold">{openChart ? "Close" : "Open"} Chart</span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
          </button>
          <button
            onClick={() => onTrade(coin.symbol)}
            className="relative px-8 py-2.5 rounded-xl font-bold text-sm tracking-wider uppercase overflow-hidden group/btn transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #fff000 0%, #ff0100 100%)',
              boxShadow: '0 0 30px rgba(0, 212, 255, 0.4), 0 4px 20px rgba(0, 0, 0, 0.3)',
              color: '#0a0a14'
            }}
          >
            <span className="relative z-10 font-extrabold">Trade Now</span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#ff0100] to-[#fff000] opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChartCardPresentation;
