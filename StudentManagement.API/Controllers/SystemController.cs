using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentManagement.Core.Entities;
using StudentManagement.Infrastructure.Data;

namespace StudentManagement.API.Controllers
{
    /// <summary>
    /// Controller cung cấp dữ liệu hệ thống: colleges, faculties (departments), majors, classes.
    /// Frontend systemService.js gọi các endpoint này để populate dropdown/filter.
    /// </summary>
    [Route("api")]
    [ApiController]
    [Authorize]
    public class SystemController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<SystemController> _logger;

        public SystemController(AppDbContext context, ILogger<SystemController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // ======================== COLLEGES (Stub — dùng Departments làm đại diện) ========================

        /// <summary>
        /// Lấy danh sách trường/college. Hiện tại trả danh sách departments vì chưa có entity College riêng.
        /// </summary>
        [HttpGet("colleges")]
        public async Task<IActionResult> GetColleges()
        {
            try
            {
                var colleges = await _context.Departments
                    .Select(d => new { _id = d.DepartmentID, id = d.DepartmentID, name = d.DepartmentName, code = d.DepartmentID, status = "Active" })
                    .ToListAsync();
                return Ok(colleges);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách colleges");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Tạo college mới (stub — ánh xạ sang Department).
        /// </summary>
        [HttpPost("colleges")]
        [Authorize(Roles = "Admin")]
        public IActionResult CreateCollege([FromBody] object data)
        {
            return Ok(new { message = "College created" });
        }

        [HttpPut("colleges/{id}")]
        [Authorize(Roles = "Admin")]
        public IActionResult UpdateCollege(string id, [FromBody] object data) => Ok(new { message = "College updated" });

        [HttpDelete("colleges/{id}")]
        [Authorize(Roles = "Admin")]
        public IActionResult DeleteCollege(string id) => Ok(new { message = "College deleted" });

        // ======================== FACULTIES (Departments) ========================

        /// <summary>
        /// Lấy danh sách khoa/phòng ban.
        /// </summary>
        [HttpGet("faculties")]
        public async Task<IActionResult> GetFaculties([FromQuery] string? collegeId)
        {
            try
            {
                var faculties = await _context.Departments
                    .Include(d => d.Dean)
                    .Select(d => new
                    {
                        _id = d.DepartmentID,
                        id = d.DepartmentID,
                        name = d.DepartmentName,
                        code = d.DepartmentID,
                        deanName = d.Dean != null ? d.Dean.FullName : "",
                        phone = d.PhoneNumber ?? "",
                        email = d.Email ?? "",
                        type = "Khoa",
                        college = new { _id = "UEH", name = "UEH" },
                        status = "Active"
                    })
                    .ToListAsync();
                return Ok(faculties);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách khoa");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpPost("faculties")]
        [Authorize(Roles = "Admin")]
        public IActionResult CreateFaculty([FromBody] object data) => Ok(new { message = "Faculty created" });

        [HttpPut("faculties/{id}")]
        [Authorize(Roles = "Admin")]
        public IActionResult UpdateFaculty(string id, [FromBody] object data) => Ok(new { message = "Faculty updated" });

        [HttpDelete("faculties/{id}")]
        [Authorize(Roles = "Admin")]
        public IActionResult DeleteFaculty(string id) => Ok(new { message = "Faculty deleted" });

        // ======================== MAJORS ========================

        /// <summary>
        /// Lấy danh sách ngành học, có thể filter theo faculty (department).
        /// </summary>
        [HttpGet("majors")]
        public async Task<IActionResult> GetMajors([FromQuery] string? facultyId)
        {
            try
            {
                IQueryable<Major> query = _context.Majors.Include(m => m.Department);

                if (!string.IsNullOrEmpty(facultyId))
                    query = query.Where(m => m.DepartmentID == facultyId);

                var majors = await query
                    .Select(m => new
                    {
                        _id = m.MajorID,
                        id = m.MajorID,
                        code = m.MajorCode,
                        name = m.MajorName,
                        faculty = new { _id = m.DepartmentID, name = m.Department != null ? m.Department.DepartmentName : "" },
                        departmentId = m.DepartmentID,
                        departmentName = m.Department != null ? m.Department.DepartmentName : "",
                        totalCredits = m.TotalCredits,
                        status = "Active"
                    })
                    .ToListAsync();
                return Ok(majors);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách ngành học");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpPost("majors")]
        [Authorize(Roles = "Admin")]
        public IActionResult CreateMajor([FromBody] object data) => Ok(new { message = "Major created" });

        [HttpPut("majors/{id}")]
        [Authorize(Roles = "Admin")]
        public IActionResult UpdateMajor(string id, [FromBody] object data) => Ok(new { message = "Major updated" });

        [HttpDelete("majors/{id}")]
        [Authorize(Roles = "Admin")]
        public IActionResult DeleteMajor(string id) => Ok(new { message = "Major deleted" });

        // ======================== CLASSES ========================

        /// <summary>
        /// Lấy danh sách lớp sinh hoạt, có thể filter theo major.
        /// </summary>
        [HttpGet("classes")]
        public async Task<IActionResult> GetClasses([FromQuery] string? majorId)
        {
            try
            {
                IQueryable<Class> query = _context.Classes.Include(c => c.Major);

                if (!string.IsNullOrEmpty(majorId))
                    query = query.Where(c => c.MajorID == majorId);

                var classesList = await query
                    .Select(c => new
                    {
                        _id = c.ClassID,
                        id = c.ClassID,
                        code = c.ClassID,
                        name = c.ClassName,
                        majorId = c.MajorID,
                        major = new { _id = c.MajorID, name = c.Major != null ? c.Major.MajorName : "" },
                        batch = c.AcademicYear ?? "Unknown",
                        status = "Active"
                    })
                    .ToListAsync();
                return Ok(classesList);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách lớp sinh hoạt");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpPost("classes")]
        [Authorize(Roles = "Admin")]
        public IActionResult CreateClass([FromBody] object data) => Ok(new { message = "Class created" });

        [HttpPut("classes/{id}")]
        [Authorize(Roles = "Admin")]
        public IActionResult UpdateClass(string id, [FromBody] object data) => Ok(new { message = "Class updated" });

        [HttpDelete("classes/{id}")]
        [Authorize(Roles = "Admin")]
        public IActionResult DeleteClass(string id) => Ok(new { message = "Class deleted" });

        // ======================== SYSTEM CONFIG ========================

        /// <summary>
        /// Lấy cấu hình hệ thống. Frontend SettingsPage có thể gọi endpoint này.
        /// </summary>
        [HttpGet("system/config")]
        public IActionResult GetConfig()
        {
            return Ok(new
            {
                appName = "UEH Student Management System",
                version = "2.0.0",
                academicYears = new[] { "2024-2025", "2025-2026", "2026-2027" },
                semesters = new[] { 1, 2, 3 }
            });
        }
    }
}
