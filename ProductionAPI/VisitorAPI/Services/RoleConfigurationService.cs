using AutoMapper;
using Microsoft.EntityFrameworkCore;
using VisitorManagement.API.Data;
using VisitorManagement.API.Models.DTOs;
using VisitorManagement.API.Models.Entities;

namespace VisitorManagement.API.Services
{
    public class RoleConfigurationService : IRoleConfigurationService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<RoleConfigurationService> _logger;

        public RoleConfigurationService(
            ApplicationDbContext context,
            IMapper mapper,
            ILogger<RoleConfigurationService> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<IEnumerable<RoleConfigurationDto>> GetAllRoleConfigurationsAsync()
        {
            try
            {
                var roles = await _context.RoleConfigurations
                    .Include(r => r.RolePermissions.Where(p => p.IsActive))
                    .Include(r => r.RoleRoutes.Where(r => r.IsActive))
                    .OrderBy(r => r.SortOrder)
                    .ToListAsync();

                return _mapper.Map<IEnumerable<RoleConfigurationDto>>(roles);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving role configurations");
                throw;
            }
        }

        public async Task<RoleConfigurationDto?> GetRoleConfigurationByIdAsync(int id)
        {
            try
            {
                var role = await _context.RoleConfigurations
                    .Include(r => r.RolePermissions.Where(p => p.IsActive))
                    .Include(r => r.RoleRoutes.Where(r => r.IsActive))
                    .FirstOrDefaultAsync(r => r.Id == id);

                return role != null ? _mapper.Map<RoleConfigurationDto>(role) : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving role configuration with ID {Id}", id);
                throw;
            }
        }

        public async Task<RoleConfigurationDto?> GetRoleConfigurationByNameAsync(string roleName)
        {
            try
            {
                var role = await _context.RoleConfigurations
                    .Include(r => r.RolePermissions.Where(p => p.IsActive))
                    .Include(r => r.RoleRoutes.Where(r => r.IsActive))
                    .FirstOrDefaultAsync(r => r.RoleName.ToLower() == roleName.ToLower() && r.IsActive);

                return role != null ? _mapper.Map<RoleConfigurationDto>(role) : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving role configuration with name {RoleName}", roleName);
                throw;
            }
        }

        public async Task<RoleConfigurationDto> CreateRoleConfigurationAsync(CreateRoleConfigurationDto createDto)
        {
            try
            {
                // Check if role name already exists
                var existingRole = await _context.RoleConfigurations
                    .FirstOrDefaultAsync(r => r.RoleName.ToLower() == createDto.RoleName.ToLower());

                if (existingRole != null)
                {
                    throw new InvalidOperationException($"Role configuration with name '{createDto.RoleName}' already exists");
                }

                var roleConfig = _mapper.Map<RoleConfiguration>(createDto);
                roleConfig.CreatedAt = DateTime.UtcNow;
                roleConfig.UpdatedAt = DateTime.UtcNow;

                _context.RoleConfigurations.Add(roleConfig);
                await _context.SaveChangesAsync();

                return _mapper.Map<RoleConfigurationDto>(roleConfig);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating role configuration");
                throw;
            }
        }

        public async Task<RoleConfigurationDto?> UpdateRoleConfigurationAsync(int id, UpdateRoleConfigurationDto updateDto)
        {
            try
            {
                var roleConfig = await _context.RoleConfigurations
                    .Include(r => r.RolePermissions)
                    .Include(r => r.RoleRoutes)
                    .FirstOrDefaultAsync(r => r.Id == id);

                if (roleConfig == null)
                {
                    return null;
                }

                // Update basic properties
                roleConfig.DisplayName = updateDto.DisplayName;
                roleConfig.Description = updateDto.Description;
                roleConfig.ColorClass = updateDto.ColorClass;
                roleConfig.IconClass = updateDto.IconClass;
                roleConfig.IsActive = updateDto.IsActive;
                roleConfig.SortOrder = updateDto.SortOrder;
                roleConfig.UpdatedAt = DateTime.UtcNow;

                // Update permissions - remove existing and add new ones
                _context.RolePermissions.RemoveRange(roleConfig.RolePermissions);
                
                foreach (var permDto in updateDto.Permissions)
                {
                    roleConfig.RolePermissions.Add(new RolePermission
                    {
                        PermissionName = permDto.PermissionName,
                        Description = permDto.Description,
                        IsActive = true
                    });
                }

                // Update routes - remove existing and add new ones
                _context.RoleRoutes.RemoveRange(roleConfig.RoleRoutes);
                
                foreach (var routeDto in updateDto.Routes)
                {
                    roleConfig.RoleRoutes.Add(new RoleRoute
                    {
                        RoutePath = routeDto.RoutePath,
                        RouteLabel = routeDto.RouteLabel,
                        IconName = routeDto.IconName,
                        SortOrder = routeDto.SortOrder,
                        IsActive = true
                    });
                }

                await _context.SaveChangesAsync();

                return _mapper.Map<RoleConfigurationDto>(roleConfig);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating role configuration with ID {Id}", id);
                throw;
            }
        }

        public async Task<bool> DeleteRoleConfigurationAsync(int id)
        {
            try
            {
                var roleConfig = await _context.RoleConfigurations.FindAsync(id);
                if (roleConfig == null)
                {
                    return false;
                }

                // Check if any users are using this role configuration
                var usersWithRole = await _context.Users
                    .AnyAsync(u => u.RoleConfigurationId == id);

                if (usersWithRole)
                {
                    throw new InvalidOperationException("Cannot delete role configuration that is assigned to users");
                }

                _context.RoleConfigurations.Remove(roleConfig);
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting role configuration with ID {Id}", id);
                throw;
            }
        }

        public async Task<bool> ActivateRoleConfigurationAsync(int id)
        {
            return await UpdateRoleStatusAsync(id, true);
        }

        public async Task<bool> DeactivateRoleConfigurationAsync(int id)
        {
            return await UpdateRoleStatusAsync(id, false);
        }

        private async Task<bool> UpdateRoleStatusAsync(int id, bool isActive)
        {
            try
            {
                var roleConfig = await _context.RoleConfigurations.FindAsync(id);
                if (roleConfig == null)
                {
                    return false;
                }

                roleConfig.IsActive = isActive;
                roleConfig.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating role status for ID {Id}", id);
                throw;
            }
        }

        public async Task<IEnumerable<RolePermissionDto>> GetRolePermissionsAsync(int roleConfigurationId)
        {
            try
            {
                var permissions = await _context.RolePermissions
                    .Where(p => p.RoleConfigurationId == roleConfigurationId && p.IsActive)
                    .ToListAsync();

                return _mapper.Map<IEnumerable<RolePermissionDto>>(permissions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving permissions for role configuration {Id}", roleConfigurationId);
                throw;
            }
        }

        public async Task<IEnumerable<RoleRouteDto>> GetRoleRoutesAsync(int roleConfigurationId)
        {
            try
            {
                var routes = await _context.RoleRoutes
                    .Where(r => r.RoleConfigurationId == roleConfigurationId && r.IsActive)
                    .OrderBy(r => r.SortOrder)
                    .ToListAsync();

                return _mapper.Map<IEnumerable<RoleRouteDto>>(routes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving routes for role configuration {Id}", roleConfigurationId);
                throw;
            }
        }

        public async Task<bool> HasPermissionAsync(string roleName, string permissionName)
        {
            try
            {
                var hasPermission = await _context.RoleConfigurations
                    .Where(r => r.RoleName.ToLower() == roleName.ToLower() && r.IsActive)
                    .SelectMany(r => r.RolePermissions)
                    .AnyAsync(p => p.PermissionName.ToLower() == permissionName.ToLower() && p.IsActive);

                return hasPermission;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking permission {Permission} for role {Role}", permissionName, roleName);
                throw;
            }
        }

        public async Task SeedDefaultRoleConfigurationsAsync()
        {
            try
            {
                // Check if any role configurations exist
                var existingRoles = await _context.RoleConfigurations.AnyAsync();
                if (existingRoles)
                {
                    _logger.LogInformation("Role configurations already exist, skipping seed");
                    return;
                }

                var defaultRoles = new List<RoleConfiguration>
                {
                    new RoleConfiguration
                    {
                        RoleName = "reception",
                        DisplayName = "Receptionist",
                        Description = "Front desk staff responsible for visitor registration and management",
                        ColorClass = "bg-blue-500",
                        IconClass = "Users",
                        SortOrder = 1,
                        RolePermissions = new List<RolePermission>
                        {
                            new RolePermission { PermissionName = "visitor_registration", Description = "Register new visitors" },
                            new RolePermission { PermissionName = "visitor_management", Description = "Manage visitor check-in/out" },
                            new RolePermission { PermissionName = "view_statistics", Description = "View visitor statistics" }
                        },
                        RoleRoutes = new List<RoleRoute>
                        {
                            new RoleRoute { RoutePath = "/register", RouteLabel = "Register Visitor", IconName = "UserPlus", SortOrder = 1 },
                            new RoleRoute { RoutePath = "/reception", RouteLabel = "Reception Dashboard", IconName = "Users", SortOrder = 2 }
                        }
                    },
                    new RoleConfiguration
                    {
                        RoleName = "admin",
                        DisplayName = "Administrator",
                        Description = "System administrator with full access to all features",
                        ColorClass = "bg-purple-500",
                        IconClass = "Shield",
                        SortOrder = 2,
                        RolePermissions = new List<RolePermission>
                        {
                            new RolePermission { PermissionName = "all", Description = "Full system access" },
                            new RolePermission { PermissionName = "user_management", Description = "Manage system users" },
                            new RolePermission { PermissionName = "system_settings", Description = "Configure system settings" },
                            new RolePermission { PermissionName = "location_management", Description = "Manage locations" },
                            new RolePermission { PermissionName = "staff_management", Description = "Manage staff members" }
                        },
                        RoleRoutes = new List<RoleRoute>
                        {
                            new RoleRoute { RoutePath = "/register", RouteLabel = "Register Visitor", IconName = "UserPlus", SortOrder = 1 },
                            new RoleRoute { RoutePath = "/admin", RouteLabel = "Admin Dashboard", IconName = "Shield", SortOrder = 2 },
                            new RoleRoute { RoutePath = "/settings", RouteLabel = "Settings", IconName = "Settings", SortOrder = 3 }
                        }
                    },
                    new RoleConfiguration
                    {
                        RoleName = "staff",
                        DisplayName = "Staff Member",
                        Description = "Regular staff member who can approve/reject visitor requests",
                        ColorClass = "bg-green-500",
                        IconClass = "UserCheck",
                        SortOrder = 3,
                        RolePermissions = new List<RolePermission>
                        {
                            new RolePermission { PermissionName = "approve_visitors", Description = "Approve visitor requests" },
                            new RolePermission { PermissionName = "reject_visitors", Description = "Reject visitor requests" },
                            new RolePermission { PermissionName = "view_visitors", Description = "View visitor information" }
                        },
                        RoleRoutes = new List<RoleRoute>
                        {
                            new RoleRoute { RoutePath = "/register", RouteLabel = "Register Visitor", IconName = "UserPlus", SortOrder = 1 },
                            new RoleRoute { RoutePath = "/approval", RouteLabel = "Approvals", IconName = "UserCheck", SortOrder = 2 }
                        }
                    }
                };

                _context.RoleConfigurations.AddRange(defaultRoles);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Default role configurations seeded successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error seeding default role configurations");
                throw;
            }
        }
    }
}
