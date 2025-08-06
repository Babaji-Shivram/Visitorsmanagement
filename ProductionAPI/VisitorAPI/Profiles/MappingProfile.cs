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
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => $"{src.FirstName} {src.LastName}"))
                .ForMember(dest => dest.RoleConfigurationId, opt => opt.MapFrom(src => src.RoleConfigurationId));
            
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

            // RoleConfiguration mappings
            CreateMap<RoleConfiguration, RoleConfigurationDto>()
                .ForMember(dest => dest.Permissions, opt => opt.MapFrom(src => src.RolePermissions))
                .ForMember(dest => dest.Routes, opt => opt.MapFrom(src => src.RoleRoutes));
            
            CreateMap<CreateRoleConfigurationDto, RoleConfiguration>()
                .ForMember(dest => dest.RolePermissions, opt => opt.MapFrom(src => src.Permissions))
                .ForMember(dest => dest.RoleRoutes, opt => opt.MapFrom(src => src.Routes));

            // RolePermission mappings
            CreateMap<RolePermission, RolePermissionDto>();
            CreateMap<CreateRolePermissionDto, RolePermission>();

            // RoleRoute mappings
            CreateMap<RoleRoute, RoleRouteDto>();
            CreateMap<CreateRoleRouteDto, RoleRoute>();
        }
    }
}