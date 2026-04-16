namespace StudentManagement.API.Controllers
{
    /// <summary>
    /// Request body để cập nhật điểm (PUT /api/grades/{id}).
    /// Hỗ trợ cập nhật từng thành phần điểm hoặc tất cả cùng lúc.
    /// </summary>
    public class UpdateGradeRequest
    {
        /// <summary>Điểm chuyên cần (0-10)</summary>
        public decimal? AttendanceScore { get; set; }

        /// <summary>Điểm giữa kỳ (0-10)</summary>
        public decimal? MidtermScore { get; set; }

        /// <summary>Điểm cuối kỳ (0-10)</summary>
        public decimal? FinalScore { get; set; }
    }
}
