using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SimpleAPI.Data;

namespace SimpleAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class HealthController : ControllerBase
    {
        private readonly ApplicationDbContext _ctx;
        public HealthController(ApplicationDbContext ctx)
        {
            _ctx = ctx;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var canConnect = await _ctx.Database.CanConnectAsync();
            var users = await _ctx.Users.CountAsync();
            var locations = await _ctx.Locations.CountAsync();
            return Ok(new
            {
                status = "OK",
                dbProvider = _ctx.Database.ProviderName,
                canConnect,
                users,
                locations,
                time = DateTime.UtcNow
            });
        }
    }
}
