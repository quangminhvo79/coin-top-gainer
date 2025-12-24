# Trading Settings Guide

## Tổng quan

Trang Settings cho phép bạn quản lý nhiều tài khoản trading và cấu hình mặc định để đặt lệnh nhanh chóng.

## Tính năng chính

### 1. Quản lý Trading Platforms
- Thêm nhiều tài khoản trading từ các sàn khác nhau (Binance, Coinbase, Kraken, Bybit, OKX)
- Lưu trữ API keys an toàn
- Hỗ trợ cả Testnet và Mainnet
- Theo dõi trạng thái kết nối của từng platform

### 2. Cấu hình Default Settings cho mỗi Platform
Mỗi platform có thể có settings riêng:

#### Trading Defaults:
- **Default Symbol**: Token mặc định khi đặt lệnh (VD: BTCUSDT, ETHUSDT)
- **Default Order Type**: MARKET hoặc LIMIT
- **Default Position Size**: Số tiền USDT mặc định cho mỗi lệnh
- **Default Leverage**: Đòn bẩy mặc định (1x - 125x)

#### Risk Management:
- **Default Take Profit (%)**: % lợi nhuận mục tiêu
- **Default Stop Loss (%)**: % cắt lỗ tự động

#### Options:
- **Auto TP/SL**: Tự động đặt Take Profit và Stop Loss khi tạo lệnh mới
- **Confirm Before Placing**: Hiển thị xác nhận trước khi đặt lệnh

### 3. Quick Order Placement
- Khi chọn platform trong form đặt lệnh, các settings mặc định sẽ tự động được load
- Nút "Use Defaults" để load lại settings bất cứ lúc nào
- Platform có settings được đánh dấu với icon ⚙️

---

## Cách sử dụng

### Thêm Platform mới

1. **Truy cập Settings**
   ```
   http://localhost:5173/settings
   ```

2. **Click "Add Platform"**

3. **Chọn sàn giao dịch**
   - Binance 🟡
   - Coinbase 🔵
   - Kraken 🟣
   - Bybit 🟠
   - OKX ⚫
   - Custom ⚪

4. **Nhập thông tin API**
   - Platform Name: Tên gợi nhớ (VD: "My Binance Main")
   - API Key: API key từ exchange
   - API Secret: API secret từ exchange
   - Passphrase: (chỉ cho Coinbase/OKX)
   - Testnet Mode: Bật nếu sử dụng testnet

5. **Click "Add Platform"**

### Cấu hình Default Settings

1. **Chọn platform** cần cấu hình

2. **Click "Edit Settings"**

3. **Cấu hình các thông số:**

   **Trading Defaults:**
   - Symbol: `BTCUSDT`, `ETHUSDT`, etc.
   - Order Type: `MARKET` hoặc `LIMIT`
   - Position Size: `100` USDT (hoặc số tiền bạn thường dùng)
   - Leverage: `10x` (di chuyển slider)

   **Risk Management:**
   - Take Profit: `5%` (hoặc % mục tiêu của bạn)
   - Stop Loss: `3%` (hoặc % cắt lỗ của bạn)

   **Options:**
   - ✅ Auto TP/SL: Tự động set TP/SL
   - ✅ Confirm Before Placing: Xác nhận trước khi đặt

4. **Click "Save Settings"**

### Đặt lệnh với Default Settings

1. **Truy cập Trading Dashboard**
   ```
   http://localhost:5173/trading
   ```

2. **Chọn platform** trong dropdown
   - Settings mặc định sẽ tự động được load
   - Platform có settings hiển thị icon ⚙️

3. **Click "Use Defaults"** nếu muốn reset về settings mặc định

4. **Điều chỉnh** nếu cần (hoặc giữ nguyên)

5. **Click "Place Order"**

---

## API Endpoints

### Get All Platforms
```bash
GET /api/v1/platforms
Authorization: Bearer <token>

Response:
[
  {
    "id": "uuid",
    "platform": "binance",
    "name": "My Binance",
    "isActive": true,
    "isTestnet": false,
    "settings": {
      "futuresConfig": {
        "defaultLeverage": 10,
        "defaultTakeProfitPercent": 5,
        "defaultStopLossPercent": 3,
        "defaultPositionSize": 100,
        "defaultSymbol": "BTCUSDT",
        "defaultOrderType": "MARKET",
        "autoTpSl": true,
        "confirmBeforePlacing": true
      }
    },
    "lastSyncedAt": "2024-01-20T10:30:00Z"
  }
]
```

### Create Platform
```bash
POST /api/v1/platforms
Authorization: Bearer <token>
Content-Type: application/json

{
  "platform": "binance",
  "name": "My Binance Account",
  "apiKey": "your-api-key",
  "apiSecret": "your-api-secret",
  "isTestnet": false
}
```

### Update Futures Settings
```bash
PUT /api/v1/platforms/:id/futures-settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "defaultLeverage": 10,
  "defaultTakeProfitPercent": 5,
  "defaultStopLossPercent": 3,
  "defaultPositionSize": 100,
  "defaultSymbol": "BTCUSDT",
  "defaultOrderType": "MARKET",
  "autoTpSl": true,
  "confirmBeforePlacing": true
}
```

### Delete Platform
```bash
DELETE /api/v1/platforms/:id
Authorization: Bearer <token>
```

