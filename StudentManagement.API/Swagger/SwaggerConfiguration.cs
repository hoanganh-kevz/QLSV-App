using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.Filters;
using System.Reflection;

namespace StudentManagement.API.Swagger
{
    /// <summary>
    /// Cấu hình Swagger/OpenAPI documentation cho API.
    /// Bao gồm JWT auth, XML comments, và examples.
    /// </summary>
    public static class SwaggerConfiguration
    {
        /// <summary>
        /// Đăng ký Swagger documentation services
        /// </summary>
        public static IServiceCollection AddSwaggerDocumentation(this IServiceCollection services)
        {
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "Student Management System API",
                    Version = "v1.0",
                    Description = "RESTful API for Student Management System - Complete solution for managing students, grades, classes, and teachers",
                    Contact = new OpenApiContact
                    {
                        Name = "Development Team",
                        Email = "dev@studentmanagement.com",
                        Url = new Uri("https://studentmanagement.com")
                    },
                    License = new OpenApiLicense
                    {
                        Name = "MIT License",
                        Url = new Uri("https://opensource.org/licenses/MIT")
                    }
                });

                // JWT Authentication schema
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token.",
                    Name = "Authorization",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.ApiKey,
                    Scheme = "Bearer",
                    BearerFormat = "JWT"
                });

                c.AddSecurityRequirement(new OpenApiSecurityRequirement
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

                // Include XML comments from project
                string xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
                string xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
                if (File.Exists(xmlPath))
                {
                    c.IncludeXmlComments(xmlPath);
                }

                // Enable annotations
                c.EnableAnnotations();

                // Examples
                c.ExampleFilters();

                // Group by controller name
                c.TagActionsBy(api => new[] { api.GroupName ?? api.ActionDescriptor.RouteValues["controller"] });
                c.DocInclusionPredicate((name, api) => true);
            });

            services.AddSwaggerExamplesFromAssemblyOf<Program>();

            return services;
        }

        /// <summary>
        /// Cấu hình Swagger UI middleware
        /// </summary>
        public static IApplicationBuilder UseSwaggerDocumentation(this IApplicationBuilder app)
        {
            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "Student Management API V1");
                c.RoutePrefix = "swagger";
                c.DocumentTitle = "Student Management API Documentation";

                // Tùy chỉnh UI
                c.DefaultModelsExpandDepth(-1);
                c.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.List);
                c.DisplayRequestDuration();
                c.EnableDeepLinking();
                c.EnableFilter();
                c.ShowExtensions();
            });

            return app;
        }
    }
}
