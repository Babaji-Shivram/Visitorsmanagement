using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SimpleAPI.Data;
using SimpleAPI.Models.Entities;
using System.Text.Json;

namespace SimpleAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;

        public AuthController(
            ApplicationDbContext context,
            UserManager<User> userManager,
            SignInManager<User> signInManager)
        {
            _context = context;
            _userManager = userManager;
            _signInManager = signInManager;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] JsonElement loginData)
        {
            try
            {
                // Extract email and password from the request
                var email = "";
                var password = "";
                
                if (loginData.TryGetProperty("email", out var emailElement))
                    email = emailElement.GetString() ?? "";
                if (loginData.TryGetProperty("password", out var passwordElement))
                    password = passwordElement.GetString() ?? "";

                if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
                {
                    return BadRequest(new { message = "Email and password are required" });
                }

                // Find user by email
                var user = await _userManager.FindByEmailAsync(email);
                if (user == null || !user.IsActive)
                {
                    return Unauthorized(new { message = "Invalid credentials" });
                }

                // Check password
                var result = await _signInManager.CheckPasswordSignInAsync(user, password, false);
                if (!result.Succeeded)
                {
                    return Unauthorized(new { message = "Invalid credentials" });
                }

                // Get user's Identity roles
                var userRoles = await _userManager.GetRolesAsync(user);
                var primaryRole = userRoles.FirstOrDefault() ?? "Staff";
                
                // Determine user role from Identity roles (prioritize Admin)
                UserRole effectiveRole;
                if (userRoles.Contains("Admin"))
                    effectiveRole = UserRole.Admin;
                else if (userRoles.Contains("Reception"))
                    effectiveRole = UserRole.Reception;
                else
                    effectiveRole = UserRole.Staff;

                // Get user's locations if not admin
                var userLocations = new List<int>();
                if (effectiveRole == UserRole.Admin)
                {
                    // Admin has access to all locations
                    userLocations = await _context.Locations
                        .Where(l => l.IsActive)
                        .Select(l => l.Id)
                        .ToListAsync();
                }
                else
                {
                    // For other roles, assign first location as default
                    var firstLocation = await _context.Locations
                        .Where(l => l.IsActive)
                        .FirstOrDefaultAsync();
                    if (firstLocation != null)
                    {
                        userLocations.Add(firstLocation.Id);
                    }
                }

                // Get location name - for now, admin users don't have a specific location
                string? locationName = null;
                if (effectiveRole != UserRole.Admin && userLocations.Any())
                {
                    var location = await _context.Locations
                        .FirstOrDefaultAsync(l => l.Id == userLocations.First());
                    locationName = location?.Name;
                }

                // Generate response
                var response = new
                {
                    token = $"jwt-token-{effectiveRole.ToString().ToLower()}-{user.Id}",
                    user = new
                    {
                        id = user.Id,
                        firstName = user.FirstName,
                        lastName = user.LastName,
                        email = user.Email,
                        role = effectiveRole.ToString().ToLower(),
                        name = $"{user.FirstName} {user.LastName}",
                        locationId = userLocations.FirstOrDefault(),
                        locationName = locationName,
                        locations = userLocations.ToArray(),
                        permissions = GetUserPermissions(effectiveRole),
                        isActive = user.IsActive
                    },
                    expiresIn = 3600
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred during login", error = ex.Message });
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] JsonElement registerData)
        {
            try
            {
                // Extract user data from the request
                var email = "";
                var password = "";
                var firstName = "";
                var lastName = "";
                var phone = "";
                var role = "staff";
                int? locationId = null;

                if (registerData.TryGetProperty("email", out var emailElement))
                    email = emailElement.GetString() ?? "";
                if (registerData.TryGetProperty("password", out var passwordElement))
                    password = passwordElement.GetString() ?? "";
                if (registerData.TryGetProperty("firstName", out var firstNameElement))
                    firstName = firstNameElement.GetString() ?? "";
                if (registerData.TryGetProperty("lastName", out var lastNameElement))
                    lastName = lastNameElement.GetString() ?? "";
                if (registerData.TryGetProperty("phone", out var phoneElement))
                    phone = phoneElement.GetString() ?? "";
                if (registerData.TryGetProperty("role", out var roleElement))
                    role = roleElement.GetString() ?? "staff";
                if (registerData.TryGetProperty("locationId", out var locationIdElement))
                    locationId = locationIdElement.GetInt32();

                if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password) || 
                    string.IsNullOrEmpty(firstName) || string.IsNullOrEmpty(lastName))
                {
                    return BadRequest(new { message = "Email, password, first name, and last name are required" });
                }

                // Check if user already exists
                var existingUser = await _userManager.FindByEmailAsync(email);
                if (existingUser != null)
                {
                    return BadRequest(new { message = "User with this email already exists" });
                }

                // Parse role
                if (!Enum.TryParse<UserRole>(role, true, out var userRole))
                {
                    userRole = UserRole.Staff;
                }

                // Create new user (without LocationId for now)
                var user = new User
                {
                    FirstName = firstName,
                    LastName = lastName,
                    Email = email,
                    UserName = email,
                    PhoneNumber = phone,
                    Role = userRole,
                    IsActive = true
                };

                var result = await _userManager.CreateAsync(user, password);
                if (result.Succeeded)
                {
                    return Ok(new
                    {
                        message = "User registered successfully",
                        user = new
                        {
                            id = user.Id,
                            firstName = user.FirstName,
                            lastName = user.LastName,
                            email = user.Email,
                            role = user.Role.ToString().ToLower(),
                            locationId = (int?)null,
                            isActive = user.IsActive
                        }
                    });
                }
                else
                {
                    return BadRequest(new { message = "Failed to create user", errors = result.Errors });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred during registration", error = ex.Message });
            }
        }

        private string[] GetUserPermissions(UserRole role)
        {
            return role switch
            {
                UserRole.Admin => new[] { "all" },
                UserRole.Reception => new[] { "visitors.create", "visitors.read", "visitors.update", "visitors.checkin", "visitors.checkout" },
                UserRole.Staff => new[] { "visitors.read", "visitors.approve" },
                _ => new[] { "visitors.read" }
            };
        }
    }
}
