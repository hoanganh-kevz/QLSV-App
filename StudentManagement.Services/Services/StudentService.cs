using AutoMapper;
using Microsoft.EntityFrameworkCore;
using StudentManagement.Core.DTOs.Student;
using StudentManagement.Core.Entities;
using StudentManagement.Core.Enums;
using StudentManagement.Core.Interfaces.Repositories;
using StudentManagement.Core.Interfaces.Services;

namespace StudentManagement.Services.Services
{
    public class StudentService : IStudentService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public StudentService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<StudentDto> GetByIdAsync(string studentId)
        {
            var student = await _unitOfWork.Repository<Student>()
                .FirstOrDefaultAsync(s => s.Id == studentId);

            if (student == null)
                throw new KeyNotFoundException($"Student with ID {studentId} not found");

            return _mapper.Map<StudentDto>(student);
        }

        public async Task<StudentDto> GetByCodeAsync(string studentCode)
        {
            var student = await _unitOfWork.Repository<Student>()
                .FirstOrDefaultAsync(s => s.StudentCode == studentCode);

            if (student == null)
                throw new KeyNotFoundException($"Student with code {studentCode} not found");

            return _mapper.Map<StudentDto>(student);
        }

        public async Task<PagedStudentResult> GetAllAsync(StudentSearchDto searchDto)
        {
            var query = _unitOfWork.Repository<Student>().FindAsync(s => true);
            var students = await query;

            // Apply filters
            if (!string.IsNullOrEmpty(searchDto.Keyword))
            {
                students = students.Where(s =>
                    s.StudentCode.Contains(searchDto.Keyword) ||
                    s.FullName.Contains(searchDto.Keyword) ||
                    s.Email.Contains(searchDto.Keyword)
                );
            }

            if (!string.IsNullOrEmpty(searchDto.ClassID))
                students = students.Where(s => s.ClassID == searchDto.ClassID);

            if (!string.IsNullOrEmpty(searchDto.MajorID))
                students = students.Where(s => s.MajorID == searchDto.MajorID);

            if (!string.IsNullOrEmpty(searchDto.Status))
                students = students.Where(s => s.Status.ToString() == searchDto.Status);

            if (searchDto.EnrollmentYear.HasValue)
                students = students.Where(s => s.EnrollmentYear == searchDto.EnrollmentYear.Value);

            if (searchDto.MinGPA.HasValue)
                students = students.Where(s => s.GPA >= searchDto.MinGPA.Value);

            if (searchDto.MaxGPA.HasValue)
                students = students.Where(s => s.GPA <= searchDto.MaxGPA.Value);

            // Get total count
            var totalCount = students.Count();

            // Apply sorting
            students = searchDto.SortBy?.ToLower() switch
            {
                "fullname" => searchDto.SortOrder == "desc" 
                    ? students.OrderByDescending(s => s.FullName)
                    : students.OrderBy(s => s.FullName),
                "gpa" => searchDto.SortOrder == "desc"
                    ? students.OrderByDescending(s => s.GPA)
                    : students.OrderBy(s => s.GPA),
                _ => students.OrderBy(s => s.StudentCode)
            };

            // Apply pagination
            var pagedStudents = students
                .Skip((searchDto.PageNumber - 1) * searchDto.PageSize)
                .Take(searchDto.PageSize)
                .ToList();

            var studentDtos = _mapper.Map<List<StudentListDto>>(pagedStudents);

            return new PagedStudentResult
            {
                Students = studentDtos,
                TotalCount = totalCount,
                PageNumber = searchDto.PageNumber,
                PageSize = searchDto.PageSize
            };
        }

