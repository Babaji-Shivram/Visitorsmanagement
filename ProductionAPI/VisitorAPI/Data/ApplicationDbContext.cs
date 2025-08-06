using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using VisitorManagement.API.Models.Entities;
using VisitorManagement.API.Models.Email;

namespace VisitorManagement.API.Data
{
    public class ApplicationDbContext : IdentityDbContext<User>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Location> Locations { get; set; }
        public DbSet<StaffMember> StaffMembers { get; set; }
        public DbSet<Visitor> Visitors { get; set; }
        public DbSet<CustomField> CustomFields { get; set; }
        public DbSet<VisitorCustomFieldValue> VisitorCustomFieldValues { get; set; }
        public DbSet<SystemSettings> SystemSettings { get; set; }
        public DbSet<LocationSettings> LocationSettings { get; set; }
        public DbSet<RoleConfiguration> RoleConfigurations { get; set; }
        public DbSet<RolePermission> RolePermissions { get; set; }
        public DbSet<RoleRoute> RoleRoutes { get; set; }
        public DbSet<EmailTemplate> EmailTemplates { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Configure User entity
            builder.Entity<User>(entity =>
            {
                entity.Property(e => e.Role).HasConversion<int>();
                entity.HasIndex(e => e.Email).IsUnique();
            });

            // Configure Location entity
            builder.Entity<Location>(entity =>
            {
                entity.HasIndex(e => e.RegistrationUrl).IsUnique();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
            });

            // Configure StaffMember entity
            builder.Entity<StaffMember>(entity =>
            {
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");

                entity.HasOne(e => e.Location)
                      .WithMany(l => l.StaffMembers)
                      .HasForeignKey(e => e.LocationId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure Visitor entity
            builder.Entity<Visitor>(entity =>
            {
                entity.Property(e => e.Status).HasConversion<int>();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");

                entity.HasOne(e => e.Location)
                      .WithMany(l => l.Visitors)
                      .HasForeignKey(e => e.LocationId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure CustomField entity
            builder.Entity<CustomField>(entity =>
            {
                entity.Property(e => e.Type).HasConversion<int>();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
            });

            // Configure VisitorCustomFieldValue entity
            builder.Entity<VisitorCustomFieldValue>(entity =>
            {
                entity.HasOne(e => e.Visitor)
                      .WithMany(v => v.CustomFieldValues)
                      .HasForeignKey(e => e.VisitorId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.CustomField)
                      .WithMany(cf => cf.Values)
                      .HasForeignKey(e => e.CustomFieldId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure SystemSettings entity
            builder.Entity<SystemSettings>(entity =>
            {
                entity.HasIndex(e => e.Key).IsUnique();
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
            });

            // Configure LocationSettings entity
            builder.Entity<LocationSettings>(entity =>
            {
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");

                entity.HasOne(e => e.Location)
                      .WithMany()
                      .HasForeignKey(e => e.LocationId)
                      .OnDelete(DeleteBehavior.Cascade);

                // Ensure only one settings record per location (or one global)
                entity.HasIndex(e => e.LocationId).IsUnique();
            });

            // Configure RoleConfiguration entity
            builder.Entity<RoleConfiguration>(entity =>
            {
                entity.HasIndex(e => e.RoleName).IsUnique();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
            });

            // Configure RolePermission entity
            builder.Entity<RolePermission>(entity =>
            {
                entity.HasOne(e => e.RoleConfiguration)
                      .WithMany(r => r.RolePermissions)
                      .HasForeignKey(e => e.RoleConfigurationId)
                      .OnDelete(DeleteBehavior.Cascade);

                // Prevent duplicate permissions per role
                entity.HasIndex(e => new { e.RoleConfigurationId, e.PermissionName }).IsUnique();
            });

            // Configure RoleRoute entity
            builder.Entity<RoleRoute>(entity =>
            {
                entity.HasOne(e => e.RoleConfiguration)
                      .WithMany(r => r.RoleRoutes)
                      .HasForeignKey(e => e.RoleConfigurationId)
                      .OnDelete(DeleteBehavior.Cascade);

                // Prevent duplicate routes per role
                entity.HasIndex(e => new { e.RoleConfigurationId, e.RoutePath }).IsUnique();
            });

            // Configure User relationship with RoleConfiguration
            builder.Entity<User>(entity =>
            {
                entity.HasOne(e => e.RoleConfiguration)
                      .WithMany()
                      .HasForeignKey(e => e.RoleConfigurationId)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            // Configure EmailTemplate entity
            builder.Entity<EmailTemplate>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Subject).IsRequired().HasMaxLength(500);
                entity.Property(e => e.Body).IsRequired();
                entity.Property(e => e.Type).IsRequired();
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");

                // Unique constraint on template type and active status
                entity.HasIndex(e => new { e.Type, e.IsActive }).IsUnique();
            });
        }
    }
}