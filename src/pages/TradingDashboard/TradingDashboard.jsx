import { useState } from 'react';
import BackgroundEffect from '../../components/BackgroundEffect';
import Navigation from '../../components/Navigation/Navigation';
import {
  ActiveOrdersList,
  OrderHistory,
  TradingStats,
  LiveBinanceOrders
} from './components';
import ccxt from 'ccxt';
/**
 * Trading Dashboard - Main trading interface
 * Manages order placement, monitoring, and history
 */
function TradingDashboard() {
  const [activeTab, setActiveTab] = useState('active-orders');
  const [refreshTrigger, _] = useState(0);

  const tabs = [
    { id: 'active-orders', label: 'Active Orders', icon: '⚡' },
    { id: 'live-binance', label: 'Live Binance', icon: '📊' },
    { id: 'history', label: 'History', icon: '📜' }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-900">
      <BackgroundEffect />

      <div className="relative z-10">
        {/* Navigation */}
        <Navigation />

        {/* Header */}
        <header className="border-b border-slate-700/50 backdrop-blur-lg bg-slate-900/80">
          <div className="container mx-auto px-4 py-6 max-w-7xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold gradient-text mb-2"
                    style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.03em' }}>
                  Trading Dashboard
                </h1>
                <p className="text-gray-400 text-lg">
                  Automated Futures Trading • Multi-Exchange Support
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Trading Stats */}
          <TradingStats refreshTrigger={refreshTrigger} />

          {/* Tabs */}
          <div className="mb-8">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap
                    ${activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700/50'
                    }
                  `}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="animate-fadeIn">
            {activeTab === 'active-orders' && (
              <ActiveOrdersList refreshTrigger={refreshTrigger} />
            )}
            {activeTab === 'live-binance' && (
              <LiveBinanceOrders />
            )}
            {activeTab === 'history' && (
              <OrderHistory />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default TradingDashboard;
