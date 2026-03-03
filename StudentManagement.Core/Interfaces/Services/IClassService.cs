using StudentManagement.Core.DTOs.Class;
using StudentManagement.Core.DTOs.Student;

namespace StudentManagement.Core.Interfaces.Services
{
    public interface IClassService
    {
        Task<ClassDto> GetByIdAsync(string classId);
        Task<List<ClassListDto>> GetAllAsync();
        Task<ClassDto> CreateAsync(CreateClassDto createDto);
        Task<ClassDto> UpdateAsync(string classId, UpdateClassDto updateDto);
        Task<bool> DeleteAsync(string classId);
        Task<bool> AddStudentToClassAsync(string classId, string studentId);
        Task<bool> RemoveStudentFromClassAsync(string classId, string studentId);
        Task<List<StudentListDto>> GetClassStudentsAsync(string classId);
        Task<int> GetTotalCountAsync();
    }
}