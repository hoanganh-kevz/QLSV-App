using AutoMapper;
using StudentManagement.Core.DTOs.Teacher;
using StudentManagement.Core.Entities;
using StudentManagement.Core.Enums;
using Microsoft.EntityFrameworkCore;
using StudentManagement.Core.Interfaces.Repositories;
using StudentManagement.Core.Interfaces.Services;

namespace StudentManagement.Services.Services
{
    public class TeacherService : ITeacherService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public TeacherService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<TeacherDto> GetByIdAsync(string teacherId)
        {
            Teacher? teacher = await _unitOfWork.Repository<Teacher>()
                .FirstOrDefaultAsync(t => t.Id == teacherId);

            if (teacher == null)
                throw new KeyNotFoundException($"Teacher with ID {teacherId} not found");

            return MapToDto(teacher);
        }

        public async Task<TeacherDto> GetByCodeAsync(string teacherCode)
        {
            Teacher? teacher = await _unitOfWork.Repository<Teacher>()
                .FirstOrDefaultAsync(t => t.TeacherCode == teacherCode);

            if (teacher == null)
                throw new KeyNotFoundException($"Teacher with code {teacherCode} not found");

            return MapToDto(teacher);
        }

        public async Task<List<TeacherListDto>> GetAllAsync()
        {
            return await _unitOfWork.Repository<Teacher>()
                .GetQueryable()
                .Select(t => new TeacherListDto
                {
                    TeacherID = t.Id,
                    TeacherCode = t.TeacherCode,
                    FullName = t.FullName,
                    Email = t.Email,
                    DepartmentName = t.Department != null ? t.Department.DepartmentName : null,
                    Position = t.Position,
                    Degree = t.Degree
                }).ToListAsync();
        }

        public async Task<List<TeacherListDto>> GetByDepartmentAsync(string departmentId)
        {
            return await _unitOfWork.Repository<Teacher>()
                .GetQueryable()
                .Where(t => t.DepartmentID == departmentId)
                .Select(t => new TeacherListDto
                {
                    TeacherID = t.Id,
                    TeacherCode = t.TeacherCode,
                    FullName = t.FullName,
                    Email = t.Email,
                    DepartmentName = t.Department != null ? t.Department.DepartmentName : null,
                    Position = t.Position,
                    Degree = t.Degree
                }).ToListAsync();
        }

        public async Task<TeacherDto> CreateAsync(CreateTeacherDto createDto)
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
                // Generate teacher code
                string teacherCode = await GenerateTeacherCodeAsync();

                // Parse gender
                Gender gender = Enum.TryParse<Gender>(createDto.Gender, true, out var g) ? g : Gender.Male;

                // Create account
                Account account = new Account(createDto.Username, createDto.Password, AccountRole.Teacher);
                await _unitOfWork.Repository<Account>().AddAsync(account);
                await _unitOfWork.SaveChangesAsync();

                // Create teacher
                Teacher teacher = new Teacher(
                    createDto.FullName,
                    createDto.Email,
                    createDto.PhoneNumber,
                    createDto.DateOfBirth,
                    gender,
                    teacherCode,
                    DateTime.UtcNow
                );

                teacher.SetAccount(account.AccountID);
                if (!string.IsNullOrEmpty(createDto.DepartmentID))
                    teacher.SetDepartment(createDto.DepartmentID);

                await _unitOfWork.Repository<Teacher>().AddAsync(teacher);
                await _unitOfWork.SaveChangesAsync();

                await _unitOfWork.CommitTransactionAsync();

                return MapToDto(teacher);
            }
            catch
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }
        }

        public async Task<TeacherDto> UpdateAsync(string teacherId, UpdateTeacherDto updateDto)
        {
            Teacher? teacher = await _unitOfWork.Repository<Teacher>()
                .FirstOrDefaultAsync(t => t.Id == teacherId);

            if (teacher == null)
                throw new KeyNotFoundException($"Teacher with ID {teacherId} not found");

            // Update person info
            teacher.UpdatePersonInfo(
                updateDto.FullName,
                updateDto.Email,
                updateDto.PhoneNumber,
                teacher.DateOfBirth,
                teacher.Gender
            );

            // Update department
            if (updateDto.DepartmentID != null)
                teacher.SetDepartment(updateDto.DepartmentID);

            // Update position & degree
            if (updateDto.Position != null || updateDto.Degree != null)
                teacher.UpdatePosition(
                    updateDto.Position ?? teacher.Position,
                    updateDto.Degree ?? teacher.Degree
                );

            // Update other info
            teacher.UpdateTeacherInfo(
                updateDto.OfficeRoom,
                updateDto.ConsultingHours,
                updateDto.ResearchArea,
                null
            );

            await _unitOfWork.Repository<Teacher>().UpdateAsync(teacher);
            await _unitOfWork.SaveChangesAsync();

            return MapToDto(teacher);
        }

        public async Task<bool> DeleteAsync(string teacherId)
        {
            Teacher? teacher = await _unitOfWork.Repository<Teacher>()
                .FirstOrDefaultAsync(t => t.Id == teacherId);

            if (teacher == null)
                return false;

            // Prevent deletion if assigned to CourseSections
            bool hasSections = await _unitOfWork.Repository<CourseSection>()
                .ExistsAsync(cs => cs.TeacherID == teacherId);

            if (hasSections)
                throw new InvalidOperationException("Cannot delete teacher because they are assigned to one or more course sections.");

            await _unitOfWork.Repository<Teacher>().DeleteAsync(teacher);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }

        public async Task<int> GetTotalCountAsync()
        {
            return await _unitOfWork.Repository<Teacher>().CountAsync();
        }

        private TeacherDto MapToDto(Teacher teacher)
        {
            return new TeacherDto
            {
                TeacherID = teacher.Id,
                TeacherCode = teacher.TeacherCode,
                FullName = teacher.FullName,
                Email = teacher.Email,
                PhoneNumber = teacher.PhoneNumber,
                DepartmentID = teacher.DepartmentID,
                DepartmentName = teacher.Department?.DepartmentName,
                Position = teacher.Position,
                Degree = teacher.Degree,
                HireDate = teacher.HireDate,
                OfficeRoom = teacher.OfficeRoom,
                ConsultingHours = teacher.ConsultingHours,
                ResearchArea = teacher.ResearchArea,
                EmploymentType = teacher.EmploymentType,
                Gender = teacher.Gender.ToString(),
                DateOfBirth = teacher.DateOfBirth
            };
        }

        private async Task<string> GenerateTeacherCodeAsync()
        {
            int count = await _unitOfWork.Repository<Teacher>().CountAsync();
            return $"GV{(count + 1):D6}";
        }
    }
}
