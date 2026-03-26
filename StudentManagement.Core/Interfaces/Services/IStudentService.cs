using StudentManagement.Core.DTOs.Student;

namespace StudentManagement.Core.Interfaces.Services
{
    public interface IStudentService
    {
        // CRUD Operations
        Task<StudentDto> GetByIdAsync(string studentId);
        Task<StudentDto> GetByCodeAsync(string studentCode);
        Task<PagedStudentResult> GetAllAsync(StudentSearchDto searchDto);
        Task<StudentDto> CreateAsync(CreateStudentDto createDto);
        Task<StudentDto> UpdateAsync(string studentId, UpdateStudentDto updateDto);
        Task<bool> DeleteAsync(string studentId);

        // Additional operations
        Task<List<StudentListDto>> GetByClassAsync(string classId);
        Task<bool> ExistsAsync(string studentCode);
        Task<bool> UpdateAvatarAsync(string studentId, string avatarUrl);
        Task<bool> UpdateGPAAsync(string studentId, decimal gpa);
        Task<StudentDto> ChangeClassAsync(string studentId, string newClassId);
        
        // Statistics
        Task<int> GetTotalCountAsync();
        Task<List<StudentListDto>> GetTopStudentsAsync(int limit = 10);
    }
}