using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using VisitorManagement.API.Data;
using VisitorManagement.API.Models.DTOs;
using VisitorManagement.API.Models.Entities;
using VisitorManagement.API.Services;

namespace VisitorManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VisitorsController : ControllerBase
    {
        private readonly IVisitorService _visitorService;
        private readonly ApplicationDbContext _context;

        public VisitorsController(IVisitorService visitorService, ApplicationDbContext context)
        {
            _visitorService = visitorService;
            _context = context;
        }

        private async Task<(bool IsAdmin, int? UserLocationId)> GetUserLocationInfoAsync()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return (false, null);

            // Check if user is admin
            if (User.IsInRole("Admin"))
                return (true, null);

            // Get staff member location for reception and staff users
            if (int.TryParse(userId, out int staffId))
            {
                var staffMember = await _context.StaffMembers
                    .FirstOrDefaultAsync(s => s.Id == staffId);
                
                if (staffMember != null)
                    return (false, staffMember.LocationId);
            }

            return (false, null);
        }

        [HttpPost]
        public async Task<ActionResult<VisitorDto>> CreateVisitor([FromBody] CreateVisitorDto request)
        {
            var result = await _visitorService.CreateVisitorAsync(request);
            if (result == null)
                return BadRequest(new { message = "Failed to create visitor" });

            return CreatedAtAction(nameof(GetVisitor), new { id = result.Id }, result);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<VisitorDto>> GetVisitor(int id)
        {
            var visitor = await _visitorService.GetVisitorByIdAsync(id);
            if (visitor == null)
                return NotFound();

            return Ok(visitor);
        }

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<List<VisitorDto>>> GetVisitors(
            [FromQuery] int? locationId = null,
            [FromQuery] DateTime? date = null,
            [FromQuery] VisitorStatus? status = null)
        {
            var (isAdmin, userLocationId) = await GetUserLocationInfoAsync();
            
            // Admin can access all locations
            if (isAdmin)
            {
                var visitors = await _visitorService.GetVisitorsAsync(locationId, date, status);
                return Ok(visitors);
            }
            
            // Reception and staff can only access their assigned location
            if (userLocationId.HasValue)
            {
                // If locationId is specified and doesn't match user's location, deny access
                if (locationId.HasValue && locationId.Value != userLocationId.Value)
                {
                    return Forbid("Access denied: You can only view visitors for your assigned location.");
                }
                
                // Force the query to use user's location
                var visitors = await _visitorService.GetVisitorsAsync(userLocationId.Value, date, status);
                return Ok(visitors);
            }
            
            return Forbid("Access denied: No location assignment found.");
        }

        [HttpGet("staff/{staffName}")]
        [Authorize]
        public async Task<ActionResult<List<VisitorDto>>> GetVisitorsByStaff(
            string staffName,
            [FromQuery] VisitorStatus? status = null)
        {
            var visitors = await _visitorService.GetVisitorsByStaffAsync(staffName, status);
            return Ok(visitors);
        }

        [HttpGet("today")]
        [Authorize]
        public async Task<ActionResult<List<VisitorDto>>> GetTodaysVisitors([FromQuery] int? locationId = null)
        {
            var (isAdmin, userLocationId) = await GetUserLocationInfoAsync();
            
            // Admin can access all locations
            if (isAdmin)
            {
                var visitors = await _visitorService.GetTodaysVisitorsAsync(locationId);
                return Ok(visitors);
            }
            
            // Reception and staff can only access their assigned location
            if (userLocationId.HasValue)
            {
                // If locationId is specified and doesn't match user's location, deny access
                if (locationId.HasValue && locationId.Value != userLocationId.Value)
                {
                    return Forbid("Access denied: You can only view visitors for your assigned location.");
                }
                
                // Force the query to use user's location
                var visitors = await _visitorService.GetTodaysVisitorsAsync(userLocationId.Value);
                return Ok(visitors);
            }
            
            return Forbid("Access denied: No location assignment found.");
        }

        [HttpGet("stats")]
        [Authorize]
        public async Task<ActionResult<VisitorStatsDto>> GetVisitorStats(
            [FromQuery] int? locationId = null,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null)
        {
            var stats = await _visitorService.GetVisitorStatsAsync(locationId, fromDate, toDate);
            return Ok(stats);
        }

        [HttpGet("{id}/approve")]
        [AllowAnonymous]
        public async Task<IActionResult> ApproveVisitor(int id, [FromQuery] string token)
        {
            if (string.IsNullOrEmpty(token))
                return BadRequest("Invalid approval token");
                
            try
            {
                // Decode the token
                byte[] tokenBytes = Convert.FromBase64String(token);
                string tokenData = System.Text.Encoding.UTF8.GetString(tokenBytes);
                
                string[] parts = tokenData.Split(':');
                if (parts.Length < 3)
                    return BadRequest("Invalid token format");
                
                // Validate token components
                if (int.Parse(parts[0]) != id)
                    return BadRequest("Token does not match visitor ID");
                    
                string staffEmail = parts[1];
                long expiryTicks = long.Parse(parts[2]);
                
                // Check if token is expired
                if (DateTime.UtcNow.Ticks > expiryTicks)
                    return BadRequest("Approval token has expired");
                    
                // Verify the visitor exists
                var visitor = await _visitorService.GetVisitorByIdAsync(id);
                if (visitor == null)
                    return NotFound("Visitor not found");
                
                // Verify the staff member exists
                var staffMember = await _context.StaffMembers
                    .FirstOrDefaultAsync(s => s.Email.Equals(staffEmail, StringComparison.OrdinalIgnoreCase));
                    
                if (staffMember == null)
                    return BadRequest("Invalid staff member");
                    
                // Update the visitor status to approved
                var updateRequest = new UpdateVisitorStatusDto
                {
                    Status = VisitorStatus.Approved,
                    Notes = $"Approved via email link by {staffMember.FirstName} {staffMember.LastName} at {DateTime.UtcNow}"
                };
                
                var result = await _visitorService.UpdateVisitorStatusAsync(id, updateRequest, $"{staffMember.FirstName} {staffMember.LastName}");
                
                if (!result)
                    return BadRequest("Failed to approve visitor");
                    
                // Redirect to the approval confirmation page
                return Redirect($"/staff/approval-success/{id}");
            }
            catch (Exception ex)
            {
                return BadRequest($"Error processing approval: {ex.Message}");
            }
        }

        [HttpPut("{id}/status")]
        [Authorize]
        public async Task<IActionResult> UpdateVisitorStatus(int id, [FromBody] UpdateVisitorStatusDto request)
        {
            var (isAdmin, userLocationId) = await GetUserLocationInfoAsync();
            
            // Admin can approve visitors at any location
            if (!isAdmin && userLocationId.HasValue)
            {
                // Verify the visitor belongs to the staff member's location
                var visitor = await _visitorService.GetVisitorByIdAsync(id);
                if (visitor == null)
                    return NotFound();
                    
                if (visitor.LocationId != userLocationId.Value)
                    return Forbid("Access denied: You can only manage visitors for your assigned location.");
            }
            else if (!isAdmin && !userLocationId.HasValue)
            {
                return Forbid("Access denied: No location assignment found.");
            }
            
            var approvedBy = User.FindFirst(ClaimTypes.Name)?.Value;
            var result = await _visitorService.UpdateVisitorStatusAsync(id, request, approvedBy);
            
            if (!result)
                return NotFound();

            return NoContent();
        }

        [HttpPost("{id}/checkin")]
        [Authorize(Roles = "Reception,Admin")]
        public async Task<IActionResult> CheckInVisitor(int id)
        {
            var (isAdmin, userLocationId) = await GetUserLocationInfoAsync();
            
            // Admin can check in visitors at any location
            if (!isAdmin && userLocationId.HasValue)
            {
                // Verify the visitor belongs to the staff member's location
                var visitor = await _visitorService.GetVisitorByIdAsync(id);
                if (visitor == null)
                    return NotFound();
                    
                if (visitor.LocationId != userLocationId.Value)
                    return Forbid("Access denied: You can only check in visitors for your assigned location.");
            }
            
            var result = await _visitorService.CheckInVisitorAsync(id);
            if (!result)
                return BadRequest(new { message = "Cannot check in visitor" });

            return NoContent();
        }

        [HttpPost("{id}/checkout")]
        [Authorize(Roles = "Reception,Admin")]
        public async Task<IActionResult> CheckOutVisitor(int id)
        {
            var (isAdmin, userLocationId) = await GetUserLocationInfoAsync();
            
            // Admin can check out visitors at any location
            if (!isAdmin && userLocationId.HasValue)
            {
                // Verify the visitor belongs to the staff member's location
                var visitor = await _visitorService.GetVisitorByIdAsync(id);
                if (visitor == null)
                    return NotFound();
                    
                if (visitor.LocationId != userLocationId.Value)
                    return Forbid("Access denied: You can only check out visitors for your assigned location.");
            }
            
            var result = await _visitorService.CheckOutVisitorAsync(id);
            if (!result)
                return BadRequest(new { message = "Cannot check out visitor" });

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteVisitor(int id)
        {
            var result = await _visitorService.DeleteVisitorAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }
    }
}