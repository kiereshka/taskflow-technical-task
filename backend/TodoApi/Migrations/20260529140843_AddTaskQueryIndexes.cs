using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TodoApi.Migrations
{
    /// <inheritdoc />
    public partial class AddTaskQueryIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Tasks_UserId",
                table: "Tasks");

            migrationBuilder.DropIndex(
                name: "IX_Categories_UserId",
                table: "Categories");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_UserId_CategoryId_IsCompleted_CreatedAt",
                table: "Tasks",
                columns: new[] { "UserId", "CategoryId", "IsCompleted", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_UserId_DueDate",
                table: "Tasks",
                columns: new[] { "UserId", "DueDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_UserId_IsCompleted_CreatedAt",
                table: "Tasks",
                columns: new[] { "UserId", "IsCompleted", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Categories_UserId_Name",
                table: "Categories",
                columns: new[] { "UserId", "Name" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Tasks_UserId_CategoryId_IsCompleted_CreatedAt",
                table: "Tasks");

            migrationBuilder.DropIndex(
                name: "IX_Tasks_UserId_DueDate",
                table: "Tasks");

            migrationBuilder.DropIndex(
                name: "IX_Tasks_UserId_IsCompleted_CreatedAt",
                table: "Tasks");

            migrationBuilder.DropIndex(
                name: "IX_Categories_UserId_Name",
                table: "Categories");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_UserId",
                table: "Tasks",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Categories_UserId",
                table: "Categories",
                column: "UserId");
        }
    }
}
