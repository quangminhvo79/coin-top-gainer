import { useOrderHistory } from '../../../hooks/useTradingDashboard';

/**
 * Trading Stats
 * Displays summary statistics for trading activity
 */
function TradingStats({ refreshTrigger }) {
  const { data: orders = [] } = useOrderHistory(refreshTrigger);

  const calculateStats = () => {
    const totalOrders = orders.length;
    const activeOrders = orders.filter(o => o.status === 'ACTIVE' || o.status === 'PENDING').length;
    const closedOrders = orders.filter(o => o.status === 'CLOSED' || o.status === 'FILLED').length;

    let totalPnL = 0;
    let winningTrades = 0;
    let losingTrades = 0;

    orders.forEach(order => {
      if (order.exitPrice && order.entryPrice) {
        const diff = order.side === 'LONG'
          ? order.exitPrice - order.entryPrice
          : order.entryPrice - order.exitPrice;

        const pnl = (diff / order.entryPrice) * order.positionSize * order.leverage;
        totalPnL += pnl;

        if (pnl > 0) winningTrades++;
        else if (pnl < 0) losingTrades++;
      }
    });

    const winRate = closedOrders > 0 ? (winningTrades / closedOrders) * 100 : 0;

    return {
      totalOrders,
      activeOrders,
      closedOrders,
      totalPnL,
      winningTrades,
      losingTrades,
      winRate
    };
  };

  const stats = calculateStats();

  const statCards = [
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      icon: '📊',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'Active Orders',
      value: stats.activeOrders,
      icon: '⚡',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      label: 'Closed Orders',
      value: stats.closedOrders,
      icon: '✅',
      color: 'from-green-500 to-emerald-500'
    },
    {
      label: 'Win Rate',
      value: `${stats.winRate.toFixed(1)}%`,
      icon: '🎯',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const formatPnL = (value) => {
    const formatted = value.toFixed(2);
    return value >= 0 ? `+$${formatted}` : `-$${Math.abs(value).toFixed(2)}`;
  };

  return (
    <div className="mb-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, index) => (
          <div
            key={stat.label}
            className="bg-slate-800/30 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all"
            style={{
              animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{stat.icon}</span>
              <div className={`px-3 py-1 rounded-lg bg-gradient-to-r ${stat.color} opacity-20`}></div>
            </div>
            <div className="text-gray-400 text-sm mb-1">{stat.label}</div>
            <div className="text-3xl font-bold text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* P&L Card */}
      <div className="bg-slate-800/30 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-gray-400 text-sm mb-1">Total Profit & Loss</div>
            <div className={`text-4xl font-bold ${stats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatPnL(stats.totalPnL)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-gray-400 text-sm mb-1">Winning</div>
              <div className="text-2xl font-bold text-green-400">{stats.winningTrades}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 text-sm mb-1">Losing</div>
              <div className="text-2xl font-bold text-red-400">{stats.losingTrades}</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {stats.closedOrders > 0 && (
          <div className="mt-4">
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${stats.winRate}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TradingStats;
