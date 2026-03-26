using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Core.DTOs.Class
{
    public class ClassDto
    {
        public string ClassID { get; set; }
        public string ClassName { get; set; }
        public string AcademicYear { get; set; }
        public string? MajorID { get; set; }
        public string? MajorName { get; set; }
        public string? AdvisorID { get; set; }
        public string? AdvisorName { get; set; }
        public int MaxCapacity { get; set; }
        public int CurrentSize { get; set; }
        public int StartYear { get; set; }
        public decimal AverageGPA { get; set; }
    }

    public class ClassListDto
    {
        public string ClassID { get; set; }
        public string ClassName { get; set; }
        public string AcademicYear { get; set; }
        public string? MajorName { get; set; }
        public int CurrentSize { get; set; }
        public int MaxCapacity { get; set; }
        public bool IsFull { get; set; }
    }

    public class CreateClassDto
    {
        [Required]
        [MaxLength(50)]
        public string ClassName { get; set; }

        [Required]
        [MaxLength(10)]
        public string AcademicYear { get; set; }

        public string? MajorID { get; set; }
        
        public string? AdvisorID { get; set; }

        [Range(1, 100)]
        public int MaxCapacity { get; set; } = 50;

        [Required]
        public int StartYear { get; set; }
    }

    public class UpdateClassDto
    {
        [Required]
        [MaxLength(50)]
        public string ClassName { get; set; }

        public string? AdvisorID { get; set; }

        [Range(1, 100)]
        public int MaxCapacity { get; set; }
    }
}