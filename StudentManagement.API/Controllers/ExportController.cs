using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Core.DTOs.Class;
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
        private readonly IClassService _classService;
        private readonly ILogger<ExportController> _logger;

        public ExportController(
            IExportService exportService,
            IStudentService studentService,
            IClassService classService,
            ILogger<ExportController> logger)
        {
            _exportService = exportService;
            _studentService = studentService;
            _classService = classService;
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
                PagedStudentResult result = await _studentService.GetAllAsync(searchDto);
                byte[] excelData = await _exportService.ExportStudentsToExcelAsync(result.Students.ToList());

                string fileName = $"Students_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
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
                byte[] excelData = await _exportService.ExportGradesToExcelAsync(sectionId);
                string fileName = $"Grades_{sectionId}_{DateTime.Now:yyyyMMdd}.xlsx";
                
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
                byte[] template = await _exportService.GenerateGradeEntryTemplateAsync(sectionId);
                string fileName = $"GradeTemplate_{sectionId}.xlsx";
                
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
                using MemoryStream memoryStream = new MemoryStream();
                await file.CopyToAsync(memoryStream);
                byte[] fileData = memoryStream.ToArray();

                bool success = await _exportService.ImportGradesFromExcelAsync(fileData, sectionId);
                
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
                string? role = User.FindFirst(ClaimTypes.Role)?.Value;
                string? currentUserId = User.FindFirst("PersonId")?.Value;

                if (role == "Student" && currentUserId != studentId)
                    return Forbid();

                byte[] pdfData = await _exportService.ExportTranscriptToPdfAsync(studentId);
                string fileName = $"Transcript_{studentId}_{DateTime.Now:yyyyMMdd}.pdf";

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
                byte[] pdfData = await _exportService.ExportClassRosterToPdfAsync(classId);
                string fileName = $"ClassRoster_{classId}_{DateTime.Now:yyyyMMdd}.pdf";

                return File(pdfData, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error exporting roster for class {classId}");
                return StatusCode(500, new { message = "Export failed" });
            }
        }

        /// <summary>
        /// Export classes to Excel
        /// </summary>
        [HttpGet("classes/excel")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ExportClassesExcel()
        {
            try
            {
                List<ClassDto> classes = (await _classService.GetAllAsync())
                    .Select((ClassListDto c) => new ClassDto
                    {
                        ClassID = c.ClassID,
                        ClassName = c.ClassName,
                        AcademicYear = c.AcademicYear,
                        MajorName = c.MajorName,
                        CurrentSize = c.CurrentSize,
                        MaxCapacity = c.MaxCapacity,
                        AverageGPA = 0
                    }).ToList();

                byte[] excelData = await _exportService.ExportClassesToExcelAsync(classes);
                string fileName = $"Classes_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";

                return File(excelData,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting classes to Excel");
                return StatusCode(500, new { message = "Export failed" });
            }
        }
    }
}