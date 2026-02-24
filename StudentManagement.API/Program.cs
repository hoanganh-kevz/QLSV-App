using Microsoft.EntityFrameworkCore;
using StudentManagement.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

// ==================== Add Services ====================

builder.Services.AddControllers();

// EF Core + SQL Server
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "StudentManagement API", Version = "v1" });
});

// CORS cho Frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",  // React
                "http://localhost:5173"   // Vite/Vue
              )
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Đăng ký Services và Repositories tại đây
// builder.Services.AddScoped<IStudentRepository, StudentRepository>();
// builder.Services.AddScoped<IStudentService, StudentService>();

var app = builder.Build();

// ==================== Configure Pipeline ====================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "StudentManagement API v1");
        c.RoutePrefix = string.Empty; // Mở Swagger ngay tại https://localhost:{port}/
    });
}

app.UseHttpsRedirection();

app.UseCors("AllowFrontend"); // Phải đặt trước UseAuthorization

app.UseAuthorization();

app.MapControllers();

app.Run();