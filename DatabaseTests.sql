USE StudentManagementDB
GO
-- Test 1: Get all students with class info
SELECT 
    s.StudentCode,
    p.FullName,
    c.ClassName,
    m.MajorName,
    s.GPA
FROM Students s
JOIN Persons p ON s.StudentID = p.Id
LEFT JOIN Classes c ON s.ClassID = c.ClassID
LEFT JOIN Majors m ON s.MajorID = m.MajorID
ORDER BY s.StudentCode;
GO

-- Test 2: Get teachers with department
SELECT 
    t.TeacherCode,
    p.FullName,
    d.DepartmentName,
    t.Position
FROM Teachers t
JOIN Persons p ON t.TeacherID = p.Id
LEFT JOIN Departments d ON t.DepartmentID = d.DepartmentID;
GO

-- Test 3: Get subjects with prerequisites
SELECT 
    SubjectCode,
    SubjectName,
    Credits,
    Prerequisites
FROM Subjects
WHERE Prerequisites IS NOT NULL;
GO

-- Test 4: Get class statistics
SELECT 
    c.ClassName,
    COUNT(s.StudentID) AS StudentCount,
    c.MaxCapacity,
    CASE 
        WHEN COUNT(s.StudentID) >= c.MaxCapacity THEN 'Full'
        ELSE 'Available'
    END AS Status
FROM Classes c
LEFT JOIN Students s ON c.ClassID = s.ClassID
GROUP BY c.ClassID, c.ClassName, c.MaxCapacity;
GO

-- Test 5: Test stored procedure
EXEC sp_GetDashboardStats;
GO