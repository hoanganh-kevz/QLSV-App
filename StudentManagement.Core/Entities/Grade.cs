using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudentManagement.Core.Entities
{
    public class Grade
    {
        [Key]
        public string GradeID { get; set; } = Guid.NewGuid().ToString();
        
        [Required]
        public string EnrollmentID { get; set; }
        
        [Required]
        public string StudentID { get; set; }
        
        [Required]
        public string SubjectID { get; set; }
        
        public int Semester { get; set; }
        
        [MaxLength(10)]
        public string AcademicYear { get; set; }
        
        // Grade components (0-10 scale)
        [Column(TypeName = "decimal(4,2)")]
        public decimal? AttendanceScore { get; set; }
        
        [Column(TypeName = "decimal(4,2)")]
        public decimal? MidtermScore { get; set; }
        
        [Column(TypeName = "decimal(4,2)")]
        public decimal? FinalScore { get; set; }
        
        // Computed fields
        [Column(TypeName = "decimal(4,2)")]
        public decimal TotalScore { get; private set; }
        
        [MaxLength(5)]
        public string LetterGrade { get; private set; }
        
        [Column(TypeName = "decimal(3,2)")]
        public decimal GradePoint { get; private set; }
        
        public string Status { get; private set; } = "Incomplete"; // Pass, Fail, Incomplete
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public string? UpdatedBy { get; set; }
        
        // Navigation properties
        public virtual Enrollment Enrollment { get; set; }
        public virtual Student Student { get; set; }
        public virtual Subject Subject { get; set; }
        public virtual ICollection<GradeHistory> GradeHistories { get; set; } = new List<GradeHistory>();
        
        // Constants for grade calculation
        private const decimal ATTENDANCE_WEIGHT = 0.1m;
        private const decimal MIDTERM_WEIGHT = 0.3m;
        private const decimal FINAL_WEIGHT = 0.6m;
        
        // Methods
        public void CalculateTotalScore()
        {
            if (!AttendanceScore.HasValue || !MidtermScore.HasValue || !FinalScore.HasValue)
            {
                TotalScore = 0;
                return;
            }
            
            TotalScore = (AttendanceScore.Value * ATTENDANCE_WEIGHT) +
                        (MidtermScore.Value * MIDTERM_WEIGHT) +
                        (FinalScore.Value * FINAL_WEIGHT);
            
            TotalScore = Math.Round(TotalScore, 2);
            
            // Update letter grade and grade point
            ConvertToLetterGrade();
            ConvertToGradePoint();
            DetermineStatus();
        }
        
        private void ConvertToLetterGrade()
        {
            LetterGrade = TotalScore switch
            {
                >= 8.5m => "A",
                >= 8.0m => "B+",
                >= 7.0m => "B",
                >= 6.5m => "C+",
                >= 5.5m => "C",
                >= 5.0m => "D+",
                >= 4.0m => "D",
                _ => "F"
            };
        }
        
        private void ConvertToGradePoint()
        {
            GradePoint = LetterGrade switch
            {
                "A" => 4.0m,
                "B+" => 3.5m,
                "B" => 3.0m,
                "C+" => 2.5m,
                "C" => 2.0m,
                "D+" => 1.5m,
                "D" => 1.0m,
                "F" => 0.0m,
                _ => 0.0m
            };
        }
        
        private void DetermineStatus()
        {
            if (TotalScore >= 4.0m)
                Status = "Pass";
            else if (TotalScore > 0)
                Status = "Fail";
            else
                Status = "Incomplete";
        }
        
        public bool IsPass()
        {
            return TotalScore >= 4.0m;
        }
        
        public bool IsComplete()
        {
            return AttendanceScore.HasValue && 
                   MidtermScore.HasValue && 
                   FinalScore.HasValue;
        }
        
        public void UpdateComponent(string component, decimal value, string updatedBy)
        {
            ValidateScore(value);
            
            var oldValue = component.ToLower() switch
            {
                "attendance" => AttendanceScore,
                "midterm" => MidtermScore,
                "final" => FinalScore,
                _ => null
            };
            
            // Record history
            if (oldValue.HasValue)
            {
                RecordHistory(component, oldValue.Value, value, updatedBy);
            }
            
            // Update score
            switch (component.ToLower())
            {
                case "attendance":
                    AttendanceScore = value;
                    break;
                case "midterm":
                    MidtermScore = value;
                    break;
                case "final":
                    FinalScore = value;
                    break;
            }
            
            UpdatedBy = updatedBy;
            UpdatedAt = DateTime.UtcNow;
            
            CalculateTotalScore();
        }
        
        private void ValidateScore(decimal score)
        {
            if (score < 0 || score > 10)
                throw new ArgumentException("Score must be between 0 and 10");
        }
        
        private void RecordHistory(string component, decimal oldValue, decimal newValue, string modifiedBy)
        {
            var history = new GradeHistory
            {
                GradeID = GradeID,
                Component = component,
                OldValue = oldValue,
                NewValue = newValue,
                ModifiedBy = modifiedBy,
                ModifiedAt = DateTime.UtcNow
            };
            
            GradeHistories.Add(history);
        }
    }
}