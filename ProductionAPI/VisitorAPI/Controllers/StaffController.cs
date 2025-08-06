using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VisitorManagement.API.Models.DTOs;
using VisitorManagement.API.Services;

namespace VisitorManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StaffController : ControllerBase
    {
        private readonly IStaffService _staffService;

        public StaffController(IStaffService staffService)
        {
            _staffService = staffService;
        }

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<List<StaffMemberDto>>> GetStaffMembers()
        {
            var staffMembers = await _staffService.GetAllStaffMembersAsync();
            return Ok(staffMembers);
        }

        [HttpGet("active")]
        public async Task<ActionResult<List<StaffMemberDto>>> GetActiveStaffMembers()
        {
            var staffMembers = await _staffService.GetActiveStaffMembersAsync();
            return Ok(staffMembers);
        }

        [HttpGet("location/{locationId}")]
        public async Task<ActionResult<List<StaffMemberDto>>> GetStaffMembersByLocation(int locationId)
        {
            var staffMembers = await _staffService.GetStaffMembersByLocationAsync(locationId);
            return Ok(staffMembers);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<StaffMemberDto>> GetStaffMember(int id)
        {
            var staffMember = await _staffService.GetStaffMemberByIdAsync(id);
            if (staffMember == null)
                return NotFound();

            return Ok(staffMember);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<StaffMemberDto>> CreateStaffMember([FromBody] CreateStaffMemberDto request)
        {
            var result = await _staffService.CreateStaffMemberAsync(request);
            if (result == null)
                return BadRequest(new { message = "Failed to create staff member" });

            return CreatedAtAction(nameof(GetStaffMember), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStaffMember(int id, [FromBody] UpdateStaffMemberDto request)
        {
            var result = await _staffService.UpdateStaffMemberAsync(id, request);
            if (!result)
                return NotFound();

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteStaffMember(int id)
        {
            var result = await _staffService.DeleteStaffMemberAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }

        [HttpPut("{id}/toggle-status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ToggleStaffMemberStatus(int id)
        {
            var result = await _staffService.ToggleStaffMemberStatusAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }
    }
}
