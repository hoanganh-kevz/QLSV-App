using Microsoft.Extensions.Configuration;
using StudentManagement.Core.DTOs.Auth;
using StudentManagement.Core.Entities;
using StudentManagement.Core.Enums;
using StudentManagement.Core.Interfaces.Repositories;
using StudentManagement.Core.Interfaces.Services;
using StudentManagement.Services.Helpers;

namespace StudentManagement.Services.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly JwtHelper _jwtHelper;
        private readonly IConfiguration _configuration;

        public AuthService(IUnitOfWork unitOfWork, JwtHelper jwtHelper, IConfiguration configuration)
        {
            _unitOfWork = unitOfWork;
            _jwtHelper = jwtHelper;
            _configuration = configuration;
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
        {
            // Find account by username
            var account = await _unitOfWork.Repository<Account>()
                .FirstOrDefaultAsync(a => a.Username == loginDto.Username);

            if (account == null || !account.IsActive)
                throw new UnauthorizedAccessException("Invalid username or password");

            // Verify password
            if (!account.VerifyPassword(loginDto.Password))
            {
                account.RecordFailedLogin();
                await _unitOfWork.SaveChangesAsync();
                throw new UnauthorizedAccessException("Invalid username or password");
            }

            // Get associated person
            var person = await _unitOfWork.Repository<Person>()
                .FirstOrDefaultAsync(p => p.AccountID == account.AccountID);

            if (person == null)
                throw new InvalidOperationException("Person data not found");

            // Record successful login
            account.RecordLogin();
            await _unitOfWork.SaveChangesAsync();

            // Generate token
            var token = _jwtHelper.GenerateToken(account, person);
            var expiryMinutes = Convert.ToDouble(_configuration["JwtSettings:ExpiryMinutes"]);

            return new AuthResponseDto
            {
                Token = token,
                Username = account.Username,
                Role = account.Role.ToString(),
                FullName = person.FullName,
                Email = person.Email,
                ExpiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes)
            };
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto)
        {
            // Check if username exists
            var existingAccount = await _unitOfWork.Repository<Account>()
                .FirstOrDefaultAsync(a => a.Username == registerDto.Username);

            if (existingAccount != null)
                throw new InvalidOperationException("Username already exists");

            // Check if email exists
            var existingPerson = await _unitOfWork.Repository<Person>()
                .FirstOrDefaultAsync(p => p.Email == registerDto.Email);

            if (existingPerson != null)
                throw new InvalidOperationException("Email already exists");

            await _unitOfWork.BeginTransactionAsync();

            try
            {
                // Create account
                var account = new Account(registerDto.Username, registerDto.Password, registerDto.Role);
                await _unitOfWork.Repository<Account>().AddAsync(account);
                await _unitOfWork.SaveChangesAsync();

                // Create person based on role
                Person person;
                switch (registerDto.Role)
                {
                    case AccountRole.Student:
                        var studentCode = GenerateStudentCode();
                        person = new Student(
                            registerDto.FullName,
                            registerDto.Email,
                            registerDto.PhoneNumber,
                            registerDto.DateOfBirth,
                            registerDto.Gender,
                            studentCode,
                            DateTime.Now.Year,
                            $"K{DateTime.Now.Year % 100}"
                        );
                        break;

                    case AccountRole.Teacher:
                        var teacherCode = GenerateTeacherCode();
                        person = new Teacher(
                            registerDto.FullName,
                            registerDto.Email,
                            registerDto.PhoneNumber,
                            registerDto.DateOfBirth,
                            registerDto.Gender,
                            teacherCode,
                            DateTime.Now
                        );
                        break;

                    case AccountRole.Admin:
                        var adminCode = GenerateAdminCode();
                        person = new Admin(
                            registerDto.FullName,
                            registerDto.Email,
                            registerDto.PhoneNumber,
                            registerDto.DateOfBirth,
                            registerDto.Gender,
                            adminCode
                        );
                        break;

                    default:
                        throw new InvalidOperationException("Invalid role");
                }

                await _unitOfWork.Repository<Person>().AddAsync(person);
                await _unitOfWork.SaveChangesAsync();

                // Link account to person
                person.SetAccount(account.AccountID);
                await _unitOfWork.SaveChangesAsync();

                await _unitOfWork.CommitTransactionAsync();

                // Generate token
                var token = _jwtHelper.GenerateToken(account, person);
                var expiryMinutes = Convert.ToDouble(_configuration["JwtSettings:ExpiryMinutes"]);

                return new AuthResponseDto
                {
                    Token = token,
                    Username = account.Username,
                    Role = account.Role.ToString(),
                    FullName = person.FullName,
                    Email = person.Email,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes)
                };
            }
            catch
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }
        }

        public async Task<bool> ChangePasswordAsync(string accountId, string currentPassword, string newPassword)
        {
            var account = await _unitOfWork.Repository<Account>().GetByIdAsync(accountId);

            if (account == null)
                throw new InvalidOperationException("Account not found");

            if (!account.VerifyPassword(currentPassword))
                throw new UnauthorizedAccessException("Current password is incorrect");

            account.SetPassword(newPassword);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }

        private string GenerateStudentCode()
        {
            // Format: YYMM + 6 digit random (e.g., 240100001)
            var prefix = DateTime.Now.ToString("yyMM");
            var random = new Random().Next(100000, 999999);
            return $"{prefix}{random}";
        }

        private string GenerateTeacherCode()
        {
            // Format: GV + 6 digit (e.g., GV000001)
            var count = _unitOfWork.Repository<Teacher>().CountAsync().Result;
            return $"GV{(count + 1):D6}";
        }

        private string GenerateAdminCode()
        {
            // Format: AD + 6 digit (e.g., AD000001)
            var count = _unitOfWork.Repository<Admin>().CountAsync().Result;
            return $"AD{(count + 1):D6}";
        }
    }
}