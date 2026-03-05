using StudentManagement.Core.DTOs.Student;
using StudentManagement.Core.DTOs.Class;

namespace StudentManagement.Core.Interfaces.Services
{
    public interface IExportService
    {
        // Excel exports
        Task<byte[]> ExportStudentsToExcelAsync(List<StudentListDto> students);
        Task<byte[]> ExportClassesToExcelAsync(List<ClassDto> classes);
        Task<byte[]> ExportGradesToExcelAsync(string sectionId);
        Task<byte[]> ExportTranscriptToExcelAsync(string studentId);
        
        // PDF exports
        Task<byte[]> ExportTranscriptToPdfAsync(string studentId);
        Task<byte[]> ExportClassRosterToPdfAsync(string classId);
        
        // Template generation
        Task<byte[]> GenerateGradeEntryTemplateAsync(string sectionId);
        Task<bool> ImportGradesFromExcelAsync(byte[] fileData, string sectionId);
    }
}