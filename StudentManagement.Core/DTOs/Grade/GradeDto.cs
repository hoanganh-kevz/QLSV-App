using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Core.DTOs.Grade
{
    public class GradeDto
    {
        public string GradeID { get; set; }
        public string StudentID { get; set; }
        public string StudentCode { get; set; }
        public string StudentName { get; set; }
        public string SubjectID { get; set; }
        public string SubjectCode { get; set; }
        public string SubjectName { get; set; }
        public int Credits { get; set; }
        public int Semester { get; set; }
        public string AcademicYear { get; set; }
        public decimal? AttendanceScore { get; set; }
        public decimal? MidtermScore { get; set; }
        public decimal? FinalScore { get; set; }
        public decimal TotalScore { get; set; }
        public string LetterGrade { get; set; }
        public decimal GradePoint { get; set; }
        public string Status { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateGradeDto
    {
        [Required]
        public string EnrollmentID { get; set; }
        
        [Range(0, 10)]
        public decimal? AttendanceScore { get; set; }
        
        [Range(0, 10)]
        public decimal? MidtermScore { get; set; }
        
        [Range(0, 10)]
        public decimal? FinalScore { get; set; }
    }

    public class UpdateGradeComponentDto
    {
        [Required]
        public string Component { get; set; } // Attendance, Midterm, Final
        
        [Required]
        [Range(0, 10)]
        public decimal Score { get; set; }
        
        public string? Reason { get; set; }
    }

    public class TranscriptDto
    {
        public string StudentID { get; set; }
        public string StudentCode { get; set; }
        public string StudentName { get; set; }
        public decimal CurrentGPA { get; set; }
        public int TotalCredits { get; set; }
        public List<SemesterGradesDto> Semesters { get; set; }
    }

    public class SemesterGradesDto
    {
        public string AcademicYear { get; set; }
        public int Semester { get; set; }
        public List<GradeDto> Grades { get; set; }
        public decimal SemesterGPA { get; set; }
        public int SemesterCredits { get; set; }
    }
}