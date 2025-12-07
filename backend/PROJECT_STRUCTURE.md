# Project Structure

```
backend/
├── src/                                    # Backend source code
│   ├── entities/                          # Database entities (TypeORM)
│   │   ├── user.entity.ts                # User authentication
│   │   ├── account.entity.ts             # Trading accounts
│   │   ├── balance.entity.ts             # Asset balances
│   │   ├── token-bookmark.entity.ts      # Saved tokens
│   │   ├── pnl-record.entity.ts          # Profit/Loss records
│   │   └── trading-platform.entity.ts    # Exchange connections
│   │
│   ├── modules/                           # Feature modules
│   │   ├── auth/                         # Authentication module
│   │   │   ├── dto/                      # Data transfer objects
│   │   │   ├── guards/                   # JWT auth guard
│   │   │   ├── strategies/               # Passport JWT strategy
│   │   │   ├── auth.controller.ts        # Auth endpoints
│   │   │   ├── auth.service.ts           # Auth business logic
│   │   │   └── auth.module.ts
│   │   │
│   │   ├── account/                      # Account management
│   │   │   ├── dto/
│   │   │   ├── account.controller.ts
│   │   │   ├── account.service.ts
│   │   │   └── account.module.ts
│   │   │
│   │   ├── token-bookmark/               # Token bookmarks
│   │   │   ├── dto/
│   │   │   ├── token-bookmark.controller.ts
│   │   │   ├── token-bookmark.service.ts
│   │   │   └── token-bookmark.module.ts
│   │   │
│   │   ├── pnl/                          # PNL analytics
│   │   │   ├── dto/
│   │   │   ├── pnl.controller.ts
│   │   │   ├── pnl.service.ts
│   │   │   └── pnl.module.ts
│   │   │
│   │   └── trading-platform/             # Platform integration
│   │       ├── dto/
│   │       ├── trading-platform.controller.ts
│   │       ├── trading-platform.service.ts
│   │       └── trading-platform.module.ts
│   │
│   ├── config/                            # Configuration
│   │   └── database.config.ts            # TypeORM config
│   │
│   ├── app.module.ts                      # Root module
│   └── main.ts                            # Application entry point
│
├── public/                                 # Static files (CMS)
│   ├── index.html                         # CMS dashboard UI
│   ├── app.js                             # CMS JavaScript logic
│   └── CMS_README.md                      # CMS documentation
│
├── .env.example                           # Environment template
├── .env                                   # Environment variables (gitignored)
├── .gitignore                             # Git ignore rules
├── .eslintrc.js                           # ESLint configuration
├── package.json                           # Dependencies & scripts
├── tsconfig.json                          # TypeScript configuration
├── docker-compose.yml                     # PostgreSQL setup
│
├── README.md                              # Full documentation
├── GETTING_STARTED.md                     # Quick start guide
├── API_EXAMPLES.md                        # API usage examples
└── PROJECT_STRUCTURE.md                   # This file
```

## Key Directories

### `/src` - Backend Application

Contains the NestJS backend with all business logic:
- **Entities**: Database models defining schema
- **Modules**: Feature-based organization (auth, accounts, etc.)
- **DTOs**: Request/response validation
- **Services**: Business logic
- **Controllers**: HTTP endpoints

### `/public` - CMS Dashboard

Static frontend files served at the root URL:
- **index.html**: Single-page application
- **app.js**: All frontend logic
- Vanilla JavaScript, no build required

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│  Browser (http://localhost:3001)                            │
│                                                               │
└────────────┬──────────────────────────────┬─────────────────┘
             │                              │
             │                              │
    ┌────────▼────────┐          ┌─────────▼──────────┐
    │                 │          │                    │
    │  GET /          │          │  GET /api/v1/*     │
    │  (CMS HTML)     │          │  (REST API)        │
    │                 │          │                    │
    └────────┬────────┘          └─────────┬──────────┘
             │                              │
             │                              │
    ┌────────▼───────────────────────────────▼─────────┐
    │                                                   │
    │         NestJS + Fastify Server                  │
    │                                                   │
    │  ┌──────────────────┐  ┌─────────────────────┐  │
    │  │  Static Assets   │  │  API Controllers     │  │
    │  │  (public/)       │  │  (src/modules/*/     │  │
    │  │                  │  │   *.controller.ts)   │  │
    │  └──────────────────┘  └──────────┬──────────┘  │
    │                                   │              │
    │                        ┌──────────▼──────────┐  │
    │                        │  Services           │  │
    │                        │  (Business Logic)   │  │
    │                        └──────────┬──────────┘  │
    │                                   │              │
    │                        ┌──────────▼──────────┐  │
    │                        │  TypeORM Entities   │  │
    │                        └──────────┬──────────┘  │
    │                                   │              │
    └───────────────────────────────────┼──────────────┘
                                        │
                                        │
                            ┌───────────▼────────────┐
                            │                        │
                            │  PostgreSQL Database   │
                            │                        │
                            │  Tables:               │
                            │  - users               │
                            │  - accounts            │
                            │  - balances            │
                            │  - token_bookmarks     │
                            │  - pnl_records         │
                            │  - trading_platforms   │
                            │                        │
                            └────────────────────────┘
