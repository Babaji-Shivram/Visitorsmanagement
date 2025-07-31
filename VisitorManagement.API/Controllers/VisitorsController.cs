using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
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

        public VisitorsController(IVisitorService visitorService)
        {
            _visitorService = visitorService;
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
            var visitors = await _visitorService.GetVisitorsAsync(locationId, date, status);
            return Ok(visitors);
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
            var visitors = await _visitorService.GetTodaysVisitorsAsync(locationId);
            return Ok(visitors);
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

        [HttpPut("{id}/status")]
        [Authorize]
        public async Task<IActionResult> UpdateVisitorStatus(int id, [FromBody] UpdateVisitorStatusDto request)
        {
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
            var result = await _visitorService.CheckInVisitorAsync(id);
            if (!result)
                return BadRequest(new { message = "Cannot check in visitor" });

            return NoContent();
        }

        [HttpPost("{id}/checkout")]
        [Authorize(Roles = "Reception,Admin")]
        public async Task<IActionResult> CheckOutVisitor(int id)
        {
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