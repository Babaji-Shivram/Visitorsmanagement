using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SimpleAPI.Models.Entities;

namespace SimpleAPI.Data
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
                // Remove SQL Server specific default values for in-memory database compatibility
            });

            // Configure StaffMember entity
            builder.Entity<StaffMember>(entity =>
            {
                entity.HasIndex(e => e.Email).IsUnique();
                // Remove SQL Server specific default values for in-memory database compatibility

                entity.HasOne(e => e.Location)
                      .WithMany(l => l.StaffMembers)
                      .HasForeignKey(e => e.LocationId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure Visitor entity
            builder.Entity<Visitor>(entity =>
            {
                entity.Property(e => e.Status).HasConversion<int>();
                // Remove SQL Server specific default values for in-memory database compatibility

                entity.HasOne(e => e.Location)
                      .WithMany(l => l.Visitors)
                      .HasForeignKey(e => e.LocationId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure CustomField entity
            builder.Entity<CustomField>(entity =>
            {
                entity.Property(e => e.Type).HasConversion<int>();
                // Remove SQL Server specific default values for in-memory database compatibility
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
                // Remove SQL Server specific default values for in-memory database compatibility
            });
        }
    }
}
