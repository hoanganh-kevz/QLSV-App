using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudentManagement.Core.Entities
{
    public class Subject
    {
        [Key]
        public string SubjectID { get; set; } = Guid.NewGuid().ToString();
        
        [Required]
        [MaxLength(20)]
        public string SubjectCode { get; set; } // CS101, MATH201
        
        [Required]
        [MaxLength(200)]
        public string SubjectName { get; set; }
        
        [Range(1, 4)]
        public int Credits { get; set; }
        
        public int TheoryHours { get; set; } = 30;
        
        public int PracticeHours { get; set; } = 0;
        
        [MaxLength(50)]
        public string SubjectType { get; set; } = "Core"; // Core, Elective, General
        
        public string? DepartmentID { get; set; }
        
        [Column(TypeName = "nvarchar(max)")]
        public string? Description { get; set; }
        
        // Prerequisites (stored as JSON array)
        [Column(TypeName = "nvarchar(max)")]
        public string? Prerequisites { get; set; } // JSON: ["CS101", "MATH101"]
        
        // Navigation properties
        public virtual Department? Department { get; set; }
        
        // Constructor
        public Subject() { }
        
        public Subject(string subjectCode, string subjectName, int credits)
        {
            SubjectCode = subjectCode;
            SubjectName = subjectName;
            Credits = credits;
        }
        
        // Methods
        public int GetTotalHours()
        {
            return TheoryHours + PracticeHours;
        }
        
        public bool HasPrerequisites()
        {
            return !string.IsNullOrEmpty(Prerequisites);
        }
        
        public List<string> GetPrerequisiteList()
        {
            if (string.IsNullOrEmpty(Prerequisites))
                return new List<string>();
            
            try
            {
                return System.Text.Json.JsonSerializer.Deserialize<List<string>>(Prerequisites) 
                       ?? new List<string>();
            }
            catch
            {
                return new List<string>();
            }
        }
    }
}