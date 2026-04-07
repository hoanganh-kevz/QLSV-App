using StudentManagement.Core.DTOs.Search;
using StudentManagement.Core.DTOs.Student;

namespace StudentManagement.Services.Services
{
    public interface IAdvancedSearchService
    {
        Task<SearchResultDto<StudentDto>> SearchStudentsAsync(AdvancedSearchDto searchDto);
        Task<SearchResultDto<StudentDto>> SearchByTextAsync(string searchText, int pageSize = 10);
    }
}
