using Microsoft.Extensions.DependencyInjection;
using StudentManagement.Core.DTOs.Student;
using StudentManagement.Core.Interfaces.Services;

namespace StudentManagement.Services.Jobs
{
    public class GpaRecalculationJob
    {
        private readonly IServiceProvider _serviceProvider;

        public GpaRecalculationJob(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        public async Task RecalculateAllGpasAsync()
        {
            using IServiceScope scope = _serviceProvider.CreateScope();
            IGradeService gradeService = scope.ServiceProvider.GetRequiredService<IGradeService>();
            IStudentService studentService = scope.ServiceProvider.GetRequiredService<IStudentService>();

            PagedStudentResult students = await studentService.GetAllAsync(new StudentSearchDto { PageSize = int.MaxValue });

            foreach (StudentListDto student in students.Students)
            {
                await gradeService.UpdateStudentGPAAsync(student.StudentID);
            }
        }
    }
}