using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VisitorManagement.API.Migrations
{
    /// <inheritdoc />
    public partial class AddPasswordAndRoleToStaffMember : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "CanLogin",
                table: "StaffMembers",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Password",
                table: "StaffMembers",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Role",
                table: "StaffMembers",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CanLogin",
                table: "StaffMembers");

            migrationBuilder.DropColumn(
                name: "Password",
                table: "StaffMembers");

            migrationBuilder.DropColumn(
                name: "Role",
                table: "StaffMembers");
        }
    }
}
