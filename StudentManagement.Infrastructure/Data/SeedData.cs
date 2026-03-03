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
                context.Students.RemoveRange(context.Students);
                context.Teachers.RemoveRange(context.Teachers);
                context.Admins.RemoveRange(context.Admins);
                context.Classes.RemoveRange(context.Classes);
                context.Majors.RemoveRange(context.Majors);
                context.Departments.RemoveRange(context.Departments);
                context.Subjects.RemoveRange(context.Subjects);
                context.Accounts.RemoveRange(context.Accounts);
                await context.SaveChangesAsync();
            }

            Console.WriteLine("Seeding database...");

            // ── 1. Create Departments ──
            List<Department> departments = new List<Department>();
            string[] deptNames = new[] { "Khoa Công nghệ Thông tin", "Khoa Kinh tế", "Khoa Ngoại ngữ" };
            for (int i = 0; i < deptNames.Length; i++)
            {
                Department dept = new Department
                {
                    DepartmentName = deptNames[i],
                    EstablishedYear = 2000 + i,
                    Building = ((char)('A' + i)).ToString(),
                    PhoneNumber = $"028123456{i}",
                    Email = $"department{i + 1}@school.edu"
                };
                departments.Add(dept);
                context.Departments.Add(dept);
            }
            await context.SaveChangesAsync();

            // ── 2. Create Majors ──
            List<Major> majors = new List<Major>();
            (string, string)[] majorData = new[]
            {
                ("CNTT", "Công nghệ Thông tin"),
                ("KTPM", "Kỹ thuật Phần mềm"),
                ("HTTT", "Hệ thống Thông tin"),
                ("QTKD", "Quản trị Kinh doanh"),
                ("NNAS", "Ngôn ngữ Anh")
            };
            for (int i = 0; i < majorData.Length; i++)
            {
                Major major = new Major
                {
                    MajorCode = majorData[i].Item1,
                    MajorName = majorData[i].Item2,
                    DepartmentID = departments[i < 3 ? 0 : (i < 4 ? 1 : 2)].DepartmentID,
                    TotalCredits = 140,
                    DurationYears = 4,
                    Degree = "Bachelor"
                };
                majors.Add(major);
                context.Majors.Add(major);
            }
            await context.SaveChangesAsync();

            // ── 3. Create Subjects ──
            List<Subject> subjects = new List<Subject>();
            (string, string, int)[] subjectData = new[]
            {
                ("CS101", "Nhập môn Lập trình", 3),
                ("CS102", "Cấu trúc Dữ liệu", 3),
                ("CS201", "Cơ sở Dữ liệu", 3),
                ("CS301", "Mạng Máy tính", 3),
                ("MATH101", "Toán Cao cấp 1", 3),
                ("MATH102", "Toán Cao cấp 2", 3),
                ("MATH201", "Xác suất Thống kê", 2),
                ("ENG101", "Tiếng Anh 1", 2),
                ("ENG102", "Tiếng Anh 2", 2),
                ("PHY101", "Vật lý Đại cương", 3)
            };
            for (int i = 0; i < subjectData.Length; i++)
            {
                Subject subject = new Subject(subjectData[i].Item1, subjectData[i].Item2, subjectData[i].Item3)
                {
                    DepartmentID = departments[i < 4 ? 0 : (i < 7 ? 0 : (i < 9 ? 2 : 0))].DepartmentID
                };
                subjects.Add(subject);
                context.Subjects.Add(subject);
            }
            await context.SaveChangesAsync();

            // ── 4. Create Admin Account ──
            Account adminAccount = new Account("admin", "admin123", AccountRole.Admin);
            context.Accounts.Add(adminAccount);
            await context.SaveChangesAsync();

            Admin admin = new Admin(
                "Nguyễn Văn Admin",
                "admin@school.edu",
                "0901234567",
                new DateTime(1985, 5, 15),
                Gender.Male,
                "AD000001"
            );
            admin.SetAccount(adminAccount.AccountID);
            context.Admins.Add(admin);

            // ── 5. Create Teachers ──
            List<Teacher> teachers = new List<Teacher>();
            for (int i = 1; i <= 5; i++)
            {
                Account teacherAccount = new Account($"teacher{i}", "teacher123", AccountRole.Teacher);
                context.Accounts.Add(teacherAccount);
                await context.SaveChangesAsync();

                Teacher teacher = new Teacher(
                    $"Giảng Viên {i}",
                    $"teacher{i}@school.edu",
                    $"090123456{i}",
                    new DateTime(1980 + i, 3, 10),
                    i % 2 == 0 ? Gender.Female : Gender.Male,
                    $"GV{i:D6}",
                    DateTime.Now.AddYears(-5)
                );
                teacher.SetAccount(teacherAccount.AccountID);
                teacher.SetDepartment(departments[i % departments.Count].DepartmentID);
                teachers.Add(teacher);
                context.Teachers.Add(teacher);
            }
            await context.SaveChangesAsync();

            // ── 6. Create Classes ──
            List<Class> classes = new List<Class>();
            for (int i = 1; i <= 5; i++)
            {
                Class cls = new Class($"CNTT{i:D2}", "K24", 2024)
                {
                    MajorID = majors[(i - 1) % majors.Count].MajorID,
                    AdvisorID = teachers[(i - 1) % teachers.Count].Id
                };
                classes.Add(cls);
                context.Classes.Add(cls);
            }
            await context.SaveChangesAsync();

            // ── 7. Create Students ──
            for (int i = 1; i <= 20; i++)
            {
                Account studentAccount = new Account($"student{i}", "student123", AccountRole.Student);
                context.Accounts.Add(studentAccount);
                await context.SaveChangesAsync();

                Student student = new Student(
                    $"Sinh Viên {i}",
                    $"student{i}@school.edu",
                    $"091234567{i:D2}",
                    new DateTime(2002 + (i % 4), (i % 12) + 1, (i % 28) + 1),
                    i % 3 == 0 ? Gender.Female : Gender.Male,
                    $"3124100{i:D4}",
                    2024,
                    "K24"
                );
                student.SetAccount(studentAccount.AccountID);
                student.SetClassAndMajor(
                    classes[(i - 1) % classes.Count].ClassID,
                    majors[(i - 1) % majors.Count].MajorID
                );
                context.Students.Add(student);
            }

            await context.SaveChangesAsync();

            Console.WriteLine("Database seeded successfully!");
            Console.WriteLine($"Created: 1 Admin, {teachers.Count} Teachers, 20 Students, " +
                              $"{departments.Count} Departments, {majors.Count} Majors, " +
                              $"{subjects.Count} Subjects, {classes.Count} Classes");
        }
    }
}