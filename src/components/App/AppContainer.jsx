import { useEffect } from 'react';
import { useTopGainers, useAutoRefresh } from '../../hooks';
import BackgroundEffect from '../BackgroundEffect';
import { HeaderContainer } from '../Header';
import { ChartCardContainer } from '../ChartCard';
import { CoinCardContainer } from '../CoinCard';
import { LoadingSkeletonPresentation } from '../LoadingSkeleton';
import { FooterPresentation } from '../Footer';
import { PeriodTabsContainer } from '../PeriodTabs';

/**
 * Main App Container
 * Manages application state and orchestrates data flow
 */
function AppContainer() {
  const { autoRefresh, toggleAutoRefresh } = useAutoRefresh();

  const {
    coins,
    allCoins,
    loading,
    isFetching,
    error,
    fetchTopGainers,
    selectedPeriod,
    setSelectedPeriod,
    availablePeriods
  } = useTopGainers(autoRefresh);

  // Initial data fetch (React Query handles this automatically, but kept for manual refresh)
  useEffect(() => {
    fetchTopGainers();
  }, [fetchTopGainers]);

  // Error state handling
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">
            Failed to load data: {error.message}
          </div>
          <button
            onClick={() => fetchTopGainers()}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <BackgroundEffect />

      {/* Background refetch indicator */}
      {isFetching && !loading && (
        <div className="fixed top-20 right-4 z-50 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
            <span className="text-sm font-medium">Updating...</span>
          </div>
        </div>
      )}

      <div className="relative z-10">
        <HeaderContainer
          onRefresh={fetchTopGainers}
          loading={loading}
          autoRefresh={autoRefresh}
          onToggleAutoRefresh={toggleAutoRefresh}
        />

        <main className="container mx-auto px-4 py-8 max-w-7xl">

          {/* TradingView Charts for Top Performers */}
          {!loading && allCoins.length > 0 && (
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
              {/* Period Filter Tabs */}
              {!loading && availablePeriods.length > 1 && (
                <PeriodTabsContainer
                  periods={availablePeriods}
                  selectedPeriod={selectedPeriod}
                  onPeriodChange={setSelectedPeriod}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {coins.slice(0, 10).map((coin, index) => (
                  <ChartCardContainer
                    key={`${coin.id}`}
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

          {/* Period Filter Tabs */}
          {!loading && availablePeriods.length > 1 && (
            <PeriodTabsContainer
              periods={availablePeriods}
              selectedPeriod={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
            />
          )}

          {loading && coins.length === 0 ? (
            <LoadingSkeletonPresentation count={12} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coins.map((coin, index) => (
                <CoinCardContainer
                  key={`${coin.id}`}
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
