using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VisitorManagement.API.Models.DTOs;
using VisitorManagement.API.Services;

namespace VisitorManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RoleConfigurationController : ControllerBase
    {
        private readonly IRoleConfigurationService _roleConfigurationService;
        private readonly ILogger<RoleConfigurationController> _logger;

        public RoleConfigurationController(
            IRoleConfigurationService roleConfigurationService,
            ILogger<RoleConfigurationController> logger)
        {
            _roleConfigurationService = roleConfigurationService;
            _logger = logger;
        }

        /// <summary>
        /// Get all role configurations
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RoleConfigurationDto>>> GetAllRoleConfigurations()
        {
            try
            {
                var roles = await _roleConfigurationService.GetAllRoleConfigurationsAsync();
                return Ok(roles);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving role configurations");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get role configuration by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<RoleConfigurationDto>> GetRoleConfiguration(int id)
        {
            try
            {
                var role = await _roleConfigurationService.GetRoleConfigurationByIdAsync(id);
                if (role == null)
                {
                    return NotFound($"Role configuration with ID {id} not found");
                }

                return Ok(role);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving role configuration with ID {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get role configuration by name
        /// </summary>
        [HttpGet("by-name/{roleName}")]
        public async Task<ActionResult<RoleConfigurationDto>> GetRoleConfigurationByName(string roleName)
        {
            try
            {
                var role = await _roleConfigurationService.GetRoleConfigurationByNameAsync(roleName);
                if (role == null)
                {
                    return NotFound($"Role configuration with name '{roleName}' not found");
                }

                return Ok(role);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving role configuration with name {RoleName}", roleName);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Create a new role configuration
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")] // Only admins can create roles
        public async Task<ActionResult<RoleConfigurationDto>> CreateRoleConfiguration([FromBody] CreateRoleConfigurationDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var role = await _roleConfigurationService.CreateRoleConfigurationAsync(createDto);
                return CreatedAtAction(nameof(GetRoleConfiguration), new { id = role.Id }, role);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating role configuration");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Update an existing role configuration
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")] // Only admins can update roles
        public async Task<ActionResult<RoleConfigurationDto>> UpdateRoleConfiguration(int id, [FromBody] UpdateRoleConfigurationDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var role = await _roleConfigurationService.UpdateRoleConfigurationAsync(id, updateDto);
                if (role == null)
                {
                    return NotFound($"Role configuration with ID {id} not found");
                }

                return Ok(role);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating role configuration with ID {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Delete a role configuration
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")] // Only admins can delete roles
        public async Task<ActionResult> DeleteRoleConfiguration(int id)
        {
            try
            {
                var success = await _roleConfigurationService.DeleteRoleConfigurationAsync(id);
                if (!success)
                {
                    return NotFound($"Role configuration with ID {id} not found");
                }

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting role configuration with ID {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Activate a role configuration
        /// </summary>
        [HttpPatch("{id}/activate")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> ActivateRoleConfiguration(int id)
        {
            try
            {
                var success = await _roleConfigurationService.ActivateRoleConfigurationAsync(id);
                if (!success)
                {
                    return NotFound($"Role configuration with ID {id} not found");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error activating role configuration with ID {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Deactivate a role configuration
        /// </summary>
        [HttpPatch("{id}/deactivate")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeactivateRoleConfiguration(int id)
        {
            try
            {
                var success = await _roleConfigurationService.DeactivateRoleConfigurationAsync(id);
                if (!success)
                {
                    return NotFound($"Role configuration with ID {id} not found");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deactivating role configuration with ID {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get permissions for a specific role configuration
        /// </summary>
        [HttpGet("{id}/permissions")]
        public async Task<ActionResult<IEnumerable<RolePermissionDto>>> GetRolePermissions(int id)
        {
            try
            {
                var permissions = await _roleConfigurationService.GetRolePermissionsAsync(id);
                return Ok(permissions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving permissions for role configuration {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get routes for a specific role configuration
        /// </summary>
        [HttpGet("{id}/routes")]
        public async Task<ActionResult<IEnumerable<RoleRouteDto>>> GetRoleRoutes(int id)
        {
            try
            {
                var routes = await _roleConfigurationService.GetRoleRoutesAsync(id);
                return Ok(routes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving routes for role configuration {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Check if a role has a specific permission
        /// </summary>
        [HttpGet("check-permission")]
        public async Task<ActionResult<bool>> CheckPermission([FromQuery] string roleName, [FromQuery] string permissionName)
        {
            try
            {
                if (string.IsNullOrEmpty(roleName) || string.IsNullOrEmpty(permissionName))
                {
                    return BadRequest("Role name and permission name are required");
                }

                var hasPermission = await _roleConfigurationService.HasPermissionAsync(roleName, permissionName);
                return Ok(hasPermission);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking permission {Permission} for role {Role}", permissionName, roleName);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Seed default role configurations (for initial setup)
        /// </summary>
        [HttpPost("seed-defaults")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> SeedDefaultRoleConfigurations()
        {
            try
            {
                await _roleConfigurationService.SeedDefaultRoleConfigurationsAsync();
                return Ok("Default role configurations seeded successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error seeding default role configurations");
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
