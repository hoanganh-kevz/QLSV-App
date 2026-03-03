using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Core.DTOs.Student;
using StudentManagement.Core.Interfaces.Services;

namespace StudentManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class StudentsController : ControllerBase
    {
        private readonly IStudentService _studentService;
        private readonly ILogger<StudentsController> _logger;

        public StudentsController(IStudentService studentService, ILogger<StudentsController> logger)
        {
            _studentService = studentService;
            _logger = logger;
        }

        /// <summary>
        /// Get all students with pagination and filtering
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<ActionResult<PagedStudentResult>> GetAll([FromQuery] StudentSearchDto searchDto)
        {
            try
            {
                PagedStudentResult result = await _studentService.GetAllAsync(searchDto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting students");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Get student by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<StudentDto>> GetById(string id)
        {
            try
            {
                StudentDto student = await _studentService.GetByIdAsync(id);
                return Ok(student);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting student {id}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Get student by code
        /// </summary>
        [HttpGet("code/{code}")]
        public async Task<ActionResult<StudentDto>> GetByCode(string code)
        {
            try
            {
                StudentDto student = await _studentService.GetByCodeAsync(code);
                return Ok(student);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting student with code {code}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Get students by class
        /// </summary>
        [HttpGet("class/{classId}")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<ActionResult<List<StudentListDto>>> GetByClass(string classId)
        {
            try
            {
                List<StudentListDto> students = await _studentService.GetByClassAsync(classId);
                return Ok(students);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting students for class {classId}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Get top students by GPA
        /// </summary>
        [HttpGet("top")]
        public async Task<ActionResult<List<StudentListDto>>> GetTopStudents([FromQuery] int limit = 10)
        {
            try
            {
                List<StudentListDto> students = await _studentService.GetTopStudentsAsync(limit);
                return Ok(students);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting top students");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Create new student
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<StudentDto>> Create([FromBody] CreateStudentDto createDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                StudentDto student = await _studentService.CreateAsync(createDto);
                return CreatedAtAction(nameof(GetById), new { id = student.StudentID }, student);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating student");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Check if student code exists
        /// </summary>
        [HttpGet("exists/{code}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<bool>> CheckExists(string code)
        {
            try
            {
                bool exists = await _studentService.ExistsAsync(code);
                return Ok(new { exists });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error checking student code {code}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

                /// <summary>
        /// Update student information
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<StudentDto>> Update(string id, [FromBody] UpdateStudentDto updateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                StudentDto student = await _studentService.UpdateAsync(id, updateDto);
                return Ok(student);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating student {id}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Update student avatar
        /// </summary>
        [HttpPatch("{id}/avatar")]
        public async Task<IActionResult> UpdateAvatar(string id, [FromBody] UpdateAvatarDto avatarDto)
        {
            try
            {
                bool success = await _studentService.UpdateAvatarAsync(id, avatarDto.AvatarUrl);
                
                if (!success)
                    return NotFound(new { message = "Student not found" });

                return Ok(new { message = "Avatar updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating avatar for student {id}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Change student class
        /// </summary>
        [HttpPatch("{id}/change-class")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<StudentDto>> ChangeClass(string id, [FromBody] ChangeClassDto classDto)
        {
            try
            {
                StudentDto student = await _studentService.ChangeClassAsync(id, classDto.NewClassID);
                return Ok(student);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error changing class for student {id}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

         /// <summary>
        /// Delete student
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                bool success = await _studentService.DeleteAsync(id);
                
                if (!success)
                    return NotFound(new { message = "Student not found" });

                return Ok(new { message = "Student deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting student {id}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
    }

    // Helper DTOs
    public class UpdateAvatarDto
    {
        public string AvatarUrl { get; set; } = string.Empty;
    }

    public class ChangeClassDto
    {
        public string NewClassID { get; set; } = string.Empty;
    }
}