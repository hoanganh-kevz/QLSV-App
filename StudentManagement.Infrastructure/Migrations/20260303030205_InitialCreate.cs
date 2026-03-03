using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudentManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Accounts",
                columns: table => new
                {
                    AccountID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Username = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PersonID = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    LastLogin = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FailedLoginAttempts = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Accounts", x => x.AccountID);
                });

            migrationBuilder.CreateTable(
                name: "Classes",
                columns: table => new
                {
                    ClassID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ClassName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    AcademicYear = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    MajorID = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    AdvisorID = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    MaxCapacity = table.Column<int>(type: "int", nullable: false),
                    StartYear = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Classes", x => x.ClassID);
                });

            migrationBuilder.CreateTable(
                name: "Departments",
                columns: table => new
                {
                    DepartmentID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    DepartmentName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DeanID = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    EstablishedYear = table.Column<int>(type: "int", nullable: false),
                    Building = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    PhoneNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Departments", x => x.DepartmentID);
                });

            migrationBuilder.CreateTable(
                name: "Majors",
                columns: table => new
                {
                    MajorID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    MajorCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    MajorName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    DepartmentID = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    TotalCredits = table.Column<int>(type: "int", nullable: false),
                    DurationYears = table.Column<int>(type: "int", nullable: false),
                    Degree = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Majors", x => x.MajorID);
                    table.ForeignKey(
                        name: "FK_Majors_Departments_DepartmentID",
                        column: x => x.DepartmentID,
                        principalTable: "Departments",
                        principalColumn: "DepartmentID",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Subjects",
                columns: table => new
                {
                    SubjectID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    SubjectCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    SubjectName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Credits = table.Column<int>(type: "int", nullable: false),
                    TheoryHours = table.Column<int>(type: "int", nullable: false),
                    PracticeHours = table.Column<int>(type: "int", nullable: false),
                    SubjectType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DepartmentID = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Prerequisites = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Subjects", x => x.SubjectID);
                    table.ForeignKey(
                        name: "FK_Subjects_Departments_DepartmentID",
                        column: x => x.DepartmentID,
                        principalTable: "Departments",
                        principalColumn: "DepartmentID",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Persons",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    FullName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PhoneNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Address = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    DateOfBirth = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Gender = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Nationality = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IdCard = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    AccountID = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    PersonType = table.Column<string>(type: "nvarchar(8)", maxLength: 8, nullable: false),
                    AdminCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Role = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Department = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    StudentCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    ClassID = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    MajorID = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    EnrollmentYear = table.Column<int>(type: "int", nullable: true),
                    AcademicYear = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Avatar = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    GPA = table.Column<decimal>(type: "decimal(3,2)", precision: 3, scale: 2, nullable: true),
                    TotalCredits = table.Column<int>(type: "int", nullable: true),
                    ScholarshipTier = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Tuition = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    DebtAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    TeacherCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    DepartmentID = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    Position = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Degree = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    HireDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EmploymentType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    OfficeRoom = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    ConsultingHours = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ResearchArea = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Persons", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Persons_Accounts_AccountID",
                        column: x => x.AccountID,
                        principalTable: "Accounts",
                        principalColumn: "AccountID",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Persons_Classes_ClassID",
                        column: x => x.ClassID,
                        principalTable: "Classes",
                        principalColumn: "ClassID",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Persons_Departments_DepartmentID",
                        column: x => x.DepartmentID,
                        principalTable: "Departments",
                        principalColumn: "DepartmentID");
                    table.ForeignKey(
                        name: "FK_Persons_Majors_MajorID",
                        column: x => x.MajorID,
                        principalTable: "Majors",
                        principalColumn: "MajorID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Accounts_Username",
                table: "Accounts",
                column: "Username",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Classes_AdvisorID",
                table: "Classes",
                column: "AdvisorID");

            migrationBuilder.CreateIndex(
                name: "IX_Classes_ClassName",
                table: "Classes",
                column: "ClassName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Classes_MajorID",
                table: "Classes",
                column: "MajorID");

            migrationBuilder.CreateIndex(
                name: "IX_Departments_DeanID",
                table: "Departments",
                column: "DeanID");

            migrationBuilder.CreateIndex(
                name: "IX_Departments_DepartmentName",
                table: "Departments",
                column: "DepartmentName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Majors_DepartmentID",
                table: "Majors",
                column: "DepartmentID");

            migrationBuilder.CreateIndex(
                name: "IX_Majors_MajorCode",
                table: "Majors",
                column: "MajorCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Persons_AccountID",
                table: "Persons",
                column: "AccountID",
                unique: true,
                filter: "[AccountID] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Persons_AdminCode",
                table: "Persons",
                column: "AdminCode",
                unique: true,
                filter: "[AdminCode] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Persons_ClassID",
                table: "Persons",
                column: "ClassID");

            migrationBuilder.CreateIndex(
                name: "IX_Persons_DepartmentID",
                table: "Persons",
                column: "DepartmentID");

            migrationBuilder.CreateIndex(
                name: "IX_Persons_Email",
                table: "Persons",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Persons_MajorID",
                table: "Persons",
                column: "MajorID");

            migrationBuilder.CreateIndex(
                name: "IX_Persons_StudentCode",
                table: "Persons",
                column: "StudentCode",
                unique: true,
                filter: "[StudentCode] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Persons_TeacherCode",
                table: "Persons",
                column: "TeacherCode",
                unique: true,
                filter: "[TeacherCode] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Subjects_DepartmentID",
                table: "Subjects",
                column: "DepartmentID");

            migrationBuilder.CreateIndex(
                name: "IX_Subjects_SubjectCode",
                table: "Subjects",
                column: "SubjectCode",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Classes_Majors_MajorID",
                table: "Classes",
                column: "MajorID",
                principalTable: "Majors",
                principalColumn: "MajorID",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Classes_Persons_AdvisorID",
                table: "Classes",
                column: "AdvisorID",
                principalTable: "Persons",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Departments_Persons_DeanID",
                table: "Departments",
                column: "DeanID",
                principalTable: "Persons",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Classes_Majors_MajorID",
                table: "Classes");

            migrationBuilder.DropForeignKey(
                name: "FK_Persons_Majors_MajorID",
                table: "Persons");

            migrationBuilder.DropForeignKey(
                name: "FK_Classes_Persons_AdvisorID",
                table: "Classes");

            migrationBuilder.DropForeignKey(
                name: "FK_Departments_Persons_DeanID",
                table: "Departments");

            migrationBuilder.DropTable(
                name: "Subjects");

            migrationBuilder.DropTable(
                name: "Majors");

            migrationBuilder.DropTable(
                name: "Persons");

            migrationBuilder.DropTable(
                name: "Accounts");

            migrationBuilder.DropTable(
                name: "Classes");

            migrationBuilder.DropTable(
                name: "Departments");
        }
    }
}
