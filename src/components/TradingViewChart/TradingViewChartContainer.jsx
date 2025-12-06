import { useTradingViewChart } from '../../hooks';
import TradingViewChartPresentation from './TradingViewChartPresentation';

/**
 * Container component for TradingView Chart
 * Manages chart state and logic using custom hook
 */
function TradingViewChartContainer({ symbol, interval }) {
  const {
    chartContainerRef,
    selectedInterval,
    setSelectedInterval,
    timeframes
  } = useTradingViewChart(symbol, interval);

  return (
    <TradingViewChartPresentation
      chartContainerRef={chartContainerRef}
      selectedInterval={selectedInterval}
      onIntervalChange={setSelectedInterval}
      timeframes={timeframes}
    />
  );
}

export default TradingViewChartContainer;
