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
            return new DashboardStatsDto(); // Left for legacy interface compatibility
        }

        public async Task<object> GetRoleBasedStatsAsync(string role, string userId)
        {
            if (role == "admin" || role == "manager")
            {
                var totalStudents = await _unitOfWork.Repository<Student>().CountAsync();
                var totalTeachers = await _unitOfWork.Repository<Teacher>().CountAsync();
                var totalCourseSections = await _unitOfWork.Repository<CourseSection>().CountAsync();
                var totalSubjects = await _unitOfWork.Repository<Subject>().CountAsync();
                
                var totalTerms = await _unitOfWork.Repository<CourseSection>().GetQueryable()
                    .Select(c => new { c.Semester, c.AcademicYear })
                    .Distinct()
                    .CountAsync();

                var classSectionsByTerm = await _unitOfWork.Repository<CourseSection>().GetQueryable()
                    .GroupBy(c => new { c.Semester, c.AcademicYear })
                    .Select(g => new { term = $"HK{g.Key.Semester} - {g.Key.AcademicYear}", count = g.Count() })
                    .ToListAsync();
                    
                var classSectionStatusDist = await _unitOfWork.Repository<CourseSection>().GetQueryable()
                    .GroupBy(c => c.Status)
                    .Select(g => new { name = g.Key, value = g.Count() })
                    .ToListAsync();
                    
                var studentsByClass = await _unitOfWork.Repository<Class>().GetQueryable()
                    .OrderByDescending(c => c.Students.Count)
                    .Select(c => new { name = c.ClassName, value = c.Students.Count })
                    .Take(10)
                    .ToListAsync();

                return new
                {
                    metrics = new
                    {
                        totalStudents,
                        totalTeachers,
                        totalClassSections = totalCourseSections,
                        totalSubjects,
                        totalTerms
                    },
                    classSectionsByTerm,
                    classSectionStatusDist,
                    studentsByClass
                };
            }
            else if (role == "teacher")
            {
                Teacher teacher = await _unitOfWork.Repository<Teacher>().GetQueryable()
                    .FirstOrDefaultAsync(t => t.AccountID == userId);

                if (teacher == null) return new { noProfile = true };

                var courseSections = await _unitOfWork.Repository<CourseSection>().GetQueryable()
                    .Include(c => c.Subject)
                    .Include(c => c.Enrollments)
                        .ThenInclude(e => e.Grade)
                    .Where(c => c.TeacherID == teacher.Id)
                    .ToListAsync();

                var performanceByClass = courseSections.Select(c => new {
                    classCode = c.SectionID.Length > 8 ? c.SectionID.Substring(0, 8) : c.SectionID,
                    subjectName = c.Subject?.SubjectName ?? "Môn học",
                    termCode = $"HK{c.Semester}-{c.AcademicYear.Substring(2)}",
                    enrolledCount = c.Enrollments.Count,
                    gradedCount = c.Enrollments.Count(e => e.Grade != null),
                    avgScore = c.Enrollments.Where(e => e.Grade != null).Any() ? Math.Round((double)c.Enrollments.Where(e => e.Grade != null).Average(e => e.Grade.FinalScore), 2) : 0
                }).ToList();

                var gradeDistribution = courseSections
                    .SelectMany(c => c.Enrollments)
                    .Where(e => e.Grade != null && !string.IsNullOrEmpty(e.Grade.LetterGrade))
                    .GroupBy(e => e.Grade.LetterGrade)
                    .Select(g => new { name = g.Key, value = g.Count() })
                    .ToList();

                var classSections = courseSections.Select(c => new {
                    code = c.SectionID.Length > 8 ? c.SectionID.Substring(0, 8) : c.SectionID,
                    subjectName = c.Subject?.SubjectName ?? "Môn học",
                    termCode = $"HK{c.Semester}-{c.AcademicYear.Substring(2)}",
                    enrolledCount = c.Enrollments.Count,
                    maxStudents = c.MaxStudents,
                    status = c.Status,
                    teachingMethod = "Offline"
                }).ToList();
                
                var validScores = courseSections.SelectMany(c => c.Enrollments).Where(e => e.Grade != null).Select(e => (double)e.Grade.FinalScore).ToList();
                var avgGrade = validScores.Any() ? Math.Round(validScores.Average(), 2) : 0;

                return new
                {
                    noProfile = false,
                    metrics = new
                    {
                        totalClasses = courseSections.Count,
                        totalStudents = courseSections.Sum(c => c.Enrollments.Count),
                        avgGrade
                    },
                    performanceByClass,
                    gradeDistribution,
                    classSections
                };
            }
            else if (role == "student")
            {
                Student student = await _unitOfWork.Repository<Student>().GetQueryable()
                    .Include(s => s.Class)
                    .FirstOrDefaultAsync(s => s.AccountID == userId);

                if (student == null) return new { noProfile = true };

                var gradedEnrollments = await _unitOfWork.Repository<Enrollment>().GetQueryable()
                    .Include(e => e.Grade)
                    .Include(e => e.Section)
                        .ThenInclude(c => c.Subject)
                    .Where(e => e.StudentID == student.Id && e.Grade != null)
                    .ToListAsync();
                
                var avgGpa = student.GPA;
                var totalCredits = gradedEnrollments.Where(e => e.Grade.GradePoint >= 1.0m).Sum(e => e.Section.Subject?.Credits ?? 0);
                var passedCourses = gradedEnrollments.Count(e => e.Grade.GradePoint >= 1.0m);
                var failedCourses = gradedEnrollments.Count(e => e.Grade.GradePoint < 1.0m);

                var performanceData = gradedEnrollments
                    .GroupBy(e => $"HK{e.Section.Semester}-{e.Section.AcademicYear.Substring(2)}")
                    .Select(g => new {
                        semester = g.Key,
                        avgGpa = Math.Round((double)g.Average(e => e.Grade.GradePoint), 2)
                    }).ToList();

                var gradeDetails = gradedEnrollments.Select(e => new {
                    subjectCode = e.Section.Subject?.SubjectCode ?? "SUB",
                    subjectName = e.Section.Subject?.SubjectName ?? "Môn học",
                    semester = $"HK{e.Section.Semester}-{e.Section.AcademicYear.Substring(2)}",
                    credits = e.Section.Subject?.Credits ?? 0,
                    totalScore = e.Grade.FinalScore,
                    gpa4 = e.Grade.GradePoint,
                    letterGrade = e.Grade.LetterGrade
                }).ToList();

                return new
                {
                    noProfile = false,
                    studentInfo = new
                    {
                        fullName = student.FullName,
                        mssv = student.StudentCode,
                        className = student.Class?.ClassName ?? "Chưa có lớp"
                    },
                    metrics = new
                    {
                        avgGpa,
                        totalCredits,
                        passedCourses,
                        failedCourses
                    },
                    performanceData,
                    gradeDetails
                };
            }
            
            return new { };
        }
    }
}
