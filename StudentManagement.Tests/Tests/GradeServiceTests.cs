using AutoMapper;
using FluentAssertions;
using Moq;
using StudentManagement.Core.DTOs.Grade;
using StudentManagement.Core.Entities;
using StudentManagement.Core.Interfaces.Repositories;
using StudentManagement.Services.Services;
using StudentManagement.Tests.TestHelpers;
using System.Linq.Expressions;

// Uses AsyncQueryableExtensions for EF Core async compatibility

namespace StudentManagement.Tests.Tests
{
    public class GradeServiceTests
    {
        private readonly Mock<IUnitOfWork> _mockUnitOfWork;
        private readonly Mock<IGenericRepository<Grade>> _mockGradeRepo;
        private readonly Mock<IGenericRepository<Enrollment>> _mockEnrollmentRepo;
        private readonly Mock<IGenericRepository<CourseSection>> _mockSectionRepo;
        private readonly Mock<IGenericRepository<Student>> _mockStudentRepo;
        private readonly IMapper _mapper;
        private readonly GradeService _gradeService;

        public GradeServiceTests()
        {
            _mockUnitOfWork = new Mock<IUnitOfWork>();
            _mockGradeRepo = new Mock<IGenericRepository<Grade>>();
            _mockEnrollmentRepo = new Mock<IGenericRepository<Enrollment>>();
            _mockSectionRepo = new Mock<IGenericRepository<CourseSection>>();
            _mockStudentRepo = new Mock<IGenericRepository<Student>>();

            _mockUnitOfWork.Setup(u => u.Repository<Grade>()).Returns(_mockGradeRepo.Object);
            _mockUnitOfWork.Setup(u => u.Repository<Enrollment>()).Returns(_mockEnrollmentRepo.Object);
            _mockUnitOfWork.Setup(u => u.Repository<CourseSection>()).Returns(_mockSectionRepo.Object);
            _mockUnitOfWork.Setup(u => u.Repository<Student>()).Returns(_mockStudentRepo.Object);
            _mockUnitOfWork.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);

            _mapper = MockSetup.CreateMapper();
            _gradeService = new GradeService(_mockUnitOfWork.Object, _mapper);
        }

        #region CreateGrade Tests

