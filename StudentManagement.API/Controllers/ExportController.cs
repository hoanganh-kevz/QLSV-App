using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Core.DTOs.Student;
using StudentManagement.Core.Interfaces.Services;
using System.Security.Claims;

namespace StudentManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ExportController : ControllerBase
    {
        private readonly IExportService _exportService;
        private readonly IStudentService _studentService;
        private readonly ILogger<ExportController> _logger;

        public ExportController(
            IExportService exportService,
            IStudentService studentService,
            ILogger<ExportController> logger)
        {
            _exportService = exportService;
            _studentService = studentService;
            _logger = logger;
        }

        /// <summary>
        /// Export students to Excel
        /// </summary>
        [HttpPost("students/excel")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> ExportStudentsExcel([FromBody] StudentSearchDto searchDto)
        {
            try
            {
                var result = await _studentService.GetAllAsync(searchDto);
                var excelData = await _exportService.ExportStudentsToExcelAsync(result.Students.ToList());

                var fileName = $"Students_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
                return File(excelData, 
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
                    fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting students to Excel");
                return StatusCode(500, new { message = "Export failed" });
            }
        }

        /// <summary>
        /// Export grade sheet to Excel
        /// </summary>
        [HttpGet("grades/{sectionId}/excel")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> ExportGradesExcel(string sectionId)
        {
            try
            {
                var excelData = await _exportService.ExportGradesToExcelAsync(sectionId);
                var fileName = $"Grades_{sectionId}_{DateTime.Now:yyyyMMdd}.xlsx";
                
                return File(excelData,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error exporting grades for section {sectionId}");
                return StatusCode(500, new { message = "Export failed" });
            }
        }

        /// <summary>
        /// Generate grade entry template
        /// </summary>
        [HttpGet("grades/{sectionId}/template")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> GetGradeTemplate(string sectionId)
        {
            try
            {
                var template = await _exportService.GenerateGradeEntryTemplateAsync(sectionId);
                var fileName = $"GradeTemplate_{sectionId}.xlsx";
                
                return File(template,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error generating template for section {sectionId}");
                return StatusCode(500, new { message = "Template generation failed" });
            }
        }

        /// <summary>
        /// Import grades from Excel
        /// </summary>
        [HttpPost("grades/{sectionId}/import")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> ImportGrades(string sectionId, IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded" });

            try
            {
                using var memoryStream = new MemoryStream();
                await file.CopyToAsync(memoryStream);
                var fileData = memoryStream.ToArray();

                var success = await _exportService.ImportGradesFromExcelAsync(fileData, sectionId);
                
                if (success)
                    return Ok(new { message = "Grades imported successfully" });
                else
                    return BadRequest(new { message = "Import failed" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error importing grades for section {sectionId}");
                return StatusCode(500, new { message = "Import failed", error = ex.Message });
            }
        }

        /// <summary>
        /// Export transcript to PDF
        /// </summary>
        [HttpGet("transcript/{studentId}/pdf")]
        public async Task<IActionResult> ExportTranscriptPdf(string studentId)
        {
            try
            {
                // Students can only export their own transcript
                var role = User.FindFirst(ClaimTypes.Role)?.Value;
                var currentUserId = User.FindFirst("PersonId")?.Value;

                if (role == "Student" && currentUserId != studentId)
                    return Forbid();

                var pdfData = await _exportService.ExportTranscriptToPdfAsync(studentId);
                var fileName = $"Transcript_{studentId}_{DateTime.Now:yyyyMMdd}.pdf";

                return File(pdfData, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error exporting transcript for student {studentId}");
                return StatusCode(500, new { message = "Export failed" });
            }
        }

        /// <summary>
        /// Export class roster to PDF
        /// </summary>
        [HttpGet("class/{classId}/roster/pdf")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> ExportClassRosterPdf(string classId)
        {
            try
            {
                var pdfData = await _exportService.ExportClassRosterToPdfAsync(classId);
                var fileName = $"ClassRoster_{classId}_{DateTime.Now:yyyyMMdd}.pdf";

                return File(pdfData, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error exporting roster for class {classId}");
                return StatusCode(500, new { message = "Export failed" });
            }
        }
    }
}