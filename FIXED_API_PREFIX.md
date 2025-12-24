# Fix: Cannot POST /auth/forgot-password

## Vấn đề
Lỗi `Cannot POST /auth/forgot-password` xảy ra vì backend NestJS có **global API prefix**.

## Root Cause
Trong [backend/src/main.ts:32](backend/src/main.ts#L32), backend được cấu hình với:
```typescript
app.setGlobalPrefix(configService.get('API_PREFIX') || 'api/v1');
```

Và trong [backend/.env:4](backend/.env#L4):
```env
API_PREFIX=api/v1
```

## Giải pháp
Tất cả API endpoints phải có prefix `/api/v1/`

### URL đúng:
- ✅ `POST http://localhost:3000/api/v1/auth/login`
- ✅ `POST http://localhost:3000/api/v1/auth/register`
- ✅ `POST http://localhost:3000/api/v1/auth/forgot-password`
- ✅ `POST http://localhost:3000/api/v1/auth/reset-password`
- ✅ `GET http://localhost:3000/api/v1/auth/profile`

### URL sai:
- ❌ `POST http://localhost:3000/auth/forgot-password`
- ❌ `POST http://localhost:3000/auth/login`

## Files đã được cập nhật

### Frontend:
1. [src/pages/Login/Login.jsx](src/pages/Login/Login.jsx#L29) ✅
2. [src/pages/ForgotPassword/ForgotPassword.jsx](src/pages/ForgotPassword/ForgotPassword.jsx#L20) ✅
3. [src/pages/ResetPassword/ResetPassword.jsx](src/pages/ResetPassword/ResetPassword.jsx#L51) ✅

### Documentation:
1. [AUTH_GUIDE.md](AUTH_GUIDE.md) ✅
2. [test-auth-flow.sh](test-auth-flow.sh#L10) ✅

## Xác nhận hoạt động

Test endpoint:
```bash
curl -X POST http://localhost:3000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@test.com"}'
```

Response thành công:
```json
{
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

## Bây giờ có thể sử dụng:

1. **Truy cập UI:**
   - Login: http://localhost:5173/login
   - Forgot Password: http://localhost:5173/forgot-password
   - Reset Password: http://localhost:5173/reset-password

2. **Hoặc chạy test script:**
   ```bash
   ./test-auth-flow.sh
   ```

## Lưu ý cho tương lai

Khi tạo API calls trong frontend, luôn nhớ sử dụng:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Đúng:
fetch(`${API_BASE_URL}/api/v1/auth/login`, ...)

// Sai:
fetch(`${API_BASE_URL}/auth/login`, ...)
```

Hoặc config trong `.env`:
```env
VITE_API_URL=http://localhost:3000/api/v1
```

Thì chỉ cần:
```javascript
fetch(`${API_BASE_URL}/auth/login`, ...)
```
