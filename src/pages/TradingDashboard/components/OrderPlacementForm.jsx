import { useState, useEffect } from 'react';
import { useTradingPlatforms, usePlaceOrder } from '../../../hooks/useTradingDashboard';

/**
 * Order Placement Form
 * Form for creating new futures trading orders
 */
function OrderPlacementForm({ onOrderPlaced }) {
  const { data: platforms = [], isLoading: loadingPlatforms } = useTradingPlatforms();
  const placeOrder = usePlaceOrder();

  const [formData, setFormData] = useState({
    platformId: '',
    symbol: 'BTCUSDT',
    side: 'LONG',
    orderType: 'MARKET',
    positionSize: '',
    leverage: 10,
    takeProfitPercent: '',
    stopLossPercent: ''
  });

  const [errors, setErrors] = useState({});
  const [estimatedValues, setEstimatedValues] = useState({
    margin: 0,
    takeProfitPrice: 0,
    stopLossPrice: 0
  });

  // Auto-select first platform and load its default settings
  useEffect(() => {
    if (platforms.length > 0 && !formData.platformId) {
      const firstPlatform = platforms[0];
      const settings = firstPlatform.settings?.futuresConfig || {};

      setFormData(prev => ({
        ...prev,
        platformId: firstPlatform.id,
        symbol: settings.defaultSymbol || 'BTCUSDT',
        orderType: settings.defaultOrderType || 'MARKET',
        positionSize: settings.defaultPositionSize || '',
        leverage: settings.defaultLeverage || 10,
        takeProfitPercent: settings.defaultTakeProfitPercent || '',
        stopLossPercent: settings.defaultStopLossPercent || '',
      }));
    }
  }, [platforms, formData.platformId]);

  // Load default settings when platform changes
  const handlePlatformChange = (platformId) => {
    const platform = platforms.find(p => p.id === platformId);
    if (platform) {
      const settings = platform.settings?.futuresConfig || {};

      setFormData(prev => ({
        ...prev,
        platformId,
        symbol: settings.defaultSymbol || prev.symbol,
        orderType: settings.defaultOrderType || prev.orderType,
        positionSize: settings.defaultPositionSize || prev.positionSize,
        leverage: settings.defaultLeverage || prev.leverage,
        takeProfitPercent: settings.defaultTakeProfitPercent || prev.takeProfitPercent,
        stopLossPercent: settings.defaultStopLossPercent || prev.stopLossPercent,
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.platformId) {
      newErrors.platformId = 'Please select a trading platform';
    }
    if (!formData.symbol) {
      newErrors.symbol = 'Symbol is required';
    }
    if (!formData.positionSize || formData.positionSize <= 0) {
      newErrors.positionSize = 'Position size must be greater than 0';
    }
    if (formData.leverage < 1 || formData.leverage > 125) {
      newErrors.leverage = 'Leverage must be between 1 and 125';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const orderData = {
        platformId: formData.platformId,
        symbol: formData.symbol,
        side: formData.side,
        orderType: formData.orderType,
        positionSize: parseFloat(formData.positionSize),
        leverage: parseInt(formData.leverage),
        ...(formData.takeProfitPercent && {
          takeProfitPercent: parseFloat(formData.takeProfitPercent)
        }),
        ...(formData.stopLossPercent && {
          stopLossPercent: parseFloat(formData.stopLossPercent)
        })
      };

      await placeOrder.mutateAsync(orderData);

      // Reset form
      setFormData({
        platformId: formData.platformId, // Keep platform selected
        symbol: 'BTCUSDT',
        side: 'LONG',
        orderType: 'MARKET',
        positionSize: '',
        leverage: 10,
        takeProfitPercent: '',
        stopLossPercent: ''
      });

      if (onOrderPlaced) {
        onOrderPlaced();
      }
    } catch (error) {
      console.error('Failed to place order:', error);
    }
  };

  const popularSymbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT', 'XRPUSDT'];

  return (
    <div className="mx-auto">
      <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50">
        <h2 className="text-2xl font-bold text-white mb-6">Place New Order</h2>

        {placeOrder.isSuccess && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
            <p className="text-green-400 font-medium">Order placed successfully!</p>
          </div>
        )}

        {placeOrder.isError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-red-400 font-medium">
              Failed to place order: {placeOrder.error?.message || 'Unknown error'}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Platform Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-gray-300 font-medium">
                Trading Platform
              </label>
              {formData.platformId && (
                <button
                  type="button"
                  onClick={() => handlePlatformChange(formData.platformId)}
                  className="text-xs px-3 py-1 bg-purple-500/20 text-purple-400 rounded-md hover:bg-purple-500/30 transition-colors"
                >
                  ⚙️ Use Defaults
                </button>
              )}
            </div>
            <select
              name="platformId"
              value={formData.platformId}
              onChange={(e) => handlePlatformChange(e.target.value)}
              disabled={loadingPlatforms}
              className={`
                w-full px-4 py-3 bg-slate-900/50 border rounded-lg text-white
                focus:outline-none focus:ring-2 focus:ring-purple-500
                ${errors.platformId ? 'border-red-500' : 'border-slate-600'}
              `}
            >
              <option value="">Select Platform</option>
              {platforms.map(platform => (
                <option key={platform.id} value={platform.id}>
                  {platform.name} ({platform.platform})
                  {platform.settings?.futuresConfig && ' ⚙️'}
                </option>
              ))}
            </select>
            {errors.platformId && (
              <p className="mt-1 text-sm text-red-400">{errors.platformId}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Symbol */}
            <div>
              <label className="block text-gray-300 font-medium mb-2">
                Symbol
              </label>
              <input
                type="text"
                name="symbol"
                value={formData.symbol}
                onChange={handleChange}
                placeholder="BTCUSDT"
                className={`
                  w-full px-4 py-3 bg-slate-900/50 border rounded-lg text-white
                  focus:outline-none focus:ring-2 focus:ring-purple-500
                  ${errors.symbol ? 'border-red-500' : 'border-slate-600'}
                `}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {popularSymbols.map(symbol => (
                  <button
                    key={symbol}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, symbol }))}
                    className={`
                      px-3 py-1 text-xs rounded-md transition-all
                      ${formData.symbol === symbol
                        ? 'bg-purple-500 text-white'
                        : 'bg-slate-700/50 text-gray-400 hover:bg-slate-600/50'
                      }
                    `}
                  >
                    {symbol}
                  </button>
                ))}
              </div>
              {errors.symbol && (
                <p className="mt-1 text-sm text-red-400">{errors.symbol}</p>
              )}
            </div>

            {/* Side */}
            <div>
              <label className="block text-gray-300 font-medium mb-2">
                Position Side
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, side: 'LONG' }))}
                  className={`
                    px-4 py-3 rounded-lg font-medium transition-all
                    ${formData.side === 'LONG'
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-900/50 text-gray-400 border border-slate-600 hover:bg-slate-800/50'
                    }
                  `}
                >
                  LONG
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, side: 'SHORT' }))}
                  className={`
                    px-4 py-3 rounded-lg font-medium transition-all
                    ${formData.side === 'SHORT'
                      ? 'bg-red-500 text-white'
                      : 'bg-slate-900/50 text-gray-400 border border-slate-600 hover:bg-slate-800/50'
                    }
                  `}
                >
                  SHORT
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Position Size */}
            <div>
              <label className="block text-gray-300 font-medium mb-2">
                Position Size (USDT)
              </label>
              <input
                type="number"
                name="positionSize"
                value={formData.positionSize}
                onChange={handleChange}
                placeholder="100"
                step="0.01"
                min="0"
                className={`
                  w-full px-4 py-3 bg-slate-900/50 border rounded-lg text-white
                  focus:outline-none focus:ring-2 focus:ring-purple-500
                  ${errors.positionSize ? 'border-red-500' : 'border-slate-600'}
                `}
              />
              {errors.positionSize && (
                <p className="mt-1 text-sm text-red-400">{errors.positionSize}</p>
              )}
            </div>

            {/* Leverage */}
            <div>
              <label className="block text-gray-300 font-medium mb-2">
                Leverage: {formData.leverage}x
              </label>
              <input
                type="range"
                name="leverage"
                value={formData.leverage}
                onChange={handleChange}
                min="1"
                max="125"
                step="1"
                className="w-full h-2 bg-slate-900/50 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1x</span>
                <span>25x</span>
                <span>50x</span>
                <span>75x</span>
                <span>100x</span>
                <span>125x</span>
              </div>
              {errors.leverage && (
                <p className="mt-1 text-sm text-red-400">{errors.leverage}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Take Profit */}
            <div>
              <label className="block text-gray-300 font-medium mb-2">
                Take Profit (%)
              </label>
              <input
                type="number"
                name="takeProfitPercent"
                value={formData.takeProfitPercent}
                onChange={handleChange}
                placeholder="5"
                step="0.1"
                min="0"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Stop Loss */}
            <div>
              <label className="block text-gray-300 font-medium mb-2">
                Stop Loss (%)
              </label>
              <input
                type="number"
                name="stopLossPercent"
                value={formData.stopLossPercent}
                onChange={handleChange}
                placeholder="3"
                step="0.1"
                min="0"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={placeOrder.isPending || loadingPlatforms}
            className={`
              w-full py-4 rounded-lg font-bold text-lg transition-all
              ${placeOrder.isPending || loadingPlatforms
                ? 'bg-slate-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/50'
              }
            `}
          >
            {placeOrder.isPending ? 'Placing Order...' : 'Place Order'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default OrderPlacementForm;
