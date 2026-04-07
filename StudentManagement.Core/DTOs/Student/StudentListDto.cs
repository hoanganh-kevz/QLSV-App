namespace StudentManagement.Core.DTOs.Student
{
    public class StudentListDto
    {
        public string StudentID { get; set; } = string.Empty;
        public string StudentCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? ClassName { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal GPA { get; set; }
        public string? Avatar { get; set; }
    }

    public class PagedStudentResult
    {
        public List<StudentListDto> Students { get; set; } = new List<StudentListDto>();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
        public bool HasPrevious => PageNumber > 1;
        public bool HasNext => PageNumber < TotalPages;
    }
}