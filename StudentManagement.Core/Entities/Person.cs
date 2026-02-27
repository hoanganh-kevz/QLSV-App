using StudentManagement.Core.Enums;
using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Core.Entities
{
    public abstract class Person
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        [Required]
        [MaxLength(100)]
        public string FullName { get; protected set; } = null!;
        
        [Required]
        [EmailAddress]
        [MaxLength(100)]
        public string Email { get; protected set; } = null!;
        
        [Required]
        [Phone]
        [MaxLength(20)]
        public string PhoneNumber { get; protected set; } = null!;
        
        [MaxLength(255)]
        public string? Address { get; protected set; }
        
        [Required]
        public DateTime DateOfBirth { get; protected set; }
        
        [Required]
        public Gender Gender { get; protected set; }
        
        [MaxLength(50)]
        public string Nationality { get; protected set; } = "Vietnam";
        
        [MaxLength(20)]
        public string? IdCard { get; protected set; }
        
        public string? AccountID { get; protected set; }
        
        // Navigation property
        public virtual Account? Account { get; set; }
        
        // Constructor
        protected Person() { }
        
        protected Person(string fullName, string email, string phoneNumber, 
                        DateTime dateOfBirth, Gender gender)
        {
            FullName = fullName;
            Email = email;
            PhoneNumber = phoneNumber;
            DateOfBirth = dateOfBirth;
            Gender = gender;
        }
        
        // Abstract methods
        public abstract void DisplayInfo();
        
        // Virtual methods
        public virtual string GetContactInfo()
        {
            return $"Email: {Email}, Phone: {PhoneNumber}";
        }
        
        // Validation
        protected bool ValidateEmail(string email)
        {
            return System.Text.RegularExpressions.Regex.IsMatch(
                email, 
                @"^[^@\s]+@[^@\s]+\.[^@\s]+$"
            );
        }

        public void SetAccount(string accountId)
        {
            AccountID = accountId;
        }
    }
}