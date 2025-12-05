# Binance Top Gainers - Real-time Analytics

A stunning, real-time cryptocurrency analytics dashboard that tracks the top performing coins on Binance. Built with React, Tailwind CSS, and featuring a distinctive cyberpunk-premium glassmorphic design.

## Features

- **Real-time Data**: Automatically fetches and updates top gainers every 30 seconds
- **Beautiful Glassmorphic UI**: Premium design with backdrop blur effects and gradient accents
- **Live Statistics**: Track total volume, average gains, and top performers
- **Mini Charts**: Sparkline visualizations for each cryptocurrency
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Smooth Animations**: Delightful micro-interactions and transitions

## Design Philosophy

This app features a bold cyberpunk-meets-premium aesthetic with:
- **Typography**: Orbitron for headings (tech/futuristic) + Rajdhani for body (clean/modern)
- **Color Palette**: Deep purple-to-indigo gradients with vibrant accent colors
- **Glass Morphism**: Multi-layered transparency with backdrop blur effects
- **Animations**: Floating orbs, glowing effects, and smooth transitions
- **Data Visualization**: Custom SVG sparklines with gradient fills

## Getting Started

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173/`

### Build for Production
```bash
npm run build
```

## API

This app uses the public Binance API:
- Endpoint: `https://api.binance.com/api/v3/ticker/24hr`
- No authentication required
- Rate limits apply (respect Binance API guidelines)

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Binance API** - Real-time cryptocurrency data

## Features Breakdown

### Components

- `Header` - Navigation with real-time clock and refresh button
- `StatCard` - Glassmorphic cards displaying key statistics
- `CoinCard` - Individual cryptocurrency cards with price, volume, and charts
- `MiniChart` - SVG-based sparkline charts with gradient fills
- `BackgroundEffect` - Animated gradient orbs and visual effects

### Data Processing

- Filters USDT trading pairs with minimum $1M volume
- Sorts by 24-hour price change percentage
- Displays top 12 gainers
- Generates sparkline data from 24h high/low/current prices
- Auto-refreshes every 30 seconds

## Customization

You can customize the design by modifying:
- Color schemes in `src/index.css` (CSS variables)
- Animation timings in `tailwind.config.js`
- Update frequency in `App.jsx` (currently 30 seconds)
- Number of coins displayed (currently top 12)
- Volume filter threshold (currently $1M)

## License

MIT
