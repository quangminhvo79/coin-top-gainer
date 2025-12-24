import { useState } from 'react';
import apiClient from '../../../utils/apiClient';
import binanceLogo from '../../../assets/binance-logo.webp';
import okxLogo from '../../../assets/okx-logo.webp';
import bybitLogo from '../../../assets/bybit-logo.webp';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function PlatformSettings({ platform, isSelected, onClick }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    defaultLeverage: platform.settings?.futuresConfig?.defaultLeverage || 10,
    defaultTakeProfitPercent: platform.settings?.futuresConfig?.defaultTakeProfitPercent || 5,
    defaultStopLossPercent: platform.settings?.futuresConfig?.defaultStopLossPercent || 3,
    defaultPositionSizePercent: platform.settings?.futuresConfig?.defaultPositionSizePercent || 50,
    autoTpSl: platform.settings?.futuresConfig?.autoTpSl || false,
  });

  const platformLogos = {
    binance: binanceLogo,
    okx: okxLogo,
    bybit: bybitLogo,
    coinbase: null, // Using emoji fallback
    kraken: null,   // Using emoji fallback
    custom: null,   // Using emoji fallback
  };

  const platformIcons = {
    binance: '🟡',
    coinbase: '🔵',
    kraken: '🟣',
    bybit: '🟠',
    okx: '⚫',
    custom: '⚪',
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await apiClient(
        `/api/v1/platforms/${platform.id}/futures-settings`,
        {
          method: 'PUT',
          body: JSON.stringify(settings),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      setIsEditing(false);
      // Optionally trigger a refetch of platforms
      window.location.reload();
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    setSettings({
      defaultLeverage: platform.settings?.futuresConfig?.defaultLeverage || 10,
      defaultTakeProfitPercent: platform.settings?.futuresConfig?.defaultTakeProfitPercent || 5,
      defaultStopLossPercent: platform.settings?.futuresConfig?.defaultStopLossPercent || 3,
      defaultPositionSizePercent: platform.settings?.futuresConfig?.defaultPositionSizePercent || 50,
      autoTpSl: platform.settings?.futuresConfig?.autoTpSl || false,
    });
    setIsEditing(false);
  };

  return (
    <div
      onClick={onClick}
      className={`
        backdrop-blur-xl rounded-2xl border transition-all duration-300 cursor-pointer
        ${
          isSelected
            ? 'bg-slate-800/50 border-purple-500/50 shadow-lg shadow-purple-500/20'
            : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600/50'
        }
      `}
    >
      {/* Platform Header */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {platformLogos[platform.platform] ? (
              <img
                src={platformLogos[platform.platform]}
                alt={`${platform.platform} logo`}
                className="w-12 h-12 object-contain rounded-md"
              />
            ) : (
              <div className="text-4xl">{platformIcons[platform.platform] || '⚪'}</div>
            )}
            <div>
              <h3 className="text-xl font-bold text-white">{platform.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-400 capitalize">{platform.platform}</span>
                {platform.isTestnet && (
                  <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                    Testnet
                  </span>
                )}
                {platform.isActive ? (
                  <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
                    Inactive
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(!isEditing);
            }}
            className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors"
          >
            {isEditing ? 'Cancel Edit' : 'Edit Settings'}
          </button>
        </div>
      </div>

      {/* Settings Content */}
      <div className="p-6 space-y-6">
        {/* Trading Defaults */}
        <div>
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Trading Defaults
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Default Position Size Percent */}
            <div className="flex flex-col justify-between">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Default Position Size (% of Capital)
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="range"
                    value={settings.defaultPositionSizePercent}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        defaultPositionSizePercent: parseInt(e.target.value),
                      })
                    }
                    min="1"
                    max="100"
                    step="1"
                    className="w-full h-2 bg-slate-900/50 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">1%</span>
                    <span className="text-sm text-blue-400 font-semibold">
                      {settings.defaultPositionSizePercent}%
                    </span>
                    <span className="text-xs text-gray-500">100%</span>
                  </div>
                </div>
              ) : (
                <div className="px-3 py-2 bg-blue-900/30 border border-blue-700/50 rounded-lg text-blue-400">
                  {settings.defaultPositionSizePercent}% of capital
                </div>
              )}
            </div>

            {/* Default Leverage */}
            <div className="flex flex-col justify-between">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Default Leverage
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="range"
                    value={settings.defaultLeverage}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        defaultLeverage: parseInt(e.target.value),
                      })
                    }
                    min="1"
                    max="125"
                    step="1"
                    className="w-full h-2 bg-slate-900/50 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">1x</span>
                    <span className="text-sm text-purple-400 font-semibold">
                      {settings.defaultLeverage}x
                    </span>
                    <span className="text-xs text-gray-500">125x</span>
                  </div>
                </div>
              ) : (
                <div className="px-3 py-2 bg-purple-900/30 border border-purple-700/50 rounded-lg text-purple-400">
                  {settings.defaultLeverage}x
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Risk Management */}
        <div>
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Risk Management
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Take Profit */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Default Take Profit (%)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={settings.defaultTakeProfitPercent}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      defaultTakeProfitPercent: parseFloat(e.target.value),
                    })
                  }
                  min="0.1"
                  max="100"
                  step="0.1"
                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              ) : (
                <div className="px-3 py-2 bg-green-900/30 border border-green-700/50 rounded-lg text-green-400">
                  +{settings.defaultTakeProfitPercent}%
                </div>
              )}
            </div>

            {/* Stop Loss */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Default Stop Loss (%)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={settings.defaultStopLossPercent}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      defaultStopLossPercent: parseFloat(e.target.value),
                    })
                  }
                  min="0.1"
                  max="100"
                  step="0.1"
                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              ) : (
                <div className="px-3 py-2 bg-red-900/30 border border-red-700/50 rounded-lg text-red-400">
                  -{settings.defaultStopLossPercent}%
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Options */}
        <div>
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Options
          </h4>
          <div className="space-y-3">
            {/* Auto TP/SL */}
            <label className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg cursor-pointer hover:bg-slate-900/50 transition-colors">
              <div>
                <div className="text-white font-medium">Auto TP/SL</div>
                <div className="text-sm text-gray-400">
                  Automatically set TP/SL on new orders
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.autoTpSl}
                onChange={(e) =>
                  setSettings({ ...settings, autoTpSl: e.target.checked })
                }
                disabled={!isEditing}
                className="w-5 h-5 rounded border-slate-600 bg-slate-900/50 text-purple-500 focus:ring-purple-500 disabled:opacity-50"
              />
            </label>
          </div>
        </div>

        {/* Save/Cancel Buttons */}
        {isEditing && (
          <div className="flex gap-3 pt-4 border-t border-slate-700/50">
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        )}

        {/* Last Synced */}
        {platform.lastSyncedAt && (
          <div className="text-xs text-gray-500 text-center pt-2 border-t border-slate-700/30">
            Last synced: {new Date(platform.lastSyncedAt).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}

export default PlatformSettings;
