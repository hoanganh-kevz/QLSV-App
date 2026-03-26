using AutoMapper;
using FluentAssertions;
using Moq;
using StudentManagement.Core.DTOs.Student;
using StudentManagement.Core.Entities;
using StudentManagement.Core.Enums;
using StudentManagement.Core.Interfaces.Repositories;
using StudentManagement.Services.Services;
using StudentManagement.Tests.TestHelpers;
using System.Linq.Expressions;

namespace StudentManagement.Tests.Tests
{
    /// <summary>
    /// A fake IUnitOfWork that dispatches Repository<T>() to pre-registered mocks.
    /// This avoids the Moq generic method proxy casting issue.
    /// </summary>
    internal class FakeUnitOfWork : IUnitOfWork
    {
        private readonly Dictionary<Type, object> _repos = new();

        public void RegisterRepo<T>(IGenericRepository<T> repo) where T : class
        {
            _repos[typeof(T)] = repo;
        }

        public IGenericRepository<T> Repository<T>() where T : class
        {
            return (IGenericRepository<T>)_repos[typeof(T)];
        }

        public Task<int> SaveChangesAsync() => Task.FromResult(1);
        public Task BeginTransactionAsync() => Task.CompletedTask;
        public Task CommitTransactionAsync() => Task.CompletedTask;
        public Task RollbackTransactionAsync() => Task.CompletedTask;
        public void Dispose() { }
    }

    public class StudentServiceTests
    {
        private readonly IMapper _mapper;

        public StudentServiceTests()
        {
            _mapper = MockSetup.CreateMapper();
        }

        private (StudentService service, FakeUnitOfWork unitOfWork,
                 Mock<IGenericRepository<Student>> studentRepo,
                 Mock<IGenericRepository<Person>> personRepo,
                 Mock<IGenericRepository<Account>> accountRepo) CreateService()
        {
            Mock<IGenericRepository<Student>> mockStudentRepo = new Mock<IGenericRepository<Student>>();
            Mock<IGenericRepository<Person>> mockPersonRepo = new Mock<IGenericRepository<Person>>();
            Mock<IGenericRepository<Account>> mockAccountRepo = new Mock<IGenericRepository<Account>>();

            FakeUnitOfWork fakeUow = new FakeUnitOfWork();
            fakeUow.RegisterRepo(mockStudentRepo.Object);
            fakeUow.RegisterRepo(mockPersonRepo.Object);
            fakeUow.RegisterRepo(mockAccountRepo.Object);

            // Default CountAsync for GenerateStudentCodeAsync
            mockStudentRepo.Setup(r => r.CountAsync(It.IsAny<Expression<Func<Student, bool>>>()))
                .ReturnsAsync(0);
            mockStudentRepo.Setup(r => r.CountAsync(null)).ReturnsAsync(0);

            StudentService service = new StudentService(fakeUow, _mapper);
            return (service, fakeUow, mockStudentRepo, mockPersonRepo, mockAccountRepo);
        }

        #region CreateStudent Tests

        [Fact]
        public async Task CreateStudent_ValidData_ReturnsStudentDto()
        {
            // Arrange
            var (service, _, studentRepo, personRepo, accountRepo) = CreateService();

            CreateStudentDto createDto = new CreateStudentDto
            {
                FullName = "Nguyễn Văn A",
                Email = "nguyenvana@test.com",
                PhoneNumber = "0901234567",
                DateOfBirth = new DateTime(2000, 1, 1),
                Gender = Gender.Male,
                EnrollmentYear = 2024,
                AcademicYear = "K24",
                Username = "nguyenvana",
                Password = "password123",
                ClassID = "class-1",
                MajorID = "major-1"
            };

            personRepo.Setup(r => r.ExistsAsync(It.IsAny<Expression<Func<Person, bool>>>()))
                .ReturnsAsync(false);

            // Act
            StudentDto result = await service.CreateAsync(createDto);

            // Assert
            result.Should().NotBeNull();
            result.FullName.Should().Be("Nguyễn Văn A");
            result.Email.Should().Be("nguyenvana@test.com");
            result.StudentCode.Should().NotBeNullOrEmpty();

            accountRepo.Verify(r => r.AddAsync(It.IsAny<Account>()), Times.Once);
            studentRepo.Verify(r => r.AddAsync(It.IsAny<Student>()), Times.Once);
        }

