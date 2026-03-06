/*
==========================================================
Procedure: sp_GetDashboardStats
Purpose  : Lấy số liệu tổng quan cho Dashboard
Usage    : Dùng cho trang Dashboard (Admin)
==========================================================
*/
CREATE OR ALTER PROCEDURE sp_GetDashboardStats
AS
BEGIN
    SET NOCOUNT ON;  -- Tránh trả về số dòng ảnh hưởng (tối ưu hiệu năng)

    SELECT 
        (SELECT COUNT(*) FROM Students) AS TotalStudents,      -- Tổng số sinh viên
        (SELECT COUNT(*) FROM Teachers) AS TotalTeachers,      -- Tổng số giảng viên
        (SELECT COUNT(*) FROM Admins) AS TotalAdmins,          -- Tổng số admin
        (SELECT COUNT(*) FROM Accounts WHERE IsActive = 1) AS ActiveAccounts,   -- Tài khoản đang hoạt động
        (SELECT COUNT(*) FROM Accounts WHERE IsActive = 0) AS InactiveAccounts  -- Tài khoản bị khóa
END
GO

/*
==========================================================
Procedure: sp_GetStudentsByClass
Purpose  : Lấy danh sách sinh viên theo ClassID
Usage    : Dùng trong chức năng quản lý lớp
==========================================================
*/
CREATE OR ALTER PROCEDURE sp_GetStudentsByClass
    @ClassID NVARCHAR(50)  -- Tham số đầu vào: mã lớp
AS
BEGIN
    SET NOCOUNT ON;

    SELECT *
    FROM vw_StudentFullInfo   -- Sử dụng view để tránh join phức tạp
    WHERE ClassID = @ClassID;
END
GO

/*
==========================================================
Procedure: sp_SearchStudents
Purpose  : Tìm kiếm sinh viên theo tên hoặc mã sinh viên
Usage    : Hỗ trợ chức năng Search trên hệ thống
==========================================================
*/
CREATE OR ALTER PROCEDURE sp_SearchStudents
    @Keyword NVARCHAR(100)  -- Từ khóa tìm kiếm
AS
BEGIN
    SET NOCOUNT ON;

    SELECT *
    FROM vw_StudentFullInfo
    WHERE FullName LIKE '%' + @Keyword + '%'
       OR StudentCode LIKE '%' + @Keyword + '%';
END
GO

/*
==========================================================
Procedure: sp_LockAccountIfNeeded
Purpose  : Tự động khóa tài khoản nếu login sai >= 5 lần
Usage    : Được gọi sau mỗi lần login thất bại
==========================================================
*/
CREATE OR ALTER PROCEDURE sp_LockAccountIfNeeded
    @Username NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Accounts
    SET IsActive = 0  -- Khóa tài khoản
    WHERE Username = @Username
      AND FailedLoginAttempts >= 5;
END
GO

/*
==========================================================
Procedure: sp_GetStudentStatisticsByYear
Purpose  : Thống kê số lượng sinh viên và GPA trung bình theo năm học
Usage    : Dùng cho biểu đồ Bar Chart trong Dashboard
==========================================================
*/
CREATE OR ALTER PROCEDURE sp_GetStudentStatisticsByYear
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        AcademicYear,
        COUNT(*) AS TotalStudents,   -- Tổng sinh viên theo năm
        AVG(GPA) AS AverageGPA       -- GPA trung bình
    FROM Students
    GROUP BY AcademicYear;
END
GO