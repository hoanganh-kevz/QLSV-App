using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Core.Entities
{
    public class Major
    {
        [Key]
        public string MajorID { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [MaxLength(20)]
        public string MajorCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string MajorName { get; set; } = string.Empty;

        public int TotalCredits { get; set; }

        public int DurationYears { get; set; }

        // Foreign Key
        public string DepartmentID { get; set; }

        // Navigation
        public virtual Department? Department { get; set; }

        public virtual ICollection<Class> Classes { get; set; } = new List<Class>();

        public Major()
        {
        }

        public Major(string code, string name)
        {
            MajorCode = code;
            MajorName = name;
        }
    }
}