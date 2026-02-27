using System.ComponentModel.DataAnnotations;
using StudentManagement.Core.Enums;

namespace StudentManagement.Core.Entities
{
    public class Account
    {
        [Key]
        public string AccountID { get; set; } = Guid.NewGuid().ToString();
        
        [Required]
        [MaxLength(50)]
        public string Username { get; set; } = null!;
        
        [Required]
        public string PasswordHash { get; private set; } = null!;
        
        [Required]
        public AccountRole Role { get; set; }
        
        public string? PersonID { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        public DateTime? LastLogin { get; private set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public int FailedLoginAttempts { get; private set; } = 0;
        
        // Navigation property
        public virtual Person? Person { get; set; }
        
        // Constructor
        public Account() { }
        
        public Account(string username, string password, AccountRole role)
        {
            Username = username;
            SetPassword(password);
            Role = role;
        }
        
        // Methods
        public void SetPassword(string password)
        {
            if (string.IsNullOrWhiteSpace(password) || password.Length < 6)
                throw new ArgumentException("Password must be at least 6 characters");
            
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password);
        }
        
        public bool VerifyPassword(string password)
        {
            return BCrypt.Net.BCrypt.Verify(password, PasswordHash);
        }
        
        public void RecordLogin()
        {
            if (!IsActive)
                throw new InvalidOperationException("Account is inactive");
            
            LastLogin = DateTime.UtcNow;
            FailedLoginAttempts = 0;
        }
        
        public void RecordFailedLogin()
        {
            FailedLoginAttempts++;
            
            if (FailedLoginAttempts >= 5)
            {
                IsActive = false;
                throw new InvalidOperationException("Account locked due to multiple failed login attempts");
            }
        }
        
        public void Activate() => IsActive = true;
        public void Deactivate() => IsActive = false;
    }
}