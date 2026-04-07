using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Core.DTOs.Subject;
using StudentManagement.Core.Interfaces.Services;

namespace StudentManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SubjectsController : ControllerBase
    {
        private readonly ISubjectService _subjectService;
        private readonly ILogger<SubjectsController> _logger;

        public SubjectsController(ISubjectService subjectService, ILogger<SubjectsController> logger)
        {
            _subjectService = subjectService;
            _logger = logger;
        }

        /// <summary>
        /// Get all subjects
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<SubjectListDto>>> GetAll()
        {
            try
            {
                List<SubjectListDto> subjects = await _subjectService.GetAllAsync();
                return Ok(subjects);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting subjects");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Get subject by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<SubjectDto>> GetById(string id)
        {
            try
            {
                SubjectDto subject = await _subjectService.GetByIdAsync(id);
                return Ok(subject);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting subject {id}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Get subject by code
        /// </summary>
        [HttpGet("code/{code}")]
        public async Task<ActionResult<SubjectDto>> GetByCode(string code)
        {
            try
            {
                SubjectDto subject = await _subjectService.GetByCodeAsync(code);
                return Ok(subject);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting subject with code {code}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Get subjects by department
        /// </summary>
        [HttpGet("department/{departmentId}")]
        public async Task<ActionResult<List<SubjectListDto>>> GetByDepartment(string departmentId)
        {
            try
            {
                List<SubjectListDto> subjects = await _subjectService.GetByDepartmentAsync(departmentId);
                return Ok(subjects);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting subjects for department {departmentId}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Create new subject
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<SubjectDto>> Create([FromBody] CreateSubjectDto createDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                SubjectDto subject = await _subjectService.CreateAsync(createDto);
                return CreatedAtAction(nameof(GetById), new { id = subject.SubjectID }, subject);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating subject");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Update subject
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<SubjectDto>> Update(string id, [FromBody] UpdateSubjectDto updateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                SubjectDto subject = await _subjectService.UpdateAsync(id, updateDto);
                return Ok(subject);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating subject {id}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Delete subject
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                bool success = await _subjectService.DeleteAsync(id);

                if (!success)
                    return NotFound(new { message = "Subject not found" });

                return Ok(new { message = "Subject deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting subject {id}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Check if subject code exists
        /// </summary>
        [HttpGet("exists/{code}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<object>> CheckExists(string code)
        {
            try
            {
                bool exists = await _subjectService.ExistsAsync(code);
                return Ok(new { exists });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error checking subject code {code}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
    }
}
