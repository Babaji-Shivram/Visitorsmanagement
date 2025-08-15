using Microsoft.AspNetCore.Mvc;

namespace SimpleAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class RoleConfigurationController : ControllerBase
    {
        // Mock role configuration data - comprehensive role management
        private static List<object> _roleConfigurations = new List<object>
        {
            new {
                id = 1,
                roleName = "admin",
                displayName = "Administrator",
                description = "Full system access with all administrative privileges",
                permissions = new[] { 
                    "all", "users.manage", "settings.manage", "locations.manage", 
                    "staff.manage", "visitors.manage", "reports.view", "system.configure",
                    "roles.manage", "audit.view", "backup.manage", "integrations.manage"
                },
                modules = new[] {
                    "dashboard", "visitor-management", "staff-management", "location-management",
                    "user-management", "settings", "reports", "audit-logs", "system-health"
                },
                isActive = true,
                isSystemRole = true,
                priority = 1,
                maxUsers = -1, // unlimited
                features = new {
                    canCreateUsers = true,
                    canDeleteUsers = true,
                    canModifySettings = true,
                    canViewReports = true,
                    canExportData = true,
                    canManageRoles = true,
                    canViewAuditLogs = true,
                    canManageIntegrations = true
                },
                restrictions = new {
                    ipWhitelist = new string[] { },
                    timeRestrictions = new { },
                    locationRestrictions = new string[] { }
                },
                createdDate = DateTime.Now.AddMonths(-12).ToString("o"),
                lastUpdated = DateTime.Now.AddDays(-1).ToString("o"),
                createdBy = "System"
            },
            new {
                id = 2,
                roleName = "reception",
                displayName = "Reception Staff",
                description = "Front desk operations including visitor registration and management",
                permissions = new[] { 
                    "visitors.create", "visitors.read", "visitors.update", "visitors.checkin",
                    "visitors.checkout", "visitors.approve", "staff.read", "locations.read",
                    "dashboard.view", "reports.basic", "notifications.manage"
                },
                modules = new[] {
                    "dashboard", "visitor-registration", "visitor-management", "check-in-out",
                    "staff-directory", "notifications", "basic-reports"
                },
                isActive = true,
                isSystemRole = true,
                priority = 2,
                maxUsers = 50,
                features = new {
                    canCreateUsers = false,
                    canDeleteUsers = false,
                    canModifySettings = false,
                    canViewReports = true,
                    canExportData = true,
                    canManageRoles = false,
                    canViewAuditLogs = false,
                    canManageIntegrations = false
                },
                restrictions = new {
                    ipWhitelist = new string[] { },
                    timeRestrictions = new {
                        allowedHours = new { start = "06:00", end = "22:00" },
                        allowedDays = new[] { "monday", "tuesday", "wednesday", "thursday", "friday", "saturday" }
                    },
                    locationRestrictions = new string[] { }
                },
                createdDate = DateTime.Now.AddMonths(-12).ToString("o"),
                lastUpdated = DateTime.Now.AddDays(-5).ToString("o"),
                createdBy = "System"
            },
            new {
                id = 3,
                roleName = "staff",
                displayName = "Staff Member",
                description = "Regular staff members who can view visitors and basic information",
                permissions = new[] { 
                    "visitors.read", "visitors.approve", "profile.update", "dashboard.view",
                    "notifications.read", "directory.read"
                },
                modules = new[] {
                    "dashboard", "visitor-directory", "notifications", "profile", "staff-directory"
                },
                isActive = true,
                isSystemRole = true,
                priority = 3,
                maxUsers = 500,
                features = new {
                    canCreateUsers = false,
                    canDeleteUsers = false,
                    canModifySettings = false,
                    canViewReports = false,
                    canExportData = false,
                    canManageRoles = false,
                    canViewAuditLogs = false,
                    canManageIntegrations = false
                },
                restrictions = new {
                    ipWhitelist = new string[] { },
                    timeRestrictions = new {
                        allowedHours = new { start = "07:00", end = "19:00" },
                        allowedDays = new[] { "monday", "tuesday", "wednesday", "thursday", "friday" }
                    },
                    locationRestrictions = new string[] { }
                },
                createdDate = DateTime.Now.AddMonths(-12).ToString("o"),
                lastUpdated = DateTime.Now.AddDays(-10).ToString("o"),
                createdBy = "System"
            },
            new {
                id = 4,
                roleName = "security",
                displayName = "Security Personnel",
                description = "Security staff with enhanced monitoring and approval capabilities",
                permissions = new[] { 
                    "visitors.read", "visitors.approve", "visitors.reject", "visitors.checkin",
                    "visitors.checkout", "security.monitor", "alerts.manage", "incidents.create",
                    "dashboard.view", "reports.security", "locations.read"
                },
                modules = new[] {
                    "dashboard", "visitor-management", "security-monitoring", "alerts", 
                    "incident-reports", "visitor-approval", "check-in-out"
                },
                isActive = true,
                isSystemRole = false,
                priority = 2,
                maxUsers = 20,
                features = new {
                    canCreateUsers = false,
                    canDeleteUsers = false,
                    canModifySettings = false,
                    canViewReports = true,
                    canExportData = true,
                    canManageRoles = false,
                    canViewAuditLogs = true,
                    canManageIntegrations = false
                },
                restrictions = new {
                    ipWhitelist = new string[] { },
                    timeRestrictions = new { },
                    locationRestrictions = new string[] { }
                },
                createdDate = DateTime.Now.AddMonths(-6).ToString("o"),
                lastUpdated = DateTime.Now.AddDays(-2).ToString("o"),
                createdBy = "admin@company.com"
            },
            new {
                id = 5,
                roleName = "manager",
                displayName = "Department Manager",
                description = "Department managers with reporting and staff oversight capabilities",
                permissions = new[] { 
                    "visitors.read", "visitors.approve", "staff.read", "reports.advanced",
                    "dashboard.view", "analytics.view", "locations.read", "settings.view",
                    "export.data", "notifications.manage"
                },
                modules = new[] {
                    "dashboard", "visitor-management", "staff-directory", "advanced-reports",
                    "analytics", "visitor-approval", "notifications"
                },
                isActive = true,
                isSystemRole = false,
                priority = 2,
                maxUsers = 30,
                features = new {
                    canCreateUsers = false,
                    canDeleteUsers = false,
                    canModifySettings = false,
                    canViewReports = true,
                    canExportData = true,
                    canManageRoles = false,
                    canViewAuditLogs = true,
                    canManageIntegrations = false
                },
                restrictions = new {
                    ipWhitelist = new string[] { },
                    timeRestrictions = new {
                        allowedHours = new { start = "06:00", end = "20:00" },
                        allowedDays = new[] { "monday", "tuesday", "wednesday", "thursday", "friday", "saturday" }
                    },
                    locationRestrictions = new string[] { }
                },
                createdDate = DateTime.Now.AddMonths(-3).ToString("o"),
                lastUpdated = DateTime.Now.AddDays(-7).ToString("o"),
                createdBy = "admin@company.com"
            }
        };

        // Available permissions for role creation/editing
        private static readonly string[] _availablePermissions = {
            "all", "users.manage", "settings.manage", "locations.manage", "staff.manage",
            "visitors.manage", "visitors.create", "visitors.read", "visitors.update", 
            "visitors.delete", "visitors.approve", "visitors.reject", "visitors.checkin",
            "visitors.checkout", "reports.view", "reports.basic", "reports.advanced",
            "reports.security", "system.configure", "roles.manage", "audit.view",
            "backup.manage", "integrations.manage", "dashboard.view", "analytics.view",
            "notifications.read", "notifications.manage", "profile.update", 
            "directory.read", "security.monitor", "alerts.manage", "incidents.create",
            "export.data", "settings.view"
        };

        // Available modules for role configuration
        private static readonly string[] _availableModules = {
            "dashboard", "visitor-management", "visitor-registration", "visitor-directory",
            "check-in-out", "visitor-approval", "staff-management", "staff-directory",
            "location-management", "user-management", "settings", "reports", "basic-reports",
            "advanced-reports", "audit-logs", "system-health", "notifications", "profile",
            "analytics", "security-monitoring", "alerts", "incident-reports"
        };

        [HttpGet]
        public IActionResult GetRoleConfigurations([FromQuery] bool? activeOnly = null, [FromQuery] bool? systemRoles = null)
        {
            var filteredRoles = _roleConfigurations.AsEnumerable();
            
            if (activeOnly.HasValue && activeOnly.Value)
            {
                filteredRoles = filteredRoles.Where(r => ((dynamic)r).isActive == true);
            }
            
            if (systemRoles.HasValue)
            {
                filteredRoles = filteredRoles.Where(r => ((dynamic)r).isSystemRole == systemRoles.Value);
            }
            
            return Ok(filteredRoles.ToList());
        }

        [HttpGet("active")]
        public IActionResult GetActiveRoles()
        {
            var activeRoles = _roleConfigurations.Where(r => ((dynamic)r).isActive == true).ToList();
            return Ok(activeRoles);
        }

        [HttpGet("permissions")]
        public IActionResult GetAvailablePermissions()
        {
            var permissionCategories = new
            {
                userManagement = new[] { "users.manage" },
                visitorManagement = new[] { 
                    "visitors.manage", "visitors.create", "visitors.read", "visitors.update", 
                    "visitors.delete", "visitors.approve", "visitors.reject", "visitors.checkin", "visitors.checkout" 
                },
                staffManagement = new[] { "staff.manage", "staff.read", "directory.read" },
                locationManagement = new[] { "locations.manage", "locations.read" },
                systemManagement = new[] { 
                    "settings.manage", "settings.view", "system.configure", "roles.manage", 
                    "backup.manage", "integrations.manage" 
                },
                reporting = new[] { 
                    "reports.view", "reports.basic", "reports.advanced", "reports.security", 
                    "analytics.view", "export.data" 
                },
                security = new[] { 
                    "security.monitor", "alerts.manage", "incidents.create", "audit.view" 
                },
                general = new[] { 
                    "dashboard.view", "notifications.read", "notifications.manage", "profile.update", "all" 
                },
                allPermissions = _availablePermissions
            };
            
            return Ok(permissionCategories);
        }

        [HttpGet("modules")]
        public IActionResult GetAvailableModules()
        {
            var moduleCategories = new
            {
                core = new[] { "dashboard", "profile", "notifications" },
                visitorManagement = new[] { 
                    "visitor-management", "visitor-registration", "visitor-directory", 
                    "check-in-out", "visitor-approval" 
                },
                staffManagement = new[] { "staff-management", "staff-directory" },
                administration = new[] { 
                    "location-management", "user-management", "settings", "roles-management" 
                },
                reporting = new[] { "reports", "basic-reports", "advanced-reports", "analytics" },
                security = new[] { 
                    "security-monitoring", "alerts", "incident-reports", "audit-logs" 
                },
                system = new[] { "system-health" },
                allModules = _availableModules
            };
            
            return Ok(moduleCategories);
        }

        [HttpGet("{id}")]
        public IActionResult GetRoleConfiguration(int id)
        {
            var roleConfig = _roleConfigurations.FirstOrDefault(r => ((dynamic)r).id == id);
            if (roleConfig == null)
                return NotFound(new { message = "Role configuration not found" });

            return Ok(roleConfig);
        }

        [HttpGet("role/{roleName}")]
        public IActionResult GetRoleByName(string roleName)
        {
            var roleConfig = _roleConfigurations.FirstOrDefault(r => ((dynamic)r).roleName == roleName);
            if (roleConfig == null)
                return NotFound(new { message = "Role not found" });

            return Ok(roleConfig);
        }

        [HttpPost]
        public IActionResult CreateRoleConfiguration([FromBody] dynamic roleConfigData)
        {
            try
            {
                var roleName = (string)(roleConfigData.roleName ?? "");
                
                // Validate role name uniqueness
                if (string.IsNullOrEmpty(roleName))
                    return BadRequest(new { message = "Role name is required" });
                
                var existingRole = _roleConfigurations.FirstOrDefault(r => ((dynamic)r).roleName == roleName);
                if (existingRole != null)
                    return Conflict(new { message = "Role name already exists" });
                
                var newId = _roleConfigurations.Count + 1;
                var newRole = new {
                    id = newId,
                    roleName = roleName,
                    displayName = (string)(roleConfigData.displayName ?? roleName),
                    description = (string)(roleConfigData.description ?? "Custom role"),
                    permissions = roleConfigData.permissions ?? new[] { "dashboard.view" },
                    modules = roleConfigData.modules ?? new[] { "dashboard" },
                    isActive = (bool)(roleConfigData.isActive ?? true),
                    isSystemRole = false,
                    priority = (int)(roleConfigData.priority ?? 5),
                    maxUsers = (int)(roleConfigData.maxUsers ?? 10),
                    features = roleConfigData.features ?? new {
                        canCreateUsers = false,
                        canDeleteUsers = false,
                        canModifySettings = false,
                        canViewReports = false,
                        canExportData = false,
                        canManageRoles = false,
                        canViewAuditLogs = false,
                        canManageIntegrations = false
                    },
                    restrictions = roleConfigData.restrictions ?? new {
                        ipWhitelist = new string[] { },
                        timeRestrictions = new { },
                        locationRestrictions = new string[] { }
                    },
                    createdDate = DateTime.Now.ToString("o"),
                    lastUpdated = DateTime.Now.ToString("o"),
                    createdBy = "admin@company.com" // In real system, get from auth context
                };
                
                _roleConfigurations.Add(newRole);
                return CreatedAtAction(nameof(GetRoleConfiguration), new { id = newId }, newRole);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Invalid role configuration data", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public IActionResult UpdateRoleConfiguration(int id, [FromBody] dynamic roleConfigData)
        {
            var roleIndex = _roleConfigurations.FindIndex(r => ((dynamic)r).id == id);
            if (roleIndex == -1)
                return NotFound(new { message = "Role configuration not found" });
            
            var oldRole = (dynamic)_roleConfigurations[roleIndex];
            
            // Prevent modification of system roles' core properties
            if (oldRole.isSystemRole && roleConfigData.roleName != null && roleConfigData.roleName != oldRole.roleName)
            {
                return Forbid("Cannot modify system role name");
            }
            
            try
            {
                var updatedRole = new {
                    id = oldRole.id,
                    roleName = oldRole.isSystemRole ? oldRole.roleName : ((string)(roleConfigData.roleName ?? oldRole.roleName)),
                    displayName = (string)(roleConfigData.displayName ?? oldRole.displayName),
                    description = (string)(roleConfigData.description ?? oldRole.description),
                    permissions = roleConfigData.permissions ?? oldRole.permissions,
                    modules = roleConfigData.modules ?? oldRole.modules,
                    isActive = (bool)(roleConfigData.isActive ?? oldRole.isActive),
                    isSystemRole = oldRole.isSystemRole,
                    priority = (int)(roleConfigData.priority ?? oldRole.priority),
                    maxUsers = (int)(roleConfigData.maxUsers ?? oldRole.maxUsers),
                    features = roleConfigData.features ?? oldRole.features,
                    restrictions = roleConfigData.restrictions ?? oldRole.restrictions,
                    createdDate = oldRole.createdDate,
                    lastUpdated = DateTime.Now.ToString("o"),
                    createdBy = oldRole.createdBy
                };
                
                _roleConfigurations[roleIndex] = updatedRole;
                return Ok(updatedRole);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Invalid role configuration data", error = ex.Message });
            }
        }

        [HttpPut("{id}/status")]
        public IActionResult UpdateRoleStatus(int id, [FromBody] dynamic statusData)
        {
            var roleIndex = _roleConfigurations.FindIndex(r => ((dynamic)r).id == id);
            if (roleIndex == -1)
                return NotFound(new { message = "Role configuration not found" });
            
            var oldRole = (dynamic)_roleConfigurations[roleIndex];
            var isActive = (bool)(statusData.isActive ?? oldRole.isActive);
            
            var updatedRole = new {
                id = oldRole.id,
                roleName = oldRole.roleName,
                displayName = oldRole.displayName,
                description = oldRole.description,
                permissions = oldRole.permissions,
                modules = oldRole.modules,
                isActive = isActive,
                isSystemRole = oldRole.isSystemRole,
                priority = oldRole.priority,
                maxUsers = oldRole.maxUsers,
                features = oldRole.features,
                restrictions = oldRole.restrictions,
                createdDate = oldRole.createdDate,
                lastUpdated = DateTime.Now.ToString("o"),
                createdBy = oldRole.createdBy
            };
            
            _roleConfigurations[roleIndex] = updatedRole;
            return Ok(new { message = "Role status updated successfully", role = updatedRole });
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteRoleConfiguration(int id)
        {
            var roleIndex = _roleConfigurations.FindIndex(r => ((dynamic)r).id == id);
            if (roleIndex == -1)
                return NotFound(new { message = "Role configuration not found" });
            
            var role = (dynamic)_roleConfigurations[roleIndex];
            
            // Prevent deletion of system roles
            if (role.isSystemRole)
            {
                return Forbid("Cannot delete system roles");
            }
            
            // Check if role is assigned to users (mock check)
            var hasAssignedUsers = false; // In real system, check user table
            
            if (hasAssignedUsers)
            {
                return Conflict(new { message = "Cannot delete role with assigned users. Please deactivate instead." });
            }
            
            _roleConfigurations.RemoveAt(roleIndex);
            return Ok(new { message = "Role configuration deleted successfully" });
        }

        [HttpGet("{id}/users")]
        public IActionResult GetRoleUsers(int id)
        {
            var role = _roleConfigurations.FirstOrDefault(r => ((dynamic)r).id == id);
            if (role == null)
                return NotFound(new { message = "Role configuration not found" });
            
            // Mock user data assigned to this role
            var users = new[]
            {
                new { id = 1, name = "John Admin", email = "admin@company.com", isActive = true, assignedDate = "2024-01-15" },
                new { id = 2, name = "Jane Reception", email = "reception@company.com", isActive = true, assignedDate = "2024-02-01" }
            };
            
            return Ok(new { role = ((dynamic)role).roleName, users = users });
        }

        [HttpPost("validate")]
        public IActionResult ValidateRoleConfiguration([FromBody] dynamic roleConfigData)
        {
            var validationErrors = new List<string>();
            
            // Validate role name
            var roleName = (string)(roleConfigData.roleName ?? "");
            if (string.IsNullOrEmpty(roleName))
                validationErrors.Add("Role name is required");
            else if (roleName.Length < 3)
                validationErrors.Add("Role name must be at least 3 characters");
            
            // Validate permissions
            var permissions = roleConfigData.permissions as string[] ?? new string[0];
            if (permissions.Length == 0)
                validationErrors.Add("At least one permission is required");
            
            // Check for invalid permissions
            var invalidPermissions = permissions.Where(p => !_availablePermissions.Contains(p)).ToArray();
            if (invalidPermissions.Any())
                validationErrors.Add($"Invalid permissions: {string.Join(", ", invalidPermissions)}");
            
            // Validate modules
            var modules = roleConfigData.modules as string[] ?? new string[0];
            if (modules.Length == 0)
                validationErrors.Add("At least one module is required");
            
            // Check for invalid modules
            var invalidModules = modules.Where(m => !_availableModules.Contains(m)).ToArray();
            if (invalidModules.Any())
                validationErrors.Add($"Invalid modules: {string.Join(", ", invalidModules)}");
            
            var isValid = !validationErrors.Any();
            
            return Ok(new { 
                isValid = isValid, 
                errors = validationErrors,
                suggestions = new {
                    requiredPermissions = new[] { "dashboard.view" },
                    requiredModules = new[] { "dashboard" },
                    recommendedPermissions = permissions.Contains("all") ? new[] { "all" } : new[] { "dashboard.view", "profile.update" }
                }
            });
        }

        [HttpGet("stats")]
        public IActionResult GetRoleStats()
        {
            var stats = new
            {
                totalRoles = _roleConfigurations.Count,
                activeRoles = _roleConfigurations.Count(r => ((dynamic)r).isActive == true),
                systemRoles = _roleConfigurations.Count(r => ((dynamic)r).isSystemRole == true),
                customRoles = _roleConfigurations.Count(r => ((dynamic)r).isSystemRole == false),
                mostUsedPermissions = new[]
                {
                    new { permission = "dashboard.view", count = 5 },
                    new { permission = "visitors.read", count = 4 },
                    new { permission = "visitors.approve", count = 3 }
                },
                roleDistribution = new[]
                {
                    new { roleName = "admin", userCount = 2 },
                    new { roleName = "reception", userCount = 8 },
                    new { roleName = "staff", userCount = 45 },
                    new { roleName = "security", userCount = 3 },
                    new { roleName = "manager", userCount = 6 }
                }
            };
            
            return Ok(stats);
        }
    }
}
