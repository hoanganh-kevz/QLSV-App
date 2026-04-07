using Microsoft.Extensions.Diagnostics.HealthChecks;
using HealthChecks.UI.Client;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;

namespace StudentManagement.API.Configuration
{
    public static class HealthCheckConfiguration
    {
        public static IServiceCollection AddHealthChecks(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            // Custom health checks
            services.AddHealthChecks()
                .AddCheck<ApiHealthCheck>("API Health")
                .AddCheck<MemoryHealthCheck>("Memory")
                .AddCheck<DiskSpaceHealthCheck>("Disk Space");

            return services;
        }

        public static void MapHealthCheckEndpoints(this WebApplication app)
        {
            app.MapHealthChecks("/health");
            app.MapHealthChecks("/health/ready");
            app.MapHealthChecks("/health/live");
        }
    }

    // Custom health checks
    public class ApiHealthCheck : IHealthCheck
    {
        public Task<HealthCheckResult> CheckHealthAsync(
            HealthCheckContext context,
            CancellationToken cancellationToken = default)
        {
            // Check API dependencies
            var isHealthy = true; // Your logic here

            if (isHealthy)
            {
                return Task.FromResult(
                    HealthCheckResult.Healthy("API is healthy"));
            }

            return Task.FromResult(
                new HealthCheckResult(
                    context.Registration.FailureStatus,
                    "API is unhealthy"));
        }
    }

    public class MemoryHealthCheck : IHealthCheck
    {
        public Task<HealthCheckResult> CheckHealthAsync(
            HealthCheckContext context,
            CancellationToken cancellationToken = default)
        {
            var allocated = GC.GetTotalMemory(forceFullCollection: false);
            var data = new Dictionary<string, object>
            {
                { "AllocatedMB", allocated / 1024 / 1024 }
            };

            var threshold = 1024 * 1024 * 1024; // 1GB

            return Task.FromResult(allocated < threshold
                ? HealthCheckResult.Healthy("Memory usage is normal", data)
                : HealthCheckResult.Degraded("Memory usage is high", null, data));
        }
    }

    public class DiskSpaceHealthCheck : IHealthCheck
    {
        public Task<HealthCheckResult> CheckHealthAsync(
            HealthCheckContext context,
            CancellationToken cancellationToken = default)
        {
            var drive = new DriveInfo("C");
            var freeSpaceGB = drive.AvailableFreeSpace / 1024 / 1024 / 1024;

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