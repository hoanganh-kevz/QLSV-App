# Hướng Dẫn Cài Đặt và Chạy Dự Án

Dự án này bao gồm hai phần chính: **Backend** (Node.js/Express) và **Frontend** (React/Vite).

## 1. Yêu cầu hệ thống
*   **Node.js**: Đã được cài đặt (Khuyên dùng phiên bản LTS).
*   **MongoDB**: Có tài khoản MongoDB Atlas hoặc chạy MongoDB local.

## 2. Các bước cài đặt

### Bước 1: Tải mã nguồn về
Giải nén file zip hoặc clone từ GitHub.

### Bước 2: Cài đặt Backend
1.  Mở terminal tại thư mục `backEnd`.
2.  Chạy lệnh cài đặt thư viện:
    ```bash
    npm install
    ```
3.  Tạo file `.env` dựa trên file `.env.example`:
    *   Sửa `MONGO_URI` thành đường dẫn database của bạn.
    *   Cấu hình `MAIL_MAIN_SYSTEM` và `MAIL_MAIN_PASSWORD` (App Password) để dùng tính năng gửi mail.

### Bước 3: Cài đặt Frontend
1.  Mở terminal tại thư mục `frontEnd`.
2.  Chạy lệnh cài đặt thư viện:
    ```bash
    npm install
    ```
3.  Tạo file `.env` dựa trên file `.env.example`:
    *   Đảm bảo `VITE_API_URL` trỏ đúng vào địa chỉ Backend (mặc định là `http://localhost:5000/api`).

## 3. Cách chạy dự án

### Chạy Backend
Trong thư mục `backEnd`, chạy:
```bash
npm run dev
```
Backend sẽ khởi chạy tại port `5000`.

### Chạy Frontend
Trong thư mục `frontEnd`, chạy:
```bash
npm run dev
```
Frontend sẽ khởi chạy tại port `3003` (mặc định). Truy cập: `http://localhost:3003`

## 4. Lưu ý quan trọng khi nén/gửi đi
Khi gửi project cho người khác, **KHÔNG** nén các thư mục sau để giảm dung lượng:
*   `backEnd/node_modules/`
*   `frontEnd/node_modules/`
*   `frontEnd/dist/`
*   Các file `.env` (nên dùng `.env.example` thay thế).

---
*Chúc bạn cài đặt thành công!*
