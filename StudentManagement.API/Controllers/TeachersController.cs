using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Core.DTOs.Teacher;
using StudentManagement.Core.Interfaces.Services;

namespace StudentManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TeachersController : ControllerBase
    {
        private readonly ITeacherService _teacherService;
        private readonly ILogger<TeachersController> _logger;

        public TeachersController(ITeacherService teacherService, ILogger<TeachersController> logger)
        {
            _teacherService = teacherService;
            _logger = logger;
        }

        /// <summary>
        /// Get all teachers
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<TeacherListDto>>> GetAll()
        {
            try
            {
                List<TeacherListDto> teachers = await _teacherService.GetAllAsync();
                return Ok(teachers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting teachers");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Get teacher by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<TeacherDto>> GetById(string id)
        {
            try
            {
                TeacherDto teacher = await _teacherService.GetByIdAsync(id);
                return Ok(teacher);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting teacher {id}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Get teacher by code
        /// </summary>
        [HttpGet("code/{code}")]
        public async Task<ActionResult<TeacherDto>> GetByCode(string code)
        {
            try
            {
                TeacherDto teacher = await _teacherService.GetByCodeAsync(code);
                return Ok(teacher);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting teacher with code {code}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Get teachers by department
        /// </summary>
        [HttpGet("department/{departmentId}")]
        public async Task<ActionResult<List<TeacherListDto>>> GetByDepartment(string departmentId)
        {
            try
            {
                List<TeacherListDto> teachers = await _teacherService.GetByDepartmentAsync(departmentId);
                return Ok(teachers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting teachers for department {departmentId}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Create new teacher
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<TeacherDto>> Create([FromBody] CreateTeacherDto createDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                TeacherDto teacher = await _teacherService.CreateAsync(createDto);
                return CreatedAtAction(nameof(GetById), new { id = teacher.TeacherID }, teacher);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating teacher");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Update teacher
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<TeacherDto>> Update(string id, [FromBody] UpdateTeacherDto updateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                TeacherDto teacher = await _teacherService.UpdateAsync(id, updateDto);
                return Ok(teacher);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating teacher {id}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Delete teacher
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                bool success = await _teacherService.DeleteAsync(id);

                if (!success)
                    return NotFound(new { message = "Teacher not found" });

                return Ok(new { message = "Teacher deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting teacher {id}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
    }
}
