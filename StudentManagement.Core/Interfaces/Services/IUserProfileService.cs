using StudentManagement.Core.DTOs.User;

namespace StudentManagement.Core.Interfaces.Services
{
    public interface IUserProfileService
    {
        Task<UserProfileDto> GetProfileAsync(string userId);
        Task<UserProfileDto> UpdateProfileAsync(string userId, UpdateProfileDto updateDto);
        Task<bool> ChangePasswordAsync(string userId, ChangePasswordDto changePasswordDto);
        Task<bool> UpdateAvatarAsync(string userId, string avatarUrl);
    }
}
