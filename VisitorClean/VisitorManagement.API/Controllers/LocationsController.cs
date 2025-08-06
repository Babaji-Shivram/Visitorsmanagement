using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VisitorManagement.API.Models.DTOs;
using VisitorManagement.API.Services;

namespace VisitorManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LocationsController : ControllerBase
    {
        private readonly ILocationService _locationService;

        public LocationsController(ILocationService locationService)
        {
            _locationService = locationService;
        }

        [HttpGet]
        public async Task<ActionResult<List<LocationDto>>> GetLocations()
        {
            var locations = await _locationService.GetAllLocationsAsync();
            return Ok(locations);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<LocationDto>> GetLocation(int id)
        {
            var location = await _locationService.GetLocationByIdAsync(id);
            if (location == null)
                return NotFound();

            return Ok(location);
        }

        [HttpGet("url/{url}")]
        public async Task<ActionResult<LocationDto>> GetLocationByUrl(string url)
        {
            var location = await _locationService.GetLocationByUrlAsync(url);
            if (location == null)
                return NotFound();

            return Ok(location);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<LocationDto>> CreateLocation([FromBody] CreateLocationDto request)
        {
            var result = await _locationService.CreateLocationAsync(request);
            if (result == null)
                return BadRequest(new { message = "Failed to create location" });

            return CreatedAtAction(nameof(GetLocation), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateLocation(int id, [FromBody] UpdateLocationDto request)
        {
            var result = await _locationService.UpdateLocationAsync(id, request);
            if (!result)
                return NotFound();

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteLocation(int id)
        {
            var result = await _locationService.DeleteLocationAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }

        [HttpPut("{id}/toggle-status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ToggleLocationStatus(int id)
        {
            var result = await _locationService.ToggleLocationStatusAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }
    }
}
