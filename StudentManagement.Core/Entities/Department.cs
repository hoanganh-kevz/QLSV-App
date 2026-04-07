using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Core.Entities
{
    public class Department
    {
        [Key]
        public string DepartmentID { get; set; } = Guid.NewGuid().ToString();
        
        [Required]
        [MaxLength(100)]
        public string DepartmentName { get; set; }
        
        public string? DeanID { get; set; } // Teacher as dean
        
        public int EstablishedYear { get; set; }
        
        [MaxLength(10)]
        public string Building { get; set; } = "A";
        
        [MaxLength(20)]
        public string? PhoneNumber { get; set; }
        
        [MaxLength(100)]
        public string? Email { get; set; }
        
        // Navigation properties
        public virtual Teacher? Dean { get; set; }
        public virtual ICollection<Teacher> Teachers { get; set; } = new List<Teacher>();
        public virtual ICollection<Major> Majors { get; set; } = new List<Major>();
        public virtual ICollection<Subject> Subjects { get; set; } = new List<Subject>();
    }
}