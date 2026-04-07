using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Core.Entities
{
    public class CourseSection
    {
        [Key]
        public string SectionID { get; set; } = Guid.NewGuid().ToString();
        
        [Required]
        public string SubjectID { get; set; }
        
        [Required]
        public string TeacherID { get; set; }
        
        [Required]
        public int Semester { get; set; } // 1, 2, 3 (Summer)
        
        [Required]
        [MaxLength(10)]
        public string AcademicYear { get; set; } // 2024-2025
        
        [MaxLength(200)]
        public string? Schedule { get; set; } // T2: 7:00-9:30, T5: 13:00-15:30
        
        public string? RoomID { get; set; }
        
        public int MaxStudents { get; set; } = 50;
        
        public string Status { get; set; } = "Open"; // Open, Full, InProgress, Completed, Cancelled
        
        // Navigation properties
        public virtual Subject Subject { get; set; }
        public virtual Teacher Teacher { get; set; }
        public virtual ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
        
        // Methods
        public int GetEnrolledCount()
        {
            return Enrollments?.Count(e => e.Status != "Dropped") ?? 0;
        }
        
        public bool IsFull()
        {
            return GetEnrolledCount() >= MaxStudents;
        }
        
        public bool CanEnroll()
        {
            return Status == "Open" && !IsFull();
        }
    }
}