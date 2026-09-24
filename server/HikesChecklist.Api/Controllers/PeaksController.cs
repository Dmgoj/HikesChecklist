using HikesChecklist.Api.Data;
using HikesChecklist.Api.Dtos;
using HikesChecklist.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HikesChecklist.Api.Controllers;

[ApiController]
[Route("api/peaks")]
public class PeaksController(AppDbContext db) : ControllerBase
{
    [HttpGet("search")]
    public async Task<ActionResult<PeakSearchResultDto>> Search(
        [FromQuery] string? q,
        [FromQuery] string? country,
        [FromQuery] int? minElevation,
        [FromQuery] int? maxElevation,
        [FromQuery] string sortBy = "name",
        [FromQuery] string sortDir = "asc",
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var hasNameQuery = !string.IsNullOrWhiteSpace(q);
        var hasFilter = !string.IsNullOrWhiteSpace(country) || minElevation.HasValue || maxElevation.HasValue;

        if (!hasNameQuery && !hasFilter)
        {
            return BadRequest("Provide a search query, a country, or an elevation filter.");
        }

        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = db.Peaks.AsNoTracking().AsQueryable();

        if (hasNameQuery)
        {
            query = query.Where(p => EF.Functions.Like(p.Name, $"%{q}%"));
        }

        if (!string.IsNullOrWhiteSpace(country))
        {
            query = query.Where(p => p.CountryCode == country);
        }

        if (minElevation.HasValue)
        {
            query = query.Where(p => p.ElevationMeters != null && p.ElevationMeters >= minElevation.Value);
        }

        if (maxElevation.HasValue)
        {
            query = query.Where(p => p.ElevationMeters != null && p.ElevationMeters < maxElevation.Value);
        }

        var totalCount = await query.CountAsync();

        var descending = string.Equals(sortDir, "desc", StringComparison.OrdinalIgnoreCase);

        query = sortBy.ToLowerInvariant() switch
        {
            "elevation" => descending
                ? query.OrderByDescending(p => p.ElevationMeters.HasValue).ThenByDescending(p => p.ElevationMeters)
                : query.OrderByDescending(p => p.ElevationMeters.HasValue).ThenBy(p => p.ElevationMeters),
            _ => descending
                ? query.OrderByDescending(p => p.Name)
                : query.OrderBy(p => p.Name),
        };

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new PeakSummaryDto(p.Id, p.Name, p.CountryCode, p.ElevationMeters))
            .ToListAsync();

        return Ok(new PeakSearchResultDto(items, page, pageSize, totalCount));
    }

    [HttpGet("countries")]
    public async Task<ActionResult<IReadOnlyList<CountryOptionDto>>> GetCountries()
    {
        var codes = await db.Peaks
            .AsNoTracking()
            .Where(p => p.CountryCode != "")
            .Select(p => p.CountryCode)
            .Distinct()
            .ToListAsync();

        var countries = codes
            .Select(code => new CountryOptionDto(code, CountryNames.ByCode.GetValueOrDefault(code, code)))
            .OrderBy(c => c.Name)
            .ToList();

        return Ok(countries);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PeakDto>> GetById(int id)
    {
        var peak = await db.Peaks.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id);
        if (peak is null)
        {
            return NotFound();
        }

        return Ok(new PeakDto(
            peak.Id,
            peak.GeoNameId,
            peak.Name,
            peak.AlternateNames,
            peak.Latitude,
            peak.Longitude,
            peak.ElevationMeters,
            peak.CountryCode,
            CountryNames.ByCode.GetValueOrDefault(peak.CountryCode, peak.CountryCode),
            peak.FeatureCode));
    }
}
