# Complete HttpOnly Cookie Implementation Guide

## 🎯 Current Status

### ✅ Completed:
1. RefreshToken entity created
2. Auth service updated with refresh token methods
3. Security documentation created

### 🔄 Remaining Work:
1. Update auth controller
2. Update CORS configuration
3. Update frontend
4. Testing

---

## 📋 Step-by-Step Implementation

### BACKEND CHANGES

#### Step 1: Update Auth Controller

**File**: `backend/src/modules/auth/auth.controller.ts`

```typescript
import { Controller, Post, Get, Body, UseGuards, Request, Response } from '@nestjs/common';
import { Response as ExpressResponse } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Req() req,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    // Validate credentials
    const user = await this.authService.validateLogin(loginDto);

    // Generate tokens
    const accessToken = this.authService.generateAccessToken(user);
    const refreshToken = this.authService.generateRefreshToken();

    // Save refresh token to DB
    await this.authService.saveRefreshToken(
      user.id,
      refreshToken,
      req.ip,
      req.get('user-agent'),
    );

    // Set httpOnly cookies
    this.setCookies(res, accessToken, refreshToken);

    return {
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  @Post('refresh')
  async refresh(
    @Req() req,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token');
    }

    // Refresh tokens (rotation)
    const tokens = await this.authService.refreshAccessToken(
      refreshToken,
      req.ip,
      req.get('user-agent'),
    );

    // Set new cookies
    this.setCookies(res, tokens.accessToken, tokens.refreshToken);

    return { message: 'Token refreshed' };
  }

  @Post('logout')
  async logout(
    @Req() req,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const refreshToken = req.cookies?.refresh_token;

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    // Clear cookies
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return { message: 'Logged out successfully' };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    return this.authService.getProfile(req.user.userId);
  }

  // Helper method
  private setCookies(
    res: ExpressResponse,
    accessToken: string,
    refreshToken: string,
  ) {
    const isProduction = process.env.NODE_ENV === 'production';

    // Access token - 15 minutes
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProduction, // HTTPS only in production
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    // Refresh token - 7 days
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
}
```

#### Step 2: Update JWT Auth Guard

**File**: `backend/src/modules/auth/guards/jwt-auth.guard.ts`

```typescript
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    // Extract token from cookie (priority) or Authorization header (fallback)
    const cookieToken = request.cookies?.access_token;
    const headerToken = request.headers.authorization?.replace('Bearer ', '');

    const token = cookieToken || headerToken;

    if (token && !request.headers.authorization) {
      // Attach to header for Passport strategy
      request.headers.authorization = `Bearer ${token}`;
    }

    return super.canActivate(context);
  }
}
```

#### Step 3: Update CORS Configuration

**File**: `backend/src/main.ts`

```typescript
app.enableCors({
  origin: configService.get('CORS_ORIGIN') || 'http://localhost:5173',
  credentials: true, // IMPORTANT: Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

#### Step 4: Install cookie-parser

```bash
cd backend
npm install cookie-parser
npm install -D @types/cookie-parser
```

**File**: `backend/src/main.ts`

```typescript
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(/*...*/);

  app.use(cookieParser()); // Add this line

  // ... rest of config
}
```

---

### FRONTEND CHANGES

#### Step 1: Remove localStorage Usage

**Before**:
```javascript
// ❌ OLD
localStorage.setItem('auth_token', token);
const token = localStorage.getItem('auth_token');
```

**After**:
```javascript
// ✅ NEW - Cookies are automatic!
// No manual storage needed
```

#### Step 2: Update Login Page

**File**: `src/pages/Login/Login.jsx`

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // IMPORTANT: Send/receive cookies
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // NO MORE localStorage! Cookies are set automatically
    navigate('/trading');
  } catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};
```

#### Step 3: Update useAuth Hook

**File**: `src/hooks/useAuth.js`

```javascript
export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/profile`, {
        credentials: 'include', // Send cookies
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
      method: 'POST',
      credentials: 'include', // Send cookies to revoke
    });

    setUser(null);
    navigate('/login');
  };

  return { user, isLoading, isAuthenticated: !!user, logout, checkAuth };
}
```

#### Step 4: Create Fetch Interceptor for Auto-Refresh

**File**: `src/utils/apiClient.js`

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function apiClient(url, options = {}) {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    credentials: 'include', // Always include credentials
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  // Handle 401 - Token might be expired
  if (response.status === 401 && !url.includes('/auth/')) {
    // Try to refresh token
    const refreshResponse = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (refreshResponse.ok) {
      // Retry original request
      return fetch(`${API_BASE_URL}${url}`, {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
    } else {
      // Refresh failed, redirect to login
      window.location.href = '/login';
      throw new Error('Session expired');
    }
  }

  return response;
}

export default apiClient;
```

#### Step 5: Update useTradingDashboard Hook

**File**: `src/hooks/useTradingDashboard.js`

Replace all `fetch` calls with `apiClient`:

