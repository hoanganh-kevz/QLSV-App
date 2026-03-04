$ErrorActionPreference = 'Stop'

# Fetch Token
$tokenOutput = Invoke-RestMethod -Uri "http://localhost:5253/api/auth/login" -Method POST -ContentType "application/json" -Body '{"username":"admin","password":"admin123"}'
$headers = @{ Authorization = "Bearer $($tokenOutput.token)"; "Content-Type" = "application/json" }

Write-Host "================ PERFORMANCE BENCHMARKS (10,000+ Records) ================" -ForegroundColor Cyan

# 1. Dashboard Stats
Write-Host "1. Testing Dashboard Stats API..."
$dashTime = Measure-Command {
    $stats = Invoke-RestMethod -Uri "http://localhost:5253/api/dashboard/stats" -Headers $headers
}
Write-Host "-> Dashboard Stats Loaded in: $($dashTime.TotalMilliseconds) ms" -ForegroundColor Green
Write-Host "   (Students: $($stats.totalStudents), Overall GPA: $($stats.averageSystemGPA))" -ForegroundColor DarkGray

# 2. Get Student List Endpoint
Write-Host "`n2. Testing Students List API..."
$studentsTime = Measure-Command {
    $students = Invoke-RestMethod -Uri "http://localhost:5253/api/students?pageSize=50" -Headers $headers
}
Write-Host "-> Paginated Students List (50 items) Loaded in: $($studentsTime.TotalMilliseconds) ms" -ForegroundColor Green

# 3. Get Student Transcript
# Find a valid student ID to test transcript
$sampleStudent = $students.students[0].studentID

Write-Host "`n3. Testing Transcript Generation API..."
$transcriptTime = Measure-Command {
    $transcript = Invoke-RestMethod -Uri "http://localhost:5253/api/grades/transcript/$sampleStudent" -Headers $headers
}
Write-Host "-> Transcript Loaded in: $($transcriptTime.TotalMilliseconds) ms" -ForegroundColor Green
Write-Host "   (Total Credits Calculated: $($transcript.totalCredits))" -ForegroundColor DarkGray

Write-Host "`n================ ALL BENCHMARKS COMPLETED ================" -ForegroundColor Cyan
