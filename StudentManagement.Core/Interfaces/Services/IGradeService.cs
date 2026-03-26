using StudentManagement.Core.DTOs.Grade;
using StudentManagement.Core.Entities;

namespace StudentManagement.Core.Interfaces.Services
{
    public interface IGradeService
    {
        // CRUD
        Task<GradeDto> GetByIdAsync(string gradeId);
        Task<List<GradeDto>> GetBySectionAsync(string sectionId);
        Task<List<GradeDto>> GetByStudentAsync(string studentId);
        Task<GradeDto> CreateAsync(CreateGradeDto createDto, string createdBy);
        Task<GradeDto> UpdateComponentAsync(string gradeId, UpdateGradeComponentDto updateDto, string updatedBy);
        Task<bool> DeleteAsync(string gradeId);
        
        // Transcript & GPA
        Task<TranscriptDto> GetTranscriptAsync(string studentId);
        Task<decimal> CalculateGPAAsync(string studentId);
        Task<decimal> CalculateSemesterGPAAsync(string studentId, int semester, string academicYear);
        Task UpdateStudentGPAAsync(string studentId);
        
        // Grade distribution
        Task<Dictionary<string, int>> GetGradeDistributionAsync(string sectionId);
        Task<List<GradeDto>> GetFailingStudentsAsync(string sectionId);
        
        // Validation
        Task<bool> CanModifyGradeAsync(string gradeId);
        Task<List<GradeHistory>> GetGradeHistoryAsync(string gradeId);
    }
}