# TradingViewChart Refactoring

## Overview

Successfully refactored the `TradingViewChart` component using the Container/Presentational pattern, separating chart logic from UI rendering.

## Changes Made

### Before (Single Component - 155 lines)

```
TradingViewChart.jsx
├── Chart initialization logic
├── Data fetching logic
├── State management (interval)
├── Resize handling
├── Chart configuration
├── Timeframe selector UI
└── Chart container UI
```

**Problems:**
- Mixed concerns (logic + UI)
- Hard to test chart logic
- Difficult to reuse chart configuration
- Large component file

### After (Separated Pattern)

```
TradingViewChartContainer
└── useTradingViewChart (hook)
    ├── Chart initialization
    ├── Data fetching
    ├── State management
    ├── Resize handling
    └── Chart configuration

TradingViewChartPresentation
├── Timeframe selector UI
└── Chart container UI
```

## New Files Created

### 1. Hook: `src/hooks/useTradingViewChart.js`

**Purpose:** Manages all chart-related logic and state

**Responsibilities:**
- Chart initialization with lightweight-charts library
- Data fetching from Binance API
- Interval state management
- Window resize handling
- Chart lifecycle (creation/cleanup)

**Returns:**
```javascript
{
  chartContainerRef,  // Ref for chart DOM element
  selectedInterval,   // Current timeframe
  setSelectedInterval, // Interval updater
  timeframes          // Available timeframes
}
```

**Key Features:**
- ✅ Encapsulated chart logic
- ✅ Proper cleanup on unmount
- ✅ Memoized data fetching
- ✅ Responsive chart resizing

### 2. Presentational: `src/components/presentational/TradingViewChartPresentation.jsx`

**Purpose:** Pure UI rendering for chart and controls

**Props:**
```javascript
{
  chartContainerRef,    // DOM ref from hook
  selectedInterval,     // Current interval
  onIntervalChange,     // Handler for interval change
  timeframes           // Available timeframes array
}
```

**Responsibilities:**
- Render timeframe buttons
- Render chart container
- Handle user clicks on timeframe buttons
- Apply styling

**Key Features:**
- ✅ No business logic
- ✅ Pure function of props
- ✅ Easy to test UI
- ✅ Reusable styling

### 3. Container: `src/containers/TradingViewChartContainer.jsx`

**Purpose:** Connect hook logic to presentational component

**Props (from parent):**
```javascript
{
  symbol,    // Trading pair (e.g., "BTCUSDT")
  interval   // Default interval (e.g., "1h")
}
```

**Responsibilities:**
- Use `useTradingViewChart` hook
- Pass data to presentation layer
- Map state to props

**Key Features:**
- ✅ Thin wrapper
- ✅ Clear data flow
- ✅ Maintains component API

### 4. Updated: `src/components/TradingViewChart.jsx`

**Purpose:** Maintain backward compatibility

**Before:** 155 lines of mixed logic
**After:** 7 lines re-exporting container

```javascript
import TradingViewChartContainer from '../containers/TradingViewChartContainer';
export default TradingViewChartContainer;
```

## Architecture Benefits

### Separation of Concerns

**Hook Layer (useTradingViewChart):**
- Chart initialization
- API calls
- State management
- Event handling

**Container Layer:**
- Props mapping
- Hook consumption

**Presentation Layer:**
- UI rendering only
- No side effects

### Testability

**Before:**
```javascript
// Hard to test - everything mixed together
test('chart renders', () => {
  // Need to mock chart library, API, and DOM
});
```

**After:**
```javascript
// Test hook logic
test('useTradingViewChart fetches data', async () => {
  const { result } = renderHook(() =>
    useTradingViewChart('BTCUSDT', '1h')
  );
  await waitFor(() => {
    expect(result.current.selectedInterval).toBe('1h');
  });
});

// Test presentation
test('renders timeframe buttons', () => {
  const mockRef = { current: null };
  render(
    <TradingViewChartPresentation
      chartContainerRef={mockRef}
      selectedInterval="1h"
      onIntervalChange={jest.fn()}
      timeframes={[{ label: '1h', value: '1h' }]}
    />
  );
  expect(screen.getByText('1h')).toBeInTheDocument();
});
```

### Reusability

**Chart Configuration:**
```javascript
// Can now reuse chart config in other components
const { chartContainerRef } = useTradingViewChart('ETHUSDT', '15m');
```

**UI Components:**
```javascript
// Can reuse presentation with different logic
<TradingViewChartPresentation
  chartContainerRef={customRef}
  selectedInterval={customInterval}
  onIntervalChange={customHandler}
  timeframes={customTimeframes}
/>
```

## Data Flow

