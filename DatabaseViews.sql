--View: Student full Info
CREATE OR ALTER VIEW vw_StudentFullInfo AS
SELECT 
    s.StudentID,
    s.StudentCode,
    p.FullName,
    p.Email,
    p.PhoneNumber,
    p.Address,
    p.DateOfBirth,
    p.Gender,
    p.Nationality,
    s.ClassID,
    s.MajorID,
    s.EnrollmentYear,
    s.AcademicYear,
    s.Status,
    s.GPA,
    s.TotalCredits,
    s.ScholarshipTier,
    s.Tuition,
    s.DebtAmount,
    a.Username,
    a.Role,
    a.IsActive,
    a.LastLogin,
    a.CreatedAt
FROM Students s
INNER JOIN Persons p ON s.StudentID = p.Id
LEFT JOIN Accounts a ON p.AccountID = a.AccountID;
GO

--View: Teacher full Info
CREATE OR ALTER VIEW vw_TeacherFullInfo AS
SELECT 
    t.TeacherID,
    t.TeacherCode,
    p.FullName,
    p.Email,
    p.PhoneNumber,
    p.Address,
    p.DateOfBirth,
    p.Gender,
    p.Nationality,
    t.DepartmentID,
    t.Position,
    t.Degree,
    t.HireDate,
    t.EmploymentType,
    t.OfficeRoom,
    t.ConsultingHours,
    t.ResearchArea,
    a.Username,
    a.Role,
    a.IsActive,
    a.LastLogin
FROM Teachers t
INNER JOIN Persons p ON t.TeacherID = p.Id
LEFT JOIN Accounts a ON p.AccountID = a.AccountID;
GO

--View: Account Summary
CREATE OR ALTER VIEW vw_AccountSummary AS
SELECT 
    a.AccountID,
    a.Username,
    a.Role,
    a.IsActive,
    a.FailedLoginAttempts,
    a.LastLogin,
    a.CreatedAt,
    p.FullName,
    p.Email,
    p.PhoneNumber
FROM Accounts a
LEFT JOIN Persons p ON a.AccountID = p.AccountID;
GO