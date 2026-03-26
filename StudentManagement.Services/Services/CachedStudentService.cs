using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using StudentManagement.Core.DTOs.Student;
using StudentManagement.Core.Interfaces.Services;
using System.Text.Json;

namespace StudentManagement.Services.Services
{
    public class CachedStudentService : IStudentService
    {
        private readonly StudentService _studentService;
        private readonly IDistributedCache _cache;
        private readonly ILogger<CachedStudentService> _logger;
        private readonly TimeSpan _defaultExpiration = TimeSpan.FromMinutes(30);

        public CachedStudentService(
            StudentService studentService,
            IDistributedCache cache,
            ILogger<CachedStudentService> logger)
        {
            _studentService = studentService;
            _cache = cache;
            _logger = logger;
        }

        public async Task<StudentDto> GetByIdAsync(string studentId)
        {
            string cacheKey = $"student:{studentId}";

            try
            {
                string? cached = await _cache.GetStringAsync(cacheKey);
                if (cached != null)
                {
                    _logger.LogInformation("Cache HIT for student {StudentId}", studentId);
                    return JsonSerializer.Deserialize<StudentDto>(cached)!;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Redis unavailable, falling back to database for student {StudentId}", studentId);
            }

            _logger.LogInformation("Cache MISS for student {StudentId}", studentId);

            StudentDto student = await _studentService.GetByIdAsync(studentId);

            try
            {
                string serialized = JsonSerializer.Serialize(student);
                await _cache.SetStringAsync(cacheKey, serialized, new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = _defaultExpiration
                });
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to cache student {StudentId}", studentId);
            }

            return student;
        }

        public async Task<StudentDto> GetByCodeAsync(string studentCode)
        {
            string cacheKey = $"student:code:{studentCode}";

            try
            {
                string? cached = await _cache.GetStringAsync(cacheKey);
                if (cached != null)
                {
                    _logger.LogInformation("Cache HIT for student code {StudentCode}", studentCode);
                    return JsonSerializer.Deserialize<StudentDto>(cached)!;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Redis unavailable, falling back to database for student code {StudentCode}", studentCode);
            }

            StudentDto student = await _studentService.GetByCodeAsync(studentCode);

            try
            {
                string serialized = JsonSerializer.Serialize(student);
                await _cache.SetStringAsync(cacheKey, serialized, new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = _defaultExpiration
                });
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to cache student code {StudentCode}", studentCode);
            }

            return student;
        }

        public async Task<PagedStudentResult> GetAllAsync(StudentSearchDto searchDto)
        {
            string queryHash = ComputeHash(searchDto);
            string cacheKey = $"students:page:{queryHash}";

            try
            {
                string? cached = await _cache.GetStringAsync(cacheKey);
                if (cached != null)
                {
                    _logger.LogInformation("Cache HIT for student list");
                    return JsonSerializer.Deserialize<PagedStudentResult>(cached)!;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Redis unavailable, falling back to database for student list");
            }

            PagedStudentResult result = await _studentService.GetAllAsync(searchDto);

            try
            {
                string serialized = JsonSerializer.Serialize(result);
                await _cache.SetStringAsync(cacheKey, serialized, new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
                });
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to cache student list");
            }

            return result;
        }

        public async Task<StudentDto> CreateAsync(CreateStudentDto createDto)
        {
            StudentDto student = await _studentService.CreateAsync(createDto);
            await InvalidateListCacheAsync();
            return student;
        }

        public async Task<StudentDto> UpdateAsync(string studentId, UpdateStudentDto updateDto)
        {
            StudentDto student = await _studentService.UpdateAsync(studentId, updateDto);

            try
            {
                await _cache.RemoveAsync($"student:{studentId}");
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to invalidate cache for student {StudentId}", studentId);
            }

            await InvalidateListCacheAsync();
            _logger.LogInformation("Cache invalidated for student {StudentId}", studentId);

            return student;
        }

        public async Task<bool> DeleteAsync(string studentId)
        {
            bool result = await _studentService.DeleteAsync(studentId);
            if (result)
            {
                try
                {
                    await _cache.RemoveAsync($"student:{studentId}");
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to invalidate cache for student {StudentId}", studentId);
                }
                await InvalidateListCacheAsync();
            }
            return result;
        }

        public async Task<List<StudentListDto>> GetByClassAsync(string classId)
        {
            return await _studentService.GetByClassAsync(classId);
        }

        public async Task<bool> ExistsAsync(string studentCode)
        {
            return await _studentService.ExistsAsync(studentCode);
        }

        public async Task<bool> UpdateAvatarAsync(string studentId, string avatarUrl)
        {
            bool result = await _studentService.UpdateAvatarAsync(studentId, avatarUrl);
            if (result)
            {
                try { await _cache.RemoveAsync($"student:{studentId}"); }
                catch { /* Redis unavailable */ }
            }
            return result;
        }

        public async Task<bool> UpdateGPAAsync(string studentId, decimal gpa)
        {
            bool result = await _studentService.UpdateGPAAsync(studentId, gpa);
            if (result)
            {
                try { await _cache.RemoveAsync($"student:{studentId}"); }
                catch { /* Redis unavailable */ }
            }
            return result;
        }

        public async Task<StudentDto> ChangeClassAsync(string studentId, string newClassId)
        {
            StudentDto student = await _studentService.ChangeClassAsync(studentId, newClassId);
            try { await _cache.RemoveAsync($"student:{studentId}"); }
            catch { /* Redis unavailable */ }
            return student;
        }

        public async Task<int> GetTotalCountAsync()
        {
            string cacheKey = "students:totalcount";
            try
            {
                string? cached = await _cache.GetStringAsync(cacheKey);
                if (cached != null)
                    return JsonSerializer.Deserialize<int>(cached);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Redis unavailable for total count");
            }

            int count = await _studentService.GetTotalCountAsync();

            try
            {
                await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(count), new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10)
                });
            }
            catch { /* Redis unavailable */ }

            return count;
        }

        public async Task<List<StudentListDto>> GetTopStudentsAsync(int limit = 10)
        {
            string cacheKey = $"students:top:{limit}";
            try
            {
                string? cached = await _cache.GetStringAsync(cacheKey);
                if (cached != null)
                    return JsonSerializer.Deserialize<List<StudentListDto>>(cached)!;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Redis unavailable for top students");
            }

            List<StudentListDto> topStudents = await _studentService.GetTopStudentsAsync(limit);

            try
            {
                await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(topStudents), new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10)
                });
            }
            catch { /* Redis unavailable */ }

            return topStudents;
        }

        // Helper methods

        private string ComputeHash(object obj)
        {
            string json = JsonSerializer.Serialize(obj);
            using System.Security.Cryptography.SHA256 sha256 = System.Security.Cryptography.SHA256.Create();
            byte[] bytes = System.Text.Encoding.UTF8.GetBytes(json);
            byte[] hash = sha256.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }

        private async Task InvalidateListCacheAsync()
        {
            try
            {
                await _cache.RemoveAsync("students:totalcount");
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to invalidate list cache");
            }
            _logger.LogInformation("Student list cache invalidated");
        }
    }
}