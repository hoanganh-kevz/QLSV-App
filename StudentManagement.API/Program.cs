using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using AspNetCoreRateLimit;
using FluentValidation;
using FluentValidation.AspNetCore;
using StudentManagement.API.Authorization;
using StudentManagement.API.Configuration;
using StudentManagement.API.Extensions;
using StudentManagement.API.Middlewares;
using StudentManagement.API.Swagger;
using StudentManagement.API.Validation;
using StudentManagement.Core.Authorization;
using StudentManagement.Infrastructure.Data;
using Serilog;

// ==================== Cấu hình Serilog sớm để log startup ====================
Log.Logger = new LoggerConfiguration()
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    Log.Information("Starting Student Management System API");

    WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

    // ==================== Serilog Configuration ====================
    builder.Host.UseSerilog((context, services, configuration) => configuration
        .ReadFrom.Configuration(context.Configuration)
        .Enrich.FromLogContext()
        .WriteTo.Console()
        .WriteTo.File("logs/log-.txt", rollingInterval: RollingInterval.Day));

    // ==================== Controllers + JSON/XML ====================
    builder.Services.AddControllers()
        .AddJsonOptions(options =>
        {
            // Serialize enums as strings thay vì numbers
            options.JsonSerializerOptions.Converters.Add(
                new System.Text.Json.Serialization.JsonStringEnumConverter());
        })
        .AddXmlSerializerFormatters()
        .ConfigureApiBehaviorOptions(options =>
        {
            options.SuppressMapClientErrors = true;
        });

    builder.Services.AddEndpointsApiExplorer();

    // ==================== Custom Service Configurations ====================
    // Database (EF Core + SQL Server)
    builder.Services.ConfigureDatabase(builder.Configuration);

    // Repository pattern (UnitOfWork + GenericRepository)
    builder.Services.ConfigureRepositories();

    // Business services (Auth, Student, Class, Grade, etc.)
    builder.Services.ConfigureServices();

    // JWT Authentication
    builder.Services.ConfigureJWT(builder.Configuration);

    // CORS (cho phép frontend gọi API)
    builder.Services.ConfigureCors();

    // ==================== Swagger Documentation ====================
    builder.Services.AddSwaggerDocumentation();

    // ==================== FluentValidation ====================
    builder.Services.AddFluentValidationAutoValidation()
                    .AddFluentValidationClientsideAdapters();
    builder.Services.AddValidatorsFromAssemblyContaining<CreateStudentValidator>();

    // ==================== Rate Limiting ====================
    builder.Services.AddRateLimiting(builder.Configuration);

    // ==================== Caching ====================
    // Sử dụng MemoryCache thay Redis cho development
    // Nếu có Redis, đổi sang AddStackExchangeRedisCache
    string? redisConnection = builder.Configuration["Redis:ConnectionString"];
    if (!string.IsNullOrEmpty(redisConnection) && redisConnection != "localhost:6379")
    {
        builder.Services.AddStackExchangeRedisCache(options =>
        {
            options.Configuration = redisConnection;
            options.InstanceName = builder.Configuration["Redis:InstanceName"];
        });
    }
    else
    {
        // Fallback: dùng MemoryCache cho development
        builder.Services.AddDistributedMemoryCache();
    }

    // ==================== Health Checks ====================
    builder.Services.AddCustomHealthChecks(builder.Configuration);

    // ==================== Authorization Policies ====================
    builder.Services.AddAuthorization(options =>
    {
        options.AddPolicy("CanViewStudents", policy =>
            policy.Requirements.Add(new PermissionRequirement(Permissions.ViewStudents)));

        options.AddPolicy("CanCreateStudents", policy =>
            policy.Requirements.Add(new PermissionRequirement(Permissions.CreateStudents)));

        options.AddPolicy("CanEnterGrades", policy =>
            policy.Requirements.Add(new PermissionRequirement(Permissions.EnterGrades)));

        options.AddPolicy("CanManageUsers", policy =>
            policy.Requirements.Add(new PermissionRequirement(Permissions.ManageUsers)));
    });

    builder.Services.AddScoped<IAuthorizationHandler, PermissionHandler>();

    // ==================== Build App ====================
    WebApplication app = builder.Build();

    // Tự động migrate database và seed data trong Development
    if (app.Environment.IsDevelopment() || args.Contains("--seed"))
    {
        using IServiceScope scope = app.Services.CreateScope();
        AppDbContext context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await context.Database.MigrateAsync();
        await SeedData.Initialize(context);
        Log.Information("Database migrated and seeded successfully");
    }

    // ==================== Middleware Pipeline ====================
    // Thứ tự rất quan trọng!

    // 1. Global exception handling (bắt mọi lỗi)
    app.UseMiddleware<ExceptionMiddleware>();

    // 2. Serilog request logging
    app.UseSerilogRequestLogging(options =>
    {
        options.MessageTemplate = "HTTP {RequestMethod} {RequestPath} responded {StatusCode} in {Elapsed:0.0000} ms";
        options.EnrichDiagnosticContext = (diagnosticContext, httpContext) =>
        {
            diagnosticContext.Set("RequestHost", httpContext.Request.Host.Value);
            diagnosticContext.Set("RequestScheme", httpContext.Request.Scheme);
            diagnosticContext.Set("UserAgent", httpContext.Request.Headers["User-Agent"].ToString());
            diagnosticContext.Set("RemoteIP", httpContext.Connection.RemoteIpAddress?.ToString());
        };
    });

    // 3. Security headers
    app.UseSecurityHeaders();

    // 4. Rate limiting
    app.UseIpRateLimiting();

    // 5. Swagger UI (chỉ Development)
    if (app.Environment.IsDevelopment())
    {
        app.UseSwaggerDocumentation();
    }

    // 6. CORS (trước Authentication)
    app.UseCors("AllowAll");

    // 7. Authentication & Authorization
    app.UseAuthentication();
    app.UseAuthorization();

    // 8. Health check endpoints
    app.MapHealthCheckEndpoints();

    // 9. Map controllers
    app.MapControllers();

    Log.Information("Application started successfully on {Urls}", string.Join(", ", app.Urls));
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}

