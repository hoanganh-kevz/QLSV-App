using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Core.DTOs.Auth;
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
                _logger.LogInformation($"User {loginDto.Username} logged in successfully");
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning($"Failed login attempt for user {loginDto.Username}");
                return Unauthorized(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Register a new user (Admin only in production)
        /// </summary>
        [HttpPost("register")]
        [AllowAnonymous] // Change to [Authorize(Roles = "Admin")] in production
        public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto registerDto)
        {
            try
            {
                AuthResponseDto result = await _authService.RegisterAsync(registerDto);
                _logger.LogInformation($"New user {registerDto.Username} registered successfully");
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
        /// Change password
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
    }

    // DTO for change password
    public class ChangePasswordDto
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}