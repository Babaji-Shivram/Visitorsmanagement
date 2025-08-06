using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using System.Reflection;
using System.Text;
using VisitorManagement.API.Data;
using VisitorManagement.API.Models.Entities;
using VisitorManagement.API.Models.Configuration;
using VisitorManagement.API.Profiles;
using VisitorManagement.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container.
builder.Services.AddControllers();

// Configure Entity Framework
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configure Identity
builder.Services.AddIdentity<User, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 6;
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
var jwtKey = jwtSettings["Key"] ?? "YourSuperSecretKeyThatIsAtLeast32CharactersLong!";
var key = Encoding.UTF8.GetBytes(jwtKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ClockSkew = TimeSpan.Zero
    };
});

// Add AutoMapper
builder.Services.AddAutoMapper(typeof(MappingProfile));

// Register services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IVisitorService, VisitorService>();
builder.Services.AddScoped<ILocationService, LocationService>();
builder.Services.AddScoped<IStaffService, StaffService>();
builder.Services.AddScoped<ISettingsService, SettingsService>();
builder.Services.AddScoped<IRoleConfigurationService, RoleConfigurationService>();

// Configure Email Settings
builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));
builder.Services.AddScoped<IEmailService, EmailService>();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177", "http://localhost:5178", "http://localhost:5179", "http://localhost:5180", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
    
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "BABAJI SHIVRAM Visitor Management API",
        Version = "v1.0.0",
        Description = @"
# BABAJI SHIVRAM Visitor Management System API

## Overview
A comprehensive visitor management system designed for modern organizations. This API provides complete visitor lifecycle management with integrated email notifications, staff management, and location-based access control.

## Key Features
- 🏢 **Multi-Location Support**: Manage visitors across multiple office locations
- 👥 **Staff Management**: Complete staff member lifecycle with role-based permissions
- 📧 **Email Notifications**: Automated Office 365 integration for visitor notifications
- 🔐 **Role-Based Security**: Dynamic role configuration with JWT authentication
- 📱 **Real-time Updates**: Live visitor status tracking and notifications
- 🎨 **Customizable Templates**: Professional HTML email templates
- 📊 **Comprehensive Reporting**: Detailed visitor analytics and reporting

## Authentication
This API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Email Integration
The system integrates with Microsoft Office 365 Exchange Server for automated email notifications:
- Staff notifications when mentioned by visitors
- Approval/rejection confirmations
- Check-in/check-out notifications
- Custom HTML email templates

## Getting Started
1. Authenticate using `/api/auth/login`
2. Use the returned JWT token for subsequent API calls
3. Explore the endpoints using this interactive documentation

## Support
For technical support or questions, contact the development team.
",
        Contact = new OpenApiContact
        {
            Name = "BABAJI SHIVRAM Development Team",
            Email = "gogulan.a@babajishivram.com"
        },
        License = new OpenApiLicense
        {
            Name = "Proprietary License",
            Url = new Uri("https://babajishivram.com/license")
        }
    });

    // Include XML comments
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }

    // Add custom schema mappings
    c.MapType<DateTime>(() => new OpenApiSchema 
    { 
        Type = "string", 
        Format = "date-time",
        Example = new Microsoft.OpenApi.Any.OpenApiString(DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ssZ"))
    });

    // Add JWT authentication to Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token in the text input below.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Visitor Management API V1");
        c.RoutePrefix = string.Empty; // Set Swagger UI at the app's root
    });
}

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Seed database
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
    
    try
    {
        await context.Database.MigrateAsync();
        await SeedData(context, userManager);
    }
    catch (Exception ex)
    {
        Log.Error(ex, "An error occurred while migrating or seeding the database");
    }
}

app.Run();

