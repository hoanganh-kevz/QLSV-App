using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace StudentManagement.Core.DTOs.Subject
{
    public class SubjectDto
    {
        public string SubjectID { get; set; } = string.Empty;
        public string SubjectCode { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public int Credits { get; set; }
        public int TheoryHours { get; set; }
        public int PracticeHours { get; set; }
        public int TotalHours { get; set; }
        public string SubjectType { get; set; } = string.Empty;
        public string? DepartmentID { get; set; }
        public string? DepartmentName { get; set; }
        public string? Description { get; set; }
        public List<string> Prerequisites { get; set; } = new();
    }

    public class SubjectListDto
    {
        public string SubjectID { get; set; } = string.Empty;
        public string SubjectCode { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public int Credits { get; set; }
        public string SubjectType { get; set; } = string.Empty;
        public string? DepartmentName { get; set; }
    }

    public class CreateSubjectDto
    {
        [Required(ErrorMessage = "Mã môn học là bắt buộc")]
        [MaxLength(20)]
        [JsonPropertyName("code")]
        public string SubjectCode { get; set; } = string.Empty;

        [Required(ErrorMessage = "Tên môn học là bắt buộc")]
        [MaxLength(200)]
        [JsonPropertyName("name")]
        public string SubjectName { get; set; } = string.Empty;

        [Required]
        [Range(1, 4, ErrorMessage = "Số tín chỉ từ 1 đến 4")]
        [JsonPropertyName("credits")]
        public int Credits { get; set; }

        public int TheoryHours { get; set; } = 30;
        public int PracticeHours { get; set; } = 0;

        [MaxLength(50)]
        [JsonPropertyName("type")]
        public string SubjectType { get; set; } = "Core";

        [JsonPropertyName("faculty")]
        public string? DepartmentID { get; set; }
        [JsonPropertyName("description")]
        public string? Description { get; set; }
        [JsonPropertyName("prerequisites")]
        public List<string>? Prerequisites { get; set; }
    }

    public class UpdateSubjectDto
    {
        [Required]
        [MaxLength(200)]
        [JsonPropertyName("name")]
        public string SubjectName { get; set; } = string.Empty;

        [Required]
        [Range(1, 4)]
        [JsonPropertyName("credits")]
        public int Credits { get; set; }

        public int TheoryHours { get; set; }
        public int PracticeHours { get; set; }

        [MaxLength(50)]
        [JsonPropertyName("type")]
        public string SubjectType { get; set; } = "Core";

        [JsonPropertyName("faculty")]
        public string? DepartmentID { get; set; }
        [JsonPropertyName("description")]
        public string? Description { get; set; }
        [JsonPropertyName("prerequisites")]
        public List<string>? Prerequisites { get; set; }
    }
}
