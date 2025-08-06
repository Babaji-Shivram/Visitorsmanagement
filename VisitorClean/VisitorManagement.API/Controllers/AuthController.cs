using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VisitorManagement.API.Models.DTOs;
using VisitorManagement.API.Services;

namespace VisitorManagement.API.Controllers
{
    /// <summary>
    /// Authentication and authorization endpoints for user management
    /// </summary>
    /// <remarks>
    /// This controller handles user authentication, registration, and user management operations.
    /// It supports both regular user login and staff member authentication with role-based access control.
    /// 
    /// Key Features:
    /// - JWT token-based authentication
    /// - Role-based access control (Admin, Staff, Reception)
    /// - Staff member authentication
    /// - User registration and management
    /// </remarks>
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        /// <summary>
        /// Authenticates a user and returns a JWT token
        /// </summary>
        /// <param name="request">Login credentials containing email and password</param>
        /// <returns>A JWT token and user information if authentication is successful</returns>
        /// <remarks>
        /// This endpoint attempts to authenticate both regular users and staff members.
        /// If regular user authentication fails, it will automatically try staff authentication.
        /// 
        /// Sample request:
        /// 
        ///     POST /api/auth/login
        ///     {
        ///         "email": "admin@company.com",
        ///         "password": "Admin123!"
        ///     }
        /// 
        /// Sample response:
        /// 
        ///     {
        ///         "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        ///         "user": {
        ///             "id": "user-guid",
        ///             "email": "admin@company.com",
        ///             "firstName": "Admin",
        ///             "lastName": "User",
        ///             "role": "Admin"
        ///         }
        ///     }
        /// </remarks>
        /// <response code="200">Returns the JWT token and user information</response>
        /// <response code="401">If the credentials are invalid</response>
        /// <response code="400">If the request is malformed</response>
        [HttpPost("login")]
        [ProducesResponseType(typeof(LoginResponseDto), 200)]
        [ProducesResponseType(401)]
        [ProducesResponseType(400)]
        public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginRequestDto request)
        {
            var result = await _authService.LoginAsync(request);
            if (result == null)
            {
                // Try staff login if regular user login fails
                var staffResult = await _authService.StaffLoginAsync(request);
                if (staffResult == null)
                    return Unauthorized(new { message = "Invalid credentials" });
                
                return Ok(staffResult);
            }

            return Ok(result);
        }

        /// <summary>
        /// Registers a new user in the system
        /// </summary>
        /// <param name="request">User registration details including email, password, name, and role</param>
        /// <returns>The created user information</returns>
        /// <remarks>
        /// This endpoint requires Admin role authorization. Only administrators can create new users.
        /// 
        /// Available roles:
        /// - Admin: Full system access
        /// - Staff: Staff member with limited access
        /// - Reception: Reception desk operations
        /// 
        /// Sample request:
        /// 
        ///     POST /api/auth/register
        ///     Authorization: Bearer YOUR_JWT_TOKEN
        ///     {
        ///         "email": "newuser@company.com",
        ///         "password": "StrongPass123!",
        ///         "firstName": "John",
        ///         "lastName": "Doe",
        ///         "role": "Staff"
        ///     }
        /// 
        /// Password requirements:
        /// - Minimum 6 characters
        /// - At least one uppercase letter
        /// - At least one lowercase letter
        /// - At least one digit
        /// </remarks>
        /// <response code="201">Returns the created user information</response>
        /// <response code="400">If the registration data is invalid or user creation fails</response>
        /// <response code="401">If the user is not authenticated</response>
        /// <response code="403">If the user doesn't have Admin role</response>
        [HttpPost("register")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(UserDto), 201)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<UserDto>> Register([FromBody] RegisterRequestDto request)
        {
            var result = await _authService.RegisterAsync(request);
            if (result == null)
                return BadRequest(new { message = "User registration failed" });

            return CreatedAtAction(nameof(GetUser), new { id = result.Id }, result);
        }

        [HttpGet("user/{id}")]
        [Authorize]
        public async Task<ActionResult<UserDto>> GetUser(string id)
        {
            var user = await _authService.GetUserByIdAsync(id);
            if (user == null)
                return NotFound();

            return Ok(user);
        }

        [HttpGet("users")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<UserDto>>> GetAllUsers()
        {
            var users = await _authService.GetAllUsersAsync();
            return Ok(users);
        }

        [HttpPut("user/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] RegisterRequestDto request)
        {
            var result = await _authService.UpdateUserAsync(id, request);
            if (!result)
                return NotFound();

            return NoContent();
        }

        [HttpDelete("user/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var result = await _authService.DeleteUserAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }
    }
}