using StudentManagement.Core.Enums;
using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Core.DTOs.Student
{
    public class UpdateStudentDto
    {
        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [Phone]
        public string PhoneNumber { get; set; } = string.Empty;

        [MaxLength(255)]
        public string? Address { get; set; }

        [Required]
        public DateTime DateOfBirth { get; set; }

        [Required]
        public Gender Gender { get; set; }

        [MaxLength(50)]
        public string? Nationality { get; set; }

        [MaxLength(20)]
        public string? IdCard { get; set; }

        public string? ClassID { get; set; }
        
        public string? MajorID { get; set; }

        public StudentStatus Status { get; set; }

        public string? Avatar { get; set; }
    }
}