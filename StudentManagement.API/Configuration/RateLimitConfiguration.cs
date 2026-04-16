using AspNetCoreRateLimit;

namespace StudentManagement.API.Configuration
{
    /// <summary>
    /// Cấu hình Rate Limiting để bảo vệ API khỏi lạm dụng.
    /// Giới hạn số request theo IP address.
    /// </summary>
    public static class RateLimitConfiguration
    {
        /// <summary>
        /// Đăng ký IP-based rate limiting services
        /// </summary>
        public static IServiceCollection AddRateLimiting(this IServiceCollection services, IConfiguration configuration)
        {
            // Lưu counter trong memory
            services.AddMemoryCache();

            // Load cấu hình từ appsettings.json
            services.Configure<IpRateLimitOptions>(configuration.GetSection("IpRateLimiting"));
            services.Configure<IpRateLimitPolicies>(configuration.GetSection("IpRateLimitPolicies"));

            // Inject stores và strategies
            services.AddSingleton<IIpPolicyStore, MemoryCacheIpPolicyStore>();
            services.AddSingleton<IRateLimitCounterStore, MemoryCacheRateLimitCounterStore>();
            services.AddSingleton<IRateLimitConfiguration, AspNetCoreRateLimit.RateLimitConfiguration>();
            services.AddSingleton<IProcessingStrategy, AsyncKeyLockProcessingStrategy>();

            return services;
        }
    }
}
