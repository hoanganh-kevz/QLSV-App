using AutoMapper;
using StudentManagement.Core.DTOs.Student;
using StudentManagement.Core.Entities;

namespace StudentManagement.Services.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Student mappings
            CreateMap<Student, StudentDto>()
                .ForMember(dest => dest.ClassName, opt => opt.MapFrom(src => src.ClassID))
                .ForMember(dest => dest.MajorName, opt => opt.MapFrom(src => src.MajorID))
                .ForMember(dest => dest.Gender, opt => opt.MapFrom(src => src.Gender.ToString()))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));

            CreateMap<Student, StudentListDto>()
                .ForMember(dest => dest.ClassName, opt => opt.MapFrom(src => src.ClassID));

            CreateMap<CreateStudentDto, Student>();
            CreateMap<UpdateStudentDto, Student>();
        }
    }
}