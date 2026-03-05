using OfficeOpenXml;
using OfficeOpenXml.Style;
using OfficeOpenXml.DataValidation;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using StudentManagement.Core.DTOs.Class;
using StudentManagement.Core.DTOs.Grade;
using StudentManagement.Core.DTOs.Student;
using StudentManagement.Core.Interfaces.Services;
using DrawingColor = System.Drawing.Color;

namespace StudentManagement.Services.Services
{
    public class ExportService : IExportService
    {
        private readonly IStudentService _studentService;
        private readonly IClassService _classService;
        private readonly IGradeService _gradeService;

        public ExportService(
            IStudentService studentService,
            IClassService classService,
            IGradeService gradeService)
        {
            _studentService = studentService;
            _classService = classService;
            _gradeService = gradeService;
        }

        public async Task<byte[]> ExportStudentsToExcelAsync(List<StudentListDto> students)
        {
            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add("Danh sách sinh viên");

            // Title
            worksheet.Cells[1, 1, 1, 8].Merge = true;
            worksheet.Cells[1, 1].Value = "DANH SÁCH SINH VIÊN";
            worksheet.Cells[1, 1].Style.Font.Size = 16;
            worksheet.Cells[1, 1].Style.Font.Bold = true;
            worksheet.Cells[1, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

            // Export info
            worksheet.Cells[2, 1].Value = $"Ngày xuất: {DateTime.Now:dd/MM/yyyy HH:mm}";
            worksheet.Cells[2, 1].Style.Font.Italic = true;
            worksheet.Cells[3, 1].Value = $"Tổng số: {students.Count} sinh viên";

            // Headers
            var headerRow = 5;
            var headers = new[]
            {
                "STT", "Mã SV", "Họ và tên", "Email",
                "Lớp", "GPA", "Trạng thái"
            };

            for (int i = 0; i < headers.Length; i++)
            {
                var cell = worksheet.Cells[headerRow, i + 1];
                cell.Value = headers[i];
                cell.Style.Font.Bold = true;
                cell.Style.Fill.PatternType = ExcelFillStyle.Solid;
                cell.Style.Fill.BackgroundColor.SetColor(DrawingColor.LightBlue);
                cell.Style.Border.BorderAround(ExcelBorderStyle.Thin);
                cell.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            }

            // Data
            int row = headerRow + 1;
            int stt = 1;
            
            foreach (var student in students)
            {
                worksheet.Cells[row, 1].Value = stt++;
                worksheet.Cells[row, 2].Value = student.StudentCode;
                worksheet.Cells[row, 3].Value = student.FullName;
                worksheet.Cells[row, 4].Value = student.Email;
                worksheet.Cells[row, 5].Value = student.ClassName ?? "Chưa có";
                worksheet.Cells[row, 6].Value = student.GPA;
                worksheet.Cells[row, 6].Style.Numberformat.Format = "0.00";
                worksheet.Cells[row, 7].Value = student.Status;

                // Conditional formatting for GPA
                var gpaCell = worksheet.Cells[row, 6];
                if (student.GPA >= 3.6m)
                    gpaCell.Style.Font.Color.SetColor(DrawingColor.Green);
                else if (student.GPA < 2.0m)
                    gpaCell.Style.Font.Color.SetColor(DrawingColor.Red);

                // Status color
                var statusCell = worksheet.Cells[row, 7];
                statusCell.Style.Font.Color.SetColor(student.Status switch
                {
                    "Active" => DrawingColor.Green,
                    "OnLeave" => DrawingColor.Orange,
                    "Suspended" => DrawingColor.Red,
                    _ => DrawingColor.Black
                });

                // Borders
                for (int col = 1; col <= headers.Length; col++)
                {
                    worksheet.Cells[row, col].Style.Border.BorderAround(ExcelBorderStyle.Thin);
                }

                row++;
            }

            // Summary
            row++;
            worksheet.Cells[row, 1].Value = "THỐNG KÊ:";
            worksheet.Cells[row, 1].Style.Font.Bold = true;
            row++;
            
            var activeCount = students.Count(s => s.Status == "Active");
            var avgGPA = students.Any() ? students.Average(s => (double)s.GPA) : 0;
            
            worksheet.Cells[row, 1].Value = $"Đang học: {activeCount}";
            row++;
            worksheet.Cells[row, 1].Value = $"GPA trung bình: {avgGPA:F2}";
            row++;
            worksheet.Cells[row, 1].Value = $"GPA cao nhất: {students.Max(s => s.GPA):F2}";
            row++;
            worksheet.Cells[row, 1].Value = $"GPA thấp nhất: {students.Min(s => s.GPA):F2}";

            // Auto-fit columns
            worksheet.Cells.AutoFitColumns(0);
            
            // Set minimum column widths
            for (int i = 1; i <= headers.Length; i++)
            {
                if (worksheet.Column(i).Width < 10)
                    worksheet.Column(i).Width = 10;
            }

            return await package.GetAsByteArrayAsync();
        }

                public async Task<byte[]> ExportClassesToExcelAsync(List<ClassDto> classes)
        {
            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add("Danh sách lớp");

            worksheet.Cells[1, 1, 1, 6].Merge = true;
            worksheet.Cells[1, 1].Value = "DANH SÁCH LỚP";
            worksheet.Cells[1, 1].Style.Font.Size = 16;
            worksheet.Cells[1, 1].Style.Font.Bold = true;
            worksheet.Cells[1, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

            var headerRow = 3;
            var headers = new[] { "STT", "Tên Lớp", "Niên Khóa", "Ngành", "Sĩ số", "GPA TB" };
            for (int i = 0; i < headers.Length; i++)
            {
                var cell = worksheet.Cells[headerRow, i + 1];
                cell.Value = headers[i];
                cell.Style.Font.Bold = true;
                cell.Style.Fill.PatternType = ExcelFillStyle.Solid;
                cell.Style.Fill.BackgroundColor.SetColor(DrawingColor.LightBlue);
                cell.Style.Border.BorderAround(ExcelBorderStyle.Thin);
            }

            int row = headerRow + 1;
            int stt = 1;
            foreach (var cls in classes)
            {
                worksheet.Cells[row, 1].Value = stt++;
                worksheet.Cells[row, 2].Value = cls.ClassName;
                worksheet.Cells[row, 3].Value = cls.AcademicYear;
                worksheet.Cells[row, 4].Value = cls.MajorName ?? "Chưa có";
                worksheet.Cells[row, 5].Value = $"{cls.CurrentSize}/{cls.MaxCapacity}";
                worksheet.Cells[row, 6].Value = cls.AverageGPA;
                worksheet.Cells[row, 6].Style.Numberformat.Format = "0.00";
                row++;
            }

            worksheet.Cells.AutoFitColumns(0);
            return await package.GetAsByteArrayAsync();
        }

        public async Task<byte[]> ExportGradesToExcelAsync(string sectionId)
        {
            var grades = await _gradeService.GetBySectionAsync(sectionId);
            
            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add("Bảng điểm");

            // Section info (get from first grade)
            var firstGrade = grades.FirstOrDefault();
            if (firstGrade != null)
            {
                worksheet.Cells[1, 1].Value = "BẢNG ĐIỂM LỚP HỌC PHẦN";
                worksheet.Cells[1, 1].Style.Font.Size = 14;
                worksheet.Cells[1, 1].Style.Font.Bold = true;
                
                worksheet.Cells[2, 1].Value = $"Môn học: {firstGrade.SubjectCode} - {firstGrade.SubjectName}";
                worksheet.Cells[3, 1].Value = $"Học kỳ: {firstGrade.Semester} - Năm học: {firstGrade.AcademicYear}";
            }

            // Headers
            var headerRow = 5;
            var headers = new[]
            {
                "STT", "Mã SV", "Họ tên", "Chuyên cần (10%)", 
                "Giữa kỳ (30%)", "Cuối kỳ (60%)", "Tổng kết", 
                "Điểm chữ", "Điểm hệ 4", "Kết quả"
            };

            for (int i = 0; i < headers.Length; i++)
            {
                var cell = worksheet.Cells[headerRow, i + 1];
                cell.Value = headers[i];
                cell.Style.Font.Bold = true;
                cell.Style.Fill.PatternType = ExcelFillStyle.Solid;
                cell.Style.Fill.BackgroundColor.SetColor(DrawingColor.LightGreen);
                cell.Style.Border.BorderAround(ExcelBorderStyle.Thin);
                cell.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            }

            // Data
            int row = headerRow + 1;
            int stt = 1;
            
            foreach (var grade in grades.OrderBy(g => g.StudentCode))
            {
                worksheet.Cells[row, 1].Value = stt++;
                worksheet.Cells[row, 2].Value = grade.StudentCode;
                worksheet.Cells[row, 3].Value = grade.StudentName;
                worksheet.Cells[row, 4].Value = grade.AttendanceScore;
                worksheet.Cells[row, 5].Value = grade.MidtermScore;
                worksheet.Cells[row, 6].Value = grade.FinalScore;
                worksheet.Cells[row, 7].Value = grade.TotalScore;
                worksheet.Cells[row, 8].Value = grade.LetterGrade;
                worksheet.Cells[row, 9].Value = grade.GradePoint;
                worksheet.Cells[row, 10].Value = grade.Status;

                // Format numbers
                for (int col = 4; col <= 9; col++)
                {
                    worksheet.Cells[row, col].Style.Numberformat.Format = "0.00";
                }

                // Color coding for results
                var resultCell = worksheet.Cells[row, 10];
                resultCell.Style.Font.Color.SetColor(grade.Status switch
                {
                    "Pass" => DrawingColor.Green,
                    "Fail" => DrawingColor.Red,
                    _ => DrawingColor.Orange
                });

                // Borders
                for (int col = 1; col <= headers.Length; col++)
                {
                    worksheet.Cells[row, col].Style.Border.BorderAround(ExcelBorderStyle.Thin);
                }

                row++;
            }

            // Statistics
            row += 2;
            worksheet.Cells[row, 1].Value = "THỐNG KÊ PHÂN BỐ ĐIỂM:";
            worksheet.Cells[row, 1].Style.Font.Bold = true;
            row++;

            var gradeDistribution = grades.GroupBy(g => g.LetterGrade)
                .OrderBy(g => g.Key)
                .ToList();

            foreach (var group in gradeDistribution)
            {
                worksheet.Cells[row, 1].Value = $"Điểm {group.Key}:";
                worksheet.Cells[row, 2].Value = group.Count();
                worksheet.Cells[row, 3].Value = $"{(group.Count() * 100.0 / grades.Count):F1}%";
                row++;
            }

            row++;
            var passCount = grades.Count(g => g.Status == "Pass");
            worksheet.Cells[row, 1].Value = "Tỷ lệ đậu:";
            worksheet.Cells[row, 2].Value = $"{(passCount * 100.0 / grades.Count):F1}%";
            worksheet.Cells[row, 2].Style.Font.Bold = true;

            worksheet.Cells.AutoFitColumns(0);

            return await package.GetAsByteArrayAsync();
        }

                public async Task<byte[]> GenerateGradeEntryTemplateAsync(string sectionId)
        {
            var grades = await _gradeService.GetBySectionAsync(sectionId);
            
            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add("Nhập điểm");

            // Instructions
            worksheet.Cells[1, 1].Value = "MẪU NHẬP ĐIỂM - HƯỚNG DẪN";
            worksheet.Cells[1, 1].Style.Font.Bold = true;
            worksheet.Cells[1, 1].Style.Font.Size = 14;
            
            worksheet.Cells[2, 1].Value = "1. KHÔNG được chỉnh sửa cột Mã SV và Họ tên";
            worksheet.Cells[3, 1].Value = "2. Điểm nhập vào từ 0 đến 10, cho phép 1 chữ số thập phân";
            worksheet.Cells[4, 1].Value = "3. Để trống nếu chưa có điểm";
            worksheet.Cells[5, 1].Value = "4. Sau khi nhập xong, upload file này lên hệ thống";

            // Headers (row 7)
            var headerRow = 7;
            worksheet.Cells[headerRow, 1].Value = "Mã SV (Không sửa)";
            worksheet.Cells[headerRow, 2].Value = "Họ tên (Không sửa)";
            worksheet.Cells[headerRow, 3].Value = "Chuyên cần (0-10)";
            worksheet.Cells[headerRow, 4].Value = "Giữa kỳ (0-10)";
            worksheet.Cells[headerRow, 5].Value = "Cuối kỳ (0-10)";
            worksheet.Cells[headerRow, 6].Value = "Ghi chú";

            // Style headers
            for (int col = 1; col <= 6; col++)
            {
                var cell = worksheet.Cells[headerRow, col];
                cell.Style.Font.Bold = true;
                cell.Style.Fill.PatternType = ExcelFillStyle.Solid;
                cell.Style.Fill.BackgroundColor.SetColor(DrawingColor.Yellow);
                cell.Style.Border.BorderAround(ExcelBorderStyle.Thick);
                cell.Style.WrapText = true;
            }

            // Lock columns 1 & 2
            worksheet.Column(1).Style.Locked = true;
            worksheet.Column(2).Style.Locked = true;
            worksheet.Column(3).Style.Locked = false;
            worksheet.Column(4).Style.Locked = false;
            worksheet.Column(5).Style.Locked = false;
            worksheet.Column(6).Style.Locked = false;

            // Student data
            int row = headerRow + 1;
            foreach (var grade in grades.OrderBy(g => g.StudentCode))
            {
                worksheet.Cells[row, 1].Value = grade.StudentCode;
                worksheet.Cells[row, 2].Value = grade.StudentName;
                
                // Data validation for score columns
                for (int col = 3; col <= 5; col++)
                {
                    var validation = worksheet.DataValidations.AddDecimalValidation(
                        worksheet.Cells[row, col].Address);
                    validation.Formula.Value = 0;
                    validation.Formula2.Value = 10;
                    validation.ShowErrorMessage = true;
                    validation.ErrorTitle = "Điểm không hợp lệ";
                    validation.Error = "Điểm phải từ 0 đến 10";
                    validation.Operator = OfficeOpenXml.DataValidation.ExcelDataValidationOperator.between;
                }

                row++;
            }

            // Protect worksheet but allow editing score columns
            worksheet.Protection.IsProtected = true;
            worksheet.Protection.AllowSelectLockedCells = true;
            worksheet.Protection.AllowSelectUnlockedCells = true;

            worksheet.Cells.AutoFitColumns(0);

            return await package.GetAsByteArrayAsync();
        }

        public async Task<bool> ImportGradesFromExcelAsync(byte[] fileData, string sectionId)
        {
            using var stream = new MemoryStream(fileData);
            using var package = new ExcelPackage(stream);
            
            var worksheet = package.Workbook.Worksheets[0];
            var startRow = 8; // Data starts at row 8
            
            var updates = new List<(string studentCode, decimal? attendance, decimal? midterm, decimal? final)>();

            for (int row = startRow; row <= worksheet.Dimension.End.Row; row++)
            {
                var studentCode = worksheet.Cells[row, 1].Value?.ToString();
                if (string.IsNullOrEmpty(studentCode))
                    break;

                var attendance = worksheet.Cells[row, 3].GetValue<decimal?>();
                var midterm = worksheet.Cells[row, 4].GetValue<decimal?>();
                var final = worksheet.Cells[row, 5].GetValue<decimal?>();

                updates.Add((studentCode, attendance, midterm, final));
            }

            // Process updates
            foreach (var (studentCode, attendance, midterm, final) in updates)
            {
                var grades = await _gradeService.GetBySectionAsync(sectionId);
                var grade = grades.FirstOrDefault(g => g.StudentCode == studentCode);
                
                if (grade != null)
                {
                    if (attendance.HasValue)
                        await _gradeService.UpdateComponentAsync(grade.GradeID, 
                            new UpdateGradeComponentDto { Component = "Attendance", Score = attendance.Value }, 
                            "System");
                    
                    if (midterm.HasValue)
                        await _gradeService.UpdateComponentAsync(grade.GradeID,
                            new UpdateGradeComponentDto { Component = "Midterm", Score = midterm.Value },
                            "System");
                    
                    if (final.HasValue)
                        await _gradeService.UpdateComponentAsync(grade.GradeID,
                            new UpdateGradeComponentDto { Component = "Final", Score = final.Value },
                            "System");
                }
            }

            return true;
        }

        public async Task<byte[]> ExportTranscriptToExcelAsync(string studentId)
        {
            // Placeholder - can be expanded later
            var transcript = await _gradeService.GetTranscriptAsync(studentId);
            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add("Bảng điểm");
            worksheet.Cells[1, 1].Value = $"Bảng điểm: {transcript.StudentName}";
            worksheet.Cells[1, 1].Style.Font.Bold = true;
            return await package.GetAsByteArrayAsync();
        }

        public async Task<byte[]> ExportTranscriptToPdfAsync(string studentId)
        {
            var transcript = await _gradeService.GetTranscriptAsync(studentId);
            
            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(11).FontFamily("Times New Roman"));

                    // Header
                    page.Header()
                        .Column(column =>
                        {
                            column.Item().Row(row =>
                            {
                                row.RelativeItem().Column(col =>
                                {
                                    col.Item().Text("TRƯỜNG ĐẠI HỌC ABC").Bold().FontSize(14);
                                    col.Item().Text("KHOA CÔNG NGHỆ THÔNG TIN").FontSize(12);
                                    col.Item().PaddingTop(5).LineHorizontal(1).LineColor(Colors.Grey.Medium);
                                });
                            });

                            column.Item().PaddingTop(10).AlignCenter().Text("BẢNG ĐIỂM SINH VIÊN")
                                .Bold().FontSize(18).FontColor(Colors.Blue.Darken2);

                            column.Item().PaddingTop(5).Row(row =>
                            {
                                row.RelativeItem().Text($"Mã SV: {transcript.StudentCode}").Bold();
                                row.RelativeItem().AlignRight().Text($"Ngày in: {DateTime.Now:dd/MM/yyyy}");
                            });
                        });

                    // Content
                    page.Content()
                        .PaddingTop(1, Unit.Centimetre)
                        .Column(column =>
                        {
                            // Student info
                            column.Item().Table(table =>
                            {
                                table.ColumnsDefinition(columns =>
                                {
                                    columns.RelativeColumn(1);
                                    columns.RelativeColumn(2);
                                });

                                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2)
                                    .Padding(5).Text("Họ và tên:").Bold();
                                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2)
                                    .Padding(5).Text(transcript.StudentName);

                                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2)
                                    .Padding(5).Text("Điểm trung bình tích lũy:").Bold();
                                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2)
                                    .Padding(5).Text($"{transcript.CurrentGPA:F2}/4.0")
                                    .FontColor(transcript.CurrentGPA >= 3.6m ? Colors.Green.Darken2 : Colors.Black);

                                table.Cell().Padding(5).Text("Tổng số tín chỉ tích lũy:").Bold();
                                table.Cell().Padding(5).Text($"{transcript.TotalCredits} TC");
                            });

