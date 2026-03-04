using Microsoft.EntityFrameworkCore;
using StudentManagement.Core.DTOs.Dashboard;
using StudentManagement.Core.Entities;
using StudentManagement.Core.Enums;
using StudentManagement.Core.Interfaces.Repositories;
using StudentManagement.Core.Interfaces.Services;

namespace StudentManagement.Services.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly IUnitOfWork _unitOfWork;

        public DashboardService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<DashboardStatsDto> GetAdvancedStatsAsync()
        {
            var stats = new DashboardStatsDto
            {
                TotalStudents = await _unitOfWork.Repository<Student>().CountAsync(s => s.Status == StudentStatus.Active),
                TotalTeachers = await _unitOfWork.Repository<Teacher>().CountAsync(),
                TotalClasses = await _unitOfWork.Repository<Class>().CountAsync(),
                TotalSubjects = await _unitOfWork.Repository<Subject>().CountAsync()
            };

            // Calculate System Average GPA
            var validGPAs = await _unitOfWork.Repository<Student>()
                .GetQueryable()
                .Where(s => s.Status == StudentStatus.Active && s.GPA > 0)
                .Select(s => s.GPA)
                .ToListAsync();

            stats.AverageSystemGPA = validGPAs.Any() ? Math.Round(validGPAs.Average(), 2) : 0;

            // Grade Distribution (From Grades table)
            var gradeDistribution = await _unitOfWork.Repository<Grade>()
                .GetQueryable()
                .Where(g => g.Status != "Incomplete" && g.LetterGrade != null)
                .GroupBy(g => g.LetterGrade)
                .Select(g => new { Grade = g.Key, Count = g.Count() })
                .ToDictionaryAsync(g => g.Grade!, g => g.Count);
                
            stats.GradeDistribution = gradeDistribution;

            // Enrollment Trends
            var enrollmentTrends = await _unitOfWork.Repository<Student>()
                .GetQueryable()
                .Where(s => s.EnrollmentYear > 0)
                .GroupBy(s => s.EnrollmentYear)
                .Select(g => new { Year = g.Key.ToString(), Count = g.Count() })
                .ToDictionaryAsync(g => g.Year, g => g.Count);

            stats.EnrollmentTrends = enrollmentTrends;

            // Top Performing Classes
            var classes = await _unitOfWork.Repository<Class>()
                .GetQueryable()
                .Include(c => c.Students)
                .ToListAsync();

            var topClasses = classes
                .Where(c => c.Students != null && c.Students.Any(s => s.GPA > 0))
                .Select(c => new TopClassDto
                {
                    ClassID = c.ClassID,
                    ClassName = c.ClassName,
                    AverageGPA = Math.Round(c.Students.Where(s => s.GPA > 0).Average(s => s.GPA), 2)
                })
                .OrderByDescending(c => c.AverageGPA)
                .Take(5)
                .ToList();

            stats.TopPerformingClasses = topClasses;

            return stats;
        }
    }
}
