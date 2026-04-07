namespace StudentManagement.Core.Authorization
{
    public static class Permissions
    {
        // Student permissions
        public const string ViewStudents = "Permissions.Students.View";
        public const string CreateStudents = "Permissions.Students.Create";
        public const string UpdateStudents = "Permissions.Students.Update";
        public const string DeleteStudents = "Permissions.Students.Delete";

        // Grade permissions
        public const string ViewGrades = "Permissions.Grades.View";
        public const string EnterGrades = "Permissions.Grades.Enter";
        public const string UpdateGrades = "Permissions.Grades.Update";
        public const string ViewOwnGrades = "Permissions.Grades.ViewOwn";

        // Class permissions
        public const string ViewClasses = "Permissions.Classes.View";
        public const string ManageClasses = "Permissions.Classes.Manage";

        // User management
        public const string ViewUsers = "Permissions.Users.View";
        public const string ManageUsers = "Permissions.Users.Manage";

        // Reports
        public const string ViewReports = "Permissions.Reports.View";
        public const string ExportData = "Permissions.Reports.Export";

        public static Dictionary<string, List<string>> RolePermissions = new()
        {
            {
                "Admin", new List<string>
                {
                    ViewStudents, CreateStudents, UpdateStudents, DeleteStudents,
                    ViewGrades, EnterGrades, UpdateGrades,
                    ViewClasses, ManageClasses,
                    ViewUsers, ManageUsers,
                    ViewReports, ExportData
                }
            },
            {
                "Teacher", new List<string>
                {
                    ViewStudents,
                    ViewGrades, EnterGrades,
                    ViewClasses,
                    ViewReports, ExportData
                }
            },
            {
                "Student", new List<string>
                {
                    ViewOwnGrades
                }
            }
        };

        public static bool HasPermission(string role, string permission)
        {
            return RolePermissions.ContainsKey(role) &&
                   RolePermissions[role].Contains(permission);
        }
    }
}