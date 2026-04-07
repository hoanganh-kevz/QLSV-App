using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Core.Entities
{
    public class Class
    {
        [Key]
        public string ClassID { get; set; } = Guid.NewGuid().ToString();
        
        [Required]
        [MaxLength(50)]
        public string ClassName { get; set; }
        
        [Required]
        [MaxLength(10)]
        public string AcademicYear { get; set; } // K19, K20, K21
        
        public string? MajorID { get; set; }
        
        public string? AdvisorID { get; set; } // Teacher as advisor
        
        public int MaxCapacity { get; set; } = 50;
        
        public int StartYear { get; set; }
        
        // Navigation properties
        public virtual ICollection<Student> Students { get; set; } = new List<Student>();
        public virtual Teacher? Advisor { get; set; }
        public virtual Major? Major { get; set; }
        
        // Constructor
        public Class() { }
        
        public Class(string className, string academicYear, int startYear)
        {
            ClassName = className;
            AcademicYear = academicYear;
            StartYear = startYear;
        }
        
        // Methods
        public int GetCurrentSize()
        {
            return Students?.Count ?? 0;
        }
        
        public bool IsFull()
        {
            return GetCurrentSize() >= MaxCapacity;
        }
        
        public bool CanAddStudent()
        {
            return !IsFull();
        }
        
        public decimal GetAverageGPA()
        {
            if (Students == null || !Students.Any())
                return 0;
            
            return Students.Average(s => s.GPA);
        }
    }
}