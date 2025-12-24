import { useState } from 'react';
import { useActiveOrders, useCancelOrder } from '../../../hooks/useTradingDashboard';

/**
 * Active Orders List
 * Displays and manages currently active trading orders
 */
function ActiveOrdersList({ refreshTrigger }) {
  const { data: orders = [], isLoading, refetch } = useActiveOrders(refreshTrigger);
  const cancelOrder = useCancelOrder();
  const [cancellingId, setCancellingId] = useState(null);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    setCancellingId(orderId);
    try {
      await cancelOrder.mutateAsync(orderId);
      await refetch();
    } catch (error) {
      console.error('Failed to cancel order:', error);
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'ACTIVE':
        return 'text-green-400 bg-green-400/10';
      case 'FILLED':
        return 'text-blue-400 bg-blue-400/10';
      case 'CANCELLED':
        return 'text-gray-400 bg-gray-400/10';
      case 'FAILED':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getSideColor = (side) => {
    return side === 'LONG' ? 'text-green-400' : 'text-red-400';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatNumber = (num, decimals = 2) => {
    if (!num) return '0.00';
    return parseFloat(num).toFixed(decimals);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl p-12 border border-slate-700/50 text-center">
        <div className="text-6xl mb-4">📭</div>
        <h3 className="text-2xl font-bold text-white mb-2">No Active Orders</h3>
        <p className="text-gray-400">Place your first order to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">
          Active Orders ({orders.length})
        </h2>
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-lg transition-all"
        >
          Refresh
        </button>
      </div>

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
              <th className="pb-3 font-medium">Entry Price</th>
              <th className="pb-3 font-medium">TP / SL</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Date</th>
              <th className="pb-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {orders.map((order) => (
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
                <td className="py-4">
                  <div className="text-xs space-y-1">
                    {order.takeProfitPrice && (
                      <div className="text-green-400">
                        TP: ${formatNumber(order.takeProfitPrice, 4)}
                      </div>
                    )}
                    {order.stopLossPrice && (
                      <div className="text-red-400">
                        SL: ${formatNumber(order.stopLossPrice, 4)}
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="py-4 text-sm text-gray-400">
                  {formatDate(order.createdAt)}
                </td>
                <td className="py-4">
                  {(order.status === 'PENDING' || order.status === 'ACTIVE') && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={cancellingId === order.id}
                      className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-md text-sm transition-all disabled:opacity-50"
                    >
                      {cancellingId === order.id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden space-y-4">
        {orders.map((order) => (
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
                <div className="text-gray-400 text-sm mb-1">Date</div>
                <div className="text-white font-medium text-sm">
                  {formatDate(order.createdAt)}
                </div>
              </div>
            </div>

            {(order.takeProfitPrice || order.stopLossPrice) && (
              <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-slate-700/50">
                {order.takeProfitPrice && (
                  <div>
                    <div className="text-gray-400 text-sm mb-1">Take Profit</div>
                    <div className="text-green-400 font-medium">
                      ${formatNumber(order.takeProfitPrice, 4)}
                    </div>
                  </div>
                )}
                {order.stopLossPrice && (
                  <div>
                    <div className="text-gray-400 text-sm mb-1">Stop Loss</div>
                    <div className="text-red-400 font-medium">
                      ${formatNumber(order.stopLossPrice, 4)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {(order.status === 'PENDING' || order.status === 'ACTIVE') && (
              <button
                onClick={() => handleCancelOrder(order.id)}
                disabled={cancellingId === order.id}
                className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all disabled:opacity-50"
              >
                {cancellingId === order.id ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ActiveOrdersList;
