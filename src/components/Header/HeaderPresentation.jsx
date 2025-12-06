/**
 * Presentational component for Header
 * Pure UI component that receives all data and handlers as props
 */
function HeaderPresentation({ time, onRefresh, loading, autoRefresh, onToggleAutoRefresh }) {
  return (
    <header className="glass-heavy border-b border-white/10 sticky top-0 z-50 backdrop-blur-3xl">
      <nav className="container mx-auto px-6 py-5 max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="relative floating">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00d4ff] to-[#00ff88] rounded-2xl blur-xl opacity-60"
                   style={{ animation: 'pulse-glow 3s ease-in-out infinite' }} />
              <div className="relative bg-gradient-to-br from-[#00d4ff] to-[#00ff88] p-3.5 rounded-2xl"
                   style={{ boxShadow: '0 0 30px rgba(0, 212, 255, 0.5), 0 0 60px rgba(0, 255, 136, 0.3)' }}>
                <svg
                  className="w-7 h-7 text-[#0a0a14]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold gradient-text"
                  style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.03em' }}>
                CRYSTAL EXCHANGE
              </h1>
              <p className="text-xs md:text-sm text-gray-400 mono-data tracking-wide">
                Real-time Top Gainers • Binance
              </p>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-3">
            {/* Time */}
            <div className="hidden md:block text-right glass rounded-2xl px-4 py-2.5">
              <div className="text-xs mono-data text-gray-400 tracking-wider">
                {time.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
              <div className="text-base mono-data font-bold text-[#00d4ff]">
                {time.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </div>
            </div>

            {/* Auto-Refresh Toggle Button */}
            <button
              onClick={onToggleAutoRefresh}
              className={`glass rounded-xl px-4 py-2.5 flex items-center space-x-2 transition-all duration-500 group relative overflow-hidden ${
                autoRefresh ? 'border-[#00ff88]/50' : 'border-gray-500/30'
              }`}
              style={{
                boxShadow: autoRefresh ? '0 0 20px rgba(0, 255, 136, 0.3)' : 'none'
              }}
              title={autoRefresh ? 'Auto-refresh enabled (30s)' : 'Auto-refresh disabled'}
            >
              <div className={`absolute inset-0 bg-gradient-to-r from-[#00ff88]/10 to-transparent opacity-0 transition-opacity duration-300 ${
                autoRefresh ? 'opacity-100' : ''
              }`} />
              <svg
                className={`w-5 h-5 transition-all duration-500 relative z-10 ${
                  autoRefresh ? 'text-[#00ff88]' : 'text-gray-400'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={autoRefresh
                    ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    : "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  }
                />
              </svg>
              <span className="hidden md:inline font-semibold text-sm relative z-10">
                Auto {autoRefresh ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={loading}
              className="glass rounded-xl px-4 py-2.5 flex items-center space-x-2 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed group hover:border-[#00d4ff]/50 relative overflow-hidden"
              style={{
                boxShadow: loading ? '0 0 20px rgba(0, 212, 255, 0.3)' : 'none'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#00d4ff]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <svg
                className={`w-5 h-5 ${loading ? 'animate-spin text-[#00d4ff]' : 'group-hover:rotate-180 text-gray-300 group-hover:text-[#00d4ff]'} transition-all duration-700 relative z-10`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span className="hidden md:inline font-semibold text-sm relative z-10">Refresh</span>
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default HeaderPresentation;
