using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Core.DTOs.Class;
using StudentManagement.Core.DTOs.Student;
using StudentManagement.Core.Interfaces.Services;

namespace StudentManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ClassesController : ControllerBase
    {
        private readonly IClassService _classService;
        private readonly ILogger<ClassesController> _logger;

        public ClassesController(IClassService classService, ILogger<ClassesController> logger)
        {
            _classService = classService;
            _logger = logger;
        }

        /// <summary>
        /// Get all classes
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<ClassListDto>>> GetAll()
        {
            try
            {
                var classes = await _classService.GetAllAsync();
                return Ok(classes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting classes");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Get class by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<ClassDto>> GetById(string id)
        {
            try
            {
                var classDto = await _classService.GetByIdAsync(id);
                return Ok(classDto);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting class {id}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Create new class
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ClassDto>> Create([FromBody] CreateClassDto createDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var classDto = await _classService.CreateAsync(createDto);
                return CreatedAtAction(nameof(GetById), new { id = classDto.ClassID }, classDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating class");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Update class
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ClassDto>> Update(string id, [FromBody] UpdateClassDto updateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var classDto = await _classService.UpdateAsync(id, updateDto);
                return Ok(classDto);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating class {id}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Delete class
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                var success = await _classService.DeleteAsync(id);
                
                if (!success)
                    return NotFound(new { message = "Class not found" });

                return Ok(new { message = "Class deleted successfully" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting class {id}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Get students in class
        /// </summary>
        [HttpGet("{id}/students")]
        public async Task<ActionResult<List<StudentListDto>>> GetStudents(string id)
        {
            try
            {
                var students = await _classService.GetClassStudentsAsync(id);
                return Ok(students);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting students for class {id}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Add student to class
        /// </summary>
        [HttpPost("{id}/students")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AddStudent(string id, [FromBody] AddStudentDto dto)
        {
            try
            {
                await _classService.AddStudentToClassAsync(id, dto.StudentID);
                return Ok(new { message = "Student added to class successfully" });
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
                _logger.LogError(ex, $"Error adding student to class {id}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Remove student from class
        /// </summary>
        [HttpDelete("{id}/students/{studentId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RemoveStudent(string id, string studentId)
        {
            try
            {
                var success = await _classService.RemoveStudentFromClassAsync(id, studentId);
                
                if (!success)
                    return NotFound(new { message = "Student not found in class" });

                return Ok(new { message = "Student removed from class successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error removing student {studentId} from class {id}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
    }

    public class AddStudentDto
    {
        public string StudentID { get; set; }
    }
}