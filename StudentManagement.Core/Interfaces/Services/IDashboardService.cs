using StudentManagement.Core.DTOs.Dashboard;

namespace StudentManagement.Core.Interfaces.Services
{
    public interface IDashboardService
    {
        Task<DashboardStatsDto> GetAdvancedStatsAsync();
    }
}
