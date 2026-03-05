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