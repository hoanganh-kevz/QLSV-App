using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Core.Entities
{
    public class Subject
    {
        [Key]
        public string SubjectID { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [MaxLength(20)]
        public string SubjectCode { get; set; }

        [Required]
        [MaxLength(200)]
        public string SubjectName { get; set; }

        public int Credits { get; set; }

        public string? SubjectType { get; set; }

        public int TheoryHours { get; set; }

        public int PracticeHours { get; set; }

        public string? Prerequisites { get; set; }

        public string? Description { get; set; }

        // Foreign Key
        public string? DepartmentID { get; set; }

        // Navigation
        public virtual Department? Department { get; set; }

        public Subject()
        {
        }

        public Subject(string code, string name, int credits)
        {
            SubjectCode = code;
            SubjectName = name;
            Credits = credits;
        }
    }
}