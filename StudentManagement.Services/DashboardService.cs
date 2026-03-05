using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using StudentManagement.Infrastructure;
using System.Data;
using System.Threading.Tasks;

namespace StudentManagement.Services
{
    public class DashboardService
    {
        private readonly AppDbContext _context;

        public DashboardService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<object> GetDashboardStats()
        {
            var connection = _context.Database.GetDbConnection();

            await connection.OpenAsync();

            using var command = connection.CreateCommand();
            command.CommandText = "sp_GetDashboardStats";
            command.CommandType = CommandType.StoredProcedure;

            using var reader = await command.ExecuteReaderAsync();

            if (await reader.ReadAsync())
            {
                return new
                {
                    TotalStudents = reader["TotalStudents"],
                    TotalTeachers = reader["TotalTeachers"],
                    TotalAdmins = reader["TotalAdmins"],
                    ActiveAccounts = reader["ActiveAccounts"],
                    InactiveAccounts = reader["InactiveAccounts"]
                };
            }

            return null;
        }
    }
}