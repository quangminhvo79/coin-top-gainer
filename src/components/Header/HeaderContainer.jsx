import { useClock } from '../../hooks';
import HeaderPresentation from './HeaderPresentation';

/**
 * Container component for Header
 * Manages clock state and passes data to presentational component
 */
function HeaderContainer({ onRefresh, loading, autoRefresh, onToggleAutoRefresh }) {
  const time = useClock();

  return (
    <HeaderPresentation
      time={time}
      onRefresh={onRefresh}
      loading={loading}
      autoRefresh={autoRefresh}
      onToggleAutoRefresh={onToggleAutoRefresh}
    />
  );
}

export default HeaderContainer;
