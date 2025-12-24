# Trading Dashboard

Giao diện quản lý giao dịch futures tự động kết nối với Binance API.

## Tính năng

### 1. Place Order (Đặt lệnh)
- Chọn trading platform (Binance, etc.)
- Chọn symbol (BTCUSDT, ETHUSDT, ...)
- Chọn side: LONG hoặc SHORT
- Thiết lập position size và leverage (1x - 125x)
- Tùy chọn Take Profit và Stop Loss
- Validation đầy đủ trước khi gửi lệnh

### 2. Active Orders (Lệnh đang hoạt động)
- Hiển thị danh sách lệnh ACTIVE và PENDING
- Theo dõi entry price, TP/SL targets
- Tính năng cancel order
- Auto-refresh mỗi 10 giây
- Responsive design (Desktop & Mobile)

### 3. Order History (Lịch sử giao dịch)
- Xem tất cả lệnh đã hoàn thành
- Filter theo status (FILLED, CLOSED, CANCELLED, FAILED)
- Tính toán P&L tự động
- Hiển thị entry/exit prices
- Thống kê chi tiết từng giao dịch

### 4. Trading Stats (Thống kê)
- Tổng số lệnh (Total Orders)
- Lệnh đang hoạt động (Active Orders)
- Lệnh đã đóng (Closed Orders)
- Win Rate (Tỷ lệ thắng)
- Total P&L (Tổng lãi/lỗ)
- Số lệnh thắng/thua

## Cấu trúc Components

```
src/pages/TradingDashboard/
├── TradingDashboard.jsx          # Main page
└── components/
    ├── OrderPlacementForm.jsx    # Form đặt lệnh
    ├── ActiveOrdersList.jsx      # Danh sách lệnh active
    ├── OrderHistory.jsx          # Lịch sử giao dịch
    ├── TradingStats.jsx          # Thống kê
    └── index.js                  # Exports

src/hooks/
└── useTradingDashboard.js        # API hooks với React Query
```

## API Hooks

### useTradingPlatforms()
Lấy danh sách trading platforms (Binance, etc.)

### useActiveOrders(refreshTrigger)
Lấy danh sách lệnh đang hoạt động
- Auto-refresh mỗi 10 giây
- Có thể manual refresh bằng refreshTrigger

### useOrderHistory(refreshTrigger)
Lấy lịch sử tất cả các lệnh
- Stale time: 30 giây

### usePlaceOrder()
Mutation hook để đặt lệnh mới
- Tự động invalidate orders sau khi đặt lệnh thành công

### useCancelOrder()
Mutation hook để hủy lệnh
- Tự động invalidate orders sau khi hủy thành công

## Cấu hình

### 1. Environment Variables

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Cấu hình API URL:
```
VITE_API_URL=http://localhost:3000
```

### 2. Authentication

API hooks sẽ tự động lấy JWT token từ localStorage:

```javascript
const token = localStorage.getItem('auth_token');
```

Bạn cần implement authentication flow để set token này.

## Routing

- `/` - Home page (Top Gainers)
- `/trading` - Trading Dashboard

## Responsive Design

UI được thiết kế responsive với:
- Desktop view: Table layout
- Mobile view: Card layout
- Breakpoints: md (768px), lg (1024px)

## Styling

Sử dụng Tailwind CSS với:
- Glass-morphism effects
- Gradient backgrounds
- Smooth animations
- Dark theme

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

## Backend Requirements

Trading Dashboard yêu cầu backend endpoints sau:

### GET /api/v1/platforms
Lấy danh sách trading platforms

Response:
```json
[
  {
    "id": "uuid",
    "name": "Binance Main",
    "exchange": "binance"
  }
]
```

### POST /api/v1/futures/orders
Đặt lệnh mới

Request:
```json
{
  "platformId": "uuid",
  "symbol": "BTCUSDT",
  "side": "LONG",
  "orderType": "MARKET",
  "positionSize": 100,
  "leverage": 10,
  "takeProfitPercent": 5,
  "stopLossPercent": 3
}
```

### GET /api/v1/futures/orders
Lấy danh sách lệnh

Query params:
- `status`: ACTIVE,PENDING hoặc không có (tất cả)

### GET /api/v1/futures/orders/:id
Lấy chi tiết một lệnh

### DELETE /api/v1/futures/orders/:id
Hủy lệnh

## Future Enhancements

- [ ] Real-time updates với WebSocket
- [ ] Price charts cho từng order
- [ ] Advanced filtering và sorting
- [ ] Export history to CSV
- [ ] Push notifications
- [ ] Multi-platform management
- [ ] Position management
- [ ] Risk calculator
- [ ] Trading templates
- [ ] Performance analytics

## License

MIT
