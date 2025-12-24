# HttpOnly Cookie Implementation Summary

## What's Changed

### Backend:
1. ✅ **RefreshToken Entity** - Store refresh tokens in DB
2. ✅ **Auth Service** - Added refresh token methods
3. 🔄 **Auth Controller** - Update to use cookies (Next)
4. 🔄 **CORS Config** - Enable credentials (Next)

### Frontend:
5. 🔄 **Remove localStorage** - Use cookies instead (Next)
6. 🔄 **Add credentials: 'include'** - Send cookies (Next)
7. 🔄 **Auto-refresh interceptor** - Handle 401 (Next)

## New Endpoints

```
POST /api/v1/auth/login
- Sets httpOnly cookies: access_token (15min), refresh_token (7days)
- No longer returns tokens in body

POST /api/v1/auth/refresh
- Uses refresh_token from cookie
- Returns new access_token in cookie

POST /api/v1/auth/logout
- Revokes refresh_token
- Clears cookies
```

## Cookie Configuration

```typescript
res.cookie('access_token', token, {
  httpOnly: true,      // Cannot be accessed by JavaScript
  secure: true,        // HTTPS only (production)
  sameSite: 'strict',  // CSRF protection
  maxAge: 15 * 60 * 1000, // 15 minutes
});
```

## Migration Path

### For existing users with localStorage tokens:
1. Continue to accept Bearer tokens temporarily
2. Show migration notice on login
3. Force re-login after X days
4. Remove localStorage support completely

## Testing Checklist

- [ ] Login sets cookies
- [ ] Cookies are httpOnly
- [ ] Access token expires after 15min
- [ ] Refresh auto-renews access token
- [ ] Logout clears cookies
- [ ] Cannot access cookies from JavaScript
- [ ] CORS allows credentials
