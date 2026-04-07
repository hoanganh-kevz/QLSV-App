using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Moq;
using StudentManagement.Core.DTOs.Auth;
using StudentManagement.Core.Entities;
using StudentManagement.Core.Enums;
using StudentManagement.Core.Interfaces.Repositories;
using StudentManagement.Services.Helpers;
using StudentManagement.Services.Services;
using System.Linq.Expressions;

namespace StudentManagement.Tests.Tests
{
    public class AuthServiceTests
    {
        private readonly Mock<IUnitOfWork> _mockUnitOfWork;
        private readonly Mock<IGenericRepository<Account>> _mockAccountRepo;
        private readonly Mock<IGenericRepository<Person>> _mockPersonRepo;
        private readonly Mock<IGenericRepository<Student>> _mockStudentRepo;
        private readonly Mock<IGenericRepository<Teacher>> _mockTeacherRepo;
        private readonly Mock<IGenericRepository<Admin>> _mockAdminRepo;
        private readonly JwtHelper _jwtHelper;
        private readonly IConfiguration _configuration;
        private readonly AuthService _authService;

        public AuthServiceTests()
        {
            // Setup in-memory configuration
            Dictionary<string, string?> configValues = new Dictionary<string, string?>
            {
                { "JwtSettings:Secret", "ThisIsASuperSecretKeyForTestingPurposesOnly123456!" },
                { "JwtSettings:Issuer", "TestIssuer" },
                { "JwtSettings:Audience", "TestAudience" },
                { "JwtSettings:ExpiryMinutes", "60" }
            };

            _configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(configValues)
                .Build();

            _jwtHelper = new JwtHelper(_configuration);

            _mockUnitOfWork = new Mock<IUnitOfWork>();
            _mockAccountRepo = new Mock<IGenericRepository<Account>>();
            _mockPersonRepo = new Mock<IGenericRepository<Person>>();
            _mockStudentRepo = new Mock<IGenericRepository<Student>>();
            _mockTeacherRepo = new Mock<IGenericRepository<Teacher>>();
            _mockAdminRepo = new Mock<IGenericRepository<Admin>>();

            _mockUnitOfWork.Setup(u => u.Repository<Account>()).Returns(_mockAccountRepo.Object);
            _mockUnitOfWork.Setup(u => u.Repository<Person>()).Returns(_mockPersonRepo.Object);
            _mockUnitOfWork.Setup(u => u.Repository<Student>()).Returns(_mockStudentRepo.Object);
            _mockUnitOfWork.Setup(u => u.Repository<Teacher>()).Returns(_mockTeacherRepo.Object);
            _mockUnitOfWork.Setup(u => u.Repository<Admin>()).Returns(_mockAdminRepo.Object);
            _mockUnitOfWork.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);
            _mockUnitOfWork.Setup(u => u.BeginTransactionAsync()).Returns(Task.CompletedTask);
            _mockUnitOfWork.Setup(u => u.CommitTransactionAsync()).Returns(Task.CompletedTask);
            _mockUnitOfWork.Setup(u => u.RollbackTransactionAsync()).Returns(Task.CompletedTask);

            _authService = new AuthService(_mockUnitOfWork.Object, _jwtHelper, _configuration);
        }

        #region Login Tests

