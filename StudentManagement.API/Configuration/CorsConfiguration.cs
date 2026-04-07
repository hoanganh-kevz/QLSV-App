namespace StudentManagement.API.Configuration
{
    public static class CorsConfiguration
    {
        public static IServiceCollection AddCorsPolicy(this IServiceCollection services, IConfiguration configuration)
        {
            var allowedOrigins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() 
                ?? new[] { "http://localhost:5173", "http://localhost:3000" };

            services.AddCors(options =>
            {
                options.AddPolicy("AllowSpecificOrigins", builder =>
                {
                    builder
                        .WithOrigins(allowedOrigins)
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .AllowCredentials()
                        .SetIsOriginAllowedToAllowWildcardSubdomains()
                        .WithExposedHeaders("Content-Disposition"); // For file downloads
                });

                // Restrictive policy for production
                options.AddPolicy("ProductionPolicy", builder =>
                {
                    builder
                        .WithOrigins("https://studentmanagement.com", "https://www.studentmanagement.com")
                        .WithMethods("GET", "POST", "PUT", "DELETE", "PATCH")
                        .WithHeaders("Authorization", "Content-Type", "Accept")
                        .AllowCredentials()
                        .SetPreflightMaxAge(TimeSpan.FromHours(1));
                });
            });

            return services;
        }
    }
}