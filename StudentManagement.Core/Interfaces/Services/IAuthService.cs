using StudentManagement.Core.DTOs.Auth;

namespace StudentManagement.Core.Interfaces.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto> LoginAsync(LoginDto loginDto);
        Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto);
        Task<bool> ChangePasswordAsync(string accountId, string currentPassword, string newPassword);
    }
}