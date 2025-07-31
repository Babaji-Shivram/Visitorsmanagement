using AutoMapper;
using VisitorManagement.API.Models.DTOs;
using VisitorManagement.API.Models.Entities;

namespace VisitorManagement.API.Profiles
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // User mappings
            CreateMap<User, UserDto>()
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => $"{src.FirstName} {src.LastName}"));
            
            CreateMap<RegisterRequestDto, User>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.Email));

            // Location mappings
            CreateMap<Location, LocationDto>()
                .ForMember(dest => dest.VisitorCount, opt => opt.MapFrom(src => src.Visitors.Count))
                .ForMember(dest => dest.StaffCount, opt => opt.MapFrom(src => src.StaffMembers.Count));
            
            CreateMap<CreateLocationDto, Location>()
                .ForMember(dest => dest.RegistrationUrl, opt => opt.Ignore())
                .ForMember(dest => dest.QrCodeUrl, opt => opt.Ignore());
            
            CreateMap<UpdateLocationDto, Location>();

            // StaffMember mappings
            CreateMap<StaffMember, StaffMemberDto>()
                .ForMember(dest => dest.LocationName, opt => opt.MapFrom(src => src.Location.Name))
                .ForMember(dest => dest.VisitorCount, opt => opt.MapFrom(src => src.Visitors.Count));
            
            CreateMap<CreateStaffMemberDto, StaffMember>();
            CreateMap<UpdateStaffMemberDto, StaffMember>();

            // Visitor mappings
            CreateMap<Visitor, VisitorDto>()
                .ForMember(dest => dest.LocationName, opt => opt.MapFrom(src => src.Location.Name))
                .ForMember(dest => dest.CustomFields, opt => opt.Ignore()); // Handled manually in service
            
            CreateMap<CreateVisitorDto, Visitor>()
                .ForMember(dest => dest.CustomFieldValues, opt => opt.Ignore()); // Handled manually in service

            // CustomField mappings
            CreateMap<CustomField, CustomFieldDto>();
            CreateMap<CreateCustomFieldDto, CustomField>();
            CreateMap<UpdateCustomFieldDto, CustomField>();
        }
    }

    // Additional DTOs for CustomField
    public class CustomFieldDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public CustomFieldType Type { get; set; }
        public string Label { get; set; } = string.Empty;
        public string? Placeholder { get; set; }
        public bool Required { get; set; }
        public List<string>? Options { get; set; }
        public int Order { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateCustomFieldDto
    {
        public string Name { get; set; } = string.Empty;
        public CustomFieldType Type { get; set; }
        public string Label { get; set; } = string.Empty;
        public string? Placeholder { get; set; }
        public bool Required { get; set; }
        public List<string>? Options { get; set; }
        public int Order { get; set; }
    }

    public class UpdateCustomFieldDto
    {
        public string Name { get; set; } = string.Empty;
        public CustomFieldType Type { get; set; }
        public string Label { get; set; } = string.Empty;
        public string? Placeholder { get; set; }
        public bool Required { get; set; }
        public List<string>? Options { get; set; }
        public int Order { get; set; }
        public bool IsActive { get; set; }
    }
}