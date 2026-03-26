# 📖 Hướng dẫn Sử dụng — Hệ thống Quản lý Sinh viên

## Tổng quan
Hệ thống cho phép quản lý toàn diện sinh viên, giảng viên, lớp học, môn học và điểm số với 3 vai trò:
- **Admin**: Toàn quyền quản lý
- **Teacher**: Quản lý điểm + xem danh sách
- **Student**: Xem thông tin cá nhân + bảng điểm

---

## Các Module chính

### 1. 🔐 Đăng nhập
- Truy cập hệ thống qua trang Login
- Nhập Username + Password
- Hệ thống tự phân quyền theo Role

### 2. 📊 Dashboard
- **4 thẻ thống kê**: Tổng sinh viên, Lớp, Môn, Giảng viên
- **Biểu đồ phân bố điểm**: Tỷ lệ A/B/C/D/F theo lớp
- **Top sinh viên**: 10 sinh viên GPA cao nhất
- **Hiệu suất lớp**: Điểm trung bình theo lớp

### 3. 👨‍🎓 Quản lý Sinh viên
- **Danh sách**: Tìm kiếm theo tên/MSSV/lớp, lọc theo trạng thái
- **Thêm mới**: Tự động tạo MSSV, kiểm tra email trùng
- **Cập nhật**: Thay đổi thông tin cá nhân
- **Xóa**: Soft delete (vô hiệu hóa)

### 4. 👨‍🏫 Quản lý Giảng viên
- CRUD giảng viên + phân khoa + quản lý lớp phụ trách

### 5. 🏫 Quản lý Lớp học
- CRUD lớp học
- Thêm/xóa sinh viên khỏi lớp
- Kiểm tra sĩ số tối đa

### 6. 📚 Quản lý Môn học
- CRUD môn học + mã môn unique + số tín chỉ

### 7. 📝 Quản lý Điểm
- **Nhập điểm đơn lẻ**: Chọn SV + Môn → Nhập điểm
- **Nhập hàng loạt**: Batch import cho cả lớp
- **Tự động tính**: TotalScore = Attendance×10% + Midterm×30% + Final×60%
- **Xếp loại**: A (≥8.5), B+ (≥7.8), B (≥7.0), C+ (≥6.5), C (≥5.5), D+ (≥5.0), D (≥4.0), F (<4.0)

### 8. 📄 Xuất báo cáo
- **Excel**: Danh sách sinh viên, Bảng điểm lớp, Danh sách lớp
- **PDF**: Bảng điểm cá nhân (transcript), Danh sách lớp (roster)

### 9. 🔍 Tìm kiếm nâng cao
- Sinh viên: Theo tên + lớp + trạng thái + khoảng GPA + ngày nhập học
- Điểm: Theo khoảng điểm + học kỳ + năm học + chỉ SV rớt

### 10. 👤 Quản lý Tài khoản (Admin)
- Xem danh sách users, tạo/sửa/xóa
- Kích hoạt/vô hiệu hóa tài khoản
- Reset mật khẩu

### 11. 🔧 Cá nhân
- Xem/sửa profile
- Đổi mật khẩu (cần OTP mật khẩu cũ)

---

## Tài khoản mặc định
| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Teacher | teacher1 | teacher123 |
| Student | student1 | student123 |
