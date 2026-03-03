using AutoMapper;
using StudentManagement.Core.DTOs.Class;
using StudentManagement.Core.DTOs.Student;
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
        }
    }
}