```javascript
import apiClient from '../utils/apiClient';

const fetchAPI = async (endpoint, options = {}) => {
  const response = await apiClient(`/api/v1${endpoint}`, options);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
};
```

---

## 🧪 Testing Guide

### Manual Testing

#### 1. Test Login
```bash
# Login and check cookies
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  -c cookies.txt -v

# Should see Set-Cookie headers:
# Set-Cookie: access_token=...; HttpOnly; SameSite=Strict
# Set-Cookie: refresh_token=...; HttpOnly; SameSite=Strict
```

#### 2. Test Protected Endpoint
```bash
# Use cookies from login
curl http://localhost:3000/api/v1/auth/profile \
  -b cookies.txt

# Should return user profile
```

#### 3. Test Refresh
```bash
# Wait 16+ minutes for access token to expire
# Then call any protected endpoint
curl http://localhost:3000/api/v1/platforms \
  -b cookies.txt

# Should auto-refresh and work
```

#### 4. Test Logout
```bash
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -b cookies.txt \
  -c cookies.txt

# Cookies should be cleared
```

### Browser Testing

#### Test 1: Cookies are HttpOnly
```javascript
// Open DevTools Console
console.log(document.cookie);
// Should NOT see access_token or refresh_token
// (only non-httpOnly cookies visible)
```

#### Test 2: XSS Attack Simulation
```javascript
// Try to steal token (should fail)
const stolenToken = document.cookie
  .split('; ')
  .find(row => row.startsWith('access_token='));

console.log(stolenToken); // Should be undefined
```

#### Test 3: Auto-Refresh
1. Login
2. Open DevTools Network tab
3. Wait 16 minutes
4. Navigate to any protected page
5. Should see POST /api/v1/auth/refresh call
6. Page should work normally

---

## 🔄 Migration Strategy

### Phase 1: Dual Support (Week 1-2)
- Accept both cookies AND localStorage tokens
- Show warning to users with localStorage
- Encourage re-login

```typescript
// In JwtAuthGuard
const cookieToken = request.cookies?.access_token;
const headerToken = request.headers.authorization?.replace('Bearer ', '');
const token = cookieToken || headerToken; // Support both

if (headerToken && !cookieToken) {
  console.warn('User still using localStorage - migration needed');
}
```

### Phase 2: Forced Migration (Week 3-4)
- Show modal on login: "We've improved security! Please log in again."
- Clear localStorage on successful cookie login
- Continue dual support

### Phase 3: Cookie Only (Week 5+)
- Remove localStorage support completely
- Only accept cookies

---

## 📊 Monitoring

### Metrics to Track
- % users on cookies vs localStorage
- Token refresh success rate
- Average session duration
- Failed auth attempts

### Log Important Events
```typescript
// In auth service
console.log('[AUTH] User logged in:', { userId, method: 'cookie' });
console.log('[AUTH] Token refreshed:', { userId });
console.log('[AUTH] Token stolen detected:', { userId, token });
```

---

## 🐛 Troubleshooting

### Problem: Cookies not being sent
**Solution**: Check `credentials: 'include'` in all fetch calls

### Problem: CORS error
**Solution**: Ensure `credentials: true` in backend CORS config

### Problem: Cookies not set in production
**Solution**: Check `secure: true` flag - requires HTTPS

### Problem: Token refresh loop
**Solution**: Check refresh token expiration logic

### Problem: Can't logout
**Solution**: Verify refresh token is being sent in logout request

---

## ⚡ Performance Considerations

### Database Cleanup
```sql
-- Delete expired refresh tokens (run daily)
DELETE FROM refresh_tokens
WHERE expiresAt < NOW()
OR isRevoked = true AND createdAt < NOW() - INTERVAL '30 days';
```

### Index for Performance
```sql
CREATE INDEX idx_refresh_tokens_user
ON refresh_tokens(userId, isRevoked);

CREATE INDEX idx_refresh_tokens_token
ON refresh_tokens(token);
```

---

## 🎯 Summary

### Security Improvements:
✅ XSS Protection (httpOnly)
✅ Token Rotation (one-time use)
✅ Short-lived Access Tokens (15min)
✅ CSRF Protection (SameSite)
✅ Token Revocation (DB tracking)

### User Experience:
✅ Seamless auto-refresh
✅ No manual token management
✅ Remember me (7 days)
✅ Logout all devices

### Developer Experience:
✅ Automatic cookie handling
✅ Simple API calls
✅ Easy testing
✅ Clear migration path

---

## 🚀 Quick Start Commands

```bash
# Backend
cd backend
npm install cookie-parser @types/cookie-parser
# Update files as shown above
npm run start:dev

# Frontend
cd ..
# Update files as shown above
npm run dev

# Test
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password"}' \
  -c cookies.txt -v
```

---

## 📚 Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [HttpOnly Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [Refresh Token Rotation](https://auth0.com/docs/secure/tokens/refresh-tokens/refresh-token-rotation)
