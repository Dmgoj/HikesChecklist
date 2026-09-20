using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HikesChecklist.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddBucketList : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BucketListEntries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UserId = table.Column<string>(type: "TEXT", nullable: false),
                    PeakId = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BucketListEntries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BucketListEntries_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BucketListEntries_Peaks_PeakId",
                        column: x => x.PeakId,
                        principalTable: "Peaks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BucketListEntries_PeakId",
                table: "BucketListEntries",
                column: "PeakId");

            migrationBuilder.CreateIndex(
                name: "IX_BucketListEntries_UserId_PeakId",
                table: "BucketListEntries",
                columns: new[] { "UserId", "PeakId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BucketListEntries");
        }
    }
}
