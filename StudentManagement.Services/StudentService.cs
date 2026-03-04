using StudentManagement.Core.Entities;
using StudentManagement.Core.Interfaces;
using StudentManagement.Services.Interfaces;

namespace StudentManagement.Services;

public class StudentService : IStudentService
{
    private readonly IStudentRepository _repository;

    public StudentService(IStudentRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<Student>> GetAll()
        => await _repository.GetAllAsync();

    public async Task<Student?> GetById(int id)
        => await _repository.GetByIdAsync(id);

    public async Task<Student> Create(Student student)
    {
        await _repository.AddAsync(student);
        return student;
    }

    public async Task Update(int id, Student student)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing == null)
            throw new Exception("Student not found");

        existing.FullName = student.FullName;
        existing.DateOfBirth = student.DateOfBirth;
        existing.Email = student.Email;
        existing.StudentCode = student.StudentCode;
        existing.Status = student.Status;
        existing.ClassId = student.ClassId;

        await _repository.UpdateAsync(existing);
    }

    public async Task Delete(int id)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing == null)
            throw new Exception("Student not found");

        await _repository.DeleteAsync(existing);
    }
}