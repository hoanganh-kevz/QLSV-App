using AutoMapper;
using Microsoft.EntityFrameworkCore;
using StudentManagement.Core.DTOs.Search;
using StudentManagement.Core.DTOs.Student;
using StudentManagement.Core.Entities;
using StudentManagement.Core.Enums;
using StudentManagement.Infrastructure.Data;
using System.Diagnostics;

namespace StudentManagement.Services.Services
{
    public class AdvancedSearchService : IAdvancedSearchService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public AdvancedSearchService(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<SearchResultDto<StudentDto>> SearchStudentsAsync(AdvancedSearchDto searchDto)
        {
            Stopwatch stopwatch = Stopwatch.StartNew();
            
            // Start with base query
            IQueryable<Student> query = _context.Students
                .Include((Student s) => s.Class)
                .AsQueryable();

            // Apply keyword search (multiple words)
            if (!string.IsNullOrWhiteSpace(searchDto.Keywords))
            {
                List<string> keywords = searchDto.Keywords
                    .Split(' ', StringSplitOptions.RemoveEmptyEntries)
                    .Select((string k) => k.ToLower())
                    .ToList();

                foreach (string keyword in keywords)
                {
                    query = query.Where((Student s) =>
                        s.FullName.ToLower().Contains(keyword) ||
                        s.Email.ToLower().Contains(keyword) ||
                        s.StudentCode.ToLower().Contains(keyword) ||
                        s.PhoneNumber.Contains(keyword)
                    );
                }
            }

            // Class filter
            if (searchDto.ClassIds != null && searchDto.ClassIds.Any())
            {
                query = query.Where((Student s) => searchDto.ClassIds.Contains(s.ClassID));
            }

            // Major filter
            if (searchDto.MajorIds != null && searchDto.MajorIds.Any())
            {
                query = query.Where((Student s) => searchDto.MajorIds.Contains(s.MajorID));
            }

            // Status filter
            if (searchDto.Statuses != null && searchDto.Statuses.Any())
            {
                List<StudentStatus> statusEnums = searchDto.Statuses
                    .Select((string s) => Enum.Parse<StudentStatus>(s))
                    .ToList();
                query = query.Where((Student s) => statusEnums.Contains(s.Status));
            }

            // Enrollment year range
            if (searchDto.EnrollmentYearFrom.HasValue)
            {
                query = query.Where((Student s) => s.EnrollmentYear >= searchDto.EnrollmentYearFrom.Value);
            }

            if (searchDto.EnrollmentYearTo.HasValue)
            {
                query = query.Where((Student s) => s.EnrollmentYear <= searchDto.EnrollmentYearTo.Value);
            }

            // GPA range
            if (searchDto.MinGPA.HasValue)
            {
                query = query.Where((Student s) => s.GPA >= searchDto.MinGPA.Value);
            }

            if (searchDto.MaxGPA.HasValue)
            {
                query = query.Where((Student s) => s.GPA <= searchDto.MaxGPA.Value);
            }

            // Get total count before pagination
            int totalCount = await query.CountAsync();

            // Calculate facets (for UI filters)
            Dictionary<string, int> facets = await CalculateFacetsAsync(query);

            // Apply sorting
            query = ApplySorting(query, searchDto.SortBy, searchDto.SortOrder);

            // Apply pagination
            query = query
                .Skip((searchDto.PageNumber - 1) * searchDto.PageSize)
                .Take(searchDto.PageSize);

            // Execute query
            List<Student> students = await query.ToListAsync();
            
            // Map to DTOs
            List<StudentDto> studentDtos = _mapper.Map<List<StudentDto>>(students);

            stopwatch.Stop();

            return new SearchResultDto<StudentDto>
            {
                Results = studentDtos,
                TotalCount = totalCount,
                PageNumber = searchDto.PageNumber,
                PageSize = searchDto.PageSize,
                Facets = facets,
                SearchTime = stopwatch.Elapsed
            };
        }

        private IQueryable<Student> ApplySorting(IQueryable<Student> query, string sortBy, string sortOrder)
        {
            bool ascending = sortOrder.ToLower() == "asc";

            return sortBy.ToLower() switch
            {
                "fullname" => ascending 
                    ? query.OrderBy((Student s) => s.FullName) 
                    : query.OrderByDescending((Student s) => s.FullName),
                    
                "gpa" => ascending 
                    ? query.OrderBy((Student s) => s.GPA) 
                    : query.OrderByDescending((Student s) => s.GPA),
                    
                "enrollmentyear" => ascending 
                    ? query.OrderBy((Student s) => s.EnrollmentYear) 
                    : query.OrderByDescending((Student s) => s.EnrollmentYear),
                    
                "class" => ascending 
                    ? query.OrderBy((Student s) => s.Class.ClassName) 
                    : query.OrderByDescending((Student s) => s.Class.ClassName),
                    
                _ => ascending 
                    ? query.OrderBy((Student s) => s.StudentCode) 
                    : query.OrderByDescending((Student s) => s.StudentCode)
            };
        }

        private async Task<Dictionary<string, int>> CalculateFacetsAsync(IQueryable<Student> query)
        {
            Dictionary<string, int> facets = new Dictionary<string, int>();

            // Count by status — var required: uses anonymous type
            var statusCounts = await query
                .GroupBy((Student s) => s.Status)
                .Select(g => new { Status = g.Key.ToString(), Count = g.Count() })
                .ToListAsync();

            foreach (var item in statusCounts)
            {
                facets[$"status_{item.Status}"] = item.Count;
            }

            // Count by class — var required: uses anonymous type
            var classCounts = await query
                .Where((Student s) => s.ClassID != null)
                .GroupBy((Student s) => s.ClassID)
                .Select(g => new { ClassID = g.Key, Count = g.Count() })
                .Take(10)
                .ToListAsync();

            foreach (var item in classCounts)
            {
                facets[$"class_{item.ClassID}"] = item.Count;
            }

            // Count by GPA range
            facets["gpa_excellent"] = await query.CountAsync((Student s) => s.GPA >= 3.6m);
            facets["gpa_good"] = await query.CountAsync((Student s) => s.GPA >= 3.2m && s.GPA < 3.6m);
            facets["gpa_average"] = await query.CountAsync((Student s) => s.GPA >= 2.5m && s.GPA < 3.2m);
            facets["gpa_below"] = await query.CountAsync((Student s) => s.GPA < 2.5m);

            return facets;
        }

        public async Task<SearchResultDto<StudentDto>> SearchByTextAsync(string searchText, int pageSize = 10)
        {
            // Simplified quick search
            IQueryable<Student> query = _context.Students
                .Include((Student s) => s.Class)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchText))
            {
                string lowerText = searchText.ToLower();
                query = query.Where((Student s) =>
                    s.FullName.ToLower().Contains(lowerText) ||
                    s.Email.ToLower().Contains(lowerText) ||
                    s.StudentCode.ToLower().Contains(lowerText)
                );
            }

            int totalCount = await query.CountAsync();
            List<Student> students = await query.Take(pageSize).ToListAsync();
            List<StudentDto> studentDtos = _mapper.Map<List<StudentDto>>(students);

            return new SearchResultDto<StudentDto>
            {
                Results = studentDtos,
                TotalCount = totalCount,
                PageNumber = 1,
                PageSize = pageSize,
                Facets = new Dictionary<string, int>(),
                SearchTime = TimeSpan.Zero
            };
        }
    }
}