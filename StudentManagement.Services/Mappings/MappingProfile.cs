using AutoMapper;
using StudentManagement.Core.DTOs.Class;
using StudentManagement.Core.DTOs.Grade;
using StudentManagement.Core.DTOs.Student;
using StudentManagement.Core.DTOs.Teacher;
using StudentManagement.Core.Entities;

namespace StudentManagement.Services.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Student -> StudentDto
            CreateMap<Student, StudentDto>()
                .ForMember(dest => dest.StudentID, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.ClassName, opt => opt.MapFrom(src => src.Class != null ? src.Class.ClassName : null))
                .ForMember(dest => dest.MajorName, opt => opt.MapFrom(src => src.MajorID))
                .ForMember(dest => dest.Gender, opt => opt.MapFrom(src => src.Gender.ToString()))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));

            // Student -> StudentListDto
            CreateMap<Student, StudentListDto>()
                .ForMember(dest => dest.StudentID, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.ClassName, opt => opt.MapFrom(src => src.Class != null ? src.Class.ClassName : null));

            CreateMap<CreateStudentDto, Student>();

            // Class -> ClassDto
            CreateMap<Class, ClassDto>()
                .ForMember(dest => dest.MajorName, opt => opt.MapFrom(src => src.Major != null ? src.Major.MajorName : null))
                .ForMember(dest => dest.AdvisorName, opt => opt.MapFrom(src => src.Advisor != null ? src.Advisor.FullName : null));

            CreateMap<CreateClassDto, Class>();
            CreateMap<UpdateClassDto, Class>();

            // Grade -> GradeDto
            CreateMap<Grade, GradeDto>()
                .ForMember(dest => dest.StudentCode, opt => opt.MapFrom(src => src.Student != null ? src.Student.StudentCode : null))
                .ForMember(dest => dest.StudentName, opt => opt.MapFrom(src => src.Student != null ? src.Student.FullName : null))
                .ForMember(dest => dest.SubjectCode, opt => opt.MapFrom(src => src.Subject != null ? src.Subject.SubjectCode : null))
                .ForMember(dest => dest.SubjectName, opt => opt.MapFrom(src => src.Subject != null ? src.Subject.SubjectName : null))
                .ForMember(dest => dest.Credits, opt => opt.MapFrom(src => src.Subject != null ? src.Subject.Credits : 0));

            // Teacher -> TeacherDto
            CreateMap<Teacher, TeacherDto>()
                .ForMember(dest => dest.TeacherID, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.DepartmentName, opt => opt.MapFrom(src => src.Department != null ? src.Department.DepartmentName : null))
                .ForMember(dest => dest.Gender, opt => opt.MapFrom(src => src.Gender.ToString()));

            // Teacher -> TeacherListDto
            CreateMap<Teacher, TeacherListDto>()
                .ForMember(dest => dest.TeacherID, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.DepartmentName, opt => opt.MapFrom(src => src.Department != null ? src.Department.DepartmentName : null));

            CreateMap<CreateTeacherDto, Teacher>();
            CreateMap<UpdateTeacherDto, Teacher>();
        }
    }
}