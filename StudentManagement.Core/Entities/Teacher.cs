using System.ComponentModel.DataAnnotations;
using StudentManagement.Core.Enums;

namespace StudentManagement.Core.Entities
{
    public class Teacher : Person
    {
        [Required]
        [MaxLength(20)]
        public string TeacherCode { get; private set; } = null!;
        
        public string? DepartmentID { get; private set; }
        
        [MaxLength(50)]
        public string Position { get; private set; } = "Lecturer";
        
        [MaxLength(20)]
        public string Degree { get; private set; } = "Bachelor";
        
        [Required]
        public DateTime HireDate { get; private set; }
        
        [MaxLength(20)]
        public string EmploymentType { get; private set; } = "FullTime";
        
        [MaxLength(20)]
        public string? OfficeRoom { get; private set; }
        
        [MaxLength(100)]
        public string? ConsultingHours { get; private set; }
        
        [MaxLength(255)]
        public string? ResearchArea { get; private set; }
        
        // Navigation properties
        public virtual Department? Department { get; set; }
        
        // Constructor
        private Teacher() : base() { }
        
        public Teacher(string fullName, string email, string phoneNumber,
                      DateTime dateOfBirth, Gender gender, string teacherCode,
                      DateTime hireDate)
            : base(fullName, email, phoneNumber, dateOfBirth, gender)
        {
            TeacherCode = teacherCode;
            HireDate = hireDate;
        }
        
        public override void DisplayInfo()
        {
            Console.WriteLine($"Teacher Code: {TeacherCode}");
            Console.WriteLine($"Name: {FullName}");
            Console.WriteLine($"Position: {Position}");
            Console.WriteLine($"Department: {DepartmentID ?? "N/A"}");
        }
        
        public void SetDepartment(string departmentId)
        {
            DepartmentID = departmentId;
        }
        
        public void UpdatePosition(string position, string degree)
        {
            Position = position;
            Degree = degree;
        }

        public void UpdateTeacherInfo(string? officeRoom, string? consultingHours, string? researchArea, string? employmentType)
        {
            if (officeRoom != null) OfficeRoom = officeRoom;
            if (consultingHours != null) ConsultingHours = consultingHours;
            if (researchArea != null) ResearchArea = researchArea;
            if (employmentType != null) EmploymentType = employmentType;
        }
    }
}