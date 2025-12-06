import { useCallback } from 'react';
import { openTradingPlatform } from '../../utils';
import ChartCardPresentation from './ChartCardPresentation';

/**
 * Container component for Chart Card
 * Manages trade logic and passes handlers to presentational component
 */
function ChartCardContainer({ coin, index }) {
  const handleTrade = useCallback(() => {
    openTradingPlatform(coin.symbol);
  }, [coin.symbol]);

  return (
    <ChartCardPresentation
      coin={coin}
      index={index}
      onTrade={handleTrade}
    />
  );
}

export default ChartCardContainer;
