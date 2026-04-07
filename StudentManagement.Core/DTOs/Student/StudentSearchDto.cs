namespace StudentManagement.Core.DTOs.Student
{
    public class StudentSearchDto
    {
        public string? Keyword { get; set; }
        public string? ClassID { get; set; }
        public string? MajorID { get; set; }
        public string? Status { get; set; }
        public int? EnrollmentYear { get; set; }
        public decimal? MinGPA { get; set; }
        public decimal? MaxGPA { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SortBy { get; set; } = "StudentCode";
        public string? SortOrder { get; set; } = "asc";
    }
}