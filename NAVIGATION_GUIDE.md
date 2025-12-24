# Navigation & Authentication Guide

## Tổng quan

Hệ thống navigation với user menu cho phép bạn dễ dàng điều hướng giữa các trang và quản lý tài khoản.

## Tính năng

### 1. Navigation Bar
- **Logo**: Link về trang chủ
- **Trading**: Link đến Trading Dashboard
- **Settings**: Link đến trang cấu hình
- **User Menu**: Avatar, tên/email, dropdown menu

### 2. User Menu
- **Avatar**: Hiển thị initials (2 chữ cái đầu)
- **User Info**:
  - Tên đầy đủ (nếu có)
  - Email
- **Dropdown Actions**:
  - Settings
  - Trading Dashboard
  - Profile (coming soon)
  - Logout

### 3. Authentication State
- Tự động kiểm tra token khi load page
- Hiển thị user info khi đã login
- Redirect về login khi logout
- Token được lưu trong localStorage

---

## Components

### 1. Navigation Component
**File**: [src/components/Navigation/Navigation.jsx](src/components/Navigation/Navigation.jsx)

**Features**:
- Sticky navigation bar
- Active route highlighting
- Responsive design
- User dropdown menu
- Logout functionality

**Usage**:
```jsx
import Navigation from '../../components/Navigation/Navigation';

function YourPage() {
  return (
    <div>
      <Navigation />
      {/* Your content */}
    </div>
  );
}
```

### 2. useAuth Hook
**File**: [src/hooks/useAuth.js](src/hooks/useAuth.js)

**Returns**:
```javascript
{
  user: {
    id: string,
    email: string,
    firstName?: string,
    lastName?: string,
    createdAt: Date
  },
  isLoading: boolean,
  isAuthenticated: boolean,
  logout: () => void,
  checkAuth: () => Promise<void>
}
```

**Usage**:
```jsx
import { useAuth } from '../../hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please login</div>;
  }

  return (
    <div>
      <p>Welcome, {user.email}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

---

## User Display Logic

### Avatar Initials
1. **Full Name**: `firstName[0] + lastName[0]` → "JD" (John Doe)
2. **First Name Only**: `firstName.substring(0, 2)` → "JO" (John)
3. **Email Only**: `email.substring(0, 2)` → "US" (user@example.com)
4. **Fallback**: "U"

### Display Name
1. **Full Name**: `firstName + " " + lastName` → "John Doe"
2. **First Name Only**: `firstName` → "John"
3. **Email Fallback**: `email` → "user@example.com"

---

## Routes

### Public Routes (không cần login):
- `/` - Home page
- `/login` - Login page
- `/forgot-password` - Forgot password
- `/reset-password` - Reset password

### Protected Routes (cần login):
- `/trading` - Trading Dashboard
- `/settings` - Settings page

Navigation chỉ hiển thị khi user đã login (`isAuthenticated = true`).

---

## Authentication Flow

### 1. Login Process
```
1. User nhập email/password tại /login
2. Backend verify credentials
3. Trả về JWT token
4. Frontend lưu token: localStorage.setItem('auth_token', token)
5. Redirect to /trading
6. Navigation hiển thị với user info
```

### 2. Page Load
```
1. Page loads
2. useAuth hook runs
3. Check localStorage for token
4. If token exists:
   - Call GET /api/v1/auth/profile
   - If valid: setUser(userData)
   - If invalid: clear token
