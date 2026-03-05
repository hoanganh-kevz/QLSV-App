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
            var stopwatch = Stopwatch.StartNew();
            
            // Start with base query
            var query = _context.Students
                .Include(s => s.Class)
                .AsQueryable();

            // Apply keyword search (multiple words)
            if (!string.IsNullOrWhiteSpace(searchDto.Keywords))
            {
                var keywords = searchDto.Keywords
                    .Split(' ', StringSplitOptions.RemoveEmptyEntries)
                    .Select(k => k.ToLower())
                    .ToList();

                foreach (var keyword in keywords)
                {
                    query = query.Where(s =>
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
                query = query.Where(s => searchDto.ClassIds.Contains(s.ClassID));
            }

            // Major filter
            if (searchDto.MajorIds != null && searchDto.MajorIds.Any())
            {
                query = query.Where(s => searchDto.MajorIds.Contains(s.MajorID));
            }

            // Status filter
            if (searchDto.Statuses != null && searchDto.Statuses.Any())
            {
                var statusEnums = searchDto.Statuses
                    .Select(s => Enum.Parse<StudentStatus>(s))
                    .ToList();
                query = query.Where(s => statusEnums.Contains(s.Status));
            }

            // Enrollment year range
            if (searchDto.EnrollmentYearFrom.HasValue)
            {
                query = query.Where(s => s.EnrollmentYear >= searchDto.EnrollmentYearFrom.Value);
            }

            if (searchDto.EnrollmentYearTo.HasValue)
            {
                query = query.Where(s => s.EnrollmentYear <= searchDto.EnrollmentYearTo.Value);
            }

            // GPA range
            if (searchDto.MinGPA.HasValue)
            {
                query = query.Where(s => s.GPA >= searchDto.MinGPA.Value);
            }

            if (searchDto.MaxGPA.HasValue)
            {
                query = query.Where(s => s.GPA <= searchDto.MaxGPA.Value);
            }

            // Get total count before pagination
            var totalCount = await query.CountAsync();

            // Calculate facets (for UI filters)
            var facets = await CalculateFacetsAsync(query);

            // Apply sorting
            query = ApplySorting(query, searchDto.SortBy, searchDto.SortOrder);

            // Apply pagination
            query = query
                .Skip((searchDto.PageNumber - 1) * searchDto.PageSize)
                .Take(searchDto.PageSize);

            // Execute query
            var students = await query.ToListAsync();
            
            // Map to DTOs
            var studentDtos = _mapper.Map<List<StudentDto>>(students);

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
            var ascending = sortOrder.ToLower() == "asc";

            return sortBy.ToLower() switch
            {
                "fullname" => ascending 
                    ? query.OrderBy(s => s.FullName) 
                    : query.OrderByDescending(s => s.FullName),
                    
                "gpa" => ascending 
                    ? query.OrderBy(s => s.GPA) 
                    : query.OrderByDescending(s => s.GPA),
                    
                "enrollmentyear" => ascending 
                    ? query.OrderBy(s => s.EnrollmentYear) 
                    : query.OrderByDescending(s => s.EnrollmentYear),
                    
                "class" => ascending 
                    ? query.OrderBy(s => s.Class.ClassName) 
                    : query.OrderByDescending(s => s.Class.ClassName),
                    
                _ => ascending 
                    ? query.OrderBy(s => s.StudentCode) 
                    : query.OrderByDescending(s => s.StudentCode)
            };
        }

        private async Task<Dictionary<string, int>> CalculateFacetsAsync(IQueryable<Student> query)
        {
            var facets = new Dictionary<string, int>();

            // Count by status
            var statusCounts = await query
                .GroupBy(s => s.Status)
                .Select(g => new { Status = g.Key.ToString(), Count = g.Count() })
                .ToListAsync();

            foreach (var item in statusCounts)
            {
                facets[$"status_{item.Status}"] = item.Count;
            }

            // Count by class
            var classCounts = await query
                .Where(s => s.ClassID != null)
                .GroupBy(s => s.ClassID)
                .Select(g => new { ClassID = g.Key, Count = g.Count() })
                .Take(10)
                .ToListAsync();

            foreach (var item in classCounts)
            {
                facets[$"class_{item.ClassID}"] = item.Count;
            }

            // Count by GPA range
            facets["gpa_excellent"] = await query.CountAsync(s => s.GPA >= 3.6m);
            facets["gpa_good"] = await query.CountAsync(s => s.GPA >= 3.2m && s.GPA < 3.6m);
            facets["gpa_average"] = await query.CountAsync(s => s.GPA >= 2.5m && s.GPA < 3.2m);
            facets["gpa_below"] = await query.CountAsync(s => s.GPA < 2.5m);

            return facets;
        }

        public async Task<SearchResultDto<StudentDto>> SearchByTextAsync(string searchText, int pageSize = 10)
        {
            // Simplified quick search
            var query = _context.Students
                .Include(s => s.Class)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchText))
            {
                var lowerText = searchText.ToLower();
                query = query.Where(s =>
                    s.FullName.ToLower().Contains(lowerText) ||
                    s.Email.ToLower().Contains(lowerText) ||
                    s.StudentCode.ToLower().Contains(lowerText)
                );
            }

            var totalCount = await query.CountAsync();
            var students = await query.Take(pageSize).ToListAsync();
            var studentDtos = _mapper.Map<List<StudentDto>>(students);

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