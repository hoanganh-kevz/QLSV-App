namespace StudentManagement.Infrastructure.Audit
{
    public class AuditLog
    {
        public string AuditLogID { get; set; } = Guid.NewGuid().ToString();
        public string UserID { get; set; }
        public string Username { get; set; }
        public string Action { get; set; } // Create, Update, Delete, View
        public string EntityType { get; set; } // Student, Grade, Class, etc.
        public string EntityID { get; set; }
        public string OldValues { get; set; } // JSON
        public string NewValues { get; set; } // JSON
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string IPAddress { get; set; }
        public string UserAgent { get; set; }
    }
}