5. Navigation renders based on isAuthenticated
```

### 3. Logout Process
```
1. User clicks Logout
2. localStorage.removeItem('auth_token')
3. setUser(null)
4. navigate('/login')
5. Navigation disappears
```

---

## Styling

### Colors
- **Background**: `bg-slate-900/30` với backdrop blur
- **Avatar**: Gradient `from-purple-500 to-pink-500`
- **Active Link**: `bg-purple-500/20 text-purple-400`
- **Hover**: `hover:bg-slate-800/50`

### Responsive
- **Mobile**:
  - Logo text hidden (`hidden sm:block`)
  - User info in dropdown only
- **Desktop**:
  - Full navigation visible
  - User info beside avatar

---

## Security

### Token Storage
- Stored in `localStorage` với key `auth_token`
- Automatically included in API requests
- Cleared on logout

### Token Validation
- Validated on every page load
- Invalid tokens are automatically cleared
- User redirected to login if not authenticated

### Protected API Calls
```javascript
const token = localStorage.getItem('auth_token');
const response = await fetch(`${API_URL}/api/v1/platforms`, {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

---

## Examples

### Example 1: Check Auth Status
```jsx
import { useAuth } from '../hooks/useAuth';

function MyComponent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please login to continue</div>;
  }

  return <div>Welcome to the app!</div>;
}
```

### Example 2: Display User Info
```jsx
import { useAuth } from '../hooks/useAuth';

function UserProfile() {
  const { user } = useAuth();

  return (
    <div>
      <h2>{user.firstName} {user.lastName}</h2>
      <p>{user.email}</p>
      <p>Member since: {new Date(user.createdAt).toLocaleDateString()}</p>
    </div>
  );
}
```

### Example 3: Protected Route
```jsx
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

function ProtectedPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <div>Protected Content</div>;
}
```

### Example 4: Custom Logout Button
```jsx
import { useAuth } from '../hooks/useAuth';

function CustomLogout() {
  const { logout } = useAuth();

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
}
```

---

## Troubleshooting

### Navigation không hiển thị
- Check `isAuthenticated` trong console
- Verify token exists: `localStorage.getItem('auth_token')`
- Check network tab cho API call `/auth/profile`

### User info không load
- Verify token is valid
- Check API response in network tab
- Clear localStorage và login lại

### Logout không hoạt động
- Check console for errors
- Verify `navigate` from react-router-dom works
- Check if token is cleared: `localStorage.getItem('auth_token')`

### Avatar không hiển thị đúng
- Check user object has correct fields
- Verify `getInitials()` logic
- Check CSS gradient classes

---

## Customization

### Change Avatar Color
```jsx
// In Navigation.jsx, update avatar div
<div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-green-500">
```

### Add More Menu Items
```jsx
// In Navigation.jsx dropdown menu
<Link
  to="/new-page"
  className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-slate-700/50"
>
  <svg>...</svg>
  <span>New Page</span>
</Link>
```

### Custom Display Name Logic
```jsx
// In Navigation.jsx, update getDisplayName()
const getDisplayName = (user) => {
  return user.username || user.email; // Use username if available
};
```

---

## File Structure

```
src/
├── components/
│   └── Navigation/
│       └── Navigation.jsx          # Main navigation component
├── hooks/
│   └── useAuth.js                  # Authentication hook
└── pages/
    ├── Login/
    │   └── Login.jsx               # Login page (sets token)
    ├── TradingDashboard/
    │   └── TradingDashboard.jsx    # Uses <Navigation />
    └── Settings/
        └── Settings.jsx            # Uses <Navigation />
```

---

## API Reference

### GET /api/v1/auth/profile
**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "createdAt": "2024-01-20T10:00:00Z"
}
```

**Errors**:
- 401 Unauthorized: Invalid or expired token
- 404 Not Found: User not found

---

## Next Steps

### Planned Features
1. **Profile Page**: Edit user information
2. **Notifications**: Bell icon with unread count
3. **Theme Toggle**: Dark/Light mode switch
4. **Language Selector**: Multi-language support
5. **Quick Actions**: Recent platforms, quick trade
6. **Search**: Global search for orders, platforms

---

## FAQ

**Q: Tại sao navigation không hiện khi chưa login?**
A: Navigation chỉ hiển thị khi `isAuthenticated = true`. Đăng nhập để thấy navigation.

**Q: Có thể tùy chỉnh avatar không?**
A: Hiện tại chỉ hiển thị initials. Feature upload avatar sẽ được thêm sau.

**Q: Token có tự động refresh không?**
A: Hiện tại không. Token sẽ expire sau 7 ngày và cần login lại.

**Q: Có thể thêm more navigation items không?**
A: Có, chỉnh sửa trong `Navigation.jsx` và thêm routes trong `main.jsx`.

**Q: Làm sao để ẩn navigation ở một số trang?**
A: Đơn giản là không import `<Navigation />` component ở trang đó.

**Q: User info lấy từ đâu?**
A: Từ API `/auth/profile` sau khi verify JWT token.
