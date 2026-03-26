namespace StudentManagement.Core.DTOs.Search
{
    public class AdvancedSearchDto
    {
        // General
        public string? Keywords { get; set; } // Space-separated keywords
        
        // Student filters
        public List<string>? ClassIds { get; set; }
        public List<string>? MajorIds { get; set; }
        public List<string>? Statuses { get; set; }
        public int? EnrollmentYearFrom { get; set; }
        public int? EnrollmentYearTo { get; set; }
        
        // GPA range
        public decimal? MinGPA { get; set; }
        public decimal? MaxGPA { get; set; }
        
        // Date range
        public DateTime? DateFrom { get; set; }
        public DateTime? DateTo { get; set; }
        
        // Sorting
        public string SortBy { get; set; } = "studentCode";
        public string SortOrder { get; set; } = "asc";
        
        // Pagination
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        
        // Advanced options
        public bool IncludeGrades { get; set; } = false;
        public bool IncludeEnrollments { get; set; } = false;
    }

    public class SearchResultDto<T>
    {
        public List<T> Results { get; set; }
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
        public Dictionary<string, int> Facets { get; set; } // For filtering counts
        public TimeSpan SearchTime { get; set; }
    }
}