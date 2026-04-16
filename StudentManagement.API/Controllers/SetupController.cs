using Microsoft.AspNetCore.Mvc;

namespace StudentManagement.API.Controllers
{
    /// <summary>
    /// Controller xử lý kiểm tra trạng thái khởi tạo hệ thống.
    /// Frontend gọi endpoint này khi app load để kiểm tra hệ thống đã được setup chưa.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class SetupController : ControllerBase
    {
        /// <summary>
        /// Kiểm tra trạng thái setup hệ thống.
        /// Vì backend C# đã có seed data sẵn, luôn trả setupRequired = false.
        /// </summary>
        [HttpGet("status")]
        public IActionResult GetStatus()
        {
            return Ok(new { setupRequired = false });
        }
    }
}
