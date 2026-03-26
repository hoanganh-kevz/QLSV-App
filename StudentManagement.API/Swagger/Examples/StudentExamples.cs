using Swashbuckle.AspNetCore.Annotations;
using Swashbuckle.AspNetCore.Filters;
using StudentManagement.Core.DTOs.Student;
using StudentManagement.Core.DTOs.Grade;

namespace StudentManagement.API.Swagger.Examples
{
    public class CreateStudentExample : IExamplesProvider<CreateStudentDto>
    {
        public CreateStudentDto GetExamples()
        {
            return new CreateStudentDto
            {
                FullName = "Nguyễn Văn A",
                Email = "nguyenvana@student.edu.vn",
                PhoneNumber = "0123456789",
                Address = "123 Đường ABC, Quận 1, TP.HCM",
                DateOfBirth = new DateTime(2003, 5, 15),
                Gender = Gender.Male,
                Nationality = "Vietnam",
                IdCard = "001234567890",
                ClassID = "CLASS001",
                MajorID = "MAJOR001",
                EnrollmentYear = 2024,
                AcademicYear = "K24",
                Username = "nguyenvana",
                Password = "Student@123"
            };
        }
    }

    public class StudentResponseExample : IExamplesProvider<StudentDto>
    {
        public StudentDto GetExamples()
        {
            return new StudentDto
            {
                StudentID = "STU001",
                StudentCode = "2024010001",
                FullName = "Nguyễn Văn A",
                Email = "nguyenvana@student.edu.vn",
                PhoneNumber = "0123456789",
                Address = "123 Đường ABC, Quận 1, TP.HCM",
                DateOfBirth = new DateTime(2003, 5, 15),
                Gender = "Male",
                Nationality = "Vietnam",
                IdCard = "001234567890",
                ClassID = "CLASS001",
                ClassName = "CNTT K24A",
                MajorID = "MAJOR001",
                MajorName = "Công nghệ thông tin",
                EnrollmentYear = 2024,
                AcademicYear = "K24",
                Status = "Active",
                Avatar = "/avatars/default.png",
                GPA = 3.45m,
                TotalCredits = 60,
                ScholarshipTier = "None",
                Tuition = 15000000m,
                DebtAmount = 0m
            };
        }
    }

    public class GradeResponseExample : IExamplesProvider<GradeDto>
    {
        public GradeDto GetExamples()
        {
            return new GradeDto
            {
                GradeID = "GRADE001",
                StudentID = "STU001",
                StudentCode = "2024010001",
                StudentName = "Nguyễn Văn A",
                SubjectID = "SUB001",
                SubjectCode = "IT101",
                SubjectName = "Nhập môn lập trình",
                Credits = 3,
                Semester = 1,
                AcademicYear = "2024-2025",
                AttendanceScore = 9.0m,
                MidtermScore = 8.5m,
                FinalScore = 8.0m,
                TotalScore = 8.25m,
                LetterGrade = "B+",
                GradePoint = 3.5m,
                Status = "Pass",
                UpdatedAt = DateTime.UtcNow
            };
        }
    }
}