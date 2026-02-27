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
                var result = await _authService.LoginAsync(loginDto);
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
                var result = await _authService.RegisterAsync(registerDto);
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
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var username = User.FindFirst(ClaimTypes.Name)?.Value;
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            var fullName = User.FindFirst("FullName")?.Value;
            var email = User.FindFirst("Email")?.Value;

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
                var accountId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                
                if (string.IsNullOrEmpty(accountId))
                    return Unauthorized();

                var result = await _authService.ChangePasswordAsync(accountId, dto.CurrentPassword, dto.NewPassword);
                
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