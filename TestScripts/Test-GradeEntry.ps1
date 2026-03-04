$ErrorActionPreference = 'Stop'
$dbContext = "Server=localhost;Database=StudentManagementDB;Trusted_Connection=True;TrustServerCertificate=True"

# Authentication
$tokenOutput = Invoke-RestMethod -Uri "http://localhost:5253/api/auth/login" -Method POST -ContentType "application/json" -Body '{"username":"admin","password":"admin123"}'
$headers = @{ Authorization = "Bearer $($tokenOutput.token)"; "Content-Type" = "application/json" }

Write-Host "================ GRADE ENTRY TESTING ================" -ForegroundColor Cyan

# Fetch top 5 Enrollments directly from Database
$query = "SELECT TOP 5 EnrollmentID, StudentID, SectionID FROM Enrollments e WHERE e.Status IN ('Enrolled', 'Active', 'Registered');"
$enrollments = Invoke-Sqlcmd -ConnectionString $dbContext -Query $query

if ($null -eq $enrollments -or $enrollments.Count -eq 0) {
    Write-Host "Warning: No enrollments found in database. Please run seed data." -ForegroundColor Yellow
    exit
}

Write-Host "Found $($enrollments.Count) Enrollments."
$createdGrades = @()
$sectionId = $enrollments[0].SectionID
$studentId = $enrollments[0].StudentID

# 1. Create grades for all students in section
Write-Host "`n1. Create Grades" -ForegroundColor Yellow
foreach ($enrollment in $enrollments) {
    $createBody = @{
        enrollmentID    = $($enrollment.EnrollmentID)
        attendanceScore = 7.5
        midtermScore    = 6.0
        finalScore      = 5.5
    } | ConvertTo-Json

    try {
        $grade = Invoke-RestMethod -Uri "http://localhost:5253/api/grades" -Method POST -Headers $headers -Body $createBody
        Write-Host "Created Grade ID: $($grade.gradeID) for Student: $($grade.studentName) (Total: $($grade.totalScore), Letter: $($grade.letterGrade))" -ForegroundColor Green
        $createdGrades += $grade
    }
    catch {
        Write-Host "Failed to create grade or grade already exists for Enrollment $($enrollment.EnrollmentID)" -ForegroundColor DarkGray
    }
}

if ($createdGrades.Count -eq 0) {
    Write-Host "Assuming grades already exist, fetching section grades..."
    $createdGrades = Invoke-RestMethod -Uri "http://localhost:5253/api/grades/section/$sectionId" -Headers $headers
}

$testGradeId = $createdGrades[0].gradeID

# 2. Update individual grade components
Write-Host "`n2. Update Grade Components (PATCH)" -ForegroundColor Yellow
$patchBody = @{
    component = "Final"
    score     = 9.5
    reason    = "Re-evaluation requested by student"
} | ConvertTo-Json

$updatedGrade = Invoke-RestMethod -Uri "http://localhost:5253/api/grades/$testGradeId/component" -Method PATCH -Headers $headers -Body $patchBody
Write-Host "Updated Grade Final Score to $($updatedGrade.finalScore). New Total: $($updatedGrade.totalScore), New Letter: $($updatedGrade.letterGrade)" -ForegroundColor Green

# 3. Verify GPA recalculation & 6. Transcript Accuracy
Write-Host "`n3. Verify GPA Recalculation & Transcript" -ForegroundColor Yellow
$transcript = Invoke-RestMethod -Uri "http://localhost:5253/api/grades/transcript/$studentId" -Headers $headers
Write-Host "Student: $($transcript.studentName) | Current Overall GPA: $($transcript.currentGPA) | Total Credits: $($transcript.totalCredits)" -ForegroundColor Green
foreach ($sem in $transcript.semesters) {
    Write-Host "- Semester $($sem.semester)/$($sem.academicYear): GPA $($sem.semesterGPA) ($($sem.semesterCredits) credits)" -ForegroundColor DarkGreen
}

# 4. Grade distribution calculations
Write-Host "`n4. Test Grade Distribution" -ForegroundColor Yellow
$distribution = Invoke-RestMethod -Uri "http://localhost:5253/api/grades/section/$sectionId/distribution" -Headers $headers
Write-Host "Grade Distribution for Section $sectionId :" -ForegroundColor Green
$distribution | Format-Table -HideTableHeaders | Out-String | Write-Host

# 5. Grade history audit trail
Write-Host "`n5. Grade History Audit Trail" -ForegroundColor Yellow
try {
    $history = Invoke-RestMethod -Uri "http://localhost:5253/api/grades/$testGradeId/history" -Headers $headers
    Write-Host "Found $($history.Count) history records for Grade $testGradeId." -ForegroundColor Green
    foreach ($h in $history) {
        Write-Host "- $($h.createdAt): $($h.changedBy) updated $($h.component) to $($h.newScore) (Reason: $($h.reason))" -ForegroundColor DarkGreen
    }
}
catch {
    Write-Host "History endpoint not fully implemented or accessible." -ForegroundColor Yellow
}

Write-Host "`n================ ALL TESTS COMPLETED ================" -ForegroundColor Cyan