        [Fact]
        public async Task Login_ValidCredentials_ReturnsAuthResponse()
        {
            // Arrange
            Account account = new Account("testuser", "password123", AccountRole.Student);

            Student person = new Student(
                "Test User", "test@example.com", "0901234567",
                new DateTime(2000, 1, 1), Gender.Male, "SV001", 2024, "K24"
            );
            person.SetAccount(account.AccountID);

            _mockAccountRepo.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<Account, bool>>>()))
                .ReturnsAsync(account);

            _mockPersonRepo.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<Person, bool>>>()))
                .ReturnsAsync(person);

            LoginDto loginDto = new LoginDto
            {
                Username = "testuser",
                Password = "password123"
            };

            // Act
            AuthResponseDto result = await _authService.LoginAsync(loginDto);

            // Assert
            result.Should().NotBeNull();
            result.Token.Should().NotBeNullOrEmpty();
            result.Username.Should().Be("testuser");
            result.Role.Should().Be("Student");
            result.FullName.Should().Be("Test User");
            result.Email.Should().Be("test@example.com");
            result.ExpiresAt.Should().BeAfter(DateTime.UtcNow);
        }

        [Fact]
        public async Task Login_InvalidPassword_ThrowsUnauthorizedAccessException()
        {
            // Arrange
            Account account = new Account("testuser", "correct_password", AccountRole.Student);

            _mockAccountRepo.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<Account, bool>>>()))
                .ReturnsAsync(account);

            LoginDto loginDto = new LoginDto
            {
                Username = "testuser",
                Password = "wrong_password"
            };

            // Act & Assert
            await _authService.Invoking(s => s.LoginAsync(loginDto))
                .Should().ThrowAsync<UnauthorizedAccessException>()
                .WithMessage("*Invalid username or password*");
        }

        [Fact]
        public async Task Login_InactiveAccount_ThrowsUnauthorizedAccessException()
        {
            // Arrange
            Account account = new Account("testuser", "password123", AccountRole.Student);
            account.Deactivate(); // Make inactive

            _mockAccountRepo.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<Account, bool>>>()))
                .ReturnsAsync(account);

            LoginDto loginDto = new LoginDto
            {
                Username = "testuser",
                Password = "password123"
            };

            // Act & Assert
            await _authService.Invoking(s => s.LoginAsync(loginDto))
                .Should().ThrowAsync<UnauthorizedAccessException>()
                .WithMessage("*Invalid username or password*");
        }

        #endregion

        #region Register Tests

        [Fact]
        public async Task Register_DuplicateUsername_ThrowsInvalidOperationException()
        {
            // Arrange
            Account existingAccount = new Account("existinguser", "password123", AccountRole.Student);

            _mockAccountRepo.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<Account, bool>>>()))
                .ReturnsAsync(existingAccount); // Username already exists

            RegisterDto registerDto = new RegisterDto
            {
                Username = "existinguser",
                Password = "password123",
                Role = AccountRole.Student,
                FullName = "New User",
                Email = "new@test.com",
                PhoneNumber = "0901234567",
                DateOfBirth = new DateTime(2000, 1, 1),
                Gender = Gender.Male
            };

            // Act & Assert
            await _authService.Invoking(s => s.RegisterAsync(registerDto))
                .Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("*Username already exists*");
        }

        #endregion

        #region ChangePassword Tests

        [Fact]
        public async Task ChangePassword_ValidCurrentPassword_ReturnsTrue()
        {
            // Arrange
            Account account = new Account("testuser", "current_password", AccountRole.Student);
            string accountId = account.AccountID;

            _mockAccountRepo.Setup(r => r.GetByIdAsync(accountId))
                .ReturnsAsync(account);

            // Act
            bool result = await _authService.ChangePasswordAsync(accountId, "current_password", "new_password_123");

            // Assert
            result.Should().BeTrue();
            account.VerifyPassword("new_password_123").Should().BeTrue();
            _mockUnitOfWork.Verify(u => u.SaveChangesAsync(), Times.Once);
        }

        [Fact]
        public async Task ChangePassword_WrongCurrentPassword_ThrowsUnauthorizedException()
        {
            // Arrange
            Account account = new Account("testuser", "correct_password", AccountRole.Student);
            string accountId = account.AccountID;

            _mockAccountRepo.Setup(r => r.GetByIdAsync(accountId))
                .ReturnsAsync(account);

            // Act & Assert
            await _authService.Invoking(s => s.ChangePasswordAsync(accountId, "wrong_password", "new_password"))
                .Should().ThrowAsync<UnauthorizedAccessException>()
                .WithMessage("*Current password is incorrect*");
        }

        #endregion
    }
}
