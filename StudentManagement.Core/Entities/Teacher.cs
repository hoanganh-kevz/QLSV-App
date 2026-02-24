namespace StudentManagement.Core.Entities
{
    public class Teacher : Person
    {
        public string TeacherCode { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;

        // Foreign Key
        public int UserId { get; set; }
        public User? User { get; set; }
    }
}