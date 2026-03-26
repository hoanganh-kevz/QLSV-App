# 📚 Student Management System

## Giới thiệu
Hệ thống quản lý sinh viên xây dựng trên ASP.NET Core với Clean Architecture, hỗ trợ quản lý sinh viên, giảng viên, lớp học, môn học, điểm số và xuất báo cáo.

## 🏗️ Kiến trúc
```
StudentManagement/
├── StudentManagement.API            # REST API (Controllers, Middleware)
├── StudentManagement.Core           # Domain entities, Interfaces, DTOs
├── StudentManagement.Infrastructure # EF Core, Repositories, Data
├── StudentManagement.Services       # Business logic
└── StudentManagement.Tests          # xUnit unit tests
```

## 🔧 Yêu cầu
- .NET 10 SDK
- SQL Server 2019+
- Visual Studio 2022 / VS Code

## ⚡ Cài đặt & Chạy

### 1. Clone repository
```bash
git clone <repo-url>
cd AppQLSV
```

### 2. Cấu hình database
Chỉnh `ConnectionStrings` trong `StudentManagement.API/appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=StudentManagement;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```

### 3. Chạy migrations
```bash
dotnet ef database update --project StudentManagement.Infrastructure --startup-project StudentManagement.API
```

### 4. Seed dữ liệu mẫu
Khi chạy lần đầu, hệ thống sẽ tự động seed dữ liệu bao gồm:
- 1 Admin (admin / admin123)
- 5 Teachers (teacher1-5 / teacher123)
- 50+ Students (student1-N / student123)
- 10 Classes, 15 Subjects, 200+ Grades

### 5. Chạy ứng dụng
```bash
cd StudentManagement.API
dotnet run
```
API sẽ chạy tại `https://localhost:5001`.

### 6. Chạy tests
```bash
dotnet test StudentManagement.Tests
```

## 📡 API Endpoints

| Module | Endpoints | Mô tả |
|--------|-----------|--------|
| Auth | `/api/auth/login`, `/api/auth/register`, `/api/auth/profile` | Xác thực |
| Students | `/api/students` (CRUD + search) | Quản lý sinh viên |
| Teachers | `/api/teachers` (CRUD) | Quản lý giảng viên |
| Classes | `/api/classes` (CRUD + students) | Quản lý lớp học |
| Subjects | `/api/subjects` (CRUD) | Quản lý môn học |
| Grades | `/api/grades` (CRUD + batch + transcript) | Quản lý điểm |
| Dashboard | `/api/dashboard/stats`, `grade-distribution`, `top-students` | Thống kê |
| Export | `/api/export/students/excel`, `transcript/{id}/pdf` | Xuất báo cáo |
| Users | `/api/users` (CRUD + activate/deactivate) | Quản lý tài khoản |
| Search | `/api/search/students`, `/api/search/grades` | Tìm kiếm nâng cao |

📖 Swagger UI: `https://localhost:5001/swagger`

## 🛠️ Tech Stack
- **Backend**: ASP.NET Core 10, EF Core, SQL Server
- **Auth**: JWT + BCrypt
- **Export**: EPPlus (Excel), QuestPDF (PDF)
- **Testing**: xUnit, Moq, FluentAssertions
- **Logging**: Serilog
