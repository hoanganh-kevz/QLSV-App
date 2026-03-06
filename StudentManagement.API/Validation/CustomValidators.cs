using FluentValidation;
using FluentValidation;
using StudentManagement.Core.DTOs.Student;

namespace StudentManagement.API.Validation
{
    public class CreateStudentValidator : AbstractValidator<CreateStudentDto>
    {
        public CreateStudentValidator()
        {
            RuleFor(x => x.FullName)
                .NotEmpty().WithMessage("Họ tên không được để trống")
                .MaximumLength(100).WithMessage("Họ tên tối đa 100 ký tự")
                .Matches(@"^[a-zA-ZÀ-ỹ\s]+$").WithMessage("Họ tên chỉ chứa chữ cái");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email không được để trống")
                .EmailAddress().WithMessage("Email không hợp lệ")
                .Must(BeValidEmailDomain).WithMessage("Email phải thuộc domain @student.edu.vn");

            RuleFor(x => x.PhoneNumber)
                .NotEmpty().WithMessage("Số điện thoại không được để trống")
                .Matches(@"^0\d{9}$").WithMessage("Số điện thoại phải bắt đầu bằng 0 và có 10 chữ số");

            RuleFor(x => x.DateOfBirth)
                .NotEmpty().WithMessage("Ngày sinh không được để trống")
                .Must(BeValidAge).WithMessage("Sinh viên phải từ 17 đến 30 tuổi");

            RuleFor(x => x.Username)
                .NotEmpty().WithMessage("Tên đăng nhập không được để trống")
                .MinimumLength(4).WithMessage("Tên đăng nhập tối thiểu 4 ký tự")
                .MaximumLength(50).WithMessage("Tên đăng nhập tối đa 50 ký tự")
                .Matches(@"^[a-zA-Z0-9_]+$").WithMessage("Tên đăng nhập chỉ chứa chữ, số và dấu gạch dưới");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Mật khẩu không được để trống")
                .MinimumLength(6).WithMessage("Mật khẩu tối thiểu 6 ký tự")
                .Matches(@"[A-Z]").WithMessage("Mật khẩu phải chứa ít nhất 1 chữ hoa")
                .Matches(@"[a-z]").WithMessage("Mật khẩu phải chứa ít nhất 1 chữ thường")
                .Matches(@"\d").WithMessage("Mật khẩu phải chứa ít nhất 1 chữ số")
                .Matches(@"[!@#$%^&*(),.?""':{}|<>]").WithMessage("Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt");
        }

        private bool BeValidEmailDomain(string email)
        {
            return email.EndsWith("@student.edu.vn", StringComparison.OrdinalIgnoreCase);
        }

        private bool BeValidAge(DateTime dateOfBirth)
        {
            var age = DateTime.Today.Year - dateOfBirth.Year;
            if (dateOfBirth.Date > DateTime.Today.AddYears(-age))
                age--;
            
            return age >= 17 && age <= 30;
        }
    }
}