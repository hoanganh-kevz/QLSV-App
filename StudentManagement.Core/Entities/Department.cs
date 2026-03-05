using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace StudentManagement.Core.Entities
{
    public class Department
    {

        [Key]
        public string DepartmentID { get; set; } = Guid.NewGuid().ToString();


        [Required]
        [MaxLength(150)]
        public string DepartmentName { get; set; } = string.Empty;


        [MaxLength(50)]
        public string? DepartmentCode { get; set; }


        public string? Description { get; set; }


        // Navigation
        public virtual ICollection<Major> Majors { get; set; } = new List<Major>();

        public virtual ICollection<Subject> Subjects { get; set; } = new List<Subject>();


        // Constructor

        public Department()
        {
        }

        public Department(string name, string code)
        {
            DepartmentName = name;
            DepartmentCode = code;
        }

    }
}
