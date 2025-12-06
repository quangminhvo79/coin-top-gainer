/**
 * Presentational component for Footer
 * Displays app information and credits
 */
function FooterPresentation() {
  return (
    <div className="mt-20 text-center frosted-card p-10">
      <div className="inline-block mb-4">
        <div className="flex items-center space-x-2 text-[#00d4ff]">
          <div className="w-2 h-2 bg-[#00d4ff] rounded-full animate-pulse"
               style={{ boxShadow: '0 0 10px rgba(0, 212, 255, 0.8)' }} />
          <p className="text-gray-300 mono-data font-medium tracking-wide">
            Live Data Stream • Updated every 30s
          </p>
        </div>
      </div>
      <p className="text-sm text-gray-500 mono-data">
        Powered by Binance API • Minimum volume $1M USDT • USDT pairs only
      </p>
      <div className="mt-6 pt-6 border-t border-white/5">
        <p className="text-xs text-gray-600 mono-data tracking-wider">
          CRYSTAL EXCHANGE © 2024 • Real-time Cryptocurrency Analytics
        </p>
      </div>
    </div>
  );
}

export default FooterPresentation;
