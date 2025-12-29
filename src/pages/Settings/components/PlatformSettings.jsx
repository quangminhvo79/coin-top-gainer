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
  const [credentials, setCredentials] = useState({
    apiKey: '',
    apiSecret: '',
    passphrase: '',
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
      // Update futures settings
      const futuresResponse = await apiClient(
        `/api/v1/platforms/${platform.id}/futures-settings`,
        {
          method: 'PUT',
          body: JSON.stringify(settings),
        }
      );

      if (!futuresResponse.ok) {
        throw new Error('Failed to update futures settings');
      }

      // Update API credentials if provided
      if (credentials.apiKey || credentials.apiSecret || credentials.passphrase) {
        const credentialsPayload = {};
        if (credentials.apiKey) credentialsPayload.apiKey = credentials.apiKey;
        if (credentials.apiSecret) credentialsPayload.apiSecret = credentials.apiSecret;
        if (credentials.passphrase) credentialsPayload.passphrase = credentials.passphrase;

        const credentialsResponse = await apiClient(
          `/api/v1/platforms/${platform.id}`,
          {
            method: 'PUT',
            body: JSON.stringify(credentialsPayload),
          }
        );

        if (!credentialsResponse.ok) {
          throw new Error('Failed to update API credentials');
        }
      }

      setIsEditing(false);
      // Clear credential fields after save
      setCredentials({ apiKey: '', apiSecret: '', passphrase: '' });
      // Optionally trigger a refetch of platforms
      window.location.reload();
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings: ' + error.message);
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
    setCredentials({ apiKey: '', apiSecret: '', passphrase: '' });
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
        {/* API Credentials */}
        <div>
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            API Credentials
          </h4>
          <div className="space-y-4">
            {/* API Key */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                API Key
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={credentials.apiKey}
                  onChange={(e) =>
                    setCredentials({
                      ...credentials,
                      apiKey: e.target.value,
                    })
                  }
                  placeholder="Enter new API key to update"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                />
              ) : (
                <div className="px-4 py-3 bg-slate-900/30 border border-slate-700/50 rounded-lg text-gray-500 font-mono text-sm">
                  {platform.apiKey ? '••••••••••••••••' : 'Not configured'}
                </div>
              )}
            </div>

            {/* API Secret */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                API Secret
              </label>
              {isEditing ? (
                <input
                  type="password"
                  value={credentials.apiSecret}
                  onChange={(e) =>
                    setCredentials({
                      ...credentials,
                      apiSecret: e.target.value,
                    })
                  }
                  placeholder="Enter new API secret to update"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                />
              ) : (
                <div className="px-4 py-3 bg-slate-900/30 border border-slate-700/50 rounded-lg text-gray-500 font-mono text-sm">
                  {platform.apiSecret ? '••••••••••••••••' : 'Not configured'}
                </div>
              )}
            </div>

            {/* Passphrase (Optional for OKX, Coinbase) */}
            {(platform.platform === 'okx' || platform.platform === 'coinbase') && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Passphrase
                  <span className="text-gray-500 text-xs ml-2">(Optional)</span>
                </label>
                {isEditing ? (
                  <input
                    type="password"
                    value={credentials.passphrase}
                    onChange={(e) =>
                      setCredentials({
                        ...credentials,
                        passphrase: e.target.value,
                      })
                    }
                    placeholder="Enter passphrase if required"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                  />
                ) : (
                  <div className="px-4 py-3 bg-slate-900/30 border border-slate-700/50 rounded-lg text-gray-500 font-mono text-sm">
                    {platform.passphrase ? '••••••••••••••••' : 'Not configured'}
                  </div>
                )}
              </div>
            )}

            {/* Security Notice */}
            {isEditing && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/50 rounded-lg">
                <div className="flex gap-2">
                  <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="text-sm text-yellow-400">
                    <p className="font-semibold mb-1">Security Notice</p>
                    <p className="text-yellow-400/80">
                      Leave fields empty to keep existing credentials. Only fill in fields you want to update.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

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
