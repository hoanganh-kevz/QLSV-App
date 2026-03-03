using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Core.Interfaces.Repositories;
using StudentManagement.Core.Entities;

namespace StudentManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public DashboardController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            int totalStudents = await _unitOfWork.Repository<Student>().CountAsync();
            int totalTeachers = await _unitOfWork.Repository<Teacher>().CountAsync();
            int totalClasses = await _unitOfWork.Repository<Class>().CountAsync();
            int totalSubjects = await _unitOfWork.Repository<Subject>().CountAsync();

            return Ok(new
            {
                totalStudents,
                totalTeachers,
                totalClasses,
                totalSubjects
            });
        }
    }
}