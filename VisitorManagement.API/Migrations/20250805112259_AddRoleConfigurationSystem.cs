using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VisitorManagement.API.Migrations
{
    /// <inheritdoc />
    public partial class AddRoleConfigurationSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "RoleConfigurationId",
                table: "AspNetUsers",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "RoleConfigurations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DisplayName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ColorClass = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    IconClass = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoleConfigurations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RolePermissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleConfigurationId = table.Column<int>(type: "int", nullable: false),
                    PermissionName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RolePermissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RolePermissions_RoleConfigurations_RoleConfigurationId",
                        column: x => x.RoleConfigurationId,
                        principalTable: "RoleConfigurations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RoleRoutes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleConfigurationId = table.Column<int>(type: "int", nullable: false),
                    RoutePath = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    RouteLabel = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    IconName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoleRoutes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RoleRoutes_RoleConfigurations_RoleConfigurationId",
                        column: x => x.RoleConfigurationId,
                        principalTable: "RoleConfigurations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_RoleConfigurationId",
                table: "AspNetUsers",
                column: "RoleConfigurationId");

            migrationBuilder.CreateIndex(
                name: "IX_RoleConfigurations_RoleName",
                table: "RoleConfigurations",
                column: "RoleName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissions_RoleConfigurationId_PermissionName",
                table: "RolePermissions",
                columns: new[] { "RoleConfigurationId", "PermissionName" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RoleRoutes_RoleConfigurationId_RoutePath",
                table: "RoleRoutes",
                columns: new[] { "RoleConfigurationId", "RoutePath" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUsers_RoleConfigurations_RoleConfigurationId",
                table: "AspNetUsers",
                column: "RoleConfigurationId",
                principalTable: "RoleConfigurations",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUsers_RoleConfigurations_RoleConfigurationId",
                table: "AspNetUsers");

            migrationBuilder.DropTable(
                name: "RolePermissions");

            migrationBuilder.DropTable(
                name: "RoleRoutes");

            migrationBuilder.DropTable(
                name: "RoleConfigurations");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_RoleConfigurationId",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "RoleConfigurationId",
                table: "AspNetUsers");
        }
    }
}
