using System.ComponentModel.DataAnnotations;

namespace VisitorManagement.API.Models.DTOs
{
    public class RoleConfigurationDto
    {
        public int Id { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string ColorClass { get; set; } = string.Empty;
        public string IconClass { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public int SortOrder { get; set; }
        public List<RolePermissionDto> Permissions { get; set; } = new();
        public List<RoleRouteDto> Routes { get; set; } = new();
    }

    public class RolePermissionDto
    {
        public int Id { get; set; }
        public int RoleConfigurationId { get; set; }
        public string PermissionName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsActive { get; set; }
    }

    public class RoleRouteDto
    {
        public int Id { get; set; }
        public int RoleConfigurationId { get; set; }
        public string RoutePath { get; set; } = string.Empty;
        public string RouteLabel { get; set; } = string.Empty;
        public string IconName { get; set; } = string.Empty;
        public int SortOrder { get; set; }
        public bool IsActive { get; set; }
    }

    public class CreateRoleConfigurationDto
    {
        [Required]
        [MaxLength(50)]
        public string RoleName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string DisplayName { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        [Required]
        [MaxLength(20)]
        public string ColorClass { get; set; } = "bg-gray-500";

        [Required]
        [MaxLength(50)]
        public string IconClass { get; set; } = "User";

        public int SortOrder { get; set; } = 0;

        public List<CreateRolePermissionDto> Permissions { get; set; } = new();
        public List<CreateRoleRouteDto> Routes { get; set; } = new();
    }

    public class CreateRolePermissionDto
    {
        [Required]
        [MaxLength(100)]
        public string PermissionName { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? Description { get; set; }
    }

    public class CreateRoleRouteDto
    {
        [Required]
        [MaxLength(200)]
        public string RoutePath { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string RouteLabel { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string IconName { get; set; } = string.Empty;

        public int SortOrder { get; set; } = 0;
    }

    public class UpdateRoleConfigurationDto
    {
        [Required]
        [MaxLength(100)]
        public string DisplayName { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        [Required]
        [MaxLength(20)]
        public string ColorClass { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string IconClass { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        public int SortOrder { get; set; } = 0;

        public List<CreateRolePermissionDto> Permissions { get; set; } = new();
        public List<CreateRoleRouteDto> Routes { get; set; } = new();
    }
}
