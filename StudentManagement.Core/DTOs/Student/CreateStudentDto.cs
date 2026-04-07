using StudentManagement.Core.Enums;
using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Core.DTOs.Student
{
    public class CreateStudentDto
    {
        [Required(ErrorMessage = "Họ tên là bắt buộc")]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email là bắt buộc")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Số điện thoại là bắt buộc")]
        [Phone(ErrorMessage = "Số điện thoại không hợp lệ")]
        public string PhoneNumber { get; set; } = string.Empty;

        [MaxLength(255)]
        public string? Address { get; set; }

        [Required(ErrorMessage = "Ngày sinh là bắt buộc")]
        public DateTime DateOfBirth { get; set; }

        [Required(ErrorMessage = "Giới tính là bắt buộc")]
        public Gender Gender { get; set; }

        [MaxLength(50)]
        public string Nationality { get; set; } = "Vietnam";

        [MaxLength(20)]
        public string? IdCard { get; set; }

        public string? ClassID { get; set; }
        
        public string? MajorID { get; set; }

        [Required]
        public int EnrollmentYear { get; set; }

        [Required]
        [MaxLength(10)]
        public string AcademicYear { get; set; } = string.Empty;

        // Account info
        [Required(ErrorMessage = "Tên đăng nhập là bắt buộc")]
        [MaxLength(50)]
        public string Username { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mật khẩu là bắt buộc")]
        [MinLength(6, ErrorMessage = "Mật khẩu phải có ít nhất 6 ký tự")]
        public string Password { get; set; } = string.Empty;
    }
}