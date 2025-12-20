import PeriodTabsPresentation from './PeriodTabsPresentation';

/**
 * PeriodTabs Container Component
 * Manages period tabs logic
 */
function PeriodTabsContainer({ periods, selectedPeriod, onPeriodChange }) {
  return (
    <PeriodTabsPresentation
      periods={periods}
      selectedPeriod={selectedPeriod}
      onPeriodChange={onPeriodChange}
    />
  );
}

export default PeriodTabsContainer;