```
User clicks timeframe button
    ↓
TradingViewChartPresentation
    ↓ (calls onIntervalChange)
TradingViewChartContainer
    ↓ (calls setSelectedInterval)
useTradingViewChart hook
    ↓ (updates state)
useEffect triggered
    ↓ (fetches new data)
Binance API
    ↓ (returns candle data)
Chart updates
    ↓
User sees new timeframe
```

## Component Lifecycle

### 1. Mount
```
Container renders
    ↓
Hook initializes
    ↓
Chart created
    ↓
API fetched
    ↓
Data rendered
```

### 2. Interval Change
```
User clicks button
    ↓
State updates
    ↓
useEffect re-runs
    ↓
New data fetched
    ↓
Chart updates
```

### 3. Unmount
```
Component unmounts
    ↓
Hook cleanup
    ↓
Remove resize listener
    ↓
Destroy chart
    ↓
Memory freed
```

## API Integration

### Binance Futures API

**Endpoint:**
```
https://fapi.binance.com/fapi/v1/continuousKlines
```

**Parameters:**
- `pair`: Trading pair (e.g., BTCUSDT)
- `interval`: Timeframe (1m, 5m, 15m, 30m, 1h, 4h, 1d)
- `contractType`: PERPETUAL
- `limit`: 100 candles

**Response Format:**
```javascript
[
  [
    openTime,    // 0: Timestamp in ms
    open,        // 1: Open price
    high,        // 2: High price
    low,         // 3: Low price
    close,       // 4: Close price
    volume,      // 5: Volume
    closeTime,   // 6: Close timestamp
    // ... more fields
  ]
]
```

**Transformation:**
```javascript
{
  time: candle[0] / 1000,  // Convert to seconds
  open: parseFloat(candle[1]),
  high: parseFloat(candle[2]),
  low: parseFloat(candle[3]),
  close: parseFloat(candle[4])
}
```

## Chart Configuration

### Theme
- Background: Transparent
- Text Color: #d1d4dc
- Grid: Subtle rgba lines
- Crosshair: Mode 1

### Candlestick Colors
- Up: #10b981 (green)
- Down: #ef4444 (red)
- Precision: 6 decimals
- Min Move: 0.000001

### Timeframe Options
| Label | Value | Description |
|-------|-------|-------------|
| 1m    | 1m    | 1 minute    |
| 5m    | 5m    | 5 minutes   |
| 15m   | 15m   | 15 minutes  |
| 30m   | 30m   | 30 minutes  |
| 1h    | 1h    | 1 hour      |
| 4h    | 4h    | 4 hours     |
| 1d    | 1d    | 1 day       |

## Performance Considerations

### Optimizations
1. **useCallback for fetchCandleData** - Prevents recreation
2. **Cleanup on unmount** - Removes event listeners and chart
3. **Responsive resize** - Adapts to window changes
4. **Memoized refs** - useRef for stable references

### Bundle Size
- Before: ~365KB
- After: ~365KB (no change)
- Additional modules: 3 (hook + container + presentation)

## Migration Guide

### For existing code using TradingViewChart:

**No changes required!** The component maintains the same API:

```javascript
// This continues to work unchanged
<TradingViewChart symbol="BTCUSDT" interval="1h" />
```

### For new code wanting to use the pattern:

```javascript
// Use container directly
import TradingViewChartContainer from './containers/TradingViewChartContainer';

<TradingViewChartContainer symbol="ETHUSDT" interval="15m" />
```

### For custom implementations:

```javascript
// Use just the hook
import { useTradingViewChart } from './hooks';

function MyCustomChart() {
  const { chartContainerRef, selectedInterval, setSelectedInterval } =
    useTradingViewChart('BTCUSDT', '1h');

  return (
    <div>
      <div ref={chartContainerRef} />
      {/* Custom UI */}
    </div>
  );
}
```

## Build Status

✅ **Build:** SUCCESS
✅ **Bundle Size:** 365.54 KB (gzip: 115.19 KB)
✅ **No Breaking Changes**
✅ **Backward Compatible**
✅ **All Features Working**

## File Summary

| File | Lines | Purpose |
|------|-------|---------|
| useTradingViewChart.js | ~140 | Chart logic & state |
| TradingViewChartPresentation.jsx | ~30 | UI rendering |
| TradingViewChartContainer.jsx | ~25 | Logic-UI connector |
| TradingViewChart.jsx | 7 | Backward compatibility |

**Total:** ~200 lines (vs 155 before, but better organized)

## Key Takeaways

1. ✅ **Separation achieved** - Logic separated from UI
2. ✅ **Testability improved** - Can test layers independently
3. ✅ **Reusability enhanced** - Hook and presentation reusable
4. ✅ **Maintainability better** - Clear responsibilities
5. ✅ **No breaking changes** - Existing code works
6. ✅ **Performance maintained** - Same bundle size
