using StudentManagement.Core.DTOs.Teacher;

namespace StudentManagement.Core.Interfaces.Services
{
    public interface ITeacherService
    {
        Task<TeacherDto> GetByIdAsync(string teacherId);
        Task<TeacherDto> GetByCodeAsync(string teacherCode);
        Task<List<TeacherListDto>> GetAllAsync();
        Task<List<TeacherListDto>> GetByDepartmentAsync(string departmentId);
        Task<TeacherDto> CreateAsync(CreateTeacherDto createDto);
        Task<TeacherDto> UpdateAsync(string teacherId, UpdateTeacherDto updateDto);
        Task<bool> DeleteAsync(string teacherId);
        Task<int> GetTotalCountAsync();
    }
}
