namespace StudentManagement.Core.DTOs.Dashboard
{
    public class DashboardStatsDto
    {
        public int TotalStudents { get; set; }
        public int TotalTeachers { get; set; }
        public int TotalClasses { get; set; }
        public int TotalSubjects { get; set; }
        
        public decimal AverageSystemGPA { get; set; }
        
        public Dictionary<string, int> GradeDistribution { get; set; } = new Dictionary<string, int>();
        
        // Key: AcademicYear, Value: Count of students enrolled
        public Dictionary<string, int> EnrollmentTrends { get; set; } = new Dictionary<string, int>();
        
        public List<TopClassDto> TopPerformingClasses { get; set; } = new List<TopClassDto>();
    }

    public class TopClassDto
    {
        public string ClassID { get; set; }
        public string ClassName { get; set; }
        public decimal AverageGPA { get; set; }
    }
}
