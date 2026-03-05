using StudentManagement.Core.Entities;
using StudentManagement.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task Initialize(AppDbContext context)
    {
        if (context.Departments.Any())
            return;

        Console.WriteLine("Seeding database...");

        // ==========================
        // DEPARTMENTS
        // ==========================

        var departments = new List<Department>
        {
            new Department
            {
                DepartmentName = "Khoa Công nghệ Thông tin",
                DepartmentCode = "FIT",
                Description = "Faculty of Information Technology"
            },

            new Department
            {
                DepartmentName = "Khoa Kinh tế",
                DepartmentCode = "FBE",
                Description = "Faculty of Business and Economics"
            }
        };

        context.Departments.AddRange(departments);
        await context.SaveChangesAsync();



        // ==========================
        // MAJORS
        // ==========================

        var majors = new List<Major>
        {
            new Major
            {
                MajorCode = "CNTT",
                MajorName = "Công nghệ Thông tin",
                DepartmentID = departments[0].DepartmentID,
                TotalCredits = 140,
                DurationYears = 4
            },

            new Major
            {
                MajorCode = "KTPM",
                MajorName = "Kỹ thuật phần mềm",
                DepartmentID = departments[0].DepartmentID,
                TotalCredits = 145,
                DurationYears = 4
            },

            new Major
            {
                MajorCode = "QTKD",
                MajorName = "Quản trị kinh doanh",
                DepartmentID = departments[1].DepartmentID,
                TotalCredits = 130,
                DurationYears = 4
            }
        };

        context.Majors.AddRange(majors);
        await context.SaveChangesAsync();



        // ==========================
        // CLASSES
        // ==========================

        var classes = new List<Class>
        {
            new Class("CNTT K19 - 01","K19",2019)
            {
                MajorID = majors[0].MajorID,
                MaxCapacity = 50
            },

            new Class("CNTT K19 - 02","K19",2019)
            {
                MajorID = majors[0].MajorID,
                MaxCapacity = 50
            },

            new Class("KTPM K20 - 01","K20",2020)
            {
                MajorID = majors[1].MajorID,
                MaxCapacity = 45
            },

            new Class("QTKD K20 - 01","K20",2020)
            {
                MajorID = majors[2].MajorID,
                MaxCapacity = 40
            }
        };

        context.Classes.AddRange(classes);
        await context.SaveChangesAsync();



        // ==========================
        // SUBJECTS
        // ==========================

        var subjects = new List<Subject>
        {
            new Subject("CS101","Lập trình C cơ bản",3)
            {
                DepartmentID = departments[0].DepartmentID,
                SubjectType = "Core",
                TheoryHours = 30,
                PracticeHours = 30,
                Description = "Môn học cơ bản về lập trình"
            },

            new Subject("CS102","Cấu trúc dữ liệu",3)
            {
                DepartmentID = departments[0].DepartmentID,
                SubjectType = "Core",
                Prerequisites = "[\"CS101\"]",
                TheoryHours = 30,
                PracticeHours = 30
            },

            new Subject("CS201","Lập trình hướng đối tượng",3)
            {
                DepartmentID = departments[0].DepartmentID,
                SubjectType = "Core",
                Prerequisites = "[\"CS102\"]",
                TheoryHours = 30,
                PracticeHours = 30
            },

            new Subject("MATH101","Toán cao cấp A1",4)
            {
                SubjectType = "General",
                TheoryHours = 60,
                PracticeHours = 0
            },

            new Subject("ENG101","Tiếng Anh cơ bản",2)
            {
                SubjectType = "General",
                TheoryHours = 30,
                PracticeHours = 0
            }
        };

        context.Subjects.AddRange(subjects);

        await context.SaveChangesAsync();



        Console.WriteLine("Database seeded successfully!");
        Console.WriteLine($"Departments: {departments.Count}");
        Console.WriteLine($"Majors: {majors.Count}");
        Console.WriteLine($"Classes: {classes.Count}");
        Console.WriteLine($"Subjects: {subjects.Count}");
    }
}