        [Fact]
        public async Task CreateGrade_ValidData_CalculatesTotalScore()
        {
            // Arrange
            string enrollmentId = "enrollment-1";
            string studentId = "student-1";
            string sectionId = "section-1";

            Enrollment enrollment = new Enrollment
            {
                EnrollmentID = enrollmentId,
                StudentID = studentId,
                SectionID = sectionId
            };

            CourseSection section = new CourseSection
            {
                SectionID = sectionId,
                SubjectID = "subject-1",
                Semester = 1,
                AcademicYear = "2024-2025"
            };

            _mockEnrollmentRepo.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<Enrollment, bool>>>()))
                .ReturnsAsync(enrollment);

            _mockGradeRepo.Setup(r => r.ExistsAsync(It.IsAny<Expression<Func<Grade, bool>>>()))
                .ReturnsAsync(false);

            _mockSectionRepo.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<CourseSection, bool>>>()))
                .ReturnsAsync(section);

            // Student for GPA update
            Student student = new Student(
                "Test Student", "test@test.com", "0901234567",
                new DateTime(2000, 1, 1), Core.Enums.Gender.Male, "SV001", 2024, "K24"
            );
            typeof(Person).GetProperty("Id")!.SetValue(student, studentId);
            _mockStudentRepo.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<Student, bool>>>()))
                .ReturnsAsync(student);

            // Mock GetQueryable for CalculateGPA
            Mock<IQueryable<Grade>> mockGradeQueryable = new Mock<IQueryable<Grade>>();
            _mockGradeRepo.Setup(r => r.GetQueryable())
                .Returns(new List<Grade>().AsAsyncQueryable());

            CreateGradeDto createDto = new CreateGradeDto
            {
                EnrollmentID = enrollmentId,
                AttendanceScore = 8.0m,
                MidtermScore = 7.0m,
                FinalScore = 9.0m
            };

            // Act
            GradeDto result = await _gradeService.CreateAsync(createDto, "teacher1");

            // Assert
            result.Should().NotBeNull();
            result.StudentID.Should().Be(studentId);
            // Total: 0.1*8 + 0.3*7 + 0.6*9 = 0.8+2.1+5.4 = 8.3
            result.TotalScore.Should().Be(8.30m);
            result.LetterGrade.Should().Be("B+");

            _mockGradeRepo.Verify(r => r.AddAsync(It.IsAny<Grade>()), Times.Once);
            _mockUnitOfWork.Verify(u => u.SaveChangesAsync(), Times.AtLeastOnce);
        }

        [Fact]
        public async Task CreateGrade_DuplicateEnrollment_ThrowsInvalidOperationException()
        {
            // Arrange
            Enrollment enrollment = new Enrollment
            {
                EnrollmentID = "enrollment-dup",
                StudentID = "student-1",
                SectionID = "section-1"
            };

            _mockEnrollmentRepo.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<Enrollment, bool>>>()))
                .ReturnsAsync(enrollment);

            _mockGradeRepo.Setup(r => r.ExistsAsync(It.IsAny<Expression<Func<Grade, bool>>>()))
                .ReturnsAsync(true); // Grade already exists

            CreateGradeDto createDto = new CreateGradeDto
            {
                EnrollmentID = "enrollment-dup",
                AttendanceScore = 8.0m,
                MidtermScore = 7.0m,
                FinalScore = 9.0m
            };

            // Act & Assert
            await _gradeService.Invoking(s => s.CreateAsync(createDto, "teacher1"))
                .Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("*already exists*");
        }

        #endregion

        #region GetById and Delete Tests

        [Fact]
        public async Task GetById_ExistingGrade_ReturnsGradeDto()
        {
            // Arrange
            Grade grade = new Grade
            {
                GradeID = "grade-1",
                StudentID = "student-1",
                SubjectID = "subject-1",
                Semester = 1,
                AcademicYear = "2024-2025",
                AttendanceScore = 8.0m,
                MidtermScore = 7.0m,
                FinalScore = 9.0m
            };
            grade.CalculateTotalScore();

            _mockGradeRepo.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<Grade, bool>>>()))
                .ReturnsAsync(grade);

            // Act
            GradeDto result = await _gradeService.GetByIdAsync("grade-1");

            // Assert
            result.Should().NotBeNull();
            result.GradeID.Should().Be("grade-1");
            result.TotalScore.Should().Be(8.30m);
        }

        [Fact]
        public async Task DeleteGrade_ExistingGrade_ReturnsTrue()
        {
            // Arrange
            Grade grade = new Grade { GradeID = "grade-delete" };

            _mockGradeRepo.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<Grade, bool>>>()))
                .ReturnsAsync(grade);

            // Act
            bool result = await _gradeService.DeleteAsync("grade-delete");

            // Assert
            result.Should().BeTrue();
            _mockGradeRepo.Verify(r => r.DeleteAsync(grade), Times.Once);
        }

        #endregion

        #region GetTranscript Tests

        [Fact]
        public async Task GetTranscript_ExistingStudent_ReturnsTranscriptData()
        {
            // Arrange
            string studentId = "student-transcript";
            Student student = new Student(
                "Transcript Student", "transcript@test.com", "0901234567",
                new DateTime(2000, 1, 1), Core.Enums.Gender.Male, "SV100", 2024, "K24"
            );
            typeof(Person).GetProperty("Id")!.SetValue(student, studentId);

            _mockStudentRepo.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<Student, bool>>>()))
                .ReturnsAsync(student);

            // Empty grades for simplicity
            _mockGradeRepo.Setup(r => r.GetQueryable())
                .Returns(new List<Grade>().AsAsyncQueryable());

            // Act
            TranscriptDto result = await _gradeService.GetTranscriptAsync(studentId);

            // Assert
            result.Should().NotBeNull();
            result.StudentID.Should().Be(studentId);
            result.StudentCode.Should().Be("SV100");
            result.StudentName.Should().Be("Transcript Student");
            result.Semesters.Should().NotBeNull();
        }

        #endregion
    }
}
