using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentManagement.Infrastructure.Data;
using StudentManagement.Core.Entities;

namespace StudentManagement.API.Controllers
{
    /// <summary>
    /// Controller quản lý lớp học phần (CourseSection).
    /// Cung cấp CRUD và chức năng đăng ký/hủy đăng ký sinh viên vào lớp học phần.
    /// </summary>
    [Route("api/class-sections")]
    [ApiController]
    [Authorize]
    public class ClassSectionsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<ClassSectionsController> _logger;

        public ClassSectionsController(AppDbContext context, ILogger<ClassSectionsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Lấy tất cả lớp học phần, bao gồm thông tin môn học, giảng viên và số sinh viên đã đăng ký.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var sections = await _context.CourseSections
                    .Include(s => s.Subject)
                    .Include(s => s.Teacher)
                    .Include(s => s.Enrollments)
                    .ToListAsync();

                var result = sections.Select(s => new
                {
                    _id = s.SectionID,
                    id = s.SectionID,
                    code = s.SectionID,
                    subjectId = s.SubjectID,
                    subject = new {
                        _id = s.SubjectID,
                        id = s.SubjectID,
                        code = s.Subject != null ? s.Subject.SubjectCode : "",
                        name = s.Subject != null ? s.Subject.SubjectName : "",
                        credits = s.Subject != null ? s.Subject.Credits : 0
                    },
                    teacherId = s.TeacherID,
                    teacher = new {
                        _id = s.TeacherID,
                        fullName = s.Teacher != null ? s.Teacher.FullName : ""
                    },
                    semester = s.Semester,
                    term = new { _id = s.Semester.ToString(), id = s.Semester.ToString(), code = "HK" + s.Semester, name = "Học kỳ " + s.Semester },
                    academicYear = s.AcademicYear,
                    schedule = !string.IsNullOrEmpty(s.Schedule) 
                        ? System.Text.Json.JsonSerializer.Deserialize<List<object>>(s.Schedule, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true }) 
                        : new List<object>(),
                    room = s.RoomID ?? "",
                    maxStudents = s.MaxStudents,
                    enrolledCount = s.Enrollments.Count(e => e.Status != "Dropped"),
                    phase = 0,
                    teachingMethod = "Tập trung",
                    language = "Tiếng Việt",
                    status = s.Status
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách lớp học phần");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Tạo lớp học phần mới.
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CreateSectionRequest request)
        {
            try
            {
                CourseSection section = new CourseSection
                {
                    SubjectID = request.Subject ?? request.SubjectId,
                    TeacherID = request.Teacher ?? request.TeacherId,
                    Semester = request.Term != null && int.TryParse(request.Term.Replace("HK", ""), out int sem) ? sem : request.Semester,
                    AcademicYear = !string.IsNullOrEmpty(request.AcademicYear) ? request.AcademicYear : "2024-2025",
                    Schedule = request.Schedule != null ? System.Text.Json.JsonSerializer.Serialize(request.Schedule) : request.ScheduleStr,
                    RoomID = request.Room,
                    MaxStudents = request.MaxStudents > 0 ? request.MaxStudents : 50,
                    Status = !string.IsNullOrEmpty(request.Status) ? request.Status : "Open"
                };

                _context.CourseSections.Add(section);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Đã tạo lớp học phần mới: {SectionId}", section.SectionID);
                return CreatedAtAction(nameof(GetAll), new { id = section.SectionID }, section);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo lớp học phần");
                return StatusCode(500, new { message = "Failed to create class section" });
            }
        }

        /// <summary>
        /// Cập nhật thông tin lớp học phần.
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(string id, [FromBody] CreateSectionRequest request)
        {
            try
            {
                CourseSection? section = await _context.CourseSections.FindAsync(id);
                if (section == null)
                    return NotFound(new { message = "Class section not found" });

                section.SubjectID = request.Subject ?? request.SubjectId ?? section.SubjectID;
                if (!string.IsNullOrEmpty(request.Teacher ?? request.TeacherId)) section.TeacherID = request.Teacher ?? request.TeacherId;
                section.Semester = request.Term != null && int.TryParse(request.Term.Replace("HK", ""), out int sem) ? sem : request.Semester > 0 ? request.Semester : section.Semester;
                if (!string.IsNullOrEmpty(request.AcademicYear)) section.AcademicYear = request.AcademicYear;
                if (request.Schedule != null) section.Schedule = System.Text.Json.JsonSerializer.Serialize(request.Schedule);
                else if (request.ScheduleStr != null) section.Schedule = request.ScheduleStr;
                if (request.Room != null) section.RoomID = request.Room;
                section.MaxStudents = request.MaxStudents > 0 ? request.MaxStudents : section.MaxStudents;
                if (!string.IsNullOrEmpty(request.Status)) section.Status = request.Status;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Đã cập nhật lớp học phần: {SectionId}", id);
                return Ok(section);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật lớp học phần {SectionId}", id);
                return StatusCode(500, new { message = "Failed to update class section" });
            }
        }

        /// <summary>
        /// Xoá lớp học phần.
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                CourseSection? section = await _context.CourseSections.FindAsync(id);
                if (section == null)
                    return NotFound(new { message = "Class section not found" });

                _context.CourseSections.Remove(section);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Đã xoá lớp học phần: {SectionId}", id);
                return Ok(new { message = "Class section deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xoá lớp học phần {SectionId}", id);
                return StatusCode(500, new { message = "Failed to delete class section" });
            }
        }

