using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using AspNetCoreRateLimit;
using StudentManagement.API.Authorization;
using StudentManagement.API.Extensions;
using StudentManagement.API.Middlewares;
using StudentManagement.API.Swagger;
using StudentManagement.API.Validation;
using StudentManagement.Core.Authorization;
using StudentManagement.Infrastructure.Data;
using StudentManagement.API.Configuration;
using FluentValidation.AspNetCore;
using FluentValidation;
using Serilog;

// Configure Serilog early for startup logging
Log.Logger = new LoggerConfiguration()
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    Log.Information("Starting Student Management System API");

    WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

    // Configure Serilog from appsettings
    builder.Host.UseSerilog((context, services, configuration) => configuration
        .ReadFrom.Configuration(context.Configuration)
        .Enrich.FromLogContext()
        .WriteTo.Console()
        .WriteTo.File("logs/log-.txt", rollingInterval: RollingInterval.Day));

    // Add controllers with JSON and XML options
    builder.Services.AddControllers()
        .AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.Converters.Add(
                new System.Text.Json.Serialization.JsonStringEnumConverter());
        })
        .AddXmlSerializerFormatters()
        .ConfigureApiBehaviorOptions(options =>
        {
            options.SuppressMapClientErrors = true;
        });

    builder.Services.AddEndpointsApiExplorer();

    // Custom service configurations (Database, Repositories, Services, JWT, CORS)
    builder.Services.ConfigureDatabase(builder.Configuration);
    builder.Services.ConfigureRepositories();
    builder.Services.ConfigureServices();
    builder.Services.ConfigureJWT(builder.Configuration);
    builder.Services.ConfigureCors();

    // Swagger documentation (from SwaggerConfiguration.cs)
    builder.Services.AddSwaggerDocumentation();

    // FluentValidation
    builder.Services.AddValidatorsFromAssemblyContaining<CreateStudentValidator>();
    builder.Services.AddFluentValidationAutoValidation();

    // Rate limiting
    builder.Services.AddRateLimiting(builder.Configuration);

    // Redis caching
    builder.Services.AddStackExchangeRedisCache(options =>
    {
        options.Configuration = builder.Configuration["Redis:ConnectionString"];
        options.InstanceName = builder.Configuration["Redis:InstanceName"];
    });

    // Application Insights
    builder.Services.AddApplicationInsightsTelemetry(options =>
    {
        options.ConnectionString = builder.Configuration["ApplicationInsights:ConnectionString"];
        options.EnableAdaptiveSampling = true;
        options.EnableDebugLogger = builder.Environment.IsDevelopment();
    });

    // Health checks
    builder.Services.AddHealthChecks(builder.Configuration);

    // Authorization policies
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

    // Hangfire (Background Jobs) — uncomment after: dotnet add package Hangfire Hangfire.SqlServer
    // builder.Services.AddHangfire(config =>
    // {
    //     config.UseSqlServerStorage(builder.Configuration.GetConnectionString("DefaultConnection"));
    // });
    // builder.Services.AddHangfireServer();

    // ==================== Build App ====================
    WebApplication app = builder.Build();

    // Seed data if --seed flag is passed
    if (args.Contains("--seed"))
    {
        using IServiceScope scope = app.Services.CreateScope();
        AppDbContext context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        context.Database.Migrate();
        await SeedData.Initialize(context);
    }

    // ==================== Middleware Pipeline ====================
    // Order matters: exception handling first, then logging, security, auth, endpoints

    // 7. CORS (Must be before exception handling so errors get CORS headers)
    app.UseCors("AllowAll");

    // 1. Global exception handling (outermost)
    app.UseMiddleware<ExceptionMiddleware>();

    // 2. Serilog request logging
    app.UseSerilogRequestLogging(options =>
    {
        options.MessageTemplate = "HTTP {RequestMethod} {RequestPath} responded {StatusCode} in {Elapsed:0.0000} ms";
        options.EnrichDiagnosticContext = (diagnosticContext, httpContext) =>
        {
            diagnosticContext.Set("RequestHost", httpContext.Request.Host.Value);
            diagnosticContext.Set("RequestScheme", httpContext.Request.Scheme);
            diagnosticContext.Set("UserAgent", httpContext.Request.Headers["User-Agent"]);
            diagnosticContext.Set("RemoteIP", httpContext.Connection.RemoteIpAddress);
        };
    });

    // 3. Security headers
    app.UseSecurityHeaders();

    // 4. Rate limiting
    app.UseIpRateLimiting();

    // 5. Swagger UI
    app.UseSwaggerDocumentation();

    // 6. HTTPS redirection
    app.UseHttpsRedirection();

    // 8. Authentication & Authorization
    app.UseAuthentication();
    app.UseAuthorization();

    // 9. Health check endpoints
    app.MapHealthCheckEndpoints();

    // Hangfire dashboard — uncomment when Hangfire is enabled
    // app.UseHangfireDashboard("/hangfire", new DashboardOptions
    // {
    //     Authorization = new[] { new HangfireAuthorizationFilter() }
    // });

    // 10. Map controllers
    app.MapControllers();

    // Run
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

// dotnet run --project StudentManagement.API