using AutoMapper;
using StudentManagement.Core.DTOs.Class;
using StudentManagement.Core.DTOs.Student;
using StudentManagement.Core.Entities;
using Microsoft.EntityFrameworkCore;
using StudentManagement.Core.Interfaces.Repositories;
using StudentManagement.Core.Interfaces.Services;

namespace StudentManagement.Services.Services
{
    public class ClassService : IClassService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public ClassService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<ClassDto> GetByIdAsync(string classId)
        {
            Class? classEntity = await _unitOfWork.Repository<Class>()
                .GetByIdAsync(classId);

            if (classEntity == null)
                throw new KeyNotFoundException($"Class with ID {classId} not found");

            ClassDto dto = _mapper.Map<ClassDto>(classEntity);
            dto.CurrentSize = classEntity.GetCurrentSize();
            dto.AverageGPA = classEntity.GetAverageGPA();

            return dto;
        }

        public async Task<List<ClassListDto>> GetAllAsync()
        {
            return await _unitOfWork.Repository<Class>()
                .GetQueryable()
                .Select(c => new ClassListDto
                {
                    ClassID = c.ClassID,
                    ClassName = c.ClassName,
                    AcademicYear = c.AcademicYear,
                    MajorName = c.Major != null ? c.Major.MajorName : null,
                    CurrentSize = c.Students.Count,
                    MaxCapacity = c.MaxCapacity,
                    IsFull = c.Students.Count >= c.MaxCapacity
                }).ToListAsync();
        }

        public async Task<ClassDto> CreateAsync(CreateClassDto createDto)
        {
            Class classEntity = new Class(
                createDto.ClassName,
                createDto.AcademicYear,
                createDto.StartYear
            )
            {
                MajorID = createDto.MajorID,
                AdvisorID = createDto.AdvisorID,
                MaxCapacity = createDto.MaxCapacity
            };

            await _unitOfWork.Repository<Class>().AddAsync(classEntity);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<ClassDto>(classEntity);
        }

        public async Task<ClassDto> UpdateAsync(string classId, UpdateClassDto updateDto)
        {
            Class? classEntity = await _unitOfWork.Repository<Class>()
                .GetByIdAsync(classId);

            if (classEntity == null)
                throw new KeyNotFoundException($"Class with ID {classId} not found");

            classEntity.ClassName = updateDto.ClassName;
            classEntity.AdvisorID = updateDto.AdvisorID;
            classEntity.MaxCapacity = updateDto.MaxCapacity;

            await _unitOfWork.Repository<Class>().UpdateAsync(classEntity);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<ClassDto>(classEntity);
        }

        public async Task<bool> DeleteAsync(string classId)
        {
            Class? classEntity = await _unitOfWork.Repository<Class>()
                .GetByIdAsync(classId);

            if (classEntity == null)
                return false;

            // Check if class has students
            if (classEntity.GetCurrentSize() > 0)
                throw new InvalidOperationException("Cannot delete class with students");

            await _unitOfWork.Repository<Class>().DeleteAsync(classEntity);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }

        public async Task<bool> AddStudentToClassAsync(string classId, string studentId)
        {
            Class? classEntity = await _unitOfWork.Repository<Class>()
                .GetByIdAsync(classId);

            if (classEntity == null)
                throw new KeyNotFoundException($"Class with ID {classId} not found");

            if (classEntity.IsFull())
                throw new InvalidOperationException("Class is full");

            Student? student = await _unitOfWork.Repository<Student>()
                .GetByIdAsync(studentId);

            if (student == null)
                throw new KeyNotFoundException($"Student with ID {studentId} not found");

            student.SetClassAndMajor(classId, classEntity.MajorID);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }

        public async Task<bool> RemoveStudentFromClassAsync(string classId, string studentId)
        {
            Student? student = await _unitOfWork.Repository<Student>()
                .FirstOrDefaultAsync(s => s.Id == studentId && s.ClassID == classId);

            if (student == null)
                return false;

            student.SetClassAndMajor(null, null);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }

        public async Task<List<StudentListDto>> GetClassStudentsAsync(string classId)
        {
            IEnumerable<Student> students = await _unitOfWork.Repository<Student>()
                .FindAsync(s => s.ClassID == classId);

            return _mapper.Map<List<StudentListDto>>(students);
        }

        public async Task<int> GetTotalCountAsync()
        {
            return await _unitOfWork.Repository<Class>().CountAsync();
        }
    }
}