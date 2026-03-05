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
            DashboardStatsDto stats = new DashboardStatsDto
            {
                TotalStudents = await _unitOfWork.Repository<Student>().CountAsync((Student s) => s.Status == StudentStatus.Active),
                TotalTeachers = await _unitOfWork.Repository<Teacher>().CountAsync(),
                TotalClasses = await _unitOfWork.Repository<Class>().CountAsync(),
                TotalSubjects = await _unitOfWork.Repository<Subject>().CountAsync()
            };

            // Calculate System Average GPA
            List<decimal> validGPAs = await _unitOfWork.Repository<Student>()
                .GetQueryable()
                .Where((Student s) => s.Status == StudentStatus.Active && s.GPA > 0)
                .Select((Student s) => s.GPA)
                .ToListAsync();

            stats.AverageSystemGPA = validGPAs.Any() ? Math.Round(validGPAs.Average(), 2) : 0;

            // Grade Distribution — var required: uses anonymous type in Select
            var gradeDistribution = await _unitOfWork.Repository<Grade>()
                .GetQueryable()
                .Where((Grade g) => g.Status != "Incomplete" && g.LetterGrade != null)
                .GroupBy((Grade g) => g.LetterGrade)
                .Select(g => new { Grade = g.Key, Count = g.Count() })
                .ToDictionaryAsync(g => g.Grade!, g => g.Count);
                
            stats.GradeDistribution = gradeDistribution;

            // Enrollment Trends — var required: uses anonymous type in Select
            var enrollmentTrends = await _unitOfWork.Repository<Student>()
                .GetQueryable()
                .Where((Student s) => s.EnrollmentYear > 0)
                .GroupBy((Student s) => s.EnrollmentYear)
                .Select(g => new { Year = g.Key.ToString(), Count = g.Count() })
                .ToDictionaryAsync(g => g.Year, g => g.Count);

            stats.EnrollmentTrends = enrollmentTrends;

            // Top Performing Classes — SQL Projection (no in-memory loading)
            List<TopClassDto> topClasses = await _unitOfWork.Repository<Class>()
                .GetQueryable()
                .Where((Class c) => c.Students != null && c.Students.Any((Student s) => s.GPA > 0))
                .Select((Class c) => new TopClassDto
                {
                    ClassID = c.ClassID,
                    ClassName = c.ClassName,
                    AverageGPA = Math.Round(c.Students.Where((Student s) => s.GPA > 0).Average((Student s) => s.GPA), 2)
                })
                .OrderByDescending((TopClassDto c) => c.AverageGPA)
                .Take(5)
                .ToListAsync();

            stats.TopPerformingClasses = topClasses;

            return stats;
        }
    }
}
