namespace StudentManagement.Core.DTOs.User
{
    public class UserSearchDto
    {
        public string? Keyword { get; set; }
        public string? Role { get; set; }
        public bool? IsActive { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }
}
