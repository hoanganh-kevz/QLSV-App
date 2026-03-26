$ErrorActionPreference = 'Stop'
$dbContext = "Server=localhost;Database=StudentManagementDB;Trusted_Connection=True;TrustServerCertificate=True"

Write-Host "================ SEED MASSIVE DATA (1000+ Students, 10000+ Grades) ================" -ForegroundColor Cyan

# Using pure SQL to quickly insert 1000 Students, 10000 Enrollments, and 10000 Grades
$sql = @"
SET NOCOUNT ON;

DECLARE @DepartmentID nvarchar(450) = (SELECT TOP 1 DepartmentID FROM Departments);
DECLARE @MajorID nvarchar(450) = (SELECT TOP 1 MajorID FROM Majors);
DECLARE @ClassID nvarchar(450) = (SELECT TOP 1 ClassID FROM Classes);
DECLARE @SubjectID nvarchar(450) = (SELECT TOP 1 SubjectID FROM Subjects);
DECLARE @SectionID nvarchar(450) = (SELECT TOP 1 SectionID FROM CourseSections);

IF @DepartmentID IS NULL
BEGIN
    PRINT 'Error: Missing Core Data (No Departments)';
    RETURN;
END

BEGIN TRANSACTION;
    DECLARE @i int = 1;

    -- Create 1000 Students
    PRINT 'Inserting 1000 Students...'
    WHILE @i <= 1000
    BEGIN
        DECLARE @StudentGuid nvarchar(450) = NEWID();
        DECLARE @Code nvarchar(50) = 'STU_MASS_' + CAST(@i AS nvarchar(20));
        
        -- Insert into Person base table (TPH)
        INSERT INTO Persons (Id, FullName, Email, PhoneNumber, DateOfBirth, Gender, PersonType, 
            StudentCode, EnrollmentYear, Status, DepartmentID, MajorID, ClassID, GPA, TotalCredits)
        VALUES (@StudentGuid, 'Massive Student ' + CAST(@i AS nvarchar(20)), 'stu' + CAST(@i AS nvarchar(20)) + '@school.edu', '0123456789', '2000-01-01', 0, 'Student',
            @Code, 2024, 0, @DepartmentID, @MajorID, @ClassID, 0, 0);

        -- Create 10 Enrollments/Grades per Student = 10000 Total Grades
        DECLARE @j int = 1;
        WHILE @j <= 10
        BEGIN
            DECLARE @EnrollGuid nvarchar(450) = NEWID();
            DECLARE @GradeGuid nvarchar(450) = NEWID();
            
            INSERT INTO Enrollments (EnrollmentID, StudentID, SectionID, EnrollmentDate, Status)
            VALUES (@EnrollGuid, @StudentGuid, @SectionID, GETDATE(), 'Completed');

            INSERT INTO Grades (GradeID, EnrollmentID, StudentID, SubjectID, AcademicYear, Semester, 
                AttendanceScore, MidtermScore, FinalScore, TotalScore, LetterGrade, GradePoint, Status, CreatedAt)
            VALUES (@GradeGuid, @EnrollGuid, @StudentGuid, @SubjectID, '2025-2026', 1, 
                8.0, 7.5, 8.5, 8.1, 'B+', 3.5, 'Pass', GETDATE());
            
            SET @j = @j + 1;
        END

        SET @i = @i + 1;
    END

COMMIT TRANSACTION;
PRINT 'Seed completed successfully!';
"@

try {
    Invoke-Sqlcmd -ConnectionString $dbContext -Query $sql -QueryTimeout 600 -ErrorAction Stop
    Write-Host "Database seeded successfully. You now have huge datasets." -ForegroundColor Green
}
catch {
    Write-Host "SQL Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.InnerException) {
        Write-Host "Inner SQL Error: $($_.Exception.InnerException.Message)" -ForegroundColor Red
    }
}
