using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using StudentManagement.Core.Enums;

namespace StudentManagement.Core.Entities
{
    public class Student : Person
    {
        [Required]
        [MaxLength(20)]
        public string StudentCode { get; private set; } = null!;
        
        public string? ClassID { get; private set; }
        
        public string? MajorID { get; private set; }
        
        [Required]
        public int EnrollmentYear { get; private set; }
        
        [Required]
        [MaxLength(10)]
        public string AcademicYear { get; private set; } = null!;
        
        public StudentStatus Status { get; private set; } = StudentStatus.Active;
        
        [MaxLength(255)]
        public string? Avatar { get; private set; }
        
        [Column(TypeName = "decimal(3,2)")]
        public decimal GPA { get; private set; } = 0.00m;
        
        public int TotalCredits { get; private set; } = 0;
        
        [MaxLength(20)]
        public string ScholarshipTier { get; private set; } = "None";
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal Tuition { get; private set; } = 0;
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal DebtAmount { get; private set; } = 0;
        
        // Constructor
        private Student() : base() { }
        
        public Student(string fullName, string email, string phoneNumber,
                      DateTime dateOfBirth, Gender gender, string studentCode,
                      int enrollmentYear, string academicYear)
            : base(fullName, email, phoneNumber, dateOfBirth, gender)
        {
            StudentCode = studentCode;
            EnrollmentYear = enrollmentYear;
            AcademicYear = academicYear;
        }
        
        // Methods
        public override void DisplayInfo()
        {
            Console.WriteLine($"Student Code: {StudentCode}");
            Console.WriteLine($"Name: {FullName}");
            Console.WriteLine($"Email: {Email}");
            Console.WriteLine($"GPA: {GPA:F2}");
            Console.WriteLine($"Status: {Status}");
        }
        
        public void UpdateGPA(decimal newGPA)
        {
            if (newGPA >= 0 && newGPA <= 4.0m)
                GPA = newGPA;
            else
                throw new ArgumentException("GPA must be between 0 and 4.0");
        }
        
        public void SetAvatar(string avatarUrl)
        {
            Avatar = avatarUrl;
        }
        
        public void SetClassAndMajor(string? classId, string? majorId)
        {
            ClassID = classId;
            MajorID = majorId;
        }

        public void SetStatus(StudentStatus status)
        {
            Status = status;
        }
        
        public bool IsEligibleForGraduation()
        {
            return TotalCredits >= 120 && GPA >= 2.0m;
        }
        
        public string GetAcademicStanding()
        {
            return GPA switch
            {
                >= 3.6m => "Excellent",
                >= 3.2m => "Good",
                >= 2.5m => "Average",
                >= 2.0m => "Below Average",
                >= 1.0m => "Warning",
                _ => "Probation"
            };
        }

        // Add navigation property
public virtual Class? Class { get; set; }
    }
}