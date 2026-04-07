namespace StudentManagement.API.Middlewares
{
    public class SecurityHeadersMiddleware
    {
        private readonly RequestDelegate _next;

        public SecurityHeadersMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // X-Content-Type-Options
            context.Response.Headers["X-Content-Type-Options"] = "nosniff";

            // X-Frame-Options
            context.Response.Headers["X-Frame-Options"] = "DENY";

            // X-XSS-Protection
            context.Response.Headers["X-XSS-Protection"] = "1; mode=block";

            // Referrer-Policy
            context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";

            // Content-Security-Policy
            context.Response.Headers["Content-Security-Policy"] = 
                "default-src 'self'; " +
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
                "style-src 'self' 'unsafe-inline'; " +
                "img-src 'self' data: https:; " +
                "font-src 'self' data:; " +
                "connect-src 'self' https://api.studentmanagement.com;";

            // Permissions-Policy
            context.Response.Headers["Permissions-Policy"] = 
                "geolocation=(), microphone=(), camera=()";

            // Strict-Transport-Security (HSTS)
            if (context.Request.IsHttps)
            {
                context.Response.Headers["Strict-Transport-Security"] = 
                    "max-age=31536000; includeSubDomains; preload";
            }

            // Remove server header
            context.Response.Headers.Remove("Server");
            context.Response.Headers.Remove("X-Powered-By");

            await _next(context);
        }
    }

    public static class SecurityHeadersMiddlewareExtensions
    {
        public static IApplicationBuilder UseSecurityHeaders(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<SecurityHeadersMiddleware>();
        }
    }
}