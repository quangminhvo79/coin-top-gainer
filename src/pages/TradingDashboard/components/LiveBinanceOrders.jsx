import { useState } from 'react';
import { useTradingPlatforms } from '../../../hooks/useTradingDashboard';
import { useQuery } from '@tanstack/react-query';
import { fetchAPI } from '../../../utils/apiClient';

/**
 * Live Binance Orders
 * Displays orders directly from Binance API without syncing to database
 */
function LiveBinanceOrders() {
  const { data: platforms = [] } = useTradingPlatforms();
  const [selectedPlatformId, setSelectedPlatformId] = useState(null);

  // Auto-select first platform if available
  const platformId = selectedPlatformId || platforms[0]?.id;

  // Fetch live orders from Binance
  const { data: liveData, isLoading, refetch, error } = useQuery({
    queryKey: ['live-binance-orders', platformId],
    queryFn: () => fetchAPI(`/api/v1/futures/sync-orders?platformId=${platformId}`),
    enabled: !!platformId,
    // refetchInterval: 10000, // Auto-refresh every 10 seconds
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'NEW':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'PARTIALLY_FILLED':
        return 'text-blue-400 bg-blue-400/10';
      case 'FILLED':
        return 'text-green-400 bg-green-400/10';
      case 'CANCELED':
        return 'text-gray-400 bg-gray-400/10';
      case 'EXPIRED':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getSideColor = (side) => {
    return side === 'LONG' ? 'text-green-400' : 'text-red-400';
  };

  const formatNumber = (num, decimals = 2) => {
    if (!num) return '0.00';
    return parseFloat(num).toFixed(decimals);
  };

  const orders = liveData?.openOrders || [];
  console.log('Live Binance Orders data:', liveData);
  return (
    <div className="space-y-6">
      {/* Header with Platform Selector */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Live Binance Orders ({orders.length})
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Real-time data from Binance • Auto-refresh every 10s
          </p>
        </div>
        <div className="flex gap-2 items-center">
          {/* Platform Selector */}
          {platforms.length > 1 && (
            <select
              value={platformId || ''}
              onChange={(e) => setSelectedPlatformId(e.target.value)}
              className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {platforms.map((platform) => (
                <option key={platform.id} value={platform.id}>
                  {platform.name} ({platform.platform.toUpperCase()})
                  {platform.isTestnet ? ' - Testnet' : ''}
                </option>
              ))}
            </select>
          )}
          {/* Refresh Button */}
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <span>{isLoading ? '⏳' : '🔄'}</span>
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-red-400">⚠️</span>
            <div>
              <div className="text-red-400 font-semibold">Failed to load orders</div>
              <div className="text-red-400/80 text-sm">{error.message}</div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !liveData && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      )}

      {/* Summary Cards */}
      {liveData && liveData.summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/30 backdrop-blur-lg rounded-xl p-4 border border-slate-700/50">
            <div className="text-gray-400 text-sm mb-1">Total Orders</div>
            <div className="text-3xl font-bold text-white">{liveData.summary.total}</div>
          </div>
          <div className="bg-slate-800/30 backdrop-blur-lg rounded-xl p-4 border border-slate-700/50">
            <div className="text-gray-400 text-sm mb-1">Unique Symbols</div>
            <div className="text-3xl font-bold text-cyan-400">
              {Object.keys(liveData.summary.bySymbol).length}
            </div>
          </div>
          <div className="bg-slate-800/30 backdrop-blur-lg rounded-xl p-4 border border-slate-700/50">
            <div className="text-gray-400 text-sm mb-1">Order Types</div>
            <div className="text-3xl font-bold text-purple-400">
              {Object.keys(liveData.summary.byStatus).length}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && orders.length === 0 && !error && (
        <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl p-12 border border-slate-700/50 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-2xl font-bold text-white mb-2">No Open Orders</h3>
          <p className="text-gray-400">No open orders found on Binance</p>
        </div>
      )}

      {/* Orders List */}
      {!isLoading && orders.length > 0 && (
        <>
          {/* Desktop View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm border-b border-slate-700">
                  <th className="pb-3 font-medium">Symbol</th>
                  <th className="pb-3 font-medium">Side</th>
                  <th className="pb-3 font-medium">PNL (USDT)</th>
                  <th className="pb-3 font-medium">Quantity (USDT)</th>
                  <th className="pb-3 font-medium">Price</th>
                  <th className="pb-3 font-medium">Quantity (USDT)</th>
                  <th className="pb-3 font-medium">Leverage</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {orders.map((order, index) => (
                  <tr key={order.orderId || index} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4">
                      <div className="font-medium text-white">{order.symbol}</div>
                      {order.clientOrderId && (
                        <div className="text-xs text-gray-500 mt-1 font-mono">
                          {order.clientOrderId}
                        </div>
                      )}
                    </td>
                    <td className="py-4">
                      <span className={`font-bold ${getSideColor(order.positionSide)}`}>
                        {order.positionSide}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className="text-gray-300 text-sm">{order.unRealizedProfit}</span>
                    </td>
                    <td className="py-4">
                      <div className="text-white">{formatNumber(order.bidNotional || order.askNotional, 6)}</div>
                    </td>
                    <td className="py-4">
                      <div className="text-white">
                        {order.price && parseFloat(order.price) > 0
                          ? `$${formatNumber(order.price, 2)}`
                          : 'Market'}
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="text-gray-400">
                        {order.stopPrice && parseFloat(order.stopPrice) > 0
                          ? `$${formatNumber(order.stopPrice, 2)}`
                          : '-'}
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="text-gray-400">
                        {formatNumber(order.executedQty, 4)} / {formatNumber(order.origQty, 4)}
                      </div>
                      {parseFloat(order.executedQty) > 0 && (
                        <div className="text-xs text-blue-400 mt-1">
                          {((parseFloat(order.executedQty) / parseFloat(order.origQty)) * 100).toFixed(1)}%
                        </div>
                      )}
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      {order.reduceOnly && (
                        <div className="text-xs text-orange-400 mt-1">Reduce Only</div>
                      )}
                    </td>
                    <td className="py-4">
                      <div className="text-gray-400 text-sm">
                        {new Date(order.time || order.updateTime).toLocaleString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="lg:hidden space-y-4">
            {orders.map((order, index) => (
              <div
                key={order.orderId || index}
                className="bg-slate-800/30 backdrop-blur-lg rounded-xl p-4 border border-slate-700/50"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-bold text-white text-lg">{order.symbol}</div>
                    <div className="text-xs text-gray-500 font-mono mt-1">
                      {order.clientOrderId}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-gray-400">Side</div>
                    <div className={`font-bold ${getSideColor(order.positionSide)}`}>{order.positionSide}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">PNL (USDT)</div>
                    <div className="text-white">{order.type}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Quantity (USDT)</div>
                    <div className="text-white">
                      {formatNumber(order.bidNotional || order.askNotional, 6)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Price</div>
                    <div className="text-white">
                      {order.markPrice && parseFloat(order.markPrice) > 0
                        ? `$${formatNumber(order.markPrice, 2)}`
                        : 'Market'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Filled</div>
                    <div className="text-white">
                      {formatNumber(order.executedQty, 4)} / {formatNumber(order.origQty, 4)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Time</div>
                    <div className="text-white text-xs">
                      {new Date(order.time || order.updateTime).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                {order.stopPrice && parseFloat(order.stopPrice) > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-700/50">
                    <div className="text-gray-400 text-sm">Stop Price</div>
                    <div className="text-white">${formatNumber(order.stopPrice, 2)}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default LiveBinanceOrders;