```

## Request Flow

### CMS Dashboard Access

1. User visits `http://localhost:3001`
2. Fastify serves `/public/index.html`
3. Browser loads JavaScript from `/public/app.js`
4. CMS makes API calls to `/api/v1/*` endpoints
5. NestJS processes requests with JWT validation
6. TypeORM queries PostgreSQL
7. Results returned as JSON
8. CMS updates UI

### Direct API Access

1. Client sends request to `http://localhost:3001/api/v1/accounts`
2. NestJS routes to AccountController
3. JWT guard validates token
4. AccountService handles business logic
5. TypeORM queries database
6. Response sent as JSON

## Data Flow Example: Creating an Account

```
User clicks "Create Account" in CMS
           │
           ▼
CMS sends POST /api/v1/accounts
{
  name: "Main Account",
  type: "spot",
  currency: "USD"
}
           │
           ▼
AccountController.create()
           │
           ▼
Validates DTO (CreateAccountDto)
           │
           ▼
AccountService.create(userId, dto)
           │
           ▼
Creates Account entity
           │
           ▼
TypeORM saves to database
           │
           ▼
Returns Account object
           │
           ▼
CMS receives response
           │
           ▼
Updates account list in UI
```

## Authentication Flow

```
Register/Login
      │
      ▼
AuthService validates credentials
      │
      ▼
Generates JWT token
      │
      ▼
Token sent to browser
      │
      ▼
Stored in localStorage
      │
      ▼
Included in all API requests as:
Authorization: Bearer <token>
      │
      ▼
JwtAuthGuard validates token
      │
      ▼
Request proceeds if valid
```

## Database Schema

```sql
users
├── id (uuid, PK)
├── email (unique)
├── password (hashed)
├── firstName
├── lastName
├── createdAt
└── updatedAt

accounts
├── id (uuid, PK)
├── userId (FK → users.id)
├── name
├── type (spot/futures/margin)
├── totalBalance
├── availableBalance
├── lockedBalance
├── currency
├── isActive
├── createdAt
└── updatedAt

balances
├── id (uuid, PK)
├── accountId (FK → accounts.id)
├── asset (BTC, ETH, etc.)
├── free
├── locked
├── total
├── usdValue
├── priceUsd
├── createdAt
└── updatedAt

token_bookmarks
├── id (uuid, PK)
├── userId (FK → users.id)
├── symbol
├── name
├── notes
├── metadata (jsonb)
├── createdAt
└── updatedAt

pnl_records
├── id (uuid, PK)
├── accountId (FK → accounts.id)
├── symbol
├── type (realized/unrealized)
├── amount
├── percentage
├── entryPrice
├── exitPrice
├── quantity
├── metadata (jsonb)
└── timestamp

trading_platforms
├── id (uuid, PK)
├── userId (FK → users.id)
├── platform (binance/coinbase/etc.)
├── name
├── apiKey
├── apiSecret
├── passphrase
├── isTestnet
├── isActive
├── settings (jsonb)
├── lastSyncedAt
├── createdAt
└── updatedAt
```

## Environment Variables

```env
# Application
NODE_ENV=development
PORT=3001
API_PREFIX=api/v1

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=coin_gainer

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Trading Platforms (optional)
BINANCE_API_KEY=
BINANCE_API_SECRET=
COINBASE_API_KEY=
COINBASE_API_SECRET=
```

## Technology Stack

### Backend
- **NestJS** 10.x - Progressive Node.js framework
- **Fastify** - Fast HTTP server (2x faster than Express)
- **TypeORM** - ORM with TypeScript support
- **PostgreSQL** - Reliable relational database
- **Passport JWT** - JWT authentication strategy
- **Class Validator** - DTO validation
- **bcrypt** - Password hashing

### Frontend (CMS)
- **Vanilla JavaScript** - No framework overhead
- **Tailwind CSS** - Utility-first styling (CDN)
- **Space Grotesk** - Modern font
- **LocalStorage** - Client-side token storage

### Development
- **TypeScript** - Type safety
- **ts-node-dev** - Hot reload in development
- **ESLint** - Code linting
- **Docker Compose** - Database setup

## Next Steps

1. Review `GETTING_STARTED.md` for setup
2. Check `API_EXAMPLES.md` for usage
3. Explore `README.md` for full docs
4. Start building your trading platform!
