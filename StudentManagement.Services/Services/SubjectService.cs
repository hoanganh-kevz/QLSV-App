using System.Text.Json;
using AutoMapper;
using StudentManagement.Core.DTOs.Subject;
using StudentManagement.Core.Entities;
using StudentManagement.Core.Interfaces.Repositories;
using StudentManagement.Core.Interfaces.Services;

namespace StudentManagement.Services.Services
{
    public class SubjectService : ISubjectService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public SubjectService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<SubjectDto> GetByIdAsync(string subjectId)
        {
            Subject? subject = await _unitOfWork.Repository<Subject>()
                .FirstOrDefaultAsync(s => s.SubjectID == subjectId);

            if (subject == null)
                throw new KeyNotFoundException($"Subject with ID {subjectId} not found");

            return MapToDto(subject);
        }

        public async Task<SubjectDto> GetByCodeAsync(string subjectCode)
        {
            Subject? subject = await _unitOfWork.Repository<Subject>()
                .FirstOrDefaultAsync(s => s.SubjectCode == subjectCode);

            if (subject == null)
                throw new KeyNotFoundException($"Subject with code {subjectCode} not found");

            return MapToDto(subject);
        }

        public async Task<List<SubjectListDto>> GetAllAsync()
        {
            IEnumerable<Subject> subjects = await _unitOfWork.Repository<Subject>().GetAllAsync();

            return subjects.Select(s => new SubjectListDto
            {
                SubjectID = s.SubjectID,
                SubjectCode = s.SubjectCode,
                SubjectName = s.SubjectName,
                Credits = s.Credits,
                SubjectType = s.SubjectType,
                DepartmentName = s.Department?.DepartmentName
            }).ToList();
        }

        public async Task<List<SubjectListDto>> GetByDepartmentAsync(string departmentId)
        {
            IEnumerable<Subject> subjects = await _unitOfWork.Repository<Subject>()
                .FindAsync(s => s.DepartmentID == departmentId);

            return subjects.Select(s => new SubjectListDto
            {
                SubjectID = s.SubjectID,
                SubjectCode = s.SubjectCode,
                SubjectName = s.SubjectName,
                Credits = s.Credits,
                SubjectType = s.SubjectType,
                DepartmentName = s.Department?.DepartmentName
            }).ToList();
        }

        public async Task<SubjectDto> CreateAsync(CreateSubjectDto createDto)
        {
            // Check if subject code already exists
            if (await _unitOfWork.Repository<Subject>()
                .ExistsAsync(s => s.SubjectCode == createDto.SubjectCode))
            {
                throw new InvalidOperationException($"Subject code {createDto.SubjectCode} already exists");
            }

            Subject subject = new Subject(createDto.SubjectCode, createDto.SubjectName, createDto.Credits)
            {
                TheoryHours = createDto.TheoryHours,
                PracticeHours = createDto.PracticeHours,
                SubjectType = createDto.SubjectType,
                DepartmentID = createDto.DepartmentID,
                Description = createDto.Description,
                Prerequisites = createDto.Prerequisites != null
                    ? JsonSerializer.Serialize(createDto.Prerequisites)
                    : null
            };

            await _unitOfWork.Repository<Subject>().AddAsync(subject);
            await _unitOfWork.SaveChangesAsync();

            return MapToDto(subject);
        }

        public async Task<SubjectDto> UpdateAsync(string subjectId, UpdateSubjectDto updateDto)
        {
            Subject? subject = await _unitOfWork.Repository<Subject>()
                .FirstOrDefaultAsync(s => s.SubjectID == subjectId);

            if (subject == null)
                throw new KeyNotFoundException($"Subject with ID {subjectId} not found");

            subject.SubjectName = updateDto.SubjectName;
            subject.Credits = updateDto.Credits;
            subject.TheoryHours = updateDto.TheoryHours;
            subject.PracticeHours = updateDto.PracticeHours;
            subject.SubjectType = updateDto.SubjectType;
            subject.DepartmentID = updateDto.DepartmentID;
            subject.Description = updateDto.Description;
            subject.Prerequisites = updateDto.Prerequisites != null
                ? JsonSerializer.Serialize(updateDto.Prerequisites)
                : null;

            await _unitOfWork.Repository<Subject>().UpdateAsync(subject);
            await _unitOfWork.SaveChangesAsync();

            return MapToDto(subject);
        }

        public async Task<bool> DeleteAsync(string subjectId)
        {
            Subject? subject = await _unitOfWork.Repository<Subject>()
                .FirstOrDefaultAsync(s => s.SubjectID == subjectId);

            if (subject == null)
                return false;

            await _unitOfWork.Repository<Subject>().DeleteAsync(subject);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }

        public async Task<bool> ExistsAsync(string subjectCode)
        {
            return await _unitOfWork.Repository<Subject>()
                .ExistsAsync(s => s.SubjectCode == subjectCode);
        }

        public async Task<int> GetTotalCountAsync()
        {
            return await _unitOfWork.Repository<Subject>().CountAsync();
        }

        private SubjectDto MapToDto(Subject subject)
        {
            return new SubjectDto
            {
                SubjectID = subject.SubjectID,
                SubjectCode = subject.SubjectCode,
                SubjectName = subject.SubjectName,
                Credits = subject.Credits,
                TheoryHours = subject.TheoryHours,
                PracticeHours = subject.PracticeHours,
                TotalHours = subject.GetTotalHours(),
                SubjectType = subject.SubjectType,
                DepartmentID = subject.DepartmentID,
                DepartmentName = subject.Department?.DepartmentName,
                Description = subject.Description,
                Prerequisites = subject.GetPrerequisiteList()
            };
        }
    }
}
