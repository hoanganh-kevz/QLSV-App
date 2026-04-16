using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentManagement.Core.DTOs.Grade;
using StudentManagement.Core.Entities;
using StudentManagement.Core.Interfaces.Services;
using StudentManagement.Infrastructure.Data;
using System.Security.Claims;

namespace StudentManagement.API.Controllers
{
    /// <summary>
    /// Controller quản lý điểm số.
    /// Cung cấp CRUD, batch operations, transcript và grade sheet.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class GradesController : ControllerBase
    {
        private readonly IGradeService _gradeService;
        private readonly AppDbContext _context;
        private readonly ILogger<GradesController> _logger;

        public GradesController(IGradeService gradeService, AppDbContext context, ILogger<GradesController> logger)
        {
            _gradeService = gradeService;
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Lấy tất cả điểm trong hệ thống.
        /// Frontend GradeEntryPage gọi GET /api/grades qua gradeService.getAllGrades().
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var grades = await _context.Grades
                    .Include(g => g.Student)
                    .Include(g => g.Subject)
                    .Select(g => new
                    {
                        gradeID = g.GradeID,
                        studentID = g.StudentID,
                        studentName = g.Student != null ? g.Student.FullName : "",
                        studentCode = g.Student != null ? g.Student.StudentCode : "",
                        subjectID = g.SubjectID,
                        subjectName = g.Subject != null ? g.Subject.SubjectName : "",
                        semester = g.Semester,
                        academicYear = g.AcademicYear,
                        attendanceScore = g.AttendanceScore,
                        midtermScore = g.MidtermScore,
                        finalScore = g.FinalScore,
                        totalScore = g.TotalScore,
                        letterGrade = g.LetterGrade,
                        gradePoint = g.GradePoint,
                        status = g.Status
                    })
                    .ToListAsync();

                return Ok(grades);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách điểm");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Lấy điểm theo sinh viên (bảng điểm / transcript).
        /// Frontend StudentTranscriptPage gọi GET /api/grades/student/{studentId}.
        /// </summary>
        [HttpGet("student/{studentId}")]
        public async Task<IActionResult> GetByStudent(string studentId)
        {
            try
            {
                // Kiểm tra quyền: sinh viên chỉ xem được bảng điểm của chính mình
                string? role = User.FindFirst(ClaimTypes.Role)?.Value;
                string? currentPersonId = User.FindFirst("PersonId")?.Value;

                if (role == "Student" && currentPersonId != studentId)
                    return Forbid();

                var grades = await _context.Grades
                    .Include(g => g.Subject)
                    .Where(g => g.StudentID == studentId)
                    .Select(g => new
                    {
                        gradeID = g.GradeID,
                        subjectID = g.SubjectID,
                        subjectCode = g.Subject != null ? g.Subject.SubjectCode : "",
                        subjectName = g.Subject != null ? g.Subject.SubjectName : "",
                        credits = g.Subject != null ? g.Subject.Credits : 0,
                        semester = g.Semester,
                        academicYear = g.AcademicYear,
                        attendanceScore = g.AttendanceScore,
                        midtermScore = g.MidtermScore,
                        finalScore = g.FinalScore,
                        totalScore = g.TotalScore,
                        letterGrade = g.LetterGrade,
                        gradePoint = g.GradePoint,
                        status = g.Status
                    })
                    .OrderBy(g => g.academicYear)
                    .ThenBy(g => g.semester)
                    .ToListAsync();

                return Ok(grades);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy bảng điểm sinh viên {StudentId}", studentId);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Lấy bảng điểm theo lớp (grade sheet).
        /// Frontend ClassGradeSheetPage gọi GET /api/grades/class?classId=&subjectId=.
        /// </summary>
        [HttpGet("class")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> GetByClass([FromQuery] string? classId, [FromQuery] string? subjectId)
        {
            try
            {
                IQueryable<Grade> query = _context.Grades
                    .Include(g => g.Student)
                    .Include(g => g.Subject);

                // Filter theo lớp (qua StudentID → Student.ClassID)
                if (!string.IsNullOrEmpty(classId))
                    query = query.Where(g => g.Student != null && g.Student.ClassID == classId);

                // Filter theo môn học
                if (!string.IsNullOrEmpty(subjectId))
                    query = query.Where(g => g.SubjectID == subjectId);

                var grades = await query
                    .Select(g => new
                    {
                        gradeID = g.GradeID,
                        studentID = g.StudentID,
                        studentCode = g.Student != null ? g.Student.StudentCode : "",
                        studentName = g.Student != null ? g.Student.FullName : "",
                        subjectID = g.SubjectID,
                        subjectName = g.Subject != null ? g.Subject.SubjectName : "",
                        attendanceScore = g.AttendanceScore,
                        midtermScore = g.MidtermScore,
                        finalScore = g.FinalScore,
                        totalScore = g.TotalScore,
                        letterGrade = g.LetterGrade,
                        status = g.Status
                    })
                    .ToListAsync();

                return Ok(grades);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy bảng điểm theo lớp");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Cập nhật toàn bộ thông tin điểm.
        /// Frontend gradeService.updateGrade gọi PUT /api/grades/{id}.
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> Update(string id, [FromBody] UpdateGradeRequest request)
        {
            try
            {
                Grade? grade = await _context.Grades.FindAsync(id);
                if (grade == null)
                    return NotFound(new { message = "Grade not found" });

                string? userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                // Cập nhật điểm thành phần
                if (request.AttendanceScore.HasValue)
                    grade.UpdateComponent("attendance", request.AttendanceScore.Value, userId ?? "system");
                if (request.MidtermScore.HasValue)
                    grade.UpdateComponent("midterm", request.MidtermScore.Value, userId ?? "system");
                if (request.FinalScore.HasValue)
                    grade.UpdateComponent("final", request.FinalScore.Value, userId ?? "system");

                await _context.SaveChangesAsync();

                return Ok(new { message = "Grade updated successfully", gradeID = grade.GradeID });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật điểm {GradeId}", id);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Get grades by section (for teachers)
        /// </summary>
        [HttpGet("section/{sectionId}")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<ActionResult<List<GradeDto>>> GetBySection(string sectionId)
        {
            try
            {
                List<GradeDto> grades = await _gradeService.GetBySectionAsync(sectionId);
                return Ok(grades);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting grades for section {sectionId}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Get student transcript
        /// </summary>
        [HttpGet("transcript/{studentId}")]
        public async Task<ActionResult<TranscriptDto>> GetTranscript(string studentId)
        {
            try
            {
                // Students can only view their own transcript
                string? role = User.FindFirst(ClaimTypes.Role)?.Value;
                string? currentUserId = User.FindFirst("PersonId")?.Value;
                
                if (role == "Student" && currentUserId != studentId)
                    return Forbid();

                TranscriptDto transcript = await _gradeService.GetTranscriptAsync(studentId);
                return Ok(transcript);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting transcript for student {studentId}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Create grade for enrollment
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<ActionResult<GradeDto>> Create([FromBody] CreateGradeDto createDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                string? userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                GradeDto grade = await _gradeService.CreateAsync(createDto, userId);
                return CreatedAtAction(nameof(GetById), new { id = grade.GradeID }, grade);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating grade");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Update grade component (attendance, midterm, final)
        /// </summary>
        [HttpPatch("{id}/component")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<ActionResult<GradeDto>> UpdateComponent(
            string id, 
            [FromBody] UpdateGradeComponentDto updateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                string? userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                GradeDto grade = await _gradeService.UpdateComponentAsync(id, updateDto, userId);
                return Ok(grade);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating grade {id}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Get grade distribution for section
        /// </summary>
        [HttpGet("section/{sectionId}/distribution")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<ActionResult<Dictionary<string, int>>> GetDistribution(string sectionId)
        {
            try
            {
                Dictionary<string, int> distribution = await _gradeService.GetGradeDistributionAsync(sectionId);
                return Ok(distribution);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting grade distribution for section {sectionId}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Get grade history (audit log)
        /// </summary>
        [HttpGet("{id}/history")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<GradeHistory>>> GetHistory(string id)
        {
            try
            {
                List<GradeHistory> history = await _gradeService.GetGradeHistoryAsync(id);
                return Ok(history);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting grade history for {id}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<GradeDto>> GetById(string id)
        {
            GradeDto grade = await _gradeService.GetByIdAsync(id);
            if (grade == null)
                return NotFound();
            return Ok(grade);
        }

        /// <summary>
        /// Delete a grade
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                bool success = await _gradeService.DeleteAsync(id);
                if (!success)
                    return NotFound(new { message = "Grade not found" });

                return Ok(new { message = "Grade deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting grade {GradeId}", id);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Batch create/update grades for a section
        /// </summary>
        [HttpPost("batch")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<ActionResult> BatchCreate([FromBody] FrontendBatchGradeDto batchDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                string? userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "system";
                int count = 0;

                foreach (var gDto in batchDto.Grades)
                {
                    // Find if grade exists
                    Grade? grade = null;
                    if (!string.IsNullOrEmpty(gDto.GradeID))
                    {
                        grade = await _context.Grades.FindAsync(gDto.GradeID);
                    }
                    else
                    {
                        grade = await _context.Grades.FirstOrDefaultAsync(g => 
                            g.StudentID == gDto.StudentID && g.SubjectID == gDto.SubjectCode && g.Semester == gDto.Semester);
                    }

                    if (grade != null)
                    {
                        // Update
                        if (gDto.AttendanceScore.HasValue) grade.UpdateComponent("attendance", gDto.AttendanceScore.Value, userId);
                        if (gDto.MidtermScore.HasValue) grade.UpdateComponent("midterm", gDto.MidtermScore.Value, userId);
                        if (gDto.FinalScore.HasValue) grade.UpdateComponent("final", gDto.FinalScore.Value, userId);
                    }
                    else
                    {
                        // Needs a valid EnrollmentID. Lookup if one exists for student and class/subject
                        var enrollment = await _context.Enrollments.FirstOrDefaultAsync(e => e.StudentID == gDto.StudentID);
                        string tempEnrollId = enrollment?.EnrollmentID ?? "ENR_TEMP_" + Guid.NewGuid().ToString().Substring(0,8);
                        
                        // Create
                        grade = new Grade
                        {
                            EnrollmentID = tempEnrollId,
                            StudentID = gDto.StudentID,
                            SubjectID = gDto.SubjectCode,
                            Semester = gDto.Semester,
                            AcademicYear = $"{DateTime.Now.Year}-{DateTime.Now.Year + 1}",
                            AttendanceScore = gDto.AttendanceScore,
                            MidtermScore = gDto.MidtermScore,
                            FinalScore = gDto.FinalScore
                        };
                        grade.CalculateTotalScore();
                        _context.Grades.Add(grade);
                    }
                    count++;
                }
                
                await _context.SaveChangesAsync();

                return Ok(new { message = $"Successfully processed {count} grades", success = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in batch grade creation");
                return StatusCode(500, new { message = "Batch grade creation failed" });
            }
        }
    }

    public class FrontendBatchGradeDto
    {
        public List<FrontendGradeItemDto> Grades { get; set; } = new();
    }

    public class FrontendGradeItemDto
    {
        public string? GradeID { get; set; }
        public string StudentID { get; set; } = string.Empty;
        public string SubjectCode { get; set; } = string.Empty;
        public int Semester { get; set; }
        public decimal? AttendanceScore { get; set; }
        public decimal? MidtermScore { get; set; }
        public decimal? FinalScore { get; set; }
    }
}