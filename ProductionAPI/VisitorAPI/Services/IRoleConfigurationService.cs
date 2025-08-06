using VisitorManagement.API.Models.DTOs;

namespace VisitorManagement.API.Services
{
    public interface IRoleConfigurationService
    {
        Task<IEnumerable<RoleConfigurationDto>> GetAllRoleConfigurationsAsync();
        Task<RoleConfigurationDto?> GetRoleConfigurationByIdAsync(int id);
        Task<RoleConfigurationDto?> GetRoleConfigurationByNameAsync(string roleName);
        Task<RoleConfigurationDto> CreateRoleConfigurationAsync(CreateRoleConfigurationDto createDto);
        Task<RoleConfigurationDto?> UpdateRoleConfigurationAsync(int id, UpdateRoleConfigurationDto updateDto);
        Task<bool> DeleteRoleConfigurationAsync(int id);
        Task<bool> ActivateRoleConfigurationAsync(int id);
        Task<bool> DeactivateRoleConfigurationAsync(int id);
        Task<IEnumerable<RolePermissionDto>> GetRolePermissionsAsync(int roleConfigurationId);
        Task<IEnumerable<RoleRouteDto>> GetRoleRoutesAsync(int roleConfigurationId);
        Task<bool> HasPermissionAsync(string roleName, string permissionName);
        Task SeedDefaultRoleConfigurationsAsync();
    }
}
