import EventTypeTabsPresentation from './EventTypeTabsPresentation';

/**
 * EventTypeTabs Container Component
 * Manages event type tabs logic
 */
function EventTypeTabsContainer({ periods, selectedPeriod, onPeriodChange }) {
  return (
    <EventTypeTabsPresentation
      periods={periods}
      selectedPeriod={selectedPeriod}
      onPeriodChange={onPeriodChange}
    />
  );
}

export default EventTypeTabsContainer;
