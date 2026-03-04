using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Core.DTOs.Teacher
{
    public class TeacherDto
    {
        public string TeacherID { get; set; } = string.Empty;
        public string TeacherCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string? DepartmentID { get; set; }
        public string? DepartmentName { get; set; }
        public string Position { get; set; } = string.Empty;
        public string Degree { get; set; } = string.Empty;
        public DateTime HireDate { get; set; }
        public string? OfficeRoom { get; set; }
        public string? ConsultingHours { get; set; }
        public string? ResearchArea { get; set; }
        public string EmploymentType { get; set; } = string.Empty;
        public string? Gender { get; set; }
        public DateTime DateOfBirth { get; set; }
    }

    public class TeacherListDto
    {
        public string TeacherID { get; set; } = string.Empty;
        public string TeacherCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? DepartmentName { get; set; }
        public string Position { get; set; } = string.Empty;
        public string Degree { get; set; } = string.Empty;
    }

    public class CreateTeacherDto
    {
        [Required]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required]
        public DateTime DateOfBirth { get; set; }

        [Required]
        public string Gender { get; set; } = "Male";

        public string? DepartmentID { get; set; }

        [Required]
        public string Username { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }

    public class UpdateTeacherDto
    {
        [Required]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PhoneNumber { get; set; } = string.Empty;

        public string? DepartmentID { get; set; }
        public string? Position { get; set; }
        public string? Degree { get; set; }
        public string? OfficeRoom { get; set; }
        public string? ConsultingHours { get; set; }
        public string? ResearchArea { get; set; }
    }
}