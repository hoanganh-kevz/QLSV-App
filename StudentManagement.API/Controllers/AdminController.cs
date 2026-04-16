using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentManagement.Core.Entities;
using StudentManagement.Core.Enums;
using StudentManagement.Infrastructure.Data;

namespace StudentManagement.API.Controllers
{
    /// <summary>
    /// Controller quản trị hệ thống (Admin only).
    /// Cung cấp quản lý người dùng: xem danh sách, đổi role, xoá tài khoản.
    /// Frontend UsersPage gọi thông qua userService.js tại /api/admin/users.
    /// </summary>
    [Route("api/admin")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<AdminController> _logger;

        public AdminController(AppDbContext context, ILogger<AdminController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Lấy danh sách tất cả user (accounts) kèm thông tin Person liên kết.
        /// </summary>
        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var users = await _context.Accounts
                    .Include(a => a.Person)
                    .Select(a => new
                    {
                        id = a.AccountID,
                        username = a.Username,
                        role = a.Role.ToString().ToLower(),
                        isActive = a.IsActive,
                        lastLogin = a.LastLogin,
                        createdAt = a.CreatedAt,
                        fullName = a.Person != null ? a.Person.FullName : a.Username,
                        email = a.Person != null ? a.Person.Email : ""
                    })
                    .OrderBy(u => u.username)
                    .ToListAsync();

                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách người dùng");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Cập nhật role cho user.
        /// </summary>
        [HttpPut("users/{userId}/role")]
        public async Task<IActionResult> UpdateUserRole(string userId, [FromBody] UpdateRoleRequest request)
        {
            try
            {
                Account? account = await _context.Accounts.FindAsync(userId);
                if (account == null)
                    return NotFound(new { message = "User not found" });

                // Parse role string sang enum
                if (Enum.TryParse<AccountRole>(request.Role, true, out AccountRole newRole))
                {
                    account.Role = newRole;
                    await _context.SaveChangesAsync();

                    _logger.LogInformation("Đã cập nhật role của user {UserId} thành {NewRole}", userId, newRole);
                    return Ok(new { message = "User role updated successfully" });
                }

                return BadRequest(new { message = "Invalid role specified" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật role user {UserId}", userId);
                return StatusCode(500, new { message = "Failed to update user role" });
            }
        }

        /// <summary>
        /// Xoá tài khoản user.
        /// </summary>
        [HttpDelete("users/{userId}")]
        public async Task<IActionResult> DeleteUser(string userId)
        {
            try
            {
                Account? account = await _context.Accounts.FindAsync(userId);
                if (account == null)
                    return NotFound(new { message = "User not found" });

                _context.Accounts.Remove(account);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Đã xoá tài khoản user {UserId}", userId);
                return Ok(new { message = "User deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xoá user {UserId}", userId);
                return StatusCode(500, new { message = "Failed to delete user" });
            }
        }

        /// <summary>
        /// Cập nhật phân công giảng dạy cho giảng viên (stub).
        /// </summary>
        [HttpPut("users/{userId}/assignments")]
        public IActionResult UpdateAssignments(string userId, [FromBody] object assignments)
        {
            // TODO: Implement khi cần quản lý phân công giảng dạy
            return Ok(new { message = "Assignments updated successfully" });
        }
    }

    /// <summary>
    /// Request body để cập nhật role.
    /// </summary>
    public class UpdateRoleRequest
    {
        public string Role { get; set; } = string.Empty;
    }
}
