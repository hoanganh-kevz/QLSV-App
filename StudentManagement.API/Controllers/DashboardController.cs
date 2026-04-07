using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Core.DTOs.Dashboard;
using StudentManagement.Core.DTOs.Student;
using StudentManagement.Core.Interfaces.Services;

namespace StudentManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;
        private readonly IStudentService _studentService;

        public DashboardController(
            IDashboardService dashboardService,
            IStudentService studentService)
        {
            _dashboardService = dashboardService;
            _studentService = studentService;
        }

        /// <summary>
        /// Get all dashboard statistics
        /// </summary>
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            DashboardStatsDto stats = await _dashboardService.GetAdvancedStatsAsync();
            return Ok(stats);
        }

        /// <summary>
        /// Get grade distribution (pie chart data)
        /// </summary>
        [HttpGet("grade-distribution")]
        public async Task<IActionResult> GetGradeDistribution()
        {
            DashboardStatsDto stats = await _dashboardService.GetAdvancedStatsAsync();
            return Ok(stats.GradeDistribution);
        }

        /// <summary>
        /// Get top students by GPA (leaderboard)
        /// </summary>
        [HttpGet("top-students")]
        public async Task<ActionResult<List<StudentListDto>>> GetTopStudents([FromQuery] int limit = 10)
        {
            List<StudentListDto> topStudents = await _studentService.GetTopStudentsAsync(limit);
            return Ok(topStudents);
        }

        /// <summary>
        /// Get class performance (average GPA by class)
        /// </summary>
        [HttpGet("class-performance")]
        public async Task<IActionResult> GetClassPerformance()
        {
            DashboardStatsDto stats = await _dashboardService.GetAdvancedStatsAsync();
            return Ok(stats.TopPerformingClasses);
        }
    }
}