        /// <summary>
        /// Đăng ký sinh viên vào lớp học phần.
        /// Kiểm tra lớp chưa đầy và sinh viên chưa đăng ký trước đó.
        /// </summary>
        [HttpPost("{sectionId}/enroll")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> Enroll(string sectionId, [FromBody] EnrollRequest request)
        {
            try
            {
                CourseSection? section = await _context.CourseSections
                    .Include(s => s.Enrollments)
                    .FirstOrDefaultAsync(s => s.SectionID == sectionId);

                if (section == null)
                    return NotFound(new { message = "Class section not found" });

                if (!section.CanEnroll())
                    return BadRequest(new { message = "Class section is full or not open for enrollment" });

                // Kiểm tra sinh viên đã đăng ký chưa
                bool alreadyEnrolled = section.Enrollments
                    .Any(e => e.StudentID == request.StudentId && e.Status != "Dropped");

                if (alreadyEnrolled)
                    return BadRequest(new { message = "Student is already enrolled in this section" });

                Enrollment enrollment = new Enrollment
                {
                    StudentID = request.StudentId,
                    SectionID = sectionId,
                    Status = "Registered"
                };

                _context.Enrollments.Add(enrollment);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Sinh viên {StudentId} đã đăng ký vào lớp học phần {SectionId}",
                    request.StudentId, sectionId);
                return Ok(new { message = "Student enrolled successfully", enrollmentId = enrollment.EnrollmentID });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi đăng ký sinh viên vào lớp học phần {SectionId}", sectionId);
                return StatusCode(500, new { message = "Failed to enroll student" });
            }
        }

        /// <summary>
        /// Hủy đăng ký sinh viên khỏi lớp học phần (đánh dấu Dropped, không xoá record).
        /// </summary>
        [HttpPost("{sectionId}/unenroll")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> Unenroll(string sectionId, [FromBody] EnrollRequest request)
        {
            try
            {
                Enrollment? enrollment = await _context.Enrollments
                    .FirstOrDefaultAsync(e => e.SectionID == sectionId
                                           && e.StudentID == request.StudentId
                                           && e.Status != "Dropped");

                if (enrollment == null)
                    return NotFound(new { message = "Enrollment not found" });

                enrollment.Status = "Dropped";
                await _context.SaveChangesAsync();

                _logger.LogInformation("Sinh viên {StudentId} đã hủy đăng ký khỏi lớp học phần {SectionId}",
                    request.StudentId, sectionId);
                return Ok(new { message = "Student unenrolled successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi hủy đăng ký sinh viên khỏi lớp học phần {SectionId}", sectionId);
                return StatusCode(500, new { message = "Failed to unenroll student" });
            }
        }
    }

    /// <summary>
    /// Request body để tạo/cập nhật lớp học phần.
    /// </summary>
    public class CreateSectionRequest
    {
        public string? SubjectId { get; set; }
        public string? Subject { get; set; }
        public string? TeacherId { get; set; }
        public string? Teacher { get; set; }
        public int Semester { get; set; }
        public string? Term { get; set; }
        public string? AcademicYear { get; set; }
        public string? ScheduleStr { get; set; }
        public List<object>? Schedule { get; set; }
        public string? Room { get; set; }
        public int MaxStudents { get; set; } = 40;
        public string? Status { get; set; }
        public List<string>? TargetClasses { get; set; }
        public int Phase { get; set; }
        public string? TeachingMethod { get; set; }
        public string? Language { get; set; }
    }

    /// <summary>
    /// Request body để đăng ký/hủy đăng ký sinh viên.
    /// </summary>
    public class EnrollRequest
    {
        public string StudentId { get; set; } = string.Empty;
    }
}
