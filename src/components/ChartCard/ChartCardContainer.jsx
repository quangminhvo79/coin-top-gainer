import { useCallback, useState } from 'react';
import { openTradingPlatform } from '../../utils';
import ChartCardPresentation from './ChartCardPresentation';

/**
 * Container component for Chart Card
 * Manages trade logic and passes handlers to presentational component
 */
function ChartCardContainer({ coin, index }) {
  const [openChart, setOpenChart] = useState(false);
  const handleTrade = useCallback(() => {
    openTradingPlatform(coin.symbol);
  }, [coin.symbol]);

  const toggleChart = useCallback(() => {
    setOpenChart(prev => !prev);
  }, []);

  return (
    <ChartCardPresentation
      coin={coin}
      index={index}
      onTrade={handleTrade}
      openChart={openChart}
      toggleChart={toggleChart}
    />
  );
}

export default ChartCardContainer;
