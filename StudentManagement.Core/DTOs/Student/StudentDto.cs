namespace StudentManagement.Core.DTOs.Student
{
    public class StudentDto
    {
        public string StudentID { get; set; } = string.Empty;
        public string StudentCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string? Address { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string Gender { get; set; } = string.Empty;
        public string? Nationality { get; set; }
        public string? IdCard { get; set; }
        public string? ClassID { get; set; }
        public string? ClassName { get; set; }
        public string? MajorID { get; set; }
        public string? MajorName { get; set; }
        public int EnrollmentYear { get; set; }
        public string AcademicYear { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? Avatar { get; set; }
        public decimal GPA { get; set; }
        public int TotalCredits { get; set; }
        public string ScholarshipTier { get; set; } = string.Empty;
        public decimal Tuition { get; set; }
        public decimal DebtAmount { get; set; }
    }
}