using StudentManagement.Core.Entities;
using StudentManagement.Core.Enums;

namespace StudentManagement.Infrastructure.Data
{
    public static class SeedData
    {
        public static async Task Initialize(AppDbContext context)
        {
            // Clear existing data and re-seed
            if (context.Accounts.Any())
            {
                Console.WriteLine("Clearing existing data...");
                context.Persons.RemoveRange(context.Persons);
                context.Accounts.RemoveRange(context.Accounts);
                await context.SaveChangesAsync();
            }

            Console.WriteLine("Seeding database...");

            // Create Admin Account
            var adminAccount = new Account("admin", "admin123", AccountRole.Admin);
            context.Accounts.Add(adminAccount);
            await context.SaveChangesAsync();

            var admin = new Admin(
                "Nguyễn Văn Admin",
                "admin@school.edu",
                "0901234567",
                new DateTime(1985, 5, 15),
                Gender.Male,
                "AD000001"
            );
            admin.SetAccount(adminAccount.AccountID);
            context.Admins.Add(admin);

            // Create Teachers
            var teachers = new List<Teacher>();
            for (int i = 1; i <= 5; i++)
            {
                var teacherAccount = new Account($"teacher{i}", "teacher123", AccountRole.Teacher);
                context.Accounts.Add(teacherAccount);
                await context.SaveChangesAsync();

                var teacher = new Teacher(
                    $"Giảng Viên {i}",
                    $"teacher{i}@school.edu",
                    $"090123456{i}",
                    new DateTime(1980 + i, 3, 10),
                    i % 2 == 0 ? Gender.Female : Gender.Male,
                    $"GV{i:D6}",
                    DateTime.Now.AddYears(-5)
                );
                teacher.SetAccount(teacherAccount.AccountID);
                teachers.Add(teacher);
                context.Teachers.Add(teacher);
            }

            // Create Students
            var students = new List<Student>();
            for (int i = 1; i <= 20; i++)
            {
                var studentAccount = new Account($"student{i}", "student123", AccountRole.Student);
                context.Accounts.Add(studentAccount);
                await context.SaveChangesAsync();

                var student = new Student(
                    $"Sinh Viên {i}",
                    $"student{i}@school.edu",
                    $"091234567{i:D}",
                    new DateTime(2002 + (i % 4), i % 12 + 1, i),
                    i % 3 == 0 ? Gender.Female : Gender.Male,
                    $"3124100{i:D4}",
                    2024,
                    "K24"
                );
                student.SetAccount(studentAccount.AccountID);
                students.Add(student);
                context.Students.Add(student);
            }

            await context.SaveChangesAsync();

            Console.WriteLine("Database seeded successfully!");
            Console.WriteLine($"Created: 1 Admin, {teachers.Count} Teachers, {students.Count} Students");
        }
    }
}