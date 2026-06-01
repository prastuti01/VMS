using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace VehicleManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SyncMigrations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: new Guid("a1111111-0000-0000-0000-000000000001"));

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: new Guid("a2222222-0000-0000-0000-000000000002"));

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: new Guid("a3333333-0000-0000-0000-000000000003"));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { new Guid("a1111111-0000-0000-0000-000000000001"), "1", "Admin", "ADMIN" },
                    { new Guid("a2222222-0000-0000-0000-000000000002"), "2", "Staff", "STAFF" },
                    { new Guid("a3333333-0000-0000-0000-000000000003"), "3", "Customer", "CUSTOMER" }
                });
        }
    }
}
