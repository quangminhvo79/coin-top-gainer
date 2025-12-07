# Coin Gainer Backend

NestJS backend with Fastify for managing crypto trading accounts, balances, token bookmarks, PNL analytics, and external trading platform integrations.

**Includes integrated CMS dashboard** - A beautiful, OLED-optimized admin interface served at the root URL.

## Features

- **Integrated CMS**: Luxury dark-mode admin dashboard with full CRUD operations
- **Account Management**: Create and manage multiple trading accounts (spot, futures, margin)
- **Balance Tracking**: Track balances across different assets with USD value calculation
- **Token Bookmarks**: Save and manage favorite tokens with custom notes and price alerts
- **PNL Analytics**: Track realized and unrealized profit/loss with detailed analytics
- **Trading Platform Integration**: Connect to external exchanges (Binance, Coinbase, Kraken, etc.)
- **Authentication**: JWT-based authentication with secure user management

## Tech Stack

- NestJS 10.x
- Fastify
- TypeORM
- PostgreSQL
- JWT Authentication
- TypeScript

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a PostgreSQL database:
```bash
createdb coin_gainer
```

3. Copy the environment file and configure:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- Database credentials
- JWT secret
- API keys for trading platforms
- CORS settings

## Running the Application

### Development mode
```bash
npm run start:dev
```

### Production mode
```bash
npm run build
npm run start:prod
```

Once running, you can access:
- **CMS Dashboard**: `http://localhost:3001` (Beautiful admin interface)
- **API**: `http://localhost:3001/api/v1` (REST endpoints)

### First Time Setup

1. Navigate to `http://localhost:3001` in your browser
2. Click "Register" and create your account
3. You'll be automatically logged into the CMS dashboard
4. Start managing your trading accounts, bookmarks, and PNL!

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/profile` - Get user profile (protected)

### Accounts
- `POST /api/v1/accounts` - Create account
- `GET /api/v1/accounts` - Get all accounts
- `GET /api/v1/accounts/:id` - Get account details
- `PUT /api/v1/accounts/:id` - Update account
- `DELETE /api/v1/accounts/:id` - Delete account
- `POST /api/v1/accounts/:id/balances` - Update account balance
- `GET /api/v1/accounts/:id/balances` - Get account balances

### Token Bookmarks
- `POST /api/v1/bookmarks` - Create bookmark
- `GET /api/v1/bookmarks` - Get all bookmarks
- `GET /api/v1/bookmarks/:id` - Get bookmark
- `GET /api/v1/bookmarks/symbol/:symbol` - Get bookmark by symbol
- `PUT /api/v1/bookmarks/:id` - Update bookmark
- `DELETE /api/v1/bookmarks/:id` - Delete bookmark

### PNL Analytics
- `POST /api/v1/pnl` - Create PNL record
- `GET /api/v1/pnl` - Get PNL records (with filters)
- `GET /api/v1/pnl/analytics` - Get analytics summary
- `DELETE /api/v1/pnl/:id` - Delete PNL record

### Trading Platforms
- `POST /api/v1/platforms` - Add trading platform
- `GET /api/v1/platforms` - Get all platforms
- `GET /api/v1/platforms/:id` - Get platform details
- `PUT /api/v1/platforms/:id` - Update platform
- `DELETE /api/v1/platforms/:id` - Delete platform
- `POST /api/v1/platforms/:id/sync` - Sync balances from platform

## Database Schema

### Users
- Basic user information and authentication

### Accounts
- Multiple accounts per user
- Support for spot, futures, and margin accounts
- Automatic balance calculation

### Balances
- Asset-specific balances per account
- USD value tracking

### Token Bookmarks
- Save favorite tokens
- Custom notes and metadata
- Price alerts configuration

### PNL Records
- Realized and unrealized PNL tracking
- Per-symbol and per-account analytics

### Trading Platforms
- API credentials storage
- Multiple exchange support
- Sync status tracking

## Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- API keys are stored encrypted
- All endpoints (except auth) require authentication
- Input validation using class-validator
- SQL injection protection via TypeORM

## Development

### Database Migrations

Generate migration:
```bash
npm run migration:generate -- src/migrations/MigrationName
```

Run migrations:
```bash
npm run migration:run
```

Revert migration:
```bash
npm run migration:revert
```

### Code Quality

Lint code:
```bash
npm run lint
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment mode | development |
| PORT | Server port | 3001 |
| API_PREFIX | API route prefix | api/v1 |
| DB_HOST | Database host | localhost |
| DB_PORT | Database port | 5432 |
| DB_USERNAME | Database user | postgres |
| DB_PASSWORD | Database password | postgres |
| DB_DATABASE | Database name | coin_gainer |
| JWT_SECRET | JWT secret key | (required) |
| JWT_EXPIRATION | Token expiration | 7d |
| CORS_ORIGIN | Allowed CORS origin | http://localhost:5173 |

## Trading Platform Integration

The backend supports integration with multiple trading platforms. To enable:

1. Add API credentials in `.env`
2. Create platform via API
3. Use sync endpoint to fetch balances

Supported platforms:
- Binance
- Coinbase
- Kraken
- Bybit
- OKX
- Custom (manual integration)

## License

MIT
