using StudentManagement.Core.DTOs;
using StudentManagement.Core.DTOs.User;

namespace StudentManagement.Core.Interfaces.Services
{
    public interface IUserManagementService
    {
        Task<PagedResult<UserListDto>> GetAllUsersAsync(UserSearchDto searchDto);
        Task<UserListDto> GetUserByIdAsync(string accountId);
        Task<UserListDto> CreateUserAsync(CreateUserDto createDto);
        Task<UserListDto> UpdateUserAsync(string accountId, UpdateUserDto updateDto);
        Task<bool> ActivateUserAsync(string accountId);
        Task<bool> DeactivateUserAsync(string accountId);
        Task<bool> ResetPasswordAsync(string accountId, string newPassword);
        Task<bool> DeleteUserAsync(string accountId);
    }
}
