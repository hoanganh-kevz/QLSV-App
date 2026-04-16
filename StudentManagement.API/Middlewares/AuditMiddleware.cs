using System.Text.Json;

namespace StudentManagement.API.Middlewares
{
    public class AuditMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<AuditMiddleware> _logger;

        public AuditMiddleware(RequestDelegate next, ILogger<AuditMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Only audit write operations
            if (IsAuditableRequest(context.Request))
            {
                var auditLog = new
                {
                    Timestamp = DateTime.UtcNow,
                    User = context.User.Identity?.Name ?? "Anonymous",
                    Method = context.Request.Method,
                    Path = context.Request.Path,
                    QueryString = context.Request.QueryString.ToString(),
                    IPAddress = context.Connection.RemoteIpAddress?.ToString(),
                    UserAgent = context.Request.Headers["User-Agent"].ToString()
                };

                _logger.LogInformation("Audit: {AuditLog}", JsonSerializer.Serialize(auditLog));
            }

            await _next(context);
        }

        private bool IsAuditableRequest(HttpRequest request)
        {
            var method = request.Method.ToUpper();
            return method == "POST" || method == "PUT" || method == "DELETE" || method == "PATCH";
        }
    }

    public static class AuditMiddlewareExtensions
    {
        public static IApplicationBuilder UseAuditLogging(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<AuditMiddleware>();
        }
    }
}