---

## Database Schema

### TradingPlatform Entity

```typescript
{
  id: string;
  platform: 'binance' | 'coinbase' | 'kraken' | 'bybit' | 'okx' | 'custom';
  name: string;
  apiKey: string;
  apiSecret: string;
  passphrase?: string;
  isTestnet: boolean;
  isActive: boolean;
  settings: {
    futuresConfig?: {
      defaultLeverage?: number;          // 1-125
      defaultTakeProfitPercent?: number; // 0.1-100
      defaultStopLossPercent?: number;   // 0.1-100
      autoTpSl?: boolean;
      defaultPositionSize?: number;      // Min 1
      defaultSymbol?: string;            // e.g., "BTCUSDT"
      defaultOrderType?: string;         // "MARKET" | "LIMIT"
      confirmBeforePlacing?: boolean;
    };
  };
  userId: string;
  lastSyncedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Use Cases

### Use Case 1: Scalper với nhiều tài khoản
```
Platform 1: Binance - Scalping
- Symbol: BTCUSDT
- Leverage: 20x
- Position Size: 50 USDT
- TP: 1%
- SL: 0.5%
- Auto TP/SL: ON

Platform 2: Binance - Swing Trading
- Symbol: ETHUSDT
- Leverage: 5x
- Position Size: 200 USDT
- TP: 10%
- SL: 5%
- Auto TP/SL: ON
```

### Use Case 2: Conservative Trader
```
Platform: Bybit
- Symbol: BTCUSDT
- Leverage: 2x
- Position Size: 100 USDT
- TP: 5%
- SL: 3%
- Auto TP/SL: ON
- Confirm Before Placing: ON (để kiểm tra lại)
```

### Use Case 3: High-Risk Trader
```
Platform: Binance Testnet (testing strategies)
- Symbol: BTCUSDT
- Leverage: 50x
- Position Size: 10 USDT
- TP: 20%
- SL: 10%
- Auto TP/SL: ON
- Confirm Before Placing: OFF (đặt nhanh)
```

---

## Security Best Practices

### 1. API Key Permissions
Chỉ cấp quyền cần thiết:
- ✅ Read account information
- ✅ Enable trading
- ❌ Enable withdrawals (KHÔNG BAO GIỜ)

### 2. IP Whitelist
- Thêm IP của máy tính vào whitelist trên exchange
- Không cho phép tất cả IP

### 3. Testnet First
- Test strategies trên testnet trước
- Chỉ chuyển sang mainnet khi đã chắc chắn

### 4. Separate Accounts
- Dùng tài khoản riêng cho trading bot
- Không dùng tài khoản chính có nhiều tiền

### 5. Monitor Regularly
- Check "Last Synced" time
- Review trading history thường xuyên
- Set up alerts cho unusual activities

---

## Troubleshooting

### API Connection Failed
- Verify API keys are correct
- Check IP whitelist on exchange
- Ensure API permissions are set correctly
- Try toggling Testnet mode

### Settings Not Loading
- Refresh the page
- Check browser console for errors
- Verify token is still valid
- Re-login if needed

### Orders Not Using Defaults
- Click "Use Defaults" button
- Check if platform has settings configured
- Look for ⚙️ icon next to platform name

---

## Next Steps

### Planned Features
1. **Preset Templates**: Save multiple strategy presets per platform
2. **Bulk Actions**: Apply settings to multiple platforms at once
3. **Import/Export**: Backup and restore settings
4. **Advanced Risk Management**: Trailing stops, partial TP/SL
5. **Performance Analytics**: Track performance by platform
6. **Notification Settings**: Alerts for filled orders, TP/SL hits

---

## Files Structure

```
src/pages/Settings/
├── Settings.jsx                    # Main settings page
├── components/
│   ├── PlatformSettings.jsx       # Individual platform card
│   └── AddPlatformModal.jsx       # Modal to add new platform

backend/src/
├── entities/
│   └── trading-platform.entity.ts # Database schema
├── modules/
│   ├── trading-platform/
│   │   ├── trading-platform.controller.ts
│   │   ├── trading-platform.service.ts
│   │   └── dto/
│   │       ├── create-platform.dto.ts
│   │       └── update-platform.dto.ts
│   └── futures-trading/
│       └── dto/
│           └── update-futures-settings.dto.ts  # Settings DTO
```

---

## FAQ

**Q: Có thể có bao nhiêu platforms?**
A: Không giới hạn. Bạn có thể thêm nhiều tài khoản từ cùng một sàn hoặc nhiều sàn khác nhau.

**Q: Settings có được encrypt không?**
A: API keys được lưu trong database. Nên sử dụng environment variables và encryption trong production.

**Q: Có thể share settings giữa các platforms không?**
A: Hiện tại mỗi platform có settings riêng. Feature "Templates" sẽ được thêm sau.

**Q: Testnet có miễn phí không?**
A: Có, các exchange đều cung cấp testnet miễn phí với fake money để test.

**Q: Làm sao để reset về default settings?**
A: Click "Edit Settings" → điều chỉnh về giá trị mong muốn → "Save Settings".

**Q: Settings có sync real-time không?**
A: Settings được lưu trên server. Khi thay đổi trên một device, reload page để thấy thay đổi.
