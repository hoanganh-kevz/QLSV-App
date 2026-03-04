using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Core.Entities
{
    public class Enrollment
    {
        [Key]
        public string EnrollmentID { get; set; } = Guid.NewGuid().ToString();
        
        [Required]
        public string StudentID { get; set; }
        
        [Required]
        public string SectionID { get; set; }
        
        public DateTime EnrollmentDate { get; set; } = DateTime.UtcNow;
        
        public string Status { get; set; } = "Registered"; // Registered, Dropped, Completed, Failed
        
        public decimal AttendanceRate { get; set; } = 0;
        
        // Navigation properties
        public virtual Student Student { get; set; }
        public virtual CourseSection Section { get; set; }
        public virtual Grade? Grade { get; set; }
    }
}