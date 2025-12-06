/**
 * Presentational component for TradingView Chart
 * Pure UI component that renders chart container and timeframe selector
 */
function TradingViewChartPresentation({
  chartContainerRef,
  selectedInterval,
  onIntervalChange,
  timeframes
}) {
  return (
    <div className="w-full rounded-lg overflow-hidden glass p-2">
      {/* Timeframe Selector */}
      <div className="flex gap-1 mb-2 flex-wrap">
        {timeframes.map((tf) => (
          <button
            key={tf.value}
            onClick={() => onIntervalChange(tf.value)}
            className={`px-3 py-1 text-xs font-semibold rounded transition-all duration-200 ${
              selectedInterval === tf.value
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {/* Chart Container */}
      <div ref={chartContainerRef} className="w-full h-[300px]" />
    </div>
  );
}

export default TradingViewChartPresentation;
