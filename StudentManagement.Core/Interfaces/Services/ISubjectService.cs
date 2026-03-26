using StudentManagement.Core.DTOs.Subject;

namespace StudentManagement.Core.Interfaces.Services
{
    public interface ISubjectService
    {
        Task<SubjectDto> GetByIdAsync(string subjectId);
        Task<SubjectDto> GetByCodeAsync(string subjectCode);
        Task<List<SubjectListDto>> GetAllAsync();
        Task<List<SubjectListDto>> GetByDepartmentAsync(string departmentId);
        Task<SubjectDto> CreateAsync(CreateSubjectDto createDto);
        Task<SubjectDto> UpdateAsync(string subjectId, UpdateSubjectDto updateDto);
        Task<bool> DeleteAsync(string subjectId);
        Task<bool> ExistsAsync(string subjectCode);
        Task<int> GetTotalCountAsync();
    }
}
