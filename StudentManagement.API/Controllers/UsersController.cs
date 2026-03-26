using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Core.DTOs;
using StudentManagement.Core.DTOs.User;
using StudentManagement.Core.Interfaces.Services;

namespace StudentManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class UsersController : ControllerBase
    {
        private readonly IUserManagementService _userService;

        public UsersController(IUserManagementService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<ActionResult<PagedResult<UserListDto>>> GetAll([FromQuery] UserSearchDto searchDto)
        {
            PagedResult<UserListDto> result = await _userService.GetAllUsersAsync(searchDto);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserListDto>> GetById(string id)
        {
            try
            {
                UserListDto result = await _userService.GetUserByIdAsync(id);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpPost]
        public async Task<ActionResult<UserListDto>> Create([FromBody] CreateUserDto createDto)
        {
            try
            {
                UserListDto result = await _userService.CreateUserAsync(createDto);
                return CreatedAtAction(nameof(GetById), new { id = result.AccountID }, result);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<UserListDto>> Update(string id, [FromBody] UpdateUserDto updateDto)
        {
            try
            {
                UserListDto result = await _userService.UpdateUserAsync(id, updateDto);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpPost("{id}/activate")]
        public async Task<IActionResult> Activate(string id)
        {
            bool success = await _userService.ActivateUserAsync(id);
            if (!success)
                return NotFound();

            return Ok(new { message = "User activated" });
        }

        [HttpPost("{id}/deactivate")]
        public async Task<IActionResult> Deactivate(string id)
        {
            bool success = await _userService.DeactivateUserAsync(id);
            if (!success)
                return NotFound();

            return Ok(new { message = "User deactivated" });
        }

        [HttpPost("{id}/reset-password")]
        public async Task<IActionResult> ResetPassword(string id, [FromBody] ResetPasswordDto dto)
        {
            bool success = await _userService.ResetPasswordAsync(id, dto.NewPassword);
            if (!success)
                return NotFound();

            return Ok(new { message = "Password reset" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            bool success = await _userService.DeleteUserAsync(id);
            if (!success)
                return NotFound();

            return Ok(new { message = "User deleted" });
        }
    }

    public class ResetPasswordDto
    {
        [Required]
        [MinLength(6)]
        public string NewPassword { get; set; } = string.Empty;
    }
}