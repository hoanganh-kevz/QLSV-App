using AutoMapper;
using StudentManagement.Core.DTOs.Grade;
using StudentManagement.Core.Entities;
using Microsoft.EntityFrameworkCore;
using StudentManagement.Core.Interfaces.Repositories;
using StudentManagement.Core.Interfaces.Services;

namespace StudentManagement.Services.Services
{
    public class GradeService : IGradeService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public GradeService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<GradeDto> GetByIdAsync(string gradeId)
        {
            Grade? grade = await _unitOfWork.Repository<Grade>()
                .FirstOrDefaultAsync(g => g.GradeID == gradeId);

            if (grade == null)
                throw new KeyNotFoundException("Grade not found");

            return _mapper.Map<GradeDto>(grade);
        }

        public async Task<List<GradeDto>> GetBySectionAsync(string sectionId)
        {
            // Single JOIN query instead of 2 separate queries
            List<Grade> grades = await _unitOfWork.Repository<Grade>()
                .GetQueryable()
                .Include(g => g.Student)
                .Include(g => g.Subject)
                .Include(g => g.Enrollment)
                .Where(g => g.Enrollment.SectionID == sectionId)
                .ToListAsync();

            return _mapper.Map<List<GradeDto>>(grades);
        }

        public async Task<List<GradeDto>> GetByStudentAsync(string studentId)
        {
            List<Grade> grades = await _unitOfWork.Repository<Grade>()
                .GetQueryable()
                .Include(g => g.Student)
                .Include(g => g.Subject)
                .Where(g => g.StudentID == studentId)
                .ToListAsync();

            return _mapper.Map<List<GradeDto>>(grades);
        }

        public async Task<GradeDto> CreateAsync(CreateGradeDto createDto, string createdBy)
        {
            Enrollment? enrollment = await _unitOfWork.Repository<Enrollment>()
                .FirstOrDefaultAsync(e => e.EnrollmentID == createDto.EnrollmentID);

            if (enrollment == null)
                throw new KeyNotFoundException("Enrollment not found");

            // Check if grade already exists
            if (await _unitOfWork.Repository<Grade>()
                .ExistsAsync(g => g.EnrollmentID == createDto.EnrollmentID))
            {
                throw new InvalidOperationException("Grade already exists for this enrollment");
            }

            // Get section info
            CourseSection? section = await _unitOfWork.Repository<CourseSection>()
                .FirstOrDefaultAsync(s => s.SectionID == enrollment.SectionID);

            Grade grade = new Grade
            {
                EnrollmentID = createDto.EnrollmentID,
                StudentID = enrollment.StudentID,
                SubjectID = section?.SubjectID ?? "",
                Semester = section?.Semester ?? 1,
                AcademicYear = section?.AcademicYear ?? "",
                AttendanceScore = createDto.AttendanceScore,
                MidtermScore = createDto.MidtermScore,
                FinalScore = createDto.FinalScore,
                UpdatedBy = createdBy
            };

            grade.CalculateTotalScore();

            await _unitOfWork.Repository<Grade>().AddAsync(grade);
            await _unitOfWork.SaveChangesAsync();

            // Update student GPA
            await UpdateStudentGPAAsync(enrollment.StudentID);

            return _mapper.Map<GradeDto>(grade);
        }

        public async Task<GradeDto> UpdateComponentAsync(string gradeId, UpdateGradeComponentDto updateDto, string updatedBy)
        {
            Grade? grade = await _unitOfWork.Repository<Grade>()
                .FirstOrDefaultAsync(g => g.GradeID == gradeId);

            if (grade == null)
                throw new KeyNotFoundException("Grade not found");

            // Check if can modify (lock after 30 days)
            if (!await CanModifyGradeAsync(gradeId))
                throw new InvalidOperationException("Grade is locked. Contact admin for approval.");

            grade.UpdateComponent(updateDto.Component, updateDto.Score, updatedBy);

            await _unitOfWork.Repository<Grade>().UpdateAsync(grade);
            await _unitOfWork.SaveChangesAsync();

            // Update student GPA
            await UpdateStudentGPAAsync(grade.StudentID);

            return _mapper.Map<GradeDto>(grade);
        }

        public async Task<bool> DeleteAsync(string gradeId)
        {
            Grade? grade = await _unitOfWork.Repository<Grade>()
                .FirstOrDefaultAsync(g => g.GradeID == gradeId);

            if (grade == null)
                return false;

            await _unitOfWork.Repository<Grade>().DeleteAsync(grade);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }

        public async Task<decimal> CalculateGPAAsync(string studentId)
        {
            List<Grade> grades = await _unitOfWork.Repository<Grade>()
                .GetQueryable()
                .Include(g => g.Subject)
                .Where(g => g.StudentID == studentId && g.Status == "Pass")
                .ToListAsync();

            if (!grades.Any())
                return 0;

            decimal totalPoints = grades.Where(g => g.Subject != null).Sum(g => g.GradePoint * g.Subject.Credits);
            int totalCredits = grades.Where(g => g.Subject != null).Sum(g => g.Subject.Credits);

            return totalCredits > 0 ? Math.Round(totalPoints / totalCredits, 2) : 0;
        }

