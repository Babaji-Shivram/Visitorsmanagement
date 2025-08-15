using Microsoft.EntityFrameworkCore;
using SimpleAPI.Data;
using SimpleAPI.Services;
using SimpleAPI.Models.Entities;
using Microsoft.AspNetCore.Identity;

var builder = WebApplication.CreateBuilder(args);

try
{
    // Configure logging
    builder.Logging.ClearProviders();
    builder.Logging.AddConsole();

    // Add basic services with error handling
    builder.Services.AddControllers()
        .AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
            options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
        });

    // Add CORS for frontend
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowAll", policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
    });

    // Register Email Service
    builder.Services.AddScoped<IEmailService, EmailService>();
    // Register diagnostics heartbeat service
    builder.Services.AddHostedService<HeartbeatHostedService>();

    // Configure Entity Framework - Use SQL Server database
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
    {
        // Use SQL Server with connection string from appsettings.json
        var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
        options.UseSqlServer(connectionString);
        options.EnableSensitiveDataLogging();
        Console.WriteLine($"📊 Using SQL Server database: {connectionString}");
    });

    // Configure Identity with simplified options
    builder.Services.AddIdentity<User, IdentityRole>(options =>
    {
        options.Password.RequireDigit = false;
        options.Password.RequireLowercase = false;
        options.Password.RequireUppercase = false;
        options.Password.RequireNonAlphanumeric = false;
        options.Password.RequiredLength = 4;
        options.User.RequireUniqueEmail = false;
    })
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

    var app = builder.Build();

    // Initialize database and seed data for development
    using (var scope = app.Services.CreateScope())
    {
        try
        {
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            
            // Ensure database is created and apply migrations
            context.Database.EnsureCreated();
            Console.WriteLine("✅ Database connection established and schema ensured");
            
            // Create Identity roles if they don't exist
            var roles = new[] { "Reception", "Admin", "Staff" };
            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new IdentityRole(role));
                    Console.WriteLine($"✅ Created role: {role}");
                }
            }
            
            // Seed initial data if empty
            if (!context.Locations.Any())
            {
                var locations = new[]
                {
                    new SimpleAPI.Models.Entities.Location
                    {
                        Id = 1,
                        Name = "Main Office",
                        Address = "BABAJI SHIVRAM Main Office",
                        RegistrationUrl = "main-office",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new SimpleAPI.Models.Entities.Location
                    {
                        Id = 2,
                        Name = "Branch Office - Delhi",
                        Address = "BABAJI SHIVRAM Delhi Branch",
                        RegistrationUrl = "delhi-branch",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new SimpleAPI.Models.Entities.Location
                    {
                        Id = 3,
                        Name = "Branch Office - Mumbai",
                        Address = "BABAJI SHIVRAM Mumbai Branch",
                        RegistrationUrl = "mumbai-branch",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    }
                };
                
                context.Locations.AddRange(locations);
                context.SaveChanges();
                Console.WriteLine("✅ Created 3 locations: Main Office, Delhi Branch, Mumbai Branch");
            }
            
            // Create all 5 staff members if no users exist
            if (!userManager.Users.Any())
            {
                var staffMembers = new[]
                {
                    new User
                    {
                        UserName = "reception@babajishivram.com",
                        Email = "reception@babajishivram.com",
                        FirstName = "Sarah",
                        LastName = "Johnson",
                        Role = SimpleAPI.Models.Entities.UserRole.Reception,
                        Department = "Reception",
                        Extension = "1001",
                        LocationId = 1, // Main Office
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new User
                    {
                        UserName = "john@company.com",
                        Email = "john@company.com",
                        FirstName = "John",
                        LastName = "Reception",
                        Role = SimpleAPI.Models.Entities.UserRole.Reception,
                        Department = "Reception",
                        Extension = "2001",
                        LocationId = 2, // Delhi Branch
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new User
                    {
                        UserName = "gogulan.a@babajishivram.com",
                        Email = "gogulan.a@babajishivram.com",
                        FirstName = "Gogulan",
                        LastName = "A",
                        Role = SimpleAPI.Models.Entities.UserRole.Staff,
                        Department = "General",
                        Extension = "3001",
                        LocationId = 3, // Mumbai Branch
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new User
                    {
                        UserName = "superadmin@babajishivram.com",
                        Email = "superadmin@babajishivram.com",
                        FirstName = "Super",
                        LastName = "Admin",
                        Role = SimpleAPI.Models.Entities.UserRole.Admin,
                        Department = "Administration",
                        Extension = "1000",
                        LocationId = 1, // Main Office
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new User
                    {
                        UserName = "javed@gmail.com",
                        Email = "javed@gmail.com",
                        FirstName = "Javed",
                        LastName = "S",
                        Role = SimpleAPI.Models.Entities.UserRole.Reception,
                        Department = "Reception",
                        Extension = "2002",
                        LocationId = 2, // Delhi Branch
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    }
                };

                foreach (var staff in staffMembers)
                {
                    var result = await userManager.CreateAsync(staff, "Welcome!23");
                    if (result.Succeeded)
                    {
                        // Assign Identity role based on custom Role enum
                        var roleName = staff.Role.ToString();
                        await userManager.AddToRoleAsync(staff, roleName);
                        Console.WriteLine($"✅ Created user: {staff.Email} with role: {roleName}");
                    }
                    else
                    {
                        Console.WriteLine($"❌ Failed to create user: {staff.Email} - {string.Join(", ", result.Errors.Select(e => e.Description))}");
                    }
                }
            }

            // Fix existing users who don't have Identity role assignments
            Console.WriteLine("🔄 Checking existing users for missing Identity role assignments...");
            var allUsers = userManager.Users.ToList();
            foreach (var user in allUsers)
            {
                var userRoles = await userManager.GetRolesAsync(user);
                var expectedRole = user.Role.ToString();
                
                if (!userRoles.Contains(expectedRole))
                {
                    // Ensure the role exists
                    if (!await roleManager.RoleExistsAsync(expectedRole))
                    {
                        await roleManager.CreateAsync(new IdentityRole(expectedRole));
                        Console.WriteLine($"✅ Created missing role: {expectedRole}");
                    }
                    
                    // Assign the role to the user
                    var roleResult = await userManager.AddToRoleAsync(user, expectedRole);
                    if (roleResult.Succeeded)
                    {
                        Console.WriteLine($"✅ Assigned role '{expectedRole}' to existing user: {user.Email}");
                    }
                    else
                    {
                        Console.WriteLine($"❌ Failed to assign role '{expectedRole}' to user {user.Email}: {string.Join(", ", roleResult.Errors.Select(e => e.Description))}");
                    }
                }
                else
                {
                    Console.WriteLine($"✓ User {user.Email} already has correct role: {expectedRole}");
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"⚠️ Database seeding warning: {ex.Message}");
        }
    }

    // Configure pipeline with basic middleware
    if (app.Environment.IsDevelopment())
    {
        app.UseDeveloperExceptionPage();
    }

    app.UseCors("AllowAll");
    app.UseAuthentication();
    app.UseAuthorization();
    app.MapControllers();

    // Test endpoint
    app.MapGet("/test", () => new { 
        message = "Production API is working!", 
        timestamp = DateTime.UtcNow,
        status = "Ready"
    });

    // Diagnostic lifecycle instrumentation
    var lifetime = app.Services.GetRequiredService<IHostApplicationLifetime>();
    lifetime.ApplicationStarted.Register(() => Console.WriteLine($"[Lifecycle] ApplicationStarted at {DateTime.UtcNow:o}"));
    lifetime.ApplicationStopping.Register(() => Console.WriteLine($"[Lifecycle] ApplicationStopping at {DateTime.UtcNow:o}"));
    lifetime.ApplicationStopped.Register(() => Console.WriteLine($"[Lifecycle] ApplicationStopped at {DateTime.UtcNow:o}"));

    AppDomain.CurrentDomain.UnhandledException += (sender, evt) =>
    {
        Console.WriteLine($"[UnhandledException] {evt.ExceptionObject}");
    };
    TaskScheduler.UnobservedTaskException += (sender, evt) =>
    {
        Console.WriteLine($"[UnobservedTaskException] {evt.Exception?.ToString()}");
        evt.SetObserved();
    };

    Console.WriteLine("🚀 Starting Production API on http://localhost:5000");
    Console.WriteLine("⏳ Server ready. Press Ctrl+C to shut down.");
    
    // Use standard ASP.NET Core hosting
    app.Run();
}
catch (Exception ex)
{
    Console.WriteLine($"💥 STARTUP ERROR: {ex.Message}");
    Console.WriteLine($"Stack Trace: {ex.StackTrace}");
    throw;
}
