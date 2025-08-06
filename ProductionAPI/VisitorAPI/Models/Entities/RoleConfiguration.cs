using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VisitorManagement.API.Models.Entities
{
    public class RoleConfiguration
    {
        [Key]
        public int Id { get; set; }

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

        public bool IsActive { get; set; } = true;

        public int SortOrder { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
        public virtual ICollection<RoleRoute> RoleRoutes { get; set; } = new List<RoleRoute>();
    }

    public class RolePermission
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int RoleConfigurationId { get; set; }

        [Required]
        [MaxLength(100)]
        public string PermissionName { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;

        // Navigation properties
        [ForeignKey("RoleConfigurationId")]
        public virtual RoleConfiguration RoleConfiguration { get; set; } = null!;
    }

    public class RoleRoute
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int RoleConfigurationId { get; set; }

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

        public bool IsActive { get; set; } = true;

        // Navigation properties
        [ForeignKey("RoleConfigurationId")]
        public virtual RoleConfiguration RoleConfiguration { get; set; } = null!;
    }
}
