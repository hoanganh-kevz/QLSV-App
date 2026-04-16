using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Core.DTOs.Auth;
using StudentManagement.Core.DTOs.User;
using StudentManagement.Core.Interfaces.Services;
using System.Security.Claims;

namespace StudentManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        /// <summary>
        /// Login with username and password
        /// </summary>
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto loginDto)
        {
            try
            {
                AuthResponseDto result = await _authService.LoginAsync(loginDto);
                _logger.LogInformation("User {Username} logged in successfully", loginDto.Username);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning("Failed login attempt for user {Username}", loginDto.Username);
                return Unauthorized(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Register a new user (Admin only in production)
        /// </summary>
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto registerDto)
        {
            try
            {
                AuthResponseDto result = await _authService.RegisterAsync(registerDto);
                _logger.LogInformation("New user {Username} registered successfully", registerDto.Username);
                return CreatedAtAction(nameof(GetProfile), new { }, result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get current user profile
        /// </summary>
        [HttpGet("profile")]
        [Authorize]
        public ActionResult<object> GetProfile()
        {
            string? userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            string? username = User.FindFirst(ClaimTypes.Name)?.Value;
            string? role = User.FindFirst(ClaimTypes.Role)?.Value;
            string? fullName = User.FindFirst("FullName")?.Value;
            string? email = User.FindFirst("Email")?.Value;

            return Ok(new
            {
                userId,
                username,
                role,
                fullName,
                email
            });
        }

        /// <summary>
        /// Lấy thông tin user hiện tại từ JWT token.
        /// Frontend AuthProvider gọi endpoint này khi khởi động để verify token.
        /// </summary>
        [HttpGet("me")]
        [Authorize]
        public ActionResult<object> GetCurrentUser()
        {
            string? userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            string? username = User.FindFirst(ClaimTypes.Name)?.Value;
            string? role = User.FindFirst(ClaimTypes.Role)?.Value;
            string? fullName = User.FindFirst("FullName")?.Value;
            string? email = User.FindFirst("Email")?.Value;
            string? personId = User.FindFirst("PersonId")?.Value;

            return Ok(new
            {
                id = userId,
                personId,
                username,
                role = role?.ToLower(),
                fullName,
                name = fullName,
                email
            });
        }

        /// <summary>
        /// Cập nhật thông tin profile của user hiện tại.
        /// Frontend ProfilePage gọi PUT /api/auth/profile.
        /// </summary>
        [HttpPut("profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] object profileData)
        {
            // TODO: Implement profile update logic khi cần
            return Ok(new { message = "Profile updated successfully" });
        }

        /// <summary>
        /// Đổi mật khẩu cho user hiện tại.
        /// </summary>
        [HttpPut("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            try
            {
                string? accountId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(accountId))
                    return Unauthorized();

                bool result = await _authService.ChangePasswordAsync(accountId, dto.CurrentPassword, dto.NewPassword);

                return Ok(new { message = "Password changed successfully" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Google OAuth login (stub — chưa triển khai xác thực Google thực tế).
        /// Frontend có nút "Login with Google", endpoint này trả lỗi cho đến khi có Google OAuth.
        /// </summary>
        [HttpPost("google")]
        [AllowAnonymous]
        public IActionResult GoogleLogin([FromBody] object googleData)
        {
            return StatusCode(501, new { message = "Google authentication is not yet configured. Please use username/password login." });
        }

        /// <summary>
        /// Yêu cầu đặt lại mật khẩu (stub — chưa triển khai gửi OTP qua email).
        /// </summary>
        [HttpPost("forgot-password")]
        [AllowAnonymous]
        public IActionResult ForgotPassword([FromBody] object data)
        {
            return StatusCode(501, new { message = "Forgot password feature is not yet configured." });
        }

        /// <summary>
        /// Đặt lại mật khẩu bằng OTP (stub — chưa triển khai).
        /// </summary>
        [HttpPost("reset-password")]
        [AllowAnonymous]
        public IActionResult ResetPassword([FromBody] object data)
        {
            return StatusCode(501, new { message = "Reset password feature is not yet configured." });
        }
    }
}