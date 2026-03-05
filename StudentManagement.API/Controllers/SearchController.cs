using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Core.DTOs.Search;
using StudentManagement.Core.DTOs.Student;
using StudentManagement.Services.Services;

namespace StudentManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SearchController : ControllerBase
    {
        private readonly IAdvancedSearchService _searchService;
        private readonly ILogger<SearchController> _logger;

        public SearchController(IAdvancedSearchService searchService, ILogger<SearchController> logger)
        {
            _searchService = searchService;
            _logger = logger;
        }

        /// <summary>
        /// Advanced search for students
        /// </summary>
        [HttpPost("students")]
        public async Task<ActionResult<SearchResultDto<StudentDto>>> SearchStudents(
            [FromBody] AdvancedSearchDto searchDto)
        {
            try
            {
                var results = await _searchService.SearchStudentsAsync(searchDto);
                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error performing advanced search");
                return StatusCode(500, new { message = "Search failed" });
            }
        }

        /// <summary>
        /// Quick text search
        /// </summary>
        [HttpGet("quick")]
        public async Task<ActionResult<SearchResultDto<StudentDto>>> QuickSearch(
            [FromQuery] string q,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                var results = await _searchService.SearchByTextAsync(q, pageSize);
                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error performing quick search");
                return StatusCode(500, new { message = "Search failed" });
            }
        }
    }
}