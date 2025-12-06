# Architecture Documentation

## Container/Presentational Pattern

This application follows the **Container/Presentational Pattern** (also known as Smart/Dumb Components) to separate business logic from UI rendering.

## Directory Structure

```
src/
├── components/
│   ├── presentational/          # Pure UI components (no logic)
│   │   ├── HeaderPresentation.jsx
│   │   ├── CoinCardPresentation.jsx
│   │   ├── ChartCardPresentation.jsx
│   │   ├── LoadingSkeletonPresentation.jsx
│   │   └── FooterPresentation.jsx
│   ├── BackgroundEffect.jsx     # Shared components
│   ├── StatCard.jsx
│   ├── MiniChart.jsx
│   ├── TradingViewChart.jsx
│   ├── Header.jsx               # Re-exports container
│   └── CoinCard.jsx             # Re-exports container
├── containers/                  # Smart components (with logic)
│   ├── AppContainer.jsx
│   ├── HeaderContainer.jsx
│   ├── CoinCardContainer.jsx
│   └── ChartCardContainer.jsx
├── hooks/                       # Custom React hooks
│   ├── useTopGainers.js        # Data fetching logic
│   ├── useAutoRefresh.js       # Auto-refresh state
│   ├── useInterval.js          # Interval management
│   └── useClock.js             # Clock state
├── utils/                       # Utility functions
│   ├── formatters.js           # Format helpers (price, volume, etc.)
│   └── trading.js              # Trading platform helpers
└── App.jsx                      # Main entry point
```

## Architecture Layers

### 1. Presentational Components (Pure UI)

**Location:** `src/components/presentational/`

**Purpose:** Display UI based on props, no business logic

**Characteristics:**
- No state management (except UI state like hover)
- Receive data and callbacks via props
- Focused on how things look
- Reusable and testable
- No direct API calls or complex logic

**Example:**
```jsx
function CoinCardPresentation({ coin, rank, delay, onTrade }) {
  return (
    <div onClick={() => onTrade(coin.symbol)}>
      {/* UI rendering only */}
    </div>
  );
}
```

### 2. Container Components (Smart)

**Location:** `src/containers/`

**Purpose:** Handle business logic and data management

**Characteristics:**
- Manage state using hooks
- Fetch and transform data
- Handle user interactions
- Pass data and callbacks to presentational components
- Focused on how things work

**Example:**
```jsx
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
```

### 3. Custom Hooks

**Location:** `src/hooks/`

**Purpose:** Extract and reuse stateful logic

**Hooks:**
- `useTopGainers` - Fetch and manage cryptocurrency data
- `useAutoRefresh` - Manage auto-refresh state with localStorage
- `useInterval` - Setup and cleanup intervals
- `useClock` - Manage live clock updates

**Benefits:**
- Separation of concerns
- Reusable across components
- Easier to test
- Cleaner component code

### 4. Utility Functions

**Location:** `src/utils/`

**Purpose:** Pure functions for data transformation and helpers

**Modules:**
- `formatters.js` - Format price, volume, ranks
- `trading.js` - Handle trading platform navigation

**Benefits:**
- No side effects
- Easy to test
- Reusable across the app

## Data Flow

```
1. AppContainer (Root)
   ↓ (uses hooks)
2. useTopGainers, useAutoRefresh
   ↓ (fetch data)
3. Binance API
   ↓ (process)
4. Utility Functions
   ↓ (pass down)
5. Child Containers
   ↓ (pass down)
6. Presentational Components
   ↓ (render)
7. User sees UI
```

## Benefits of This Pattern

### Separation of Concerns
- Business logic isolated in containers and hooks
- UI rendering isolated in presentational components
- Easy to locate and modify specific functionality

### Reusability
- Presentational components can be reused with different data
- Hooks can be shared across multiple components
- Utilities are pure functions usable anywhere

### Testability
- Presentational components: Test UI rendering
- Containers: Test logic and data flow
- Hooks: Test state management
- Utils: Test pure functions

### Maintainability
- Clear file organization
- Predictable data flow
- Easy to onboard new developers
- Scalable architecture

## Component Responsibilities

### AppContainer
- Orchestrates entire application
- Manages top-level state
- Coordinates data fetching
- Handles auto-refresh logic

### HeaderContainer
- Manages clock state
- Delegates UI rendering to HeaderPresentation

### CoinCardContainer / ChartCardContainer
- Handles trade button logic
- Delegates UI rendering to presentational components

### Presentational Components
- Render UI based on props
- Handle visual interactions
- No business logic

## Adding New Features

### To add a new presentational component:
1. Create component in `src/components/presentational/`
2. Accept all data via props
3. Return JSX for rendering

### To add a new container:
1. Create component in `src/containers/`
2. Use hooks for state/data
3. Handle business logic
4. Render presentational component

### To add a new hook:
1. Create file in `src/hooks/`
2. Extract stateful logic
3. Return state and handlers
4. Use in containers

### To add utilities:
1. Add to appropriate file in `src/utils/`
2. Keep functions pure
3. Export for use in containers/hooks

## Best Practices

1. **Keep presentational components pure** - No side effects
2. **Use hooks for state** - Don't manage state in containers directly
3. **Single Responsibility** - Each component/hook/util should do one thing
4. **Prop drilling is okay** - For shallow trees (1-2 levels)
5. **Use callbacks** - Wrap handlers in useCallback for performance
6. **Document components** - Add JSDoc comments explaining purpose
7. **Type safety** - Consider adding PropTypes or TypeScript

## Performance Considerations

- Presentational components re-render when props change
- Use `React.memo()` for expensive presentational components
- Use `useCallback` for handlers passed to children
- Use `useMemo` for expensive computations
- Containers should minimize re-renders by proper hook usage

## Migration Notes

The existing components (`Header.jsx`, `CoinCard.jsx`) now re-export containers for backward compatibility. This ensures existing code continues to work while using the new pattern internally.
