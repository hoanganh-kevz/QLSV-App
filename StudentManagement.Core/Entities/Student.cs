namespace StudentManagement.Core.Entities
{
    public class Student : Person
    {
        public string StudentCode { get; set; } = string.Empty;
        public string? ClassId { get; set; }
        public string? Avatar { get; set; }
        public decimal GPA { get; set; } = 0;
        public string Status { get; set; } = "Active";
        public virtual Class? Class { get; set; }

        // Foreign Key
        public int UserId { get; set; }
        public User? User { get; set; }
    }
}