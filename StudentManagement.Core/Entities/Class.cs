using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudentManagement.Core.Entities
{
    public class Class
    {
        // =========================
        // PRIMARY KEY
        // =========================

        [Key]
        public string ClassID { get; set; } = Guid.NewGuid().ToString();


        // =========================
        // BASIC INFORMATION
        // =========================

        [Required]
        [MaxLength(50)]
        public string ClassName { get; set; }


        [Required]
        [MaxLength(10)]
        public string AcademicYear { get; set; }


        public int StartYear { get; set; }


        public int MaxCapacity { get; set; } = 50;


        // =========================
        // FOREIGN KEYS
        // =========================

        public string? MajorID { get; set; }

        public string? AdvisorID { get; set; }


        // =========================
        // NAVIGATION PROPERTIES
        // =========================

        public virtual Major? Major { get; set; }

        public virtual Teacher? Advisor { get; set; }

        public virtual ICollection<Student> Students { get; set; } = new List<Student>();


        // =========================
        // CONSTRUCTORS
        // =========================

        public Class()
        {
        }

        public Class(string className, string academicYear, int startYear)
        {
            ClassName = className;
            AcademicYear = academicYear;
            StartYear = startYear;
        }


        // =========================
        // BUSINESS METHODS
        // =========================

        public int GetCurrentSize()
        {
            if (Students == null)
                return 0;

            return Students.Count;
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