import { useCallback } from 'react';
import { openTradingPlatform } from '../../utils';
import CoinCardPresentation from './CoinCardPresentation';

/**
 * Container component for CoinCard
 * Manages trade logic and passes handlers to presentational component
 */
function CoinCardContainer({ coin, rank, delay }) {
  const handleTrade = useCallback(() => {
    openTradingPlatform(coin.symbol);
  }, [coin.symbol]);

  return (
    <CoinCardPresentation
      coin={coin}
      rank={rank}
      delay={delay}
      onTrade={handleTrade}
    />
  );
}

export default CoinCardContainer;
