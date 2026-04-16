using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using System.Text.Json;

namespace StudentManagement.API.Configuration
{
    /// <summary>
    /// Cấu hình Health Checks cho hệ thống.
    /// Kiểm tra SQL Server, memory, disk space.
    /// </summary>
    public static class HealthCheckConfiguration
    {
        /// <summary>
        /// Đăng ký health checks: SQL Server, Memory, Disk Space
        /// </summary>
        public static IServiceCollection AddCustomHealthChecks(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            services.AddHealthChecks()
                .AddSqlServer(
                    configuration.GetConnectionString("DefaultConnection")!,
                    name: "SQL Server",
                    failureStatus: HealthStatus.Degraded,
                    tags: new[] { "db", "sql", "sqlserver" })
                .AddCheck<ApiHealthCheck>("API Health")
                .AddCheck<MemoryHealthCheck>("Memory")
                .AddCheck<DiskSpaceHealthCheck>("Disk Space");

            return services;
        }

        /// <summary>
        /// Map health check endpoints: /health, /health/ready, /health/live
        /// </summary>
        public static void MapHealthCheckEndpoints(this WebApplication app)
        {
            app.MapHealthChecks("/health", new HealthCheckOptions
            {
                ResponseWriter = WriteHealthCheckResponse
            });

            app.MapHealthChecks("/health/ready", new HealthCheckOptions
            {
                Predicate = check => check.Tags.Contains("db"),
                ResponseWriter = WriteHealthCheckResponse
            });

            app.MapHealthChecks("/health/live", new HealthCheckOptions
            {
                Predicate = _ => false
            });
        }

        /// <summary>
        /// Viết response JSON cho health check endpoint
        /// </summary>
        private static async Task WriteHealthCheckResponse(HttpContext context, HealthReport report)
        {
            context.Response.ContentType = "application/json";
            var response = new
            {
                status = report.Status.ToString(),
                totalDuration = report.TotalDuration.TotalMilliseconds,
                checks = report.Entries.Select(entry => new
                {
                    name = entry.Key,
                    status = entry.Value.Status.ToString(),
                    duration = entry.Value.Duration.TotalMilliseconds,
                    description = entry.Value.Description,
                    data = entry.Value.Data
                })
            };
            await context.Response.WriteAsJsonAsync(response);
        }
    }

    /// <summary>
    /// Health check cơ bản cho API
    /// </summary>
    public class ApiHealthCheck : IHealthCheck
    {
        public Task<HealthCheckResult> CheckHealthAsync(
            HealthCheckContext context,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult(HealthCheckResult.Healthy("API is healthy"));
        }
    }

    /// <summary>
    /// Kiểm tra memory usage (cảnh báo nếu > 1GB)
    /// </summary>
    public class MemoryHealthCheck : IHealthCheck
    {
        public Task<HealthCheckResult> CheckHealthAsync(
            HealthCheckContext context,
            CancellationToken cancellationToken = default)
        {
            long allocated = GC.GetTotalMemory(forceFullCollection: false);
            var data = new Dictionary<string, object>
            {
                { "AllocatedMB", allocated / 1024 / 1024 }
            };

            long threshold = 1024L * 1024 * 1024; // 1GB

            return Task.FromResult(allocated < threshold
                ? HealthCheckResult.Healthy("Memory usage is normal", data)
                : HealthCheckResult.Degraded("Memory usage is high", null, data));
        }
    }

    /// <summary>
    /// Kiểm tra dung lượng ổ đĩa (cảnh báo nếu < 10GB)
    /// </summary>
    public class DiskSpaceHealthCheck : IHealthCheck
    {
        public Task<HealthCheckResult> CheckHealthAsync(
            HealthCheckContext context,
            CancellationToken cancellationToken = default)
        {
            DriveInfo drive = new DriveInfo("C");
            long freeSpaceGB = drive.AvailableFreeSpace / 1024 / 1024 / 1024;

            var data = new Dictionary<string, object>
            {
                { "FreeSpaceGB", freeSpaceGB },
                { "TotalSpaceGB", drive.TotalSize / 1024 / 1024 / 1024 }
            };

            return Task.FromResult(freeSpaceGB > 10
                ? HealthCheckResult.Healthy("Disk space is sufficient", data)
                : HealthCheckResult.Degraded("Low disk space", null, data));
        }
    }
}
