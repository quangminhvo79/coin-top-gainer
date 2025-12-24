# Fix Screen Flash on Page Navigation

## Problem
Khi chuyển trang, màn hình bị nháy (flash) do:
- Mỗi component gọi `useAuth()` hook
- Mỗi lần mount, hook gọi API `/profile` để check authentication
- State `isLoading` reset về `true` → Navigation component ẩn → hiện lại sau khi API response
- Tạo hiệu ứng nháy màn hình không mượt

## Solution
Sử dụng **React Context** để chia sẻ authentication state toàn app:

### 1. Tạo AuthContext
**File**: `src/contexts/AuthContext.jsx`

```jsx
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth(); // Chỉ gọi 1 lần khi app load
  }, []);

  // Show loading screen on initial load only
  if (isLoading) {
    return <LoadingScreen />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

**Benefits:**
- ✅ API `/profile` chỉ được gọi **1 lần duy nhất** khi app khởi động
- ✅ Auth state được chia sẻ cho toàn bộ app qua Context
- ✅ Khi chuyển trang, **không gọi lại API** → không có nháy màn hình
- ✅ Loading screen chỉ hiện 1 lần lúc đầu

### 2. Wrap App với AuthProvider
**File**: `src/main.jsx`

```jsx
<BrowserRouter>
  <AuthProvider>  {/* ← Wrap toàn bộ routes */}
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/trading" element={<TradingDashboard />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  </AuthProvider>
</BrowserRouter>
```

### 3. Sử dụng useAuth từ Context
**File**: `src/components/Navigation/Navigation.jsx`

```jsx
import { useAuth } from '../../contexts/AuthContext'; // ← Đổi từ hooks sang contexts

function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
  // Không còn gọi API mỗi lần render
}
```

## Changes Made

### Created Files:
1. **`src/contexts/AuthContext.jsx`** - New authentication context provider
   - Manages global auth state
   - Provides `useAuth()` hook
   - Shows loading screen on initial load only

2. **`src/components/ProtectedRoute.jsx`** - Route protection components
   - `<ProtectedRoute>` - Requires authentication, redirects to `/login` if not logged in
   - `<PublicRoute>` - Prevents logged-in users from seeing login pages, redirects to `/trading`

### Modified Files:
1. **`src/main.jsx`**
   - Import `AuthProvider` from contexts
   - Import `ProtectedRoute` and `PublicRoute`
   - Wrap `<Routes>` with `<AuthProvider>`
   - Wrap protected routes (`/trading`, `/settings`) with `<ProtectedRoute>`
   - Wrap public routes (`/login`, `/forgot-password`, `/reset-password`) with `<PublicRoute>`

2. **`src/components/Navigation/Navigation.jsx`**
   - Change import from `hooks/useAuth` to `contexts/AuthContext`

3. **`src/pages/Login/Login.jsx`**
   - Import and use `checkAuth()` from `useAuth()`
   - Call `checkAuth()` after successful login to update auth context

### Deleted Files:
1. **`src/hooks/useAuth.js`** - Old hook (replaced by Context)

## How It Works

### Before (❌ Screen Flash):
```
User navigates → New page loads → useAuth() called
→ isLoading = true → Navigation hidden
→ API /profile called → Response received
→ isLoading = false → Navigation shown
→ **Screen flash!**
```

### After (✅ Smooth):
```
App loads → AuthProvider mounts → API /profile called once
→ Loading screen shown (once only)
→ Context provides auth state to all components

User navigates → ProtectedRoute checks isAuthenticated
→ Already loaded from Context (no API call)
→ Instant decision: render page or redirect
→ **No flash, smooth transition!**
```

### Route Protection Flow:
```
User visits /trading:
1. ProtectedRoute checks isAuthenticated from Context (instant)
2. If YES → Render TradingDashboard
3. If NO → <Navigate to="/login" replace />

User visits /login (already logged in):
1. PublicRoute checks isAuthenticated from Context (instant)
2. If YES → <Navigate to="/trading" replace />
3. If NO → Render Login page
```

## Testing

1. **Start backend:**
```bash
cd backend
npm run start:dev
```

2. **Start frontend:**
```bash
npm run dev
```

3. **Test navigation:**
   - Login at http://localhost:5173/login
   - Navigate between /trading and /settings
   - Navigation should remain visible (no flash)
   - Page transitions should be smooth

## Technical Details

### Context Benefits:
- **Single source of truth** - Auth state managed in one place
- **No prop drilling** - Any component can access auth via `useAuth()`
- **Performance** - API called once, not on every navigation
- **Better UX** - Smooth transitions without loading states

### Loading Screen:
- Shows only on **initial app load**
- Simple spinner with purple theme matching app design
- Blocks rendering until auth check completes

## Related Files

- Authentication logic: [backend/src/modules/auth/auth.controller.ts](backend/src/modules/auth/auth.controller.ts)
- Cookie handling: [backend/src/main.ts](backend/src/main.ts)
- HttpOnly implementation: [HTTPONLY_COOKIES_IMPLEMENTED.md](HTTPONLY_COOKIES_IMPLEMENTED.md)
