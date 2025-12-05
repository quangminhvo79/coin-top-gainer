import { useState, useEffect } from 'react';

function Header({ onRefresh, loading }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="glass-medium border-b border-white/10 sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur-lg opacity-75 animate-pulse" />
              <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold orbitron gradient-text">
                BINANCE GAINERS
              </h1>
              <p className="text-xs md:text-sm text-gray-400 font-mono">
                Real-time Market Analytics
              </p>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Time */}
            <div className="hidden md:block text-right">
              <div className="text-sm font-mono text-gray-400">
                {time.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
              <div className="text-lg font-mono orbitron text-white">
                {time.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </div>
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={loading}
              className="glass hover-glow rounded-xl px-4 py-3 flex items-center space-x-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <svg
                className={`w-5 h-5 ${loading ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span className="hidden md:inline font-medium">Refresh</span>
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
