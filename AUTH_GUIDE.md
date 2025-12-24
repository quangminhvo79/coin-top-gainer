# Authentication & Password Reset Guide

## Tính năng mới đã được thêm vào

### Backend (NestJS)
1. **Forgot Password API** - Tạo reset token cho user
2. **Reset Password API** - Cho phép user đặt lại mật khẩu với token
3. **User Entity Updates** - Thêm `resetPasswordToken` và `resetPasswordExpires` fields

### Frontend (React)
1. **Login Page** - `/login`
2. **Forgot Password Page** - `/forgot-password`
3. **Reset Password Page** - `/reset-password`

---

## API Endpoints

### 1. Đăng nhập
```bash
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your-password"
}

Response:
{
  "accessToken": "jwt-token-here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### 2. Quên mật khẩu
```bash
POST http://localhost:3000/api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}

Response (Development):
{
  "message": "If an account with that email exists, a password reset link has been sent.",
  "resetToken": "hex-token-here"  # CHỈ HIỂN THỊ TRONG DEVELOPMENT
}
```

### 3. Reset mật khẩu
```bash
POST http://localhost:3000/api/v1/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "newPassword": "new-secure-password"
}

Response:
{
  "message": "Password has been reset successfully"
}
```

---

## Cách sử dụng

### Trường hợp: Quên mật khẩu

1. **Truy cập trang Forgot Password**
   - URL: `http://localhost:5173/forgot-password`
   - Nhập email của bạn
   - Click "Send Reset Link"

2. **Lấy Reset Token** (Development Mode)
   - Token sẽ hiển thị ngay trên màn hình (màu vàng)
   - Trong production, token sẽ được gửi qua email
   - Copy token này

3. **Reset Password**
   - Click vào nút "Go to Reset Password Page" hoặc
   - Truy cập: `http://localhost:5173/reset-password`
   - Paste token vào field "Reset Token"
   - Nhập mật khẩu mới (tối thiểu 6 ký tự)
   - Nhập lại mật khẩu để xác nhận
   - Click "Reset Password"

4. **Đăng nhập với mật khẩu mới**
   - Sau khi reset thành công, bạn sẽ được redirect về trang login
   - Đăng nhập với mật khẩu mới

---

## Testing Flow

### Bước 1: Tạo user mới (nếu chưa có)
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "oldpassword",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Bước 2: Request forgot password
```bash
curl -X POST http://localhost:3000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

Response sẽ chứa `resetToken` (trong development mode).

### Bước 3: Reset password
```bash
curl -X POST http://localhost:3000/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "TOKEN_FROM_STEP_2",
    "newPassword": "newpassword123"
  }'
```

### Bước 4: Login với mật khẩu mới
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "newpassword123"
  }'
```

---

## Database Schema Updates

### User Table - Các cột mới:
```sql
ALTER TABLE users
ADD COLUMN resetPasswordToken VARCHAR(255),
ADD COLUMN resetPasswordExpires TIMESTAMP;
```

TypeORM sẽ tự động tạo các cột này khi bạn chạy ứng dụng với `synchronize: true`.

---

## Security Features

### 1. Token Security
- Reset token được hash bằng SHA-256 trước khi lưu vào database
- Token có thời hạn 1 giờ
- Mỗi request tạo token mới sẽ ghi đè token cũ

### 2. Privacy Protection
- API không tiết lộ liệu email có tồn tại trong hệ thống hay không
- Message response luôn giống nhau cho tất cả requests

### 3. Password Requirements
- Tối thiểu 6 ký tự
- Hash bằng bcrypt với 10 salt rounds

---

## Production Deployment

### QUAN TRỌNG: Cần cấu hình Email Service

Trong production, bạn cần:

1. **Tích hợp Email Service**
   - Sử dụng: SendGrid, AWS SES, Mailgun, hoặc Nodemailer
   - Update `auth.service.ts` method `forgotPassword()`
   - Gửi email với link: `https://yourapp.com/reset-password?token=${resetToken}`

2. **Xóa Development Code**
   - Xóa dòng return `resetToken` trong response
   - Xóa `console.log` statement

3. **Environment Variables**
   ```env
   EMAIL_SERVICE=sendgrid
   EMAIL_FROM=noreply@yourapp.com
   SENDGRID_API_KEY=your-api-key
   FRONTEND_URL=https://yourapp.com
   ```

4. **Cập nhật Email Template**
   - Tạo HTML email template đẹp
   - Include reset link với token
   - Thêm branding và instructions

Example email service integration:
```typescript
// In forgotPassword method
const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

await this.emailService.send({
  to: user.email,
  subject: 'Password Reset Request',
  template: 'password-reset',
  context: {
    name: user.firstName,
    resetUrl: resetUrl,
    expiresIn: '1 hour'
  }
});
```

---

## Frontend Routes

- `/login` - Login page
- `/forgot-password` - Request password reset
- `/reset-password` - Reset password with token
- `/trading` - Protected trading dashboard (requires auth)

---

## Troubleshooting

### Token không hoạt động
- Check xem token có hết hạn chưa (1 giờ)
- Verify token được copy chính xác (không có khoảng trắng)
- Check console logs trong backend để xem token được generate

### Không thể login sau khi reset
- Verify password mới đáp ứng yêu cầu (>= 6 chars)
- Clear localStorage và thử lại
- Check database xem `resetPasswordToken` đã được clear chưa

### Database errors
- Chạy lại backend để TypeORM tự động sync schema
- Hoặc chạy migration manually nếu `synchronize: false`

---

## Next Steps (Optional Improvements)

1. **Email Integration** - Thêm email service thật
2. **Rate Limiting** - Giới hạn số lần request forgot password
3. **2FA** - Two-Factor Authentication
4. **Password Strength Meter** - Hiển thị độ mạnh password
5. **Login History** - Track login attempts
6. **Session Management** - Multiple device tracking
7. **OAuth** - Google/Facebook login