        [Fact]
        public async Task CreateStudent_DuplicateEmail_ThrowsInvalidOperationException()
        {
            // Arrange
            var (service, _, _, personRepo, _) = CreateService();

            CreateStudentDto createDto = new CreateStudentDto
            {
                FullName = "Nguyễn Văn B",
                Email = "existing@test.com",
                PhoneNumber = "0901234567",
                DateOfBirth = new DateTime(2000, 1, 1),
                Gender = Gender.Male,
                EnrollmentYear = 2024,
                AcademicYear = "K24",
                Username = "nguyenvanb",
                Password = "password123"
            };

            personRepo.Setup(r => r.ExistsAsync(It.IsAny<Expression<Func<Person, bool>>>()))
                .ReturnsAsync(true);

            // Act & Assert
            await service.Invoking(s => s.CreateAsync(createDto))
                .Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("*Email already exists*");
        }

        #endregion

        #region GetById Tests

        [Fact]
        public async Task GetById_ExistingStudent_ReturnsStudentDto()
        {
            // Arrange
            var (service, _, studentRepo, _, _) = CreateService();
            string studentId = "student-123";
            Student student = new Student(
                "Trần Thị B", "tranthib@test.com", "0907654321",
                new DateTime(2001, 5, 15), Gender.Female, "SV001", 2024, "K24"
            );
            typeof(Person).GetProperty("Id")!.SetValue(student, studentId);

            studentRepo.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<Student, bool>>>()))
                .ReturnsAsync(student);

            // Act
            StudentDto result = await service.GetByIdAsync(studentId);

            // Assert
            result.Should().NotBeNull();
            result.FullName.Should().Be("Trần Thị B");
            result.Email.Should().Be("tranthib@test.com");
            result.StudentCode.Should().Be("SV001");
        }

        [Fact]
        public async Task GetById_NonExistentStudent_ThrowsKeyNotFoundException()
        {
            // Arrange
            var (service, _, studentRepo, _, _) = CreateService();

            studentRepo.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<Student, bool>>>()))
                .ReturnsAsync((Student?)null);

            // Act & Assert
            await service.Invoking(s => s.GetByIdAsync("non-existent"))
                .Should().ThrowAsync<KeyNotFoundException>()
                .WithMessage("*not found*");
        }

        #endregion

        #region UpdateStudent Tests

        [Fact]
        public async Task UpdateStudent_ValidData_ReturnsUpdatedDto()
        {
            // Arrange
            var (service, _, studentRepo, _, _) = CreateService();
            string studentId = "student-update";
            Student existingStudent = new Student(
                "Old Name", "old@test.com", "0900000000",
                new DateTime(2000, 1, 1), Gender.Male, "SV002", 2024, "K24"
            );
            typeof(Person).GetProperty("Id")!.SetValue(existingStudent, studentId);

            studentRepo.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<Student, bool>>>()))
                .ReturnsAsync(existingStudent);

            UpdateStudentDto updateDto = new UpdateStudentDto
            {
                FullName = "New Name",
                Email = "new@test.com",
                PhoneNumber = "0911111111",
                DateOfBirth = new DateTime(2000, 6, 15),
                Gender = Gender.Male,
                Status = StudentStatus.Active
            };

            // Act
            StudentDto result = await service.UpdateAsync(studentId, updateDto);

            // Assert
            result.Should().NotBeNull();
            result.FullName.Should().Be("New Name");
            result.Email.Should().Be("new@test.com");
        }

        #endregion

        #region DeleteStudent Tests

        [Fact]
        public async Task DeleteStudent_ExistingStudent_ReturnsTrue()
        {
            // Arrange
            var (service, _, studentRepo, _, _) = CreateService();
            Student student = new Student(
                "Delete Me", "delete@test.com", "0900000000",
                new DateTime(2000, 1, 1), Gender.Male, "SV003", 2024, "K24"
            );

            studentRepo.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<Student, bool>>>()))
                .ReturnsAsync(student);

            // Act
            bool result = await service.DeleteAsync("student-delete");

            // Assert
            result.Should().BeTrue();
            studentRepo.Verify(r => r.DeleteAsync(student), Times.Once);
        }

        [Fact]
        public async Task DeleteStudent_NonExistentStudent_ReturnsFalse()
        {
            // Arrange
            var (service, _, studentRepo, _, _) = CreateService();

            studentRepo.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<Student, bool>>>()))
                .ReturnsAsync((Student?)null);

            // Act
            bool result = await service.DeleteAsync("non-existent");

            // Assert
            result.Should().BeFalse();
            studentRepo.Verify(r => r.DeleteAsync(It.IsAny<Student>()), Times.Never);
        }

        #endregion
    }
}
