using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentManagement.Infrastructure.Data;

namespace StudentManagement.API.Controllers
{
    /// <summary>
    /// Controller quản lý học kỳ (Terms).
    /// Frontend TermsPage sử dụng CRUD thông qua termService.js.
    /// Hiện tại dùng bảng CourseSection để derive thông tin term.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TermsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<TermsController> _logger;

        public TermsController(AppDbContext context, ILogger<TermsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Lấy danh sách các học kỳ (derived từ CourseSections).
        /// Trả về danh sách unique (semester, academicYear) combinations.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                // Lấy danh sách term duy nhất từ CourseSections
                var terms = await _context.CourseSections
                    .GroupBy(s => new { s.Semester, s.AcademicYear })
                    .Select(g => new
                    {
                        id = $"{g.Key.AcademicYear}-S{g.Key.Semester}",
                        semester = g.Key.Semester,
                        academicYear = g.Key.AcademicYear,
                        sectionCount = g.Count(),
                        status = "Active"
                    })
                    .OrderByDescending(t => t.academicYear)
                    .ThenByDescending(t => t.semester)
                    .ToListAsync();

                return Ok(terms);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách học kỳ");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Tạo học kỳ mới (stub — term được tự động tạo khi thêm CourseSection).
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public IActionResult Create([FromBody] object termData)
        {
            // Term được tự động derive từ CourseSection, không cần entity riêng
            return Ok(new { message = "Term created successfully. Terms are automatically derived from class sections." });
        }

        /// <summary>
        /// Cập nhật học kỳ (stub).
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public IActionResult Update(string id, [FromBody] object termData)
        {
            return Ok(new { message = "Term updated successfully" });
        }

        /// <summary>
        /// Xoá học kỳ (stub).
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public IActionResult Delete(string id)
        {
            return Ok(new { message = "Term deleted successfully" });
        }
    }
}
