using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Core.Entities;
using StudentManagement.Core.Interfaces.Repositories;

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
        var totalStudents = await _unitOfWork.Repository<Student>().CountAsync();
        var totalTeachers = await _unitOfWork.Repository<Teacher>().CountAsync();
        var totalClasses = await _unitOfWork.Repository<Class>().CountAsync();
        var totalSubjects = await _unitOfWork.Repository<Subject>().CountAsync();

        return Ok(new
        {
            totalStudents,
            totalTeachers,
            totalClasses,
            totalSubjects
        });
    }

    // Grade Distribution
    [HttpGet("grade-distribution")]
    public async Task<IActionResult> GetGradeDistribution(int classId)
    {
        var students = await _unitOfWork.Repository<Student>().GetAllAsync();

        var distribution = students
            .Where(s => s.ClassId == classId)
            .GroupBy(s => s.GPA >= 3.6m ? "A" :
                          s.GPA >= 3.2m ? "B" :
                          s.GPA >= 2.5m ? "C" :
                          s.GPA >= 2.0m ? "D" : "F")
            .Select(g => new
            {
                grade = g.Key,
                count = g.Count()
            });

        return Ok(distribution);
    }

    // Top Students
    [HttpGet("top-students")]
    public async Task<IActionResult> GetTopStudents(int limit = 10)
    {
        var students = await _unitOfWork.Repository<Student>().GetAllAsync();

        var topStudents = students
            .OrderByDescending(s => s.GPA)
            .Take(limit)
            .Select(s => new
            {
                s.StudentCode,
                s.FullName,
                s.GPA
            });

        return Ok(topStudents);
    }

    // Class Performance
    [HttpGet("class-performance")]
    public async Task<IActionResult> GetClassPerformance()
    {
        var students = await _unitOfWork.Repository<Student>().GetAllAsync();

        var performance = students
            .GroupBy(s => s.ClassId)
            .Select(g => new
            {
                classId = g.Key,
                averageGPA = g.Average(s => s.GPA),
                totalStudents = g.Count()
            });

        return Ok(performance);
    }
}