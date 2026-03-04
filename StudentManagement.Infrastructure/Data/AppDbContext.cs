using Microsoft.EntityFrameworkCore;
using StudentManagement.Core.Entities;

namespace StudentManagement.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }
        
        // DbSets
        public DbSet<Account> Accounts { get; set; }
        public DbSet<Person> Persons { get; set; }
        public DbSet<Student> Students { get; set; }
        public DbSet<Teacher> Teachers { get; set; }
        public DbSet<Admin> Admins { get; set; }
        public DbSet<Class> Classes { get; set; }
        public DbSet<Major> Majors { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<Subject> Subjects { get; set; }
        public DbSet<CourseSection> CourseSections { get; set; }
        public DbSet<Enrollment> Enrollments { get; set; }
        public DbSet<Grade> Grades { get; set; }
        public DbSet<GradeHistory> GradeHistories { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Person Inheritance (TPH - Table Per Hierarchy)
            modelBuilder.Entity<Person>()
                .HasDiscriminator<string>("PersonType")
                .HasValue<Student>("Student")
                .HasValue<Teacher>("Teacher")
                .HasValue<Admin>("Admin");
            
            // Account configuration
            modelBuilder.Entity<Account>(entity =>
            {
                entity.HasKey(e => e.AccountID);
                entity.HasIndex(e => e.Username).IsUnique();
                entity.Property(e => e.Role).HasConversion<string>();
            });
            
            // Person configuration
            modelBuilder.Entity<Person>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.Gender).HasConversion<string>();
                
                entity.HasOne(e => e.Account)
                      .WithOne(a => a.Person)
                      .HasForeignKey<Person>(e => e.AccountID)
                      .OnDelete(DeleteBehavior.SetNull);
            });
            
            // Student configuration
            modelBuilder.Entity<Student>(entity =>
            {
                entity.HasIndex(e => e.StudentCode).IsUnique();
                entity.Property(e => e.Status).HasConversion<string>();
                entity.Property(e => e.GPA).HasPrecision(3, 2);
                entity.Property(e => e.Tuition).HasPrecision(18, 2);
                entity.Property(e => e.DebtAmount).HasPrecision(18, 2);

                entity.HasOne(e => e.Class)
                      .WithMany(c => c.Students)
                      .HasForeignKey(e => e.ClassID)
                      .OnDelete(DeleteBehavior.SetNull);
            });
            
            // Teacher configuration
            modelBuilder.Entity<Teacher>(entity =>
            {
                entity.HasIndex(e => e.TeacherCode).IsUnique();
                entity.HasOne(e => e.Department)
                      .WithMany(d => d.Teachers)
                      .HasForeignKey(e => e.DepartmentID)
                      .OnDelete(DeleteBehavior.SetNull);
            });
            
            // Admin configuration
            modelBuilder.Entity<Admin>(entity =>
            {
                entity.HasIndex(e => e.AdminCode).IsUnique();
            });

            // Department configuration
            modelBuilder.Entity<Department>(entity =>
            {
                entity.HasIndex(e => e.DepartmentName).IsUnique();
                entity.HasOne(e => e.Dean)
                      .WithMany()
                      .HasForeignKey(e => e.DeanID)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            // Major configuration
            modelBuilder.Entity<Major>(entity =>
            {
                entity.HasIndex(e => e.MajorCode).IsUnique();
                entity.HasOne(e => e.Department)
                      .WithMany(d => d.Majors)
                      .HasForeignKey(e => e.DepartmentID)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            // Class configuration
            modelBuilder.Entity<Class>(entity =>
            {
                entity.HasIndex(e => e.ClassName).IsUnique();
                entity.HasOne(e => e.Major)
                      .WithMany(m => m.Classes)
                      .HasForeignKey(e => e.MajorID)
                      .OnDelete(DeleteBehavior.SetNull);
                entity.HasOne(e => e.Advisor)
                      .WithMany()
                      .HasForeignKey(e => e.AdvisorID)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            // Subject configuration
            modelBuilder.Entity<Subject>(entity =>
            {
                entity.HasIndex(e => e.SubjectCode).IsUnique();
                entity.HasOne(e => e.Department)
                      .WithMany(d => d.Subjects)
                      .HasForeignKey(e => e.DepartmentID)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            // CourseSection configuration
            modelBuilder.Entity<CourseSection>(entity =>
            {
                entity.HasKey(e => e.SectionID);
                entity.HasOne(e => e.Subject)
                      .WithMany()
                      .HasForeignKey(e => e.SubjectID)
                      .OnDelete(DeleteBehavior.NoAction);
                entity.HasOne(e => e.Teacher)
                      .WithMany()
                      .HasForeignKey(e => e.TeacherID)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            // Enrollment configuration
            modelBuilder.Entity<Enrollment>(entity =>
            {
                entity.HasKey(e => e.EnrollmentID);
                entity.HasOne(e => e.Student)
                      .WithMany()
                      .HasForeignKey(e => e.StudentID)
                      .OnDelete(DeleteBehavior.NoAction);
                entity.HasOne(e => e.Section)
                      .WithMany(s => s.Enrollments)
                      .HasForeignKey(e => e.SectionID)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            // Grade configuration
            modelBuilder.Entity<Grade>(entity =>
            {
                entity.HasKey(e => e.GradeID);
                entity.HasOne(e => e.Enrollment)
                      .WithOne(e => e.Grade)
                      .HasForeignKey<Grade>(e => e.EnrollmentID)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Student)
                      .WithMany()
                      .HasForeignKey(e => e.StudentID)
                      .OnDelete(DeleteBehavior.NoAction);
                entity.HasOne(e => e.Subject)
                      .WithMany()
                      .HasForeignKey(e => e.SubjectID)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            // GradeHistory configuration
            modelBuilder.Entity<GradeHistory>(entity =>
            {
                entity.HasKey(e => e.HistoryID);
                entity.HasOne(e => e.Grade)
                      .WithMany(g => g.GradeHistories)
                      .HasForeignKey(e => e.GradeID)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}