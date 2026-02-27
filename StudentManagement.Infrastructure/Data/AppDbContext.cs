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
            });
            
            // Teacher configuration
            modelBuilder.Entity<Teacher>(entity =>
            {
                entity.HasIndex(e => e.TeacherCode).IsUnique();
            });
            
            // Admin configuration
            modelBuilder.Entity<Admin>(entity =>
            {
                entity.HasIndex(e => e.AdminCode).IsUnique();
            });
        }
    }
}