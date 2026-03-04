using StudentManagement.Core.Entities;

namespace StudentManagement.Services.Interfaces;

public interface IStudentService
{
    Task<List<Student>> GetAll();
    Task<Student?> GetById(int id);
    Task<Student> Create(Student student);
    Task Update(int id, Student student);
    Task Delete(int id);
}