        public async Task<decimal> CalculateSemesterGPAAsync(string studentId, int semester, string academicYear)
        {
            List<Grade> grades = await _unitOfWork.Repository<Grade>()
                .GetQueryable()
                .Include(g => g.Subject)
                .Where(g => g.StudentID == studentId &&
                            g.Semester == semester &&
                            g.AcademicYear == academicYear &&
                            g.Status == "Pass")
                .ToListAsync();

            if (!grades.Any())
                return 0;

            decimal totalPoints = grades.Where(g => g.Subject != null).Sum(g => g.GradePoint * g.Subject.Credits);
            int totalCredits = grades.Where(g => g.Subject != null).Sum(g => g.Subject.Credits);

            return totalCredits > 0 ? Math.Round(totalPoints / totalCredits, 2) : 0;
        }

        public async Task UpdateStudentGPAAsync(string studentId)
        {
            Student? student = await _unitOfWork.Repository<Student>()
                .FirstOrDefaultAsync(s => s.Id == studentId);

            if (student == null)
                return;

            decimal gpa = await CalculateGPAAsync(studentId);
            student.UpdateGPA(gpa);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<TranscriptDto> GetTranscriptAsync(string studentId)
        {
            Student? student = await _unitOfWork.Repository<Student>()
                .FirstOrDefaultAsync(s => s.Id == studentId);

            if (student == null)
                throw new KeyNotFoundException("Student not found");

            List<Grade> grades = await _unitOfWork.Repository<Grade>()
                .GetQueryable()
                .Include(g => g.Subject)
                .Where(g => g.StudentID == studentId)
                .ToListAsync();

            // var required here: GroupBy uses anonymous type which cannot be explicitly named
            var groupedGrades = grades
                .GroupBy((Grade g) => new { g.AcademicYear, g.Semester })
                .OrderBy(g => g.Key.AcademicYear)
                .ThenBy(g => g.Key.Semester);

            List<SemesterGradesDto> semesterGrades = new();

            foreach (var group in groupedGrades)
            {
                decimal totalSemesterPoints = 0;
                int semesterCredits = 0;
                List<GradeDto> gradeList = new();

                foreach (Grade grade in group)
                {
                    GradeDto gradeDto = _mapper.Map<GradeDto>(grade);
                    gradeList.Add(gradeDto);

                    if (grade.Subject != null && grade.IsPass())
                    {
                        semesterCredits += grade.Subject.Credits;
                        totalSemesterPoints += grade.GradePoint * grade.Subject.Credits;
                    }
                }

                decimal semesterGPA = semesterCredits > 0 ? Math.Round(totalSemesterPoints / semesterCredits, 2) : 0;

                semesterGrades.Add(new SemesterGradesDto
                {
                    AcademicYear = group.Key.AcademicYear,
                    Semester = group.Key.Semester,
                    Grades = gradeList,
                    SemesterGPA = semesterGPA,
                    SemesterCredits = semesterCredits
                });
            }

            return new TranscriptDto
            {
                StudentID = studentId,
                StudentCode = student.StudentCode,
                StudentName = student.FullName,
                CurrentGPA = student.GPA,
                TotalCredits = student.TotalCredits,
                Semesters = semesterGrades
            };
        }

        public async Task<Dictionary<string, int>> GetGradeDistributionAsync(string sectionId)
        {
            List<string> enrollmentIds = await _unitOfWork.Repository<Enrollment>()
                .GetQueryable()
                .Where(e => e.SectionID == sectionId)
                .Select(e => e.EnrollmentID)
                .ToListAsync();

            List<Grade> grades = await _unitOfWork.Repository<Grade>()
                .GetQueryable()
                .Where(g => enrollmentIds.Contains(g.EnrollmentID) && g.Status != "Incomplete")
                .ToListAsync();

            return grades
                .GroupBy(g => g.LetterGrade ?? "N/A")
                .ToDictionary(g => g.Key, g => g.Count());
        }

        public async Task<List<GradeDto>> GetFailingStudentsAsync(string sectionId)
        {
            List<string> enrollmentIds = await _unitOfWork.Repository<Enrollment>()
                .GetQueryable()
                .Where(e => e.SectionID == sectionId)
                .Select(e => e.EnrollmentID)
                .ToListAsync();

            List<Grade> grades = await _unitOfWork.Repository<Grade>()
                .GetQueryable()
                .Include(g => g.Student)
                .Include(g => g.Subject)
                .Where(g => enrollmentIds.Contains(g.EnrollmentID) && g.Status == "Fail")
                .ToListAsync();

            return _mapper.Map<List<GradeDto>>(grades);
        }

        public async Task<bool> CanModifyGradeAsync(string gradeId)
        {
            Grade? grade = await _unitOfWork.Repository<Grade>()
                .FirstOrDefaultAsync(g => g.GradeID == gradeId);

            if (grade == null)
                return false;

            int daysSinceUpdate = (DateTime.UtcNow - grade.UpdatedAt).Days;
            return daysSinceUpdate <= 30;
        }

        public async Task<List<GradeHistory>> GetGradeHistoryAsync(string gradeId)
        {
            // Sort in SQL instead of in-memory
            return await _unitOfWork.Repository<GradeHistory>()
                .GetQueryable()
                .Where(h => h.GradeID == gradeId)
                .OrderByDescending(h => h.ModifiedAt)
                .ToListAsync();
        }
    }
}