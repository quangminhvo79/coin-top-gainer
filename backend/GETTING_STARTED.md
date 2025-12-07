# Getting Started with Coin Gainer

This guide will help you set up and run the Coin Gainer backend with integrated CMS in just a few minutes.

## Quick Start (5 Minutes)

### 1. Start the Database

Using Docker (easiest):
```bash
docker-compose up -d
```

Or manually install PostgreSQL and create the database:
```bash
createdb coin_gainer
```

### 2. Configure Environment

```bash
cp .env.example .env
```

The default configuration works out of the box! But you should change the JWT secret for production:
```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Server

```bash
npm run start:dev
```

You'll see:
```
Application is running on: http://localhost:3001
CMS available at: http://localhost:3001
API documentation: http://localhost:3001/api/v1
```

### 5. Open the CMS Dashboard

Navigate to: **http://localhost:3001**

You'll see a beautiful dark-mode login screen!

## First Time Setup

### Create Your Account

1. Click **"Register"** on the login screen
2. Fill in your details:
   - Email: your@email.com
   - Password: minimum 6 characters
   - First Name & Last Name (optional)
3. Click **"Create Account"**

You'll be automatically logged in!

### Create Your First Trading Account

1. Click **"Accounts"** in the sidebar
2. Click **"+ Create Account"**
3. Fill in:
   - Name: "Main Spot Account"
   - Type: Spot
   - Currency: USD (optional)
4. Click **"Create"**

### Add a Token Bookmark

1. Click **"Bookmarks"** in the sidebar
2. Click **"+ Add Bookmark"**
3. Fill in:
   - Symbol: BTCUSDT
   - Name: Bitcoin
   - Notes: Your analysis (optional)
4. Click **"Add Bookmark"**

### Track Your PNL

1. Click **"PNL Analytics"** in the sidebar
2. Click **"+ Add PNL Record"**
3. Fill in your trade details:
   - Select account
   - Symbol: BTCUSDT
   - Type: Realized or Unrealized
   - Amount: e.g., 1250.50
   - Entry/Exit prices (optional)
4. Click **"Add Record"**

View your analytics automatically calculated!

### Connect a Trading Platform (Optional)

1. Click **"Platforms"** in the sidebar
2. Click **"+ Connect Platform"**
3. Choose your exchange (Binance, Coinbase, etc.)
4. Enter your API credentials
5. Click **"Connect"**

Note: Exchange API integration is placeholder - you'll need to implement specific exchange SDKs.

## What You Get

### Beautiful CMS Dashboard
- **OLED-optimized design**: Deep black background saves battery
- **Luxury aesthetics**: Emerald and cyan accents with subtle glows
- **Responsive**: Works on desktop, tablet, and mobile
- **Fast**: Vanilla JavaScript, no build required

### Powerful API
- RESTful endpoints for all operations
- JWT authentication
- TypeORM with PostgreSQL
- Fastify for high performance

### Features
- ✅ Account management with balance tracking
- ✅ Token bookmarks with custom notes
- ✅ PNL analytics with win rate calculation
- ✅ Trading platform integration support
- ✅ User authentication and profiles

## Troubleshooting

### "Cannot connect to database"
```bash
# Check if PostgreSQL is running
docker-compose ps

# Or start it
docker-compose up -d
```

### "Port 3001 already in use"
Change the port in `.env`:
```env
PORT=3002
```

### "Login failed"
- Make sure the backend is running
- Check browser console for errors
- Try clearing localStorage and refreshing

### CMS not loading
- Make sure you're accessing `http://localhost:3001` (not `/api/v1`)
- Check that `public/index.html` exists
- Look at server logs for errors

## Next Steps

### Add Real Exchange Integration

Currently, the exchange sync returns placeholder data. To integrate real exchanges:

1. Install exchange SDKs:
```bash
npm install binance-api-node ccxt
```

2. Implement in `src/modules/trading-platform/trading-platform.service.ts`
3. Update the `syncBinanceBalances()` method
4. Create balance records via the Account service

### Customize the CMS

Edit `public/index.html` and `public/app.js`:
- Change colors in CSS variables
- Add new views
- Modify layouts
- Add charts/visualizations

### Deploy to Production

1. Set proper environment variables
2. Use a production PostgreSQL database
3. Set strong JWT secret
4. Enable HTTPS
5. Set up reverse proxy (nginx)

Example nginx config:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Add More Features

Ideas to extend:
- Real-time price updates with WebSockets
- TradingView chart integration
- Email notifications for price alerts
- Export to CSV/PDF
- Advanced filtering and search
- Multi-currency support
- Trading journal with notes
- Performance metrics and charts

## Support

Need help? Check:
- `README.md` - Full documentation
- `API_EXAMPLES.md` - API usage examples
- Backend logs - Check terminal output
- Browser console - For frontend errors

## Tips

1. **Keep your JWT secret secure** - Never commit `.env` to Git
2. **Backup your database** regularly
3. **Use testnet** for platform integration testing
4. **Monitor API rate limits** when syncing exchanges
5. **Regular updates** - Keep dependencies up to date

Enjoy your Coin Gainer trading intelligence platform! 🚀
