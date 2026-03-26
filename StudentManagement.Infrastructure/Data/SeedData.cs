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
                context.Grades.RemoveRange(context.Grades);
                context.Enrollments.RemoveRange(context.Enrollments);
                context.CourseSections.RemoveRange(context.CourseSections);
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

            // ── 3. Create 15 Subjects ──
            List<Subject> subjects = new List<Subject>();
            (string, string, int)[] subjectData = new[]
            {
                ("CS101", "Nhập môn Lập trình", 3),
                ("CS102", "Cấu trúc Dữ liệu", 3),
                ("CS201", "Cơ sở Dữ liệu", 3),
                ("CS301", "Mạng Máy tính", 3),
                ("CS302", "Lập trình Web", 3),
                ("MATH101", "Toán Cao cấp 1", 3),
                ("MATH102", "Toán Cao cấp 2", 3),
                ("MATH201", "Xác suất Thống kê", 2),
                ("ENG101", "Tiếng Anh 1", 2),
                ("ENG102", "Tiếng Anh 2", 2),
                ("PHY101", "Vật lý Đại cương", 3),
                ("CS303", "Trí tuệ Nhân tạo", 3),
                ("CS304", "Hệ điều hành", 3),
                ("CS305", "Công nghệ Phần mềm", 3),
                ("CS401", "Đồ án Tốt nghiệp", 6)
            };
            for (int i = 0; i < subjectData.Length; i++)
            {
                Subject subject = new Subject(subjectData[i].Item1, subjectData[i].Item2, subjectData[i].Item3)
                {
                    DepartmentID = departments[i < 5 ? 0 : (i < 8 ? 0 : (i < 10 ? 2 : 0))].DepartmentID
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

            // ── 5. Create 5 Teachers ──
            List<Teacher> teachers = new List<Teacher>();
            string[] teacherNames = new[]
            {
                "Trần Văn Minh", "Nguyễn Thị Hồng", "Lê Hoàng Phúc",
                "Phạm Thị Mai", "Vũ Đình Khoa"
            };
            for (int i = 1; i <= 5; i++)
            {
                Account teacherAccount = new Account($"teacher{i}", "teacher123", AccountRole.Teacher);
                context.Accounts.Add(teacherAccount);
                await context.SaveChangesAsync();

                Teacher teacher = new Teacher(
                    teacherNames[i - 1],
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

            // ── 6. Create 10 Classes ──
            List<Class> classes = new List<Class>();
            string[] classNames = new[]
            {
                "CNTT01", "CNTT02", "CNTT03", "KTPM01", "KTPM02",
                "HTTT01", "QTKD01", "QTKD02", "NNAS01", "NNAS02"
            };
            for (int i = 0; i < 10; i++)
            {
                Class cls = new Class(classNames[i], "K24", 2024)
                {
                    MajorID = majors[i % majors.Count].MajorID,
                    AdvisorID = teachers[i % teachers.Count].Id
                };
                classes.Add(cls);
                context.Classes.Add(cls);
            }
            await context.SaveChangesAsync();

            // ── 7. Create 55 Students ──
            string[] firstNames = new[]
            {
                "Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan",
                "Vũ", "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương"
            };
            string[] middleNames = new[]
            {
                "Văn", "Thị", "Hoàng", "Minh", "Đức", "Thanh", "Quốc",
                "Ngọc", "Phương", "Hữu"
            };
            string[] lastNames = new[]
            {
                "An", "Bình", "Cường", "Dũng", "Em", "Phúc", "Giang",
                "Hải", "Khang", "Linh", "Minh", "Nam", "Oanh", "Phong",
                "Quân", "Sơn", "Tâm", "Uyên", "Vinh", "Xuân"
            };

            List<Student> students = new List<Student>();
            Random rng = new Random(42); // Fixed seed for reproducibility

            for (int i = 1; i <= 55; i++)
            {
                Account studentAccount = new Account($"student{i}", "student123", AccountRole.Student);
                context.Accounts.Add(studentAccount);
                await context.SaveChangesAsync();

                string fullName = $"{firstNames[i % firstNames.Length]} {middleNames[i % middleNames.Length]} {lastNames[i % lastNames.Length]}";
                Gender gender = i % 3 == 0 ? Gender.Female : Gender.Male;

                Student student = new Student(
                    fullName,
                    $"student{i}@school.edu",
                    $"09{rng.Next(10000000, 99999999)}",
                    new DateTime(2002 + (i % 4), (i % 12) + 1, (i % 28) + 1),
                    gender,
                    $"3124100{i:D4}",
                    2024,
                    "K24"
                );
                student.SetAccount(studentAccount.AccountID);
                student.SetClassAndMajor(
                    classes[i % classes.Count].ClassID,
                    majors[i % majors.Count].MajorID
                );
                students.Add(student);
                context.Students.Add(student);
            }
            await context.SaveChangesAsync();

            // ── 8. Create CourseSections ──
            List<string> studentIds = students.Select(s => s.Id).ToList();
            List<CourseSection> sections = new List<CourseSection>();
            string[] schedules = new[]
            {
                "T2: 7:00-9:30", "T2: 9:45-12:15", "T3: 7:00-9:30",
                "T3: 13:00-15:30", "T4: 7:00-9:30", "T4: 9:45-12:15",
                "T5: 7:00-9:30", "T5: 13:00-15:30", "T6: 7:00-9:30",
                "T6: 9:45-12:15"
            };

            for (int i = 0; i < 10; i++)
            {
                CourseSection section = new CourseSection
                {
                    SubjectID = subjects[i % subjects.Count].SubjectID,
                    TeacherID = teachers[i % teachers.Count].Id,
                    Semester = i < 5 ? 1 : 2,
                    AcademicYear = "2024-2025",
                    Schedule = schedules[i],
                    MaxStudents = 50,
                    Status = "InProgress"
                };
                sections.Add(section);
                context.CourseSections.Add(section);
            }
            await context.SaveChangesAsync();

            // ── 9. Create Enrollments ──
            List<Enrollment> enrollments = new List<Enrollment>();
            for (int i = 0; i < studentIds.Count && i < 30; i++)
            {
                Enrollment enrollment = new Enrollment
                {
                    StudentID = studentIds[i],
                    SectionID = sections[i % sections.Count].SectionID,
                    Status = "Registered"
                };
                enrollments.Add(enrollment);
                context.Enrollments.Add(enrollment);
            }
            await context.SaveChangesAsync();

            // ── 10. Create 220+ Grade records ──
            int gradeCount = 0;
            for (int s = 0; s < Math.Min(studentIds.Count, 50); s++)
            {
                // Each student gets 4-5 grades across different subjects
                int numGrades = 4 + (s % 2);
                for (int g = 0; g < numGrades; g++)
                {
                    int subjectIdx = (s + g) % subjects.Count;
                    int sectionIdx = (s + g) % sections.Count;

                    double attendance = Math.Round(3.0 + rng.NextDouble() * 7.0, 1);
                    double midterm = Math.Round(2.0 + rng.NextDouble() * 8.0, 1);
                    double finalScore = Math.Round(2.0 + rng.NextDouble() * 8.0, 1);

                    // Clamp to 0-10
                    attendance = Math.Min(10.0, Math.Max(0.0, attendance));
                    midterm = Math.Min(10.0, Math.Max(0.0, midterm));
                    finalScore = Math.Min(10.0, Math.Max(0.0, finalScore));

                    string enrollmentId = enrollments
                        .FirstOrDefault(e => e.StudentID == studentIds[s] && e.SectionID == sections[sectionIdx].SectionID)?.EnrollmentID 
                        ?? Guid.NewGuid().ToString();

                    Grade grade = new Grade
                    {
                        StudentID = studentIds[s],
                        SubjectID = subjects[subjectIdx].SubjectID,
                        Semester = g < 3 ? 1 : 2,
                        EnrollmentID = enrollmentId,
                        AcademicYear = "2024-2025"
                    };
                    grade.UpdateComponent("Attendance", (decimal)attendance, "System");
                    grade.UpdateComponent("Midterm", (decimal)midterm, "System");
                    grade.UpdateComponent("Final", (decimal)finalScore, "System");

                    context.Grades.Add(grade);
                    gradeCount++;
                }
            }
            await context.SaveChangesAsync();

            Console.WriteLine("Database seeded successfully!");
            Console.WriteLine($"Created: 1 Admin, {teachers.Count} Teachers, {students.Count} Students, " +
                              $"{departments.Count} Departments, {majors.Count} Majors, " +
                              $"{subjects.Count} Subjects, {classes.Count} Classes, " +
                              $"{sections.Count} Sections, {enrollments.Count} Enrollments, " +
                              $"{gradeCount} Grades");
        }
    }
}