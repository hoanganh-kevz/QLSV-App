using System.Diagnostics;

namespace StudentManagement.API.Middlewares
{
    public class PerformanceMonitoringMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<PerformanceMonitoringMiddleware> _logger;

        public PerformanceMonitoringMiddleware(
            RequestDelegate next,
            ILogger<PerformanceMonitoringMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var stopwatch = Stopwatch.StartNew();

            try
            {
                await _next(context);
            }
            finally
            {
                stopwatch.Stop();

                var elapsedMilliseconds = stopwatch.ElapsedMilliseconds;

                if (elapsedMilliseconds > 1000) // Log slow requests (>1s)
                {
                    _logger.LogWarning(
                        "Slow request: {Method} {Path} took {ElapsedMilliseconds}ms",
                        context.Request.Method,
                        context.Request.Path,
                        elapsedMilliseconds);
                }

                // Add custom header
                context.Response.Headers.Add("X-Response-Time", $"{elapsedMilliseconds}ms");
            }
        }
    }
}
