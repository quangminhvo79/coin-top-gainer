import { useState } from 'react';
import { useOrderHistory } from '../../../hooks/useTradingDashboard';

/**
 * Order History
 * Displays historical trading orders with filtering
 */
function OrderHistory() {
  const [filter, setFilter] = useState('ALL');
  const { data: orders = [], isLoading, refetch } = useOrderHistory();

  const filteredOrders = filter === 'ALL'
    ? orders
    : orders.filter(order => order.status === filter);

  const getStatusColor = (status) => {
    switch (status) {
      case 'FILLED':
        return 'text-green-400 bg-green-400/10';
      case 'CANCELLED':
        return 'text-gray-400 bg-gray-400/10';
      case 'FAILED':
        return 'text-red-400 bg-red-400/10';
      case 'CLOSED':
        return 'text-blue-400 bg-blue-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getSideColor = (side) => {
    return side === 'LONG' ? 'text-green-400' : 'text-red-400';
  };

  const getPnLColor = (pnl) => {
    if (!pnl || pnl === 0) return 'text-gray-400';
    return pnl > 0 ? 'text-green-400' : 'text-red-400';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatNumber = (num, decimals = 2) => {
    if (!num) return '0.00';
    return parseFloat(num).toFixed(decimals);
  };

  const calculatePnL = (order) => {
    if (!order.exitPrice || !order.entryPrice) return null;

    const diff = order.side === 'LONG'
      ? order.exitPrice - order.entryPrice
      : order.entryPrice - order.exitPrice;

    const pnl = (diff / order.entryPrice) * order.positionSize * order.leverage;
    return pnl;
  };

  const filterOptions = [
    { value: 'ALL', label: 'All Orders' },
    { value: 'FILLED', label: 'Filled' },
    { value: 'CLOSED', label: 'Closed' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'FAILED', label: 'Failed' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-white">
          Order History ({filteredOrders.length})
        </h2>

        <div className="flex items-center gap-3">
          {/* Filter Buttons */}
          <div className="flex gap-2 overflow-x-auto">
            {filterOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                  ${filter === option.value
                    ? 'bg-purple-500 text-white'
                    : 'bg-slate-700/50 text-gray-400 hover:bg-slate-600/50'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-lg transition-all"
          >
            Refresh
          </button>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl p-12 border border-slate-700/50 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-2xl font-bold text-white mb-2">No History Yet</h3>
          <p className="text-gray-400">Your completed orders will appear here</p>
        </div>
      ) : (
        <>
          {/* Desktop View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm border-b border-slate-700">
                  <th className="pb-3 font-medium">Symbol</th>
                  <th className="pb-3 font-medium">Side</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Size</th>
                  <th className="pb-3 font-medium">Leverage</th>
                  <th className="pb-3 font-medium">Entry</th>
                  <th className="pb-3 font-medium">Exit</th>
                  <th className="pb-3 font-medium">P&L</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredOrders.map((order) => {
                  const pnl = calculatePnL(order);
                  return (
                    <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4">
                        <div className="font-medium text-white">{order.symbol}</div>
                      </td>
                      <td className="py-4">
                        <span className={`font-bold ${getSideColor(order.side)}`}>
                          {order.side}
                        </span>
                      </td>
                      <td className="py-4 text-gray-300">
                        {order.orderType}
                      </td>
                      <td className="py-4 text-gray-300">
                        ${formatNumber(order.positionSize)}
                      </td>
                      <td className="py-4 text-gray-300">
                        {order.leverage}x
                      </td>
                      <td className="py-4 text-gray-300">
                        {order.entryPrice ? `$${formatNumber(order.entryPrice, 4)}` : '-'}
                      </td>
                      <td className="py-4 text-gray-300">
                        {order.exitPrice ? `$${formatNumber(order.exitPrice, 4)}` : '-'}
                      </td>
                      <td className="py-4">
                        {pnl !== null ? (
                          <span className={`font-bold ${getPnLColor(pnl)}`}>
                            {pnl > 0 ? '+' : ''}${formatNumber(pnl)}
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 text-sm text-gray-400">
                        {formatDate(order.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="lg:hidden space-y-4">
            {filteredOrders.map((order) => {
              const pnl = calculatePnL(order);
              return (
                <div
                  key={order.id}
                  className="bg-slate-800/30 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        {order.symbol}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${getSideColor(order.side)}`}>
                          {order.side}
                        </span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-400">{order.orderType}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-gray-400 text-sm mb-1">Position Size</div>
                      <div className="text-white font-medium">${formatNumber(order.positionSize)}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm mb-1">Leverage</div>
                      <div className="text-white font-medium">{order.leverage}x</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm mb-1">Entry Price</div>
                      <div className="text-white font-medium">
                        {order.entryPrice ? `$${formatNumber(order.entryPrice, 4)}` : '-'}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm mb-1">Exit Price</div>
                      <div className="text-white font-medium">
                        {order.exitPrice ? `$${formatNumber(order.exitPrice, 4)}` : '-'}
                      </div>
                    </div>
                  </div>

                  {pnl !== null && (
                    <div className="pt-4 border-t border-slate-700/50 mb-4">
                      <div className="text-gray-400 text-sm mb-1">Profit & Loss</div>
                      <div className={`text-2xl font-bold ${getPnLColor(pnl)}`}>
                        {pnl > 0 ? '+' : ''}${formatNumber(pnl)}
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-gray-400">
                    {formatDate(order.createdAt)}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default OrderHistory;
