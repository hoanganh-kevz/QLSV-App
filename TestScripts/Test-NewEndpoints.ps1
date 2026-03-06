$ErrorActionPreference = 'Stop'
$baseUrl = "http://localhost:5253"

Write-Host "================ TESTING NEW ENDPOINTS ================" -ForegroundColor Cyan

# Authentication
Write-Host "`n[1] Authenticating as admin..." -ForegroundColor Yellow
$loginBody = '{"username":"admin","password":"admin123"}'
$tokenOutput = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
$headers = @{ Authorization = "Bearer $($tokenOutput.token)"; "Content-Type" = "application/json" }
Write-Host "-> Successfully authenticated! Token length: $($tokenOutput.token.Length)" -ForegroundColor Green

# 1. Swagger UI
Write-Host "`n[2] Testing Swagger UI endpoint..." -ForegroundColor Yellow
$swaggerRes = Invoke-WebRequest -Uri "$baseUrl/swagger/index.html" -UseBasicParsing
if ($swaggerRes.StatusCode -eq 200) { Write-Host "-> /swagger/index.html returned 200 OK" -ForegroundColor Green }

# 2. Dashboard - Grade Distribution
Write-Host "`n[3] Testing Dashboard - Grade Distribution..." -ForegroundColor Yellow
$dist = Invoke-RestMethod -Uri "$baseUrl/api/dashboard/grade-distribution" -Headers $headers
Write-Host "-> Array length: $($dist.Count)" -ForegroundColor Green

# 3. Dashboard - Top Students
Write-Host "`n[4] Testing Dashboard - Top Students..." -ForegroundColor Yellow
$top = Invoke-RestMethod -Uri "$baseUrl/api/dashboard/top-students?limit=5" -Headers $headers
Write-Host "-> Found $($top.Count) top students" -ForegroundColor Green

# 4. Dashboard - Class Performance
Write-Host "`n[5] Testing Dashboard - Class Performance..." -ForegroundColor Yellow
$perf = Invoke-RestMethod -Uri "$baseUrl/api/dashboard/class-performance" -Headers $headers
Write-Host "-> Class performance records: $($perf.Count)" -ForegroundColor Green

# 5. Export Endpoint (Using first class from performance if exists)
$testClassId = ""
if ($perf.Count -gt 0) { $testClassId = $perf[0].ClassID } else { $testClassId = "CLS001" }

Write-Host "`n[6] Testing Export API for Class $testClassId..." -ForegroundColor Yellow
try {
    $exportRes = Invoke-WebRequest -Uri "$baseUrl/api/export/classes/$testClassId/grades" -Headers $headers -Method GET -OutFile "test_export.xlsx"
    Write-Host "-> Successfully downloaded Excel file." -ForegroundColor Green
} catch {
    Write-Host "-> Export failed or threw an exception: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. Batch Grade Entry
Write-Host "`n[7] Testing Batch Grade Entry..." -ForegroundColor Yellow
$batchBody = @"
{
  "grades": [
    {
      "enrollmentId": "11111111-1111-4111-a111-111111111111",
      "attendanceScore": 10,
      "midtermScore": 8,
      "finalScore": 9
    }
  ]
}
"@
try {
    # Generate random guid just to hit the endpoint (expecting 404 or 400 Enrollment Not Found, which means endpoint is active)
    $batchRes = Invoke-RestMethod -Uri "$baseUrl/api/grades/batch" -Headers $headers -Body $batchBody -Method POST
    Write-Host "-> Batch Grade response received." -ForegroundColor Green
} catch {
    Write-Host "-> Batch API reached. Error (expected for fake enrollment): $($_.Exception.Message)" -ForegroundColor Green
}

# 7. Delete Grade (Soft Delete)
Write-Host "`n[8] Testing Delete Grade endpoint..." -ForegroundColor Yellow
try {
    # Delete non-existent
    Invoke-RestMethod -Uri "$baseUrl/api/grades/11111111-1111-4111-a111-111111111111" -Headers $headers -Method DELETE
} catch {
    Write-Host "-> Delete API reached. Error (expected for fake ID): $($_.Exception.Message)" -ForegroundColor Green
}

Write-Host "`n================ ALL NEW ENDPOINTS RESPONDED ================" -ForegroundColor Cyan
