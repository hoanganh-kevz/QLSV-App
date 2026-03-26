using System.ComponentModel.DataAnnotations;
using StudentManagement.Core.Enums;

namespace StudentManagement.Core.Entities
{
    public class Admin : Person
    {
        [Required]
        [MaxLength(20)]
        public string AdminCode { get; private set; } = null!;
        
        [MaxLength(50)]
        public string Role { get; private set; } = "AcademicAffairs";
        
        [MaxLength(100)]
        public string? Department { get; private set; }
        
        // Constructor
        private Admin() : base() { }
        
        public Admin(string fullName, string email, string phoneNumber,
                    DateTime dateOfBirth, Gender gender, string adminCode)
            : base(fullName, email, phoneNumber, dateOfBirth, gender)
        {
            AdminCode = adminCode;
        }
        
        public override void DisplayInfo()
        {
            Console.WriteLine($"Admin Code: {AdminCode}");
            Console.WriteLine($"Name: {FullName}");
            Console.WriteLine($"Role: {Role}");
            Console.WriteLine($"Department: {Department ?? "N/A"}");
        }
        
        public void SetRole(string role, string? department = null)
        {
            Role = role;
            Department = department;
        }
    }
}