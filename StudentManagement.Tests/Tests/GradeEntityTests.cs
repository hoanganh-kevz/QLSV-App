using FluentAssertions;
using StudentManagement.Core.Entities;

namespace StudentManagement.Tests.Tests
{
    public class GradeEntityTests
    {
        #region CalculateTotalScore Tests

        [Fact]
        public void CalculateTotalScore_AllScoresProvided_CorrectFormula()
        {
            // Arrange - Formula: 0.1*Attendance + 0.3*Midterm + 0.6*Final
            Grade grade = new Grade
            {
                AttendanceScore = 8.0m,
                MidtermScore = 7.0m,
                FinalScore = 9.0m
            };

            // Act
            grade.CalculateTotalScore();

            // Assert - 0.1*8 + 0.3*7 + 0.6*9 = 0.8 + 2.1 + 5.4 = 8.3
            grade.TotalScore.Should().Be(8.30m);
            grade.LetterGrade.Should().Be("B+");
            grade.GradePoint.Should().Be(3.5m);
            grade.Status.Should().Be("Pass");
        }

        [Fact]
        public void CalculateTotalScore_MissingScores_ReturnsZero()
        {
            // Arrange
            Grade grade = new Grade
            {
                AttendanceScore = 8.0m,
                MidtermScore = null, // Missing
                FinalScore = 9.0m
            };

            // Act
            grade.CalculateTotalScore();

            // Assert
            grade.TotalScore.Should().Be(0m);
            grade.Status.Should().Be("Incomplete");
        }

        [Theory]
        [InlineData(10.0, 10.0, 10.0, "A", 4.0)]    // Perfect score: 10.0
        [InlineData(8.0, 8.0, 8.5, "B+", 3.5)]       // 0.8+2.4+5.1 = 8.3
        [InlineData(7.0, 7.0, 7.0, "B", 3.0)]         // 0.7+2.1+4.2 = 7.0
        [InlineData(7.0, 6.5, 6.5, "C+", 2.5)]        // 0.7+1.95+3.9 = 6.55
        [InlineData(5.0, 5.0, 5.0, "D+", 1.5)]        // 0.5+1.5+3.0 = 5.0
        [InlineData(3.0, 3.0, 3.0, "F", 0.0)]          // 0.3+0.9+1.8 = 3.0
        [InlineData(0.0, 0.0, 0.0, "F", 0.0)]          // All zeros
        public void LetterGrade_VariousScores_CorrectMapping(
            double attendance, double midterm, double final_score,
            string expectedLetter, double expectedGradePoint)
        {
            // Arrange
            Grade grade = new Grade
            {
                AttendanceScore = (decimal)attendance,
                MidtermScore = (decimal)midterm,
                FinalScore = (decimal)final_score
            };

            // Act
            grade.CalculateTotalScore();

            // Assert
            grade.LetterGrade.Should().Be(expectedLetter);
            grade.GradePoint.Should().Be((decimal)expectedGradePoint);
        }

        #endregion

        #region UpdateComponent Tests

        [Fact]
        public void UpdateComponent_ValidScore_UpdatesAndRecalculates()
        {
            // Arrange
            Grade grade = new Grade
            {
                AttendanceScore = 5.0m,
                MidtermScore = 5.0m,
                FinalScore = 5.0m,
                UpdatedBy = "teacher1"
            };
            grade.CalculateTotalScore();

            // Act - Update midterm score
            grade.UpdateComponent("midterm", 8.0m, "teacher2");

            // Assert
            grade.MidtermScore.Should().Be(8.0m);
            grade.UpdatedBy.Should().Be("teacher2");

            // Recalculated: 0.1*5 + 0.3*8 + 0.6*5 = 0.5+2.4+3.0 = 5.9
            grade.TotalScore.Should().Be(5.90m);
        }

        [Fact]
        public void UpdateComponent_InvalidScore_ThrowsArgumentException()
        {
            // Arrange
            Grade grade = new Grade
            {
                AttendanceScore = 5.0m,
                MidtermScore = 5.0m,
                FinalScore = 5.0m
            };

            // Act & Assert - Score > 10
            Action actOver = () => grade.UpdateComponent("midterm", 11.0m, "teacher");
            actOver.Should().Throw<ArgumentException>()
                .WithMessage("*Score must be between 0 and 10*");

            // Act & Assert - Score < 0
            Action actUnder = () => grade.UpdateComponent("final", -1.0m, "teacher");
            actUnder.Should().Throw<ArgumentException>()
                .WithMessage("*Score must be between 0 and 10*");
        }

        #endregion

        #region IsPass and IsComplete Tests

        [Fact]
        public void IsPass_ScoreAbove4_ReturnsTrue()
        {
            // Arrange
            Grade grade = new Grade
            {
                AttendanceScore = 5.0m,
                MidtermScore = 5.0m,
                FinalScore = 5.0m
            };
            grade.CalculateTotalScore();

            // Assert - Total = 5.0 >= 4.0
            grade.IsPass().Should().BeTrue();
        }

        [Fact]
        public void IsComplete_AllScoresPresent_ReturnsTrue()
        {
            // Arrange
            Grade grade = new Grade
            {
                AttendanceScore = 8.0m,
                MidtermScore = 7.0m,
                FinalScore = 9.0m
            };

            // Assert
            grade.IsComplete().Should().BeTrue();
        }

        [Fact]
        public void IsComplete_MissingScore_ReturnsFalse()
        {
            // Arrange
            Grade grade = new Grade
            {
                AttendanceScore = 8.0m,
                MidtermScore = null,
                FinalScore = 9.0m
            };

            // Assert
            grade.IsComplete().Should().BeFalse();
        }

        #endregion
    }
}
