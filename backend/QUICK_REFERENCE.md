# Quick Reference Card

## 🚀 Start Everything

```bash
# Terminal 1: Start Database
docker-compose up -d

# Terminal 2: Start Backend + CMS
npm install
npm run start:dev

# Browser: Open CMS
http://localhost:3001
```

## 📋 Essential Commands

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run start:prod` | Run production build |
| `npm run lint` | Check code quality |
| `docker-compose up -d` | Start PostgreSQL in background |
| `docker-compose down` | Stop PostgreSQL |
| `docker-compose logs` | View database logs |

## 🌐 URLs

| URL | What is it? |
|-----|-------------|
| http://localhost:3001 | **CMS Dashboard** ⭐ |
| http://localhost:3001/api/v1 | REST API base |
| http://localhost:3001/api/v1/auth/login | Login endpoint |
| http://localhost:3001/api/v1/accounts | Accounts API |

## 🔑 Environment Variables

```env
# Essential
PORT=3001
DB_DATABASE=coin_gainer
JWT_SECRET=your-secret-key

# Optional (defaults work)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
```

## 📁 Project Layout

```
backend/
├── public/          ← CMS (HTML + JS)
├── src/             ← NestJS API
│   ├── entities/    ← Database models
│   ├── modules/     ← Features (auth, accounts, etc.)
│   └── main.ts      ← Entry point
├── .env             ← Config (create from .env.example)
└── package.json     ← Dependencies
```

## 🎯 CMS Features

- ✅ Account Management
- ✅ Balance Tracking
- ✅ Token Bookmarks
- ✅ PNL Analytics
- ✅ Platform Integration
- ✅ User Authentication

## 🎨 Design

- **Style**: Dark OLED Luxury
- **Colors**: Emerald (#10b981) + Cyan (#06b6d4)
- **Font**: Space Grotesk
- **Framework**: Vanilla JS (no build!)

## 🔐 First Time Setup

1. Visit http://localhost:3001
2. Click "Register"
3. Create account
4. Auto-login to dashboard
5. Start managing your trading!

## 🐛 Quick Fixes

### Server won't start
```bash
# Kill any process on port 3001
lsof -ti:3001 | xargs kill -9

# Restart
npm run start:dev
```

### Database issues
```bash
# Restart PostgreSQL
docker-compose restart

# Or recreate
docker-compose down
docker-compose up -d
```

### CMS not loading
```bash
# Verify files exist
ls public/index.html public/app.js

# Should see both files
# If not, copy from ../cms/
```

### Login fails
- Check backend is running
- Check browser console (F12)
- Clear localStorage and retry
- Verify .env has JWT_SECRET

## 📊 Database Tables

- `users` - User accounts
- `accounts` - Trading accounts
- `balances` - Asset balances
- `token_bookmarks` - Saved tokens
- `pnl_records` - Profit/loss
- `trading_platforms` - Exchange connections

## 🔗 API Endpoints

### Auth
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/profile`

### Accounts
- `GET /api/v1/accounts`
- `POST /api/v1/accounts`
- `GET /api/v1/accounts/:id`
- `PUT /api/v1/accounts/:id`
- `DELETE /api/v1/accounts/:id`

### Bookmarks
- `GET /api/v1/bookmarks`
- `POST /api/v1/bookmarks`
- `DELETE /api/v1/bookmarks/:id`

### PNL
- `GET /api/v1/pnl`
- `POST /api/v1/pnl`
- `GET /api/v1/pnl/analytics`

### Platforms
- `GET /api/v1/platforms`
- `POST /api/v1/platforms`
- `POST /api/v1/platforms/:id/sync`

## 📚 Documentation

- `README.md` - Full docs
- `GETTING_STARTED.md` - Setup guide
- `API_EXAMPLES.md` - API examples
- `PROJECT_STRUCTURE.md` - Architecture
- `INTEGRATION_COMPLETE.md` - What's included

## ⚡ Performance Tips

- CMS uses vanilla JS (super fast!)
- PostgreSQL with proper indexes
- Fastify is 2x faster than Express
- OLED design saves battery on mobile

## 🔒 Security Checklist

- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ Input validation (class-validator)
- ✅ SQL injection protection (TypeORM)
- ⚠️ Change JWT_SECRET in production
- ⚠️ Use HTTPS in production
- ⚠️ Set strong database passwords

## 🎓 Learning Resources

- NestJS Docs: https://docs.nestjs.com
- TypeORM Docs: https://typeorm.io
- Fastify Docs: https://fastify.dev
- PostgreSQL Docs: https://postgresql.org/docs

## 💬 Common Questions

**Q: Can I use this in production?**
A: Yes! Just set strong secrets and use HTTPS.

**Q: How do I add more features?**
A: Create new modules in `src/modules/`, add endpoints, update CMS.

**Q: Can I customize the CMS?**
A: Absolutely! Edit `public/index.html` and `public/app.js`.

**Q: What about mobile?**
A: CMS is fully responsive - works great on mobile!

**Q: How do I deploy?**
A: Build with `npm run build`, deploy to any Node.js host.

## 🎉 You're Ready!

Everything you need to build a crypto trading intelligence platform!

**Quick Start**: `docker-compose up -d && npm run start:dev`
**Open CMS**: http://localhost:3001

Happy trading! 🚀
