using Microsoft.EntityFrameworkCore;
using StudentManagement.Core.Entities;

namespace StudentManagement.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {

        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }


        // =====================
        // DbSets
        // =====================

        public DbSet<Student> Students { get; set; }

        public DbSet<Class> Classes { get; set; }

        public DbSet<Subject> Subjects { get; set; }

        public DbSet<Department> Departments { get; set; }

        public DbSet<Major> Majors { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Class>()
                .HasMany(c => c.Students)
                .WithOne(s => s.Class)
                .HasForeignKey(s => s.ClassId);


            modelBuilder.Entity<Department>()
                .HasMany(d => d.Majors)
                .WithOne(m => m.Department)
                .HasForeignKey(m => m.DepartmentID);


            modelBuilder.Entity<Department>()
                .HasMany(d => d.Subjects)
                .WithOne(s => s.Department)
                .HasForeignKey(s => s.DepartmentID);

        }

    }
}