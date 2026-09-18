using HikesChecklist.Api.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace HikesChecklist.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : IdentityDbContext<ApplicationUser>(options)
{
    public DbSet<Peak> Peaks => Set<Peak>();
    public DbSet<VisitedPeak> VisitedPeaks => Set<VisitedPeak>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Peak>()
            .HasIndex(p => p.GeoNameId)
            .IsUnique();

        builder.Entity<Peak>()
            .HasIndex(p => p.Name);

        builder.Entity<VisitedPeak>()
            .HasIndex(v => new { v.UserId, v.PeakId })
            .IsUnique();

        builder.Entity<VisitedPeak>()
            .HasOne(v => v.Peak)
            .WithMany(p => p.VisitedByUsers)
            .HasForeignKey(v => v.PeakId);

        builder.Entity<VisitedPeak>()
            .HasOne(v => v.User)
            .WithMany()
            .HasForeignKey(v => v.UserId);
    }
}
