import { IsArray, IsNotEmpty, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CheckRsiDto {
  @IsArray()
  @IsNotEmpty({ message: 'Danh sách mã chứng khoán không được để trống' })
  symbols: string[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  period?: number = 14; // Mặc định sử dụng RSI 14 ngày

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  days?: number = 30; // Số ngày lấy dữ liệu lịch sử (mặc định 30 ngày)
}
