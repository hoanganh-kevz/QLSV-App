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
            services.AddHealthChecks()
                // Database health check
                .AddSqlServer(
                    configuration.GetConnectionString("DefaultConnection"),
                    name: "SQL Server",
                    failureStatus: HealthStatus.Degraded,
                    tags: new[] { "db", "sql", "sqlserver" })
                
                // Redis health check (if using caching)
                .AddRedis(
                    configuration["Redis:ConnectionString"],
                    name: "Redis Cache",
                    failureStatus: HealthStatus.Degraded,
                    tags: new[] { "cache", "redis" })
                
                // Custom health checks
                .AddCheck<ApiHealthCheck>("API Health")
                .AddCheck<MemoryHealthCheck>("Memory")
                .AddCheck<DiskSpaceHealthCheck>("Disk Space");

            // Health checks UI
            services.AddHealthChecksUI(setup =>
            {
                setup.SetEvaluationTimeInSeconds(30);
                setup.MaximumHistoryEntriesPerEndpoint(50);
                setup.AddHealthCheckEndpoint("API", "/health");
            })
            .AddInMemoryStorage();

            return services;
        }

        public static void MapHealthCheckEndpoints(this WebApplication app)
        {
            app.MapHealthChecks("/health", new HealthCheckOptions
            {
                ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
            });

            app.MapHealthChecks("/health/ready", new HealthCheckOptions
            {
                Predicate = check => check.Tags.Contains("ready"),
                ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
            });

            app.MapHealthChecks("/health/live", new HealthCheckOptions
            {
                Predicate = _ => false,
                ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
            });

            app.MapHealthChecksUI(options => options.UIPath = "/health-ui");
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