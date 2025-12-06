import { useEffect } from 'react';
import { useTopGainers, useAutoRefresh, useInterval } from '../../hooks';
import BackgroundEffect from '../BackgroundEffect';
import { HeaderContainer } from '../Header';
import { ChartCardContainer } from '../ChartCard';
import { CoinCardContainer } from '../CoinCard';
import { LoadingSkeletonPresentation } from '../LoadingSkeleton';
import { FooterPresentation } from '../Footer';

/**
 * Main App Container
 * Manages application state and orchestrates data flow
 */
function AppContainer() {
  const { coins, loading, fetchTopGainers } = useTopGainers();
  const { autoRefresh, toggleAutoRefresh } = useAutoRefresh();

  // Initial data fetch
  useEffect(() => {
    fetchTopGainers();
  }, [fetchTopGainers]);

  // Auto-refresh interval
  useInterval(fetchTopGainers, 30000, autoRefresh);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <BackgroundEffect />

      <div className="relative z-10">
        <HeaderContainer
          onRefresh={fetchTopGainers}
          loading={loading}
          autoRefresh={autoRefresh}
          onToggleAutoRefresh={toggleAutoRefresh}
        />

        <main className="container mx-auto px-4 py-8 max-w-7xl">
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
                  <ChartCardContainer
                    key={coin.symbol}
                    coin={coin}
                    index={index}
                  />
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
            <LoadingSkeletonPresentation count={12} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coins.map((coin, index) => (
                <CoinCardContainer
                  key={coin.symbol}
                  coin={coin}
                  rank={index + 1}
                  delay={index * 0.05}
                />
              ))}
            </div>
          )}

          {/* Footer Info */}
          <FooterPresentation />
        </main>
      </div>
    </div>
  );
}

export default AppContainer;