                            // Academic standing
                            column.Item().PaddingTop(10).Row(row =>
                            {
                                var standing = transcript.CurrentGPA switch
                                {
                                    >= 3.6m => "Xuất sắc",
                                    >= 3.2m => "Giỏi",
                                    >= 2.5m => "Khá",
                                    >= 2.0m => "Trung bình",
                                    _ => "Yếu"
                                };
                                
                                row.RelativeItem().Background(Colors.Grey.Lighten3)
                                    .Padding(10).Text($"Xếp loại: {standing}").Bold().FontSize(12);
                            });

                            // Grades by semester
                            foreach (var semester in transcript.Semesters)
                            {
                                column.Item().PaddingTop(15).Text(
                                    $"HỌC KỲ {semester.Semester} - NĂM HỌC {semester.AcademicYear}"
                                ).Bold().FontSize(13).FontColor(Colors.Blue.Medium);

                                column.Item().PaddingTop(5).Table(table =>
                                {
                                    // Define columns
                                    table.ColumnsDefinition(columns =>
                                    {
                                        columns.ConstantColumn(30);  // STT
                                        columns.ConstantColumn(70);  // Mã môn
                                        columns.RelativeColumn(3);   // Tên môn
                                        columns.ConstantColumn(40);  // TC
                                        columns.ConstantColumn(50);  // Điểm
                                        columns.ConstantColumn(50);  // Chữ
                                        columns.ConstantColumn(50);  // Hệ 4
                                    });

                                    // Header
                                    table.Header(header =>
                                    {
                                        header.Cell().Element(HeaderCellStyle).Text("STT");
                                        header.Cell().Element(HeaderCellStyle).Text("Mã môn");
                                        header.Cell().Element(HeaderCellStyle).Text("Tên môn học");
                                        header.Cell().Element(HeaderCellStyle).Text("TC");
                                        header.Cell().Element(HeaderCellStyle).Text("Điểm");
                                        header.Cell().Element(HeaderCellStyle).Text("Chữ");
                                        header.Cell().Element(HeaderCellStyle).Text("Hệ 4");
                                    });

                                    // Data rows
                                    int stt = 1;
                                    foreach (var grade in semester.Grades)
                                    {
                                        var rowColor = stt % 2 == 0 ? Colors.Grey.Lighten4 : Colors.White;

                                        table.Cell().Background(rowColor).Element(DataCellStyle).Text(stt.ToString());
                                        table.Cell().Background(rowColor).Element(DataCellStyle).Text(grade.SubjectCode);
                                        table.Cell().Background(rowColor).Element(DataCellStyle).Text(grade.SubjectName);
                                        table.Cell().Background(rowColor).Element(DataCellStyle).AlignCenter().Text(grade.Credits.ToString());
                                        table.Cell().Background(rowColor).Element(DataCellStyle).AlignCenter()
                                            .Text(grade.TotalScore.ToString("F2"))
                                            .FontColor(grade.TotalScore >= 8.5m ? Colors.Green.Darken2 : 
                                                      grade.TotalScore < 4.0m ? Colors.Red.Medium : Colors.Black);
                                        table.Cell().Background(rowColor).Element(DataCellStyle).AlignCenter()
                                            .Text(grade.LetterGrade).Bold();
                                        table.Cell().Background(rowColor).Element(DataCellStyle).AlignCenter()
                                            .Text(grade.GradePoint.ToString("F1"));

                                        stt++;
                                    }

                                    // Summary row
                                    table.Cell().ColumnSpan(3).Element(SummaryCellStyle).Text("Tổng kết học kỳ:").Bold();
                                    table.Cell().Element(SummaryCellStyle).AlignCenter()
                                        .Text($"{semester.SemesterCredits} TC").Bold();
                                    table.Cell().ColumnSpan(2).Element(SummaryCellStyle)
                                        .Text($"GPA: {semester.SemesterGPA:F2}").Bold();
                                    table.Cell().Element(SummaryCellStyle);
                                });
                            }
                        });

                    // Footer
                    page.Footer()
                        .AlignCenter()
                        .Text(x =>
                        {
                            x.Span("Trang ");
                            x.CurrentPageNumber();
                            x.Span(" / ");
                            x.TotalPages();
                        });
                });
            });

            return document.GeneratePdf();
        }

        // Helper methods for PDF styling
        static IContainer HeaderCellStyle(IContainer container)
        {
            return container
                .Border(1)
                .BorderColor(Colors.Grey.Medium)
                .Background(Colors.Blue.Lighten4)
                .Padding(5)
                .AlignCenter()
                .AlignMiddle();
        }

        static IContainer DataCellStyle(IContainer container)
        {
            return container
                .Border(1)
                .BorderColor(Colors.Grey.Lighten2)
                .Padding(5)
                .AlignMiddle();
        }

        static IContainer SummaryCellStyle(IContainer container)
        {
            return container
                .Border(1)
                .BorderColor(Colors.Grey.Medium)
                .Background(Colors.Blue.Lighten5)
                .Padding(5)
                .AlignMiddle();
        }

                public async Task<byte[]> ExportClassRosterToPdfAsync(string classId)
        {
            var classDto = await _classService.GetByIdAsync(classId);
            var students = await _classService.GetClassStudentsAsync(classId);

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4.Landscape());
                    page.Margin(1.5f, Unit.Centimetre);

                    page.Header()
                        .Column(column =>
                        {
                            column.Item().Text("DANH SÁCH LỚP").Bold().FontSize(16).AlignCenter();
                            column.Item().Text($"Lớp: {classDto.ClassName}").FontSize(12);
                            column.Item().Text($"GVCN: {classDto.AdvisorName ?? "Chưa có"}");
                            column.Item().Text($"Sĩ số: {students.Count}/{classDto.MaxCapacity}");
                        });

                    page.Content()
                        .PaddingTop(10)
                        .Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.ConstantColumn(40);  // STT
                                columns.ConstantColumn(100); // Mã SV
                                columns.RelativeColumn(2);   // Họ tên
                                columns.RelativeColumn(2);   // Email
                                columns.ConstantColumn(100); // SĐT
                                columns.ConstantColumn(60);  // GPA
                                columns.ConstantColumn(100); // Trạng thái
                            });

                            // Header
                            table.Header(header =>
                            {
                                header.Cell().Element(HeaderCellStyle).Text("STT");
                                header.Cell().Element(HeaderCellStyle).Text("Mã SV");
                                header.Cell().Element(HeaderCellStyle).Text("Họ và tên");
                                header.Cell().Element(HeaderCellStyle).Text("Email");
                                header.Cell().Element(HeaderCellStyle).Text("Số điện thoại");
                                header.Cell().Element(HeaderCellStyle).Text("GPA");
                                header.Cell().Element(HeaderCellStyle).Text("Trạng thái");
                            });

                            // Data
                            int stt = 1;
                            foreach (var student in students.OrderBy(s => s.FullName))
                            {
                                table.Cell().Element(DataCellStyle).Text(stt.ToString());
                                table.Cell().Element(DataCellStyle).Text(student.StudentCode);
                                table.Cell().Element(DataCellStyle).Text(student.FullName);
                                table.Cell().Element(DataCellStyle).Text(student.Email);
                                table.Cell().Element(DataCellStyle).Text(""); // Phone not in DTO
                                table.Cell().Element(DataCellStyle).AlignCenter().Text(student.GPA.ToString("F2"));
                                table.Cell().Element(DataCellStyle).Text(student.Status);
                                stt++;
                            }
                        });

                    page.Footer()
                        .AlignRight()
                        .Text($"In ngày: {DateTime.Now:dd/MM/yyyy HH:mm}");
                });
            });

            return document.GeneratePdf();
        }
    }
}