// Seed initial data
static async Task SeedData(ApplicationDbContext context, UserManager<User> userManager)
{
    // Seed default admin user
    if (!await userManager.Users.AnyAsync())
    {
        // Create the super admin user
        var superAdminUser = new User
        {
            FirstName = "Super",
            LastName = "Admin",
            Email = "superadmin@company.com",
            UserName = "superadmin@company.com",
            PhoneNumber = "+1 (555) 100-1000",
            Extension = "1000",
            Role = UserRole.Admin,
            IsActive = true
        };

        await userManager.CreateAsync(superAdminUser, "Welcome!23");

        var adminUser = new User
        {
            FirstName = "System",
            LastName = "Administrator",
            Email = "admin@company.com",
            UserName = "admin@company.com",
            PhoneNumber = "+1 (555) 100-1002",
            Extension = "1002",
            Role = UserRole.Admin,
            IsActive = true
        };

        await userManager.CreateAsync(adminUser, "Admin123!");

        var receptionUser = new User
        {
            FirstName = "Sarah",
            LastName = "Johnson",
            Email = "reception@company.com",
            UserName = "reception@company.com",
            PhoneNumber = "+1 (555) 100-1001",
            Extension = "1001",
            Role = UserRole.Reception,
            IsActive = true
        };

        await userManager.CreateAsync(receptionUser, "Reception123!");

        var staffUser = new User
        {
            FirstName = "Emily",
            LastName = "Watson",
            Email = "emily.watson@company.com",
            UserName = "emily.watson@company.com",
            PhoneNumber = "+1 (555) 100-1003",
            Extension = "1003",
            Role = UserRole.Staff,
            Department = "Engineering",
            IsActive = true
        };

        await userManager.CreateAsync(staffUser, "Staff123!");

        var johnUser = new User
        {
            FirstName = "John",
            LastName = "Reception",
            Email = "john@company.com",
            UserName = "john@company.com",
            PhoneNumber = "+1 (555) 100-1004",
            Extension = "1004",
            Role = UserRole.Reception,
            IsActive = true
        };

        await userManager.CreateAsync(johnUser, "Welcome!23");
    }

    // Seed locations
    if (!context.Locations.Any())
    {
        var locations = new[]
        {
            new Location
            {
                Name = "Main Office",
                Address = "123 Business Ave, Suite 100, New York, NY 10001",
                Description = "Corporate headquarters and main reception",
                IsActive = true,
                RegistrationUrl = "main-office",
                QrCodeUrl = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=http://localhost:5173/visit/main-office"
            },
            new Location
            {
                Name = "Corporate Office",
                Address = "789 Corporate Blvd, Tower A, New York, NY 10003",
                Description = "Executive offices and boardroom facilities",
                IsActive = true,
                RegistrationUrl = "corporate-office",
                QrCodeUrl = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=http://localhost:5173/visit/corporate-office"
            },
            new Location
            {
                Name = "Research Lab",
                Address = "456 Innovation Dr, Building B, New York, NY 10002",
                Description = "R&D facility and testing center",
                IsActive = true,
                RegistrationUrl = "research-lab",
                QrCodeUrl = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=http://localhost:5173/visit/research-lab"
            }
        };

        context.Locations.AddRange(locations);
        await context.SaveChangesAsync();
    }

    // Seed staff members
    if (!context.StaffMembers.Any())
    {
        var mainOfficeLocation = context.Locations.FirstOrDefault(l => l.Name == "Main Office");
        var locationId = mainOfficeLocation?.Id ?? 1;

        var staffMembers = new[]
        {
            new StaffMember
            {
                FirstName = "John",
                LastName = "Reception",
                LocationId = locationId,
                Email = "john@company.com",
                Password = BCrypt.Net.BCrypt.HashPassword("Welcome!23"),
                MobileNumber = "+1234567890",
                PhoneNumber = "+1234567890",
                Extension = "1004",
                Designation = "Receptionist",
                Role = "reception",
                IsActive = true,
                CanLogin = true
            },
            new StaffMember
            {
                FirstName = "Sarah",
                LastName = "Johnson",
                LocationId = locationId,
                Email = "reception@company.com",
                Password = BCrypt.Net.BCrypt.HashPassword("Reception123!"),
                MobileNumber = "+1555100001",
                PhoneNumber = "+1555100001",
                Extension = "1001",
                Designation = "Senior Receptionist",
                Role = "reception",
                IsActive = true,
                CanLogin = true
            },
            new StaffMember
            {
                FirstName = "Emily",
                LastName = "Watson",
                LocationId = locationId,
                Email = "emily.watson@company.com",
                Password = BCrypt.Net.BCrypt.HashPassword("Staff123!"),
                MobileNumber = "+1555100003",
                PhoneNumber = "+1555100003",
                Extension = "1003",
                Designation = "Software Engineer",
                Role = "staff",
                IsActive = true,
                CanLogin = true
            }
        };

        context.StaffMembers.AddRange(staffMembers);
        await context.SaveChangesAsync();
    }

    // Seed system settings
    if (!context.SystemSettings.Any())
    {
        var settings = new[]
        {
            new SystemSettings { Key = "PurposeOfVisitOptions", Value = "[\"Business Meeting\",\"Interview\",\"Consultation\",\"Delivery\",\"Maintenance\",\"Training\",\"Other\"]", Description = "Available purpose of visit options" },
            new SystemSettings { Key = "IdTypeOptions", Value = "[\"Driver's License\",\"Passport\",\"National ID\",\"Employee ID\",\"Student ID\"]", Description = "Available ID proof types" },
            new SystemSettings { Key = "IsPhotoMandatory", Value = "false", Description = "Whether visitor photo is mandatory" },
            new SystemSettings { Key = "EnabledFields", Value = "{\"email\":true,\"companyName\":true,\"idProof\":true,\"photo\":true}", Description = "Enabled form fields" }
        };

        context.SystemSettings.AddRange(settings);
        await context.SaveChangesAsync();
    }

    // Update users with role configuration IDs if they exist
    var adminRoleConfig = await context.RoleConfigurations
        .FirstOrDefaultAsync(rc => rc.RoleName == "admin" && rc.IsActive);
    var receptionRoleConfig = await context.RoleConfigurations
        .FirstOrDefaultAsync(rc => rc.RoleName == "reception" && rc.IsActive);
    var staffRoleConfig = await context.RoleConfigurations
        .FirstOrDefaultAsync(rc => rc.RoleName == "staff" && rc.IsActive);

    if (adminRoleConfig != null)
    {
        var adminUsers = await userManager.Users
            .Where(u => u.Role == UserRole.Admin && u.RoleConfigurationId == null)
            .ToListAsync();
        
        foreach (var user in adminUsers)
        {
            user.RoleConfigurationId = adminRoleConfig.Id;
            await userManager.UpdateAsync(user);
        }
    }

    if (receptionRoleConfig != null)
    {
        var receptionUsers = await userManager.Users
            .Where(u => u.Role == UserRole.Reception && u.RoleConfigurationId == null)
            .ToListAsync();
        
        foreach (var user in receptionUsers)
        {
            user.RoleConfigurationId = receptionRoleConfig.Id;
            await userManager.UpdateAsync(user);
        }
    }

    // Seed email templates
    await EmailTemplateSeeder.SeedDefaultTemplatesAsync(context);
}