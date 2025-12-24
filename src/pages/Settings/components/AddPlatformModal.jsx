import { useState } from 'react';
import apiClient from '../../../utils/apiClient';
import binanceLogo from '../../../assets/binance-logo.webp';
import okxLogo from '../../../assets/okx-logo.webp';
import bybitLogo from '../../../assets/bybit-logo.webp';

function AddPlatformModal({ onClose }) {
  const [formData, setFormData] = useState({
    platform: 'binance',
    name: '',
    apiKey: '',
    apiSecret: '',
    passphrase: '',
    isTestnet: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const platforms = [
    { value: 'binance', label: 'Binance', icon: '🟡', logo: binanceLogo },
    { value: 'okx', label: 'OKX', icon: '⚫', logo: okxLogo },
    { value: 'bybit', label: 'Bybit', icon: '🟠', logo: bybitLogo },
    { value: 'custom', label: 'Custom', icon: '⚪', logo: null },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await apiClient('/api/v1/platforms', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to add platform');
      }

      // Reload to show new platform
      window.location.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">Add Trading Platform</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Select Platform
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {platforms.map((platform) => (
                <button
                  key={platform.value}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, platform: platform.value })
                  }
                  className={`
                    p-4 rounded-lg border-2 transition-all
                    ${
                      formData.platform === platform.value
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-slate-600 bg-slate-900/30 hover:border-slate-500'
                    }
                  `}
                >
                  {platform.logo ? (
                    <img
                      src={platform.logo}
                      alt={`${platform.label} logo`}
                      className="w-12 h-12 object-contain rounded-md mx-auto mb-2"
                    />
                  ) : (
                    <div className="text-3xl mb-2">{platform.icon}</div>
                  )}
                  <div className="text-white font-medium">{platform.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Platform Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Platform Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="My Binance Account"
              required
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              API Key
            </label>
            <input
              type="text"
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              placeholder="Enter your API key"
              required
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
            />
          </div>

          {/* API Secret */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              API Secret
            </label>
            <input
              type="password"
              value={formData.apiSecret}
              onChange={(e) =>
                setFormData({ ...formData, apiSecret: e.target.value })
              }
              placeholder="Enter your API secret"
              required
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
            />
          </div>

          {/* Passphrase (Optional) */}
          {(formData.platform === 'coinbase' || formData.platform === 'okx') && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Passphrase
                <span className="text-gray-500 text-xs ml-2">(Optional for some platforms)</span>
              </label>
              <input
                type="password"
                value={formData.passphrase}
                onChange={(e) =>
                  setFormData({ ...formData, passphrase: e.target.value })
                }
                placeholder="Enter passphrase if required"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
              />
            </div>
          )}

          {/* Testnet Toggle */}
          <label className="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg cursor-pointer hover:bg-slate-900/50 transition-colors">
            <div>
              <div className="text-white font-medium">Testnet Mode</div>
              <div className="text-sm text-gray-400">
                Use testnet API endpoints for testing
              </div>
            </div>
            <input
              type="checkbox"
              checked={formData.isTestnet}
              onChange={(e) =>
                setFormData({ ...formData, isTestnet: e.target.checked })
              }
              className="w-5 h-5 rounded border-slate-600 bg-slate-900/50 text-purple-500 focus:ring-purple-500"
            />
          </label>

          {/* Warning */}
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="text-sm text-yellow-400">
                <p className="font-semibold mb-1">Security Notice</p>
                <p className="text-yellow-400/80">
                  Make sure to only grant necessary permissions to your API keys (e.g., trading, reading).
                  Never share your API keys with anyone.
                </p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Adding...' : 'Add Platform'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddPlatformModal;
