# API Examples

This document provides example requests for testing the API endpoints.

## Authentication

### Register
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### Login
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Get Profile
```bash
curl -X GET http://localhost:3001/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Account Management

### Create Account
```bash
curl -X POST http://localhost:3001/api/v1/accounts \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Main Spot Account",
    "type": "spot",
    "currency": "USD"
  }'
```

### Get All Accounts
```bash
curl -X GET http://localhost:3001/api/v1/accounts \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Update Account Balance
```bash
curl -X POST http://localhost:3001/api/v1/accounts/ACCOUNT_ID/balances \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "asset": "BTC",
    "free": 0.5,
    "locked": 0.1,
    "priceUsd": 45000
  }'
```

### Get Account Balances
```bash
curl -X GET http://localhost:3001/api/v1/accounts/ACCOUNT_ID/balances \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Token Bookmarks

### Create Bookmark
```bash
curl -X POST http://localhost:3001/api/v1/bookmarks \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTCUSDT",
    "name": "Bitcoin",
    "notes": "Top cryptocurrency, strong fundamentals",
    "metadata": {
      "tags": ["top-cap", "store-of-value"],
      "priceAlerts": [
        {
          "price": 50000,
          "type": "above",
          "enabled": true
        }
      ]
    }
  }'
```

### Get All Bookmarks
```bash
curl -X GET http://localhost:3001/api/v1/bookmarks \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Bookmark by Symbol
```bash
curl -X GET http://localhost:3001/api/v1/bookmarks/symbol/BTCUSDT \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Update Bookmark
```bash
curl -X PUT http://localhost:3001/api/v1/bookmarks/BOOKMARK_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Updated analysis - bullish trend"
  }'
```

## PNL Analytics

### Create PNL Record
```bash
curl -X POST http://localhost:3001/api/v1/pnl \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "ACCOUNT_ID",
    "symbol": "BTCUSDT",
    "type": "realized",
    "amount": 1250.50,
    "percentage": 5.2,
    "entryPrice": 43000,
    "exitPrice": 45000,
    "quantity": 0.5,
    "metadata": {
      "tradingPair": "BTC/USDT",
      "fees": 12.50,
      "notes": "Swing trade - weekly timeframe"
    }
  }'
```

### Get PNL Records (with filters)
```bash
# All records
curl -X GET http://localhost:3001/api/v1/pnl \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Filter by account
curl -X GET "http://localhost:3001/api/v1/pnl?accountId=ACCOUNT_ID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Filter by symbol
curl -X GET "http://localhost:3001/api/v1/pnl?symbol=BTCUSDT" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Filter by date range
curl -X GET "http://localhost:3001/api/v1/pnl?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Filter by type
curl -X GET "http://localhost:3001/api/v1/pnl?type=realized" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Analytics
```bash
# All accounts
curl -X GET http://localhost:3001/api/v1/pnl/analytics \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Specific account
curl -X GET "http://localhost:3001/api/v1/pnl/analytics?accountId=ACCOUNT_ID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Response:
```json
{
  "summary": {
    "totalRealized": 5420.30,
    "totalUnrealized": 1250.75,
    "totalPnl": 6671.05,
    "winningTrades": 15,
    "losingTrades": 5,
    "totalTrades": 20,
    "winRate": 75
  },
  "bySymbol": {
    "BTCUSDT": {
      "realized": 3200.50,
      "unrealized": 500.25,
      "trades": 10
    },
    "ETHUSDT": {
      "realized": 2219.80,
      "unrealized": 750.50,
      "trades": 10
    }
  },
  "byMonth": {
    "2024-01": {
      "realized": 1500.20,
      "unrealized": 300.15
    },
    "2024-02": {
      "realized": 3920.10,
      "unrealized": 950.60
    }
  }
}
```

## Trading Platforms

### Add Trading Platform
```bash
curl -X POST http://localhost:3001/api/v1/platforms \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "binance",
    "name": "Binance Main Account",
    "apiKey": "your-api-key",
    "apiSecret": "your-api-secret",
    "isTestnet": false,
    "settings": {
      "permissions": ["read", "trade"],
      "rateLimits": {
        "requests": 1200,
        "orders": 100
      }
    }
  }'
```

### Get All Platforms
```bash
curl -X GET http://localhost:3001/api/v1/platforms \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Sync Platform Balances
```bash
curl -X POST http://localhost:3001/api/v1/platforms/PLATFORM_ID/sync \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Update Platform
```bash
curl -X PUT http://localhost:3001/api/v1/platforms/PLATFORM_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": false
  }'
```

## Common Response Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required or failed
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists
- `500 Internal Server Error` - Server error

## Testing with JavaScript/Fetch

```javascript
// Register
const register = async () => {
  const response = await fetch('http://localhost:3001/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'user@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    })
  });
  const data = await response.json();
  return data.accessToken;
};

// Get accounts with authentication
const getAccounts = async (token) => {
  const response = await fetch('http://localhost:3001/api/v1/accounts', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await response.json();
};
```
