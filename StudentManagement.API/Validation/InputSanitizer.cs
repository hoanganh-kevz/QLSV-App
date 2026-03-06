using System.Text.RegularExpressions;
using System.Web;

namespace StudentManagement.API.Validation
{
    public static class InputSanitizer
    {
        public static string SanitizeString(string input)
        {
            if (string.IsNullOrWhiteSpace(input))
                return input;

            // Remove HTML tags
            input = Regex.Replace(input, @"<[^>]+>", string.Empty);
            
            // Encode special characters
            input = HttpUtility.HtmlEncode(input);
            
            // Remove SQL injection patterns
            input = Regex.Replace(input, @"('|(--)|;|\/\*|\*\/|xp_|sp_)", string.Empty, RegexOptions.IgnoreCase);
            
            return input.Trim();
        }

        public static string SanitizeEmail(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return email;

            email = email.ToLower().Trim();
            
            // Basic email validation
            var emailRegex = new Regex(@"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$");
            
            return emailRegex.IsMatch(email) ? email : throw new ArgumentException("Invalid email format");
        }

        public static string SanitizePhoneNumber(string phone)
        {
            if (string.IsNullOrWhiteSpace(phone))
                return phone;

            // Remove all non-digit characters
            return Regex.Replace(phone, @"[^\d]", string.Empty);
        }
    }
}