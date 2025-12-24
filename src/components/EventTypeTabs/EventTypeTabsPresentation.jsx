/**
 * PeriodTabs Presentation Component
 * Displays event type filter tabs
 */
function EventTypeTabsPresentation({ periods, selectedPeriod, onPeriodChange }) {
  const getPeriodLabel = (period) => {
    return period.toUpperCase();
  };

  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-3">
        {periods.map((period) => (
          <button
            key={period}
            onClick={() => onPeriodChange(period)}
            className={`
              px-6 py-3 rounded-xl font-semibold transition-all duration-300
              ${selectedPeriod === period
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50'
                : 'bg-slate-800/50 text-gray-300 hover:bg-slate-700/70 border border-slate-700/50'
              }
            `}
          >
            {getPeriodLabel(period)}
          </button>
        ))}
      </div>
    </div>
  );
}

export default EventTypeTabsPresentation;
