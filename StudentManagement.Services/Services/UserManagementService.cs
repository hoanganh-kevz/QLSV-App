using AutoMapper;
using StudentManagement.Core.DTOs;
using StudentManagement.Core.DTOs.User;
using StudentManagement.Core.Entities;
using StudentManagement.Core.Enums;
using StudentManagement.Core.Interfaces.Repositories;
using StudentManagement.Core.Interfaces.Services;

namespace StudentManagement.Services.Services
{
    public class UserManagementService : IUserManagementService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public UserManagementService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<PagedResult<UserListDto>> GetAllUsersAsync(UserSearchDto searchDto)
        {
            IEnumerable<Account> accounts = await _unitOfWork.Repository<Account>()
                .FindAsync((Account a) => true);

            // Apply filters
            if (!string.IsNullOrEmpty(searchDto.Keyword))
            {
                accounts = accounts.Where((Account a) =>
                    a.Username.Contains(searchDto.Keyword, StringComparison.OrdinalIgnoreCase));
            }

            if (!string.IsNullOrEmpty(searchDto.Role))
            {
                AccountRole roleEnum = Enum.Parse<AccountRole>(searchDto.Role);
                accounts = accounts.Where((Account a) => a.Role == roleEnum);
            }

            if (searchDto.IsActive.HasValue)
            {
                accounts = accounts.Where((Account a) => a.IsActive == searchDto.IsActive.Value);
            }

            int totalCount = accounts.Count();

            // Pagination
            List<Account> pagedAccounts = accounts
                .Skip((searchDto.PageNumber - 1) * searchDto.PageSize)
                .Take(searchDto.PageSize)
                .ToList();

            // Get person info for each account
            List<UserListDto> userDtos = new List<UserListDto>();
            foreach (Account account in pagedAccounts)
            {
                Person? person = await _unitOfWork.Repository<Person>()
                    .FirstOrDefaultAsync((Person p) => p.AccountID == account.AccountID);

                userDtos.Add(new UserListDto
                {
                    AccountID = account.AccountID,
                    Username = account.Username,
                    Role = account.Role.ToString(),
                    FullName = person?.FullName ?? "N/A",
                    Email = person?.Email ?? "N/A",
                    IsActive = account.IsActive,
                    LastLogin = account.LastLogin,
                    CreatedAt = account.CreatedAt,
                    FailedLoginAttempts = account.FailedLoginAttempts
                });
            }

            return new PagedResult<UserListDto>
            {
                Items = userDtos,
                TotalCount = totalCount,
                PageNumber = searchDto.PageNumber,
                PageSize = searchDto.PageSize
            };
        }

        public async Task<UserListDto> GetUserByIdAsync(string accountId)
        {
            Account? account = await _unitOfWork.Repository<Account>().GetByIdAsync(accountId);
            if (account == null)
                throw new KeyNotFoundException($"User with ID {accountId} not found");

            Person? person = await _unitOfWork.Repository<Person>()
                .FirstOrDefaultAsync((Person p) => p.AccountID == account.AccountID);

            return new UserListDto
            {
                AccountID = account.AccountID,
                Username = account.Username,
                Role = account.Role.ToString(),
                FullName = person?.FullName ?? "N/A",
                Email = person?.Email ?? "N/A",
                IsActive = account.IsActive,
                LastLogin = account.LastLogin,
                CreatedAt = account.CreatedAt,
                FailedLoginAttempts = account.FailedLoginAttempts
            };
        }

        public async Task<UserListDto> CreateUserAsync(CreateUserDto createDto)
        {
            // Check duplicate username
            Account? existing = await _unitOfWork.Repository<Account>()
                .FirstOrDefaultAsync((Account a) => a.Username == createDto.Username);
            if (existing != null)
                throw new InvalidOperationException("Username already exists");

            // Parse role
            AccountRole role = Enum.Parse<AccountRole>(createDto.Role);

            // Create account
            Account account = new Account(createDto.Username, createDto.Password, role);
            await _unitOfWork.Repository<Account>().AddAsync(account);
            await _unitOfWork.SaveChangesAsync();

            // Create person based on role
            Gender gender = Enum.TryParse<Gender>(createDto.Gender, out Gender g) ? g : Gender.Male;

            if (role == AccountRole.Admin)
            {
                Admin admin = new Admin(
                    createDto.FullName, createDto.Email, createDto.PhoneNumber,
                    createDto.DateOfBirth, gender,
                    $"AD{DateTime.Now:yyyyMMddHHmmss}"
                );
                admin.SetAccount(account.AccountID);
                await _unitOfWork.Repository<Admin>().AddAsync(admin);
            }

            await _unitOfWork.SaveChangesAsync();

            return new UserListDto
            {
                AccountID = account.AccountID,
                Username = account.Username,
                Role = account.Role.ToString(),
                FullName = createDto.FullName,
                Email = createDto.Email,
                IsActive = account.IsActive,
                CreatedAt = account.CreatedAt
            };
        }

        public async Task<UserListDto> UpdateUserAsync(string accountId, UpdateUserDto updateDto)
        {
            Account? account = await _unitOfWork.Repository<Account>().GetByIdAsync(accountId);
            if (account == null)
                throw new KeyNotFoundException($"User with ID {accountId} not found");

            // Update IsActive if provided
            if (updateDto.IsActive.HasValue)
            {
                if (updateDto.IsActive.Value)
                    account.Activate();
                else
                    account.Deactivate();
            }

            // Update person info if provided
            Person? person = await _unitOfWork.Repository<Person>()
                .FirstOrDefaultAsync((Person p) => p.AccountID == accountId);

            if (person != null)
            {
                person.UpdatePersonInfo(
                    updateDto.FullName ?? person.FullName,
                    updateDto.Email ?? person.Email,
                    updateDto.PhoneNumber ?? person.PhoneNumber,
                    person.DateOfBirth,
                    person.Gender
                );
            }

            await _unitOfWork.SaveChangesAsync();

            return new UserListDto
            {
                AccountID = account.AccountID,
                Username = account.Username,
                Role = account.Role.ToString(),
                FullName = person?.FullName ?? "N/A",
                Email = person?.Email ?? "N/A",
                IsActive = account.IsActive,
                LastLogin = account.LastLogin,
                CreatedAt = account.CreatedAt,
                FailedLoginAttempts = account.FailedLoginAttempts
            };
        }

        public async Task<bool> ActivateUserAsync(string accountId)
        {
            Account? account = await _unitOfWork.Repository<Account>().GetByIdAsync(accountId);
            if (account == null)
                return false;

            account.Activate();
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeactivateUserAsync(string accountId)
        {
            Account? account = await _unitOfWork.Repository<Account>().GetByIdAsync(accountId);
            if (account == null)
                return false;

            account.Deactivate();
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ResetPasswordAsync(string accountId, string newPassword)
        {
            Account? account = await _unitOfWork.Repository<Account>().GetByIdAsync(accountId);
            if (account == null)
                return false;

            account.SetPassword(newPassword);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteUserAsync(string accountId)
        {
            // Soft delete - deactivate instead
            return await DeactivateUserAsync(accountId);
        }
    }
}