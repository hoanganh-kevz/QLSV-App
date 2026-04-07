using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Core.Entities
{
    public class Major
    {
        [Key]
        public string MajorID { get; set; } = Guid.NewGuid().ToString();
        
        [Required]
        [MaxLength(20)]
        public string MajorCode { get; set; } // CNTT, KTPM
        
        [Required]
        [MaxLength(200)]
        public string MajorName { get; set; }
        
        public string? DepartmentID { get; set; }
        
        public int TotalCredits { get; set; } = 140;
        
        public int DurationYears { get; set; } = 4;
        
        [MaxLength(20)]
        public string Degree { get; set; } = "Bachelor";
        
        // Navigation properties
        public virtual Department? Department { get; set; }
        public virtual ICollection<Student> Students { get; set; } = new List<Student>();
        public virtual ICollection<Class> Classes { get; set; } = new List<Class>();
    }
}