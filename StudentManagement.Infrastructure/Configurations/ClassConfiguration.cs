using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StudentManagement.Core.Entities;

namespace StudentManagement.Infrastructure.Configurations
{
    public class ClassConfiguration : IEntityTypeConfiguration<Class>
    {
        public void Configure(EntityTypeBuilder<Class> builder)
        {
            builder.HasKey(c => c.ClassID);
            
            builder.Property(c => c.ClassName)
                .IsRequired()
                .HasMaxLength(50);
            
            builder.Property(c => c.AcademicYear)
                .IsRequired()
                .HasMaxLength(10);
            
            builder.HasIndex(c => c.ClassName);
            
            // Relationships
            builder.HasMany(c => c.Students)
                .WithOne(s => s.Class)
                .HasForeignKey(s => s.ClassID)
                .OnDelete(DeleteBehavior.SetNull);
            
            builder.HasOne(c => c.Advisor)
                .WithMany()
                .HasForeignKey(c => c.AdvisorID)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}