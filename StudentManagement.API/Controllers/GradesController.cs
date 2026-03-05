using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Core.DTOs.Grade;
using StudentManagement.Core.Entities;
using StudentManagement.Core.Interfaces.Services;
using System.Security.Claims;

namespace StudentManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class GradesController : ControllerBase
    {
        private readonly IGradeService _gradeService;
        private readonly ILogger<GradesController> _logger;

        public GradesController(IGradeService gradeService, ILogger<GradesController> logger)
        {
            _gradeService = gradeService;
            _logger = logger;
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
        public async Task<ActionResult<List<GradeDto>>> BatchCreate([FromBody] BatchGradeDto batchDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                string? userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                List<GradeDto> results = new List<GradeDto>();

                foreach (CreateGradeDto gradeDto in batchDto.Grades)
                {
                    GradeDto grade = await _gradeService.CreateAsync(gradeDto, userId);
                    results.Add(grade);
                }

                return Ok(new { message = $"Successfully created {results.Count} grades", grades = results });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in batch grade creation");
                return StatusCode(500, new { message = "Batch grade creation failed" });
            }
        }
    }

    public class BatchGradeDto
    {
        public List<CreateGradeDto> Grades { get; set; } = new List<CreateGradeDto>();
    }
}