using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using VisitorManagement.API.Data;
using VisitorManagement.API.Models.DTOs;
using VisitorManagement.API.Services;

namespace VisitorManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SettingsController : ControllerBase
    {
        private readonly ISettingsService _settingsService;
        private readonly ApplicationDbContext _context;

        public SettingsController(ISettingsService settingsService, ApplicationDbContext context)
        {
            _settingsService = settingsService;
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<LocationSettingsDto>> GetSettings([FromQuery] int? locationId = null)
        {
            var (isAdmin, userLocationId) = await GetUserLocationInfoAsync();
            
            // Determine which location settings to retrieve
            int? targetLocationId = null;
            
            if (isAdmin)
            {
                // Admin can specify location or get global settings (null)
                targetLocationId = locationId;
            }
            else if (userLocationId.HasValue)
            {
                // Non-admin users can only access their own location settings
                targetLocationId = userLocationId.Value;
            }
            else
            {
                return Forbid("Access denied: No location assignment found.");
            }

            var settings = await _settingsService.GetLocationSettingsAsync(targetLocationId);
            return Ok(settings);
        }

        [HttpPost]
        public async Task<ActionResult<LocationSettingsDto>> CreateSettings([FromBody] CreateLocationSettingsDto request)
        {
            var (isAdmin, userLocationId) = await GetUserLocationInfoAsync();
            
            // Validate location access
            if (!isAdmin)
            {
                if (!userLocationId.HasValue)
                    return Forbid("Access denied: No location assignment found.");
                
                // Non-admin users can only create settings for their own location
                request.LocationId = userLocationId.Value;
            }

            var settings = await _settingsService.CreateLocationSettingsAsync(request);
            return CreatedAtAction(nameof(GetSettings), new { locationId = settings.LocationId }, settings);
        }

        [HttpPut]
        public async Task<ActionResult<LocationSettingsDto>> UpdateSettings(
            [FromQuery] int? locationId, 
            [FromBody] UpdateLocationSettingsDto request)
        {
            var (isAdmin, userLocationId) = await GetUserLocationInfoAsync();
            
            // Determine which location settings to update
            int? targetLocationId = null;
            
            if (isAdmin)
            {
                // Admin can update any location or global settings
                targetLocationId = locationId;
            }
            else if (userLocationId.HasValue)
            {
                // Non-admin users can only update their own location settings
                if (locationId.HasValue && locationId.Value != userLocationId.Value)
                    return Forbid("Access denied: You can only update settings for your assigned location.");
                
                targetLocationId = userLocationId.Value;
            }
            else
            {
                return Forbid("Access denied: No location assignment found.");
            }

            var settings = await _settingsService.UpdateLocationSettingsAsync(targetLocationId, request);
            if (settings == null)
                return NotFound();

            return Ok(settings);
        }

        [HttpDelete]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteSettings([FromQuery] int? locationId)
        {
            var result = await _settingsService.DeleteLocationSettingsAsync(locationId);
            if (!result)
                return NotFound();

            return NoContent();
        }

        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<LocationSettingsDto>>> GetAllSettings()
        {
            var settings = await _settingsService.GetAllLocationSettingsAsync();
            return Ok(settings);
        }

        private async Task<(bool isAdmin, int? userLocationId)> GetUserLocationInfoAsync()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            
            if (string.IsNullOrEmpty(userId) && string.IsNullOrEmpty(userEmail))
                return (false, null);

            // Check if user is admin
            var isAdmin = User.IsInRole("Admin");
            if (isAdmin)
                return (true, null);

            // First try to get LocationId from JWT token claims
            var locationIdClaim = User.FindFirst("LocationId")?.Value;
            if (!string.IsNullOrEmpty(locationIdClaim) && int.TryParse(locationIdClaim, out int locationId))
            {
                return (false, locationId);
            }

            // Fallback: Try to get user's location from staff member record by email, then by ID
            var staffMember = await _context.StaffMembers
                .FirstOrDefaultAsync(s => (s.Email == userEmail || s.Id.ToString() == userId) && s.IsActive);

            return (false, staffMember?.LocationId);
        }
    }
}
