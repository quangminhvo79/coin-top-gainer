# Vietnamese Stock RSI Checker API

Module này cung cấp các API để kiểm tra giá trị RSI (Relative Strength Index) của các mã chứng khoán Việt Nam.

## Endpoints

### 1. Kiểm tra RSI cho nhiều mã chứng khoán

**POST** `/api/vn-stock-rsi/check`

Request Body:
```json
{
  "symbols": ["VNM", "VIC", "HPG", "VHM"],
  "period": 14,  // Tùy chọn, mặc định là 14
  "days": 30     // Tùy chọn, mặc định là 30
}
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "symbol": "VNM",
      "currentPrice": 85000,
      "rsi": 65.5,
      "rsiStatus": "neutral",
      "lastUpdated": "2026-01-04T10:30:00.000Z"
    },
    {
      "symbol": "VIC",
      "currentPrice": 42000,
      "rsi": 28.3,
      "rsiStatus": "oversold",
      "lastUpdated": "2026-01-04T10:30:00.000Z"
    }
  ],
  "timestamp": "2026-01-04T10:30:00.000Z"
}
```

### 2. Kiểm tra RSI cho một mã chứng khoán

**GET** `/api/vn-stock-rsi/check-single?symbol=VNM&period=14&days=30`

Query Parameters:
- `symbol` (bắt buộc): Mã chứng khoán cần kiểm tra
- `period` (tùy chọn): Chu kỳ RSI, mặc định là 14
- `days` (tùy chọn): Số ngày lấy dữ liệu lịch sử, mặc định là 30

Response: Tương tự như endpoint POST, nhưng chỉ trả về kết quả cho một mã.

### 3. Lấy danh sách mã chứng khoán phổ biến

**GET** `/api/vn-stock-rsi/popular-symbols`

Response:
```json
{
  "symbols": [
    "VNM", "VIC", "HPG", "VHM", "TCB", "VPB", "MWG", "VJC",
    "GAS", "MSN", "PLX", "VRE", "VCB", "BID", "CTG",
    "POW", "SAB", "SSI", "FPT", "MBB",
    "ACB", "PVS", "PVD", "SHS", "VCS"
  ]
}
```

## Giải thích RSI

RSI (Relative Strength Index) là một chỉ báo kỹ thuật đo lường động lượng giá:

- **RSI < 30**: Vùng quá bán (oversold) - Có thể là cơ hội mua
- **RSI 30-70**: Vùng trung tính (neutral) - Giá đang trong xu hướng bình thường
- **RSI > 70**: Vùng quá mua (overbought) - Có thể là thời điểm để cân nhắc bán

## Nguồn dữ liệu

Module này sử dụng API công khai của VND Direct để lấy dữ liệu giá lịch sử của các mã chứng khoán Việt Nam.

## Ví dụ sử dụng

### Với cURL:

```bash
# Kiểm tra RSI cho nhiều mã
curl -X POST http://localhost:3000/api/vn-stock-rsi/check \
  -H "Content-Type: application/json" \
  -d '{"symbols": ["VNM", "VIC", "HPG"], "period": 14, "days": 30}'

# Kiểm tra RSI cho một mã
curl http://localhost:3000/api/vn-stock-rsi/check-single?symbol=VNM

# Lấy danh sách mã phổ biến
curl http://localhost:3000/api/vn-stock-rsi/popular-symbols
```

### Với JavaScript/Fetch:

```javascript
// Kiểm tra RSI cho nhiều mã
const checkRSI = async () => {
  const response = await fetch('http://localhost:3000/api/vn-stock-rsi/check', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      symbols: ['VNM', 'VIC', 'HPG'],
      period: 14,
      days: 30
    })
  });

  const data = await response.json();
  console.log(data);
};
```

## Lưu ý

- API có thể mất một chút thời gian để xử lý nếu kiểm tra nhiều mã cùng lúc
- Đảm bảo kết nối internet ổn định để lấy dữ liệu từ VND Direct
- Nên cache kết quả để tránh gọi API quá nhiều lần
