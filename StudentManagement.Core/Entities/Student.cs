namespace StudentManagement.Core.Entities
{
    public class Student : Person
    {
        public string StudentCode { get; set; } = string.Empty;
        public int ClassId { get; set; }
        public string? Avatar { get; set; }
        public string Status { get; set; } = "Active";

        // Foreign Key
        public int UserId { get; set; }
        public User? User { get; set; }
    }
}