        public async Task<StudentDto> CreateAsync(CreateStudentDto createDto)
        {
            // Check if email already exists
            if (await _unitOfWork.Repository<Person>()
                .ExistsAsync(p => p.Email == createDto.Email))
            {
                throw new InvalidOperationException("Email already exists");
            }

            await _unitOfWork.BeginTransactionAsync();

            try
            {
                // Generate student code
                var studentCode = await GenerateStudentCodeAsync();

                // Create account
                var account = new Account(createDto.Username, createDto.Password, AccountRole.Student);
                await _unitOfWork.Repository<Account>().AddAsync(account);
                await _unitOfWork.SaveChangesAsync();

                // Create student
                var student = new Student(
                    createDto.FullName,
                    createDto.Email,
                    createDto.PhoneNumber,
                    createDto.DateOfBirth,
                    createDto.Gender,
                    studentCode,
                    createDto.EnrollmentYear,
                    createDto.AcademicYear
                );

                student.SetAccount(account.AccountID);
                student.SetClassAndMajor(createDto.ClassID ?? string.Empty, createDto.MajorID ?? string.Empty);

                await _unitOfWork.Repository<Student>().AddAsync(student);
                await _unitOfWork.SaveChangesAsync();

                await _unitOfWork.CommitTransactionAsync();

                return _mapper.Map<StudentDto>(student);
            }
            catch
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }
        }

        public async Task<StudentDto> UpdateAsync(string studentId, UpdateStudentDto updateDto)
        {
            var student = await _unitOfWork.Repository<Student>()
                .FirstOrDefaultAsync(s => s.Id == studentId);

            if (student == null)
                throw new KeyNotFoundException($"Student with ID {studentId} not found");

            // Update properties manually (can't use AutoMapper directly due to encapsulation)
            // Note: In real implementation, add public setters or Update methods in Student class

            _mapper.Map(updateDto, student);
            
            await _unitOfWork.Repository<Student>().UpdateAsync(student);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<StudentDto>(student);
        }

        public async Task<bool> DeleteAsync(string studentId)
        {
            var student = await _unitOfWork.Repository<Student>()
                .FirstOrDefaultAsync(s => s.Id == studentId);

            if (student == null)
                return false;

            // Soft delete - change status
            // student.Status = StudentStatus.Expelled; // Or use a Deleted status

            // Or hard delete
            await _unitOfWork.Repository<Student>().DeleteAsync(student);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }

        public async Task<List<StudentListDto>> GetByClassAsync(string classId)
        {
            var students = await _unitOfWork.Repository<Student>()
                .FindAsync(s => s.ClassID == classId);

            return _mapper.Map<List<StudentListDto>>(students);
        }

        public async Task<bool> ExistsAsync(string studentCode)
        {
            return await _unitOfWork.Repository<Student>()
                .ExistsAsync(s => s.StudentCode == studentCode);
        }

        public async Task<bool> UpdateAvatarAsync(string studentId, string avatarUrl)
        {
            var student = await _unitOfWork.Repository<Student>()
                .FirstOrDefaultAsync(s => s.Id == studentId);

            if (student == null)
                return false;

            student.SetAvatar(avatarUrl);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }

        public async Task<bool> UpdateGPAAsync(string studentId, decimal gpa)
        {
            var student = await _unitOfWork.Repository<Student>()
                .FirstOrDefaultAsync(s => s.Id == studentId);

            if (student == null)
                return false;

            student.UpdateGPA(gpa);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }

        public async Task<StudentDto> ChangeClassAsync(string studentId, string newClassId)
        {
            var student = await _unitOfWork.Repository<Student>()
                .FirstOrDefaultAsync(s => s.Id == studentId);

            if (student == null)
                throw new KeyNotFoundException($"Student with ID {studentId} not found");

            student.SetClassAndMajor(newClassId, student.MajorID ?? string.Empty);
            await _unitOfWork.SaveChangesAsync();
            return _mapper.Map<StudentDto>(student);
        }

        public async Task<int> GetTotalCountAsync()
        {
            return await _unitOfWork.Repository<Student>()
                .CountAsync(s => s.Status == StudentStatus.Active);
        }

        public async Task<List<StudentListDto>> GetTopStudentsAsync(int limit = 10)
        {
            var students = await _unitOfWork.Repository<Student>()
                .FindAsync(s => s.Status == StudentStatus.Active);

            var topStudents = students
                .OrderByDescending(s => s.GPA)
                .Take(limit)
                .ToList();

            return _mapper.Map<List<StudentListDto>>(topStudents);
        }

        private async Task<string> GenerateStudentCodeAsync()
        {
            var year = DateTime.Now.Year % 100; // 24 for 2024
            var month = DateTime.Now.Month;
            var count = await _unitOfWork.Repository<Student>().CountAsync();
            
            return $"{year:D2}{month:D2}{(count + 1):D6}"; // e.g., 2402000001
        }
    }
}