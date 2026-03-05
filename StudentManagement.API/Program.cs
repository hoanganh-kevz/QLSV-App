using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using StudentManagement.API.Authorization;
using StudentManagement.API.Extensions;
using StudentManagement.API.Middlewares;
using StudentManagement.Core.Authorization;
using StudentManagement.Infrastructure.Data;    
using Serilog;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/log-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddControllers().AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

// Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Student Management API",
        Version = "v1",
        Description = "API quản lý sinh viên - ASP.NET Core 8"
    });

    // JWT Bearer authentication in Swagger
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Nhập JWT token (không cần prefix 'Bearer')"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Custom service configurations
builder.Services.ConfigureDatabase(builder.Configuration);
builder.Services.ConfigureRepositories();
builder.Services.ConfigureServices();
builder.Services.ConfigureJWT(builder.Configuration);
builder.Services.ConfigureCors();

// Redis caching
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration["Redis:ConnectionString"];
    options.InstanceName = builder.Configuration["Redis:InstanceName"];
});

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

WebApplication app = builder.Build();

if (args.Contains("--seed"))
{
    using IServiceScope scope = app.Services.CreateScope();
    AppDbContext context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    context.Database.Migrate();
    await SeedData.Initialize(context);
}

// Hangfire (Background Jobs) — uncomment after: dotnet add package Hangfire Hangfire.SqlServer
// builder.Services.AddHangfire(config =>
// {
//     config.UseSqlServerStorage(builder.Configuration.GetConnectionString("DefaultConnection"));
// });
// builder.Services.AddHangfireServer();
// app.UseHangfireDashboard("/hangfire", new DashboardOptions
// {
//     Authorization = new[] { new HangfireAuthorizationFilter() }
// });

// Configure the HTTP request pipeline
app.UseMiddleware<ExceptionMiddleware>();

// Swagger UI (available in all environments)
app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "Student Management API v1");
    options.RoutePrefix = "swagger";
});

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

// dotnet run --project StudentManagement.API