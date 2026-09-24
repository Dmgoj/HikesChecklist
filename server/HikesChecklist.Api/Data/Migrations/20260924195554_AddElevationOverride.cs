using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HikesChecklist.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddElevationOverride : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ElevationOverrides",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    PeakId = table.Column<int>(type: "INTEGER", nullable: false),
                    ElevationMeters = table.Column<int>(type: "INTEGER", nullable: false),
                    Source = table.Column<string>(type: "TEXT", nullable: false),
                    Note = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ElevationOverrides", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ElevationOverrides_Peaks_PeakId",
                        column: x => x.PeakId,
                        principalTable: "Peaks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ElevationOverrides_PeakId",
                table: "ElevationOverrides",
                column: "PeakId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ElevationOverrides");
        }
    }
}
