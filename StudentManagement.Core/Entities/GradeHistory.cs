using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudentManagement.Core.Entities
{
    public class GradeHistory
    {
        [Key]
        public string HistoryID { get; set; } = Guid.NewGuid().ToString();
        
        [Required]
        public string GradeID { get; set; }
        
        [Required]
        [MaxLength(20)]
        public string Component { get; set; } // Attendance, Midterm, Final
        
        [Column(TypeName = "decimal(4,2)")]
        public decimal OldValue { get; set; }
        
        [Column(TypeName = "decimal(4,2)")]
        public decimal NewValue { get; set; }
        
        public string? ModifiedBy { get; set; }
        
        public DateTime ModifiedAt { get; set; } = DateTime.UtcNow;
        
        public string? Reason { get; set; }
        
        // Navigation
        public virtual Grade Grade { get; set; }
    }
}
