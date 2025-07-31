using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using System.Text;
using VisitorManagement.API.Data;
using VisitorManagement.API.Models.Entities;
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
var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]!);

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

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Visitor Management API",
        Version = "v1",
        Description = "A comprehensive visitor management system API"
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

app.UseCors("AllowReactApp");

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
                QrCodeUrl = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=http://localhost:5173/register/main-office"
            },
            new Location
            {
                Name = "Research Lab",
                Address = "456 Innovation Dr, Building B, New York, NY 10002",
                Description = "R&D facility and testing center",
                IsActive = true,
                RegistrationUrl = "research-lab",
                QrCodeUrl = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=http://localhost:5173/register/research-lab"
            }
        };

        context.Locations.AddRange(locations);
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
}