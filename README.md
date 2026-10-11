# Từ điển Bahnar – Việt

Ứng dụng tra cứu và học từ vựng Bahnar – Việt, xây dựng bằng React và Vite.

## Chạy giao diện

```sh
npm install
npm run dev
```

## Tích hợp API dịch

Nút **Dịch cả câu bằng AI** gửi yêu cầu tới `POST /api/translate`:

```json
{
  "text": "Câu cần dịch",
  "direction": "vb"
}
```

`direction` là `vb` (Việt → Bahnar) hoặc `bv` (Bahnar → Việt). API trả về JSON có trường `translation` dạng chuỗi; `cached` dạng boolean là tùy chọn. Khi yêu cầu thất bại, API có thể trả thêm trường `error` để giao diện hiển thị lý do.

Khi frontend và backend đã triển khai ở các domain riêng, cấu hình `VITE_API_BASE_URL` thành origin public của backend trong phần Environment Variables của nền tảng deploy frontend, sau đó build và deploy lại frontend. Ví dụ: `VITE_API_BASE_URL=https://api.example.com` (không thêm `/api` ở cuối). Frontend sẽ gọi `https://api.example.com/api/translate`. Đây là URL công khai, không đặt API key hoặc bí mật vào biến này.

Khi chạy Vite ở local với backend riêng, có thể đặt `VITE_API_PROXY_TARGET` thành origin backend, ví dụ `http://localhost:3000`, trong file `.env.local` ở thư mục gốc rồi khởi động lại dev server. Vite sẽ chuyển tiếp các yêu cầu `/api/*` tới backend. Nếu không đặt `VITE_API_BASE_URL`, trình duyệt gọi `/api/translate` trên cùng origin hiện tại.

Tra từ, gợi ý, câu hỏi luyện tập, từ đã lưu và lịch sử tra cứu vẫn dùng dữ liệu/tính năng hiện có ở frontend; chỉ thao tác dịch cả câu bằng AI gọi backend.
