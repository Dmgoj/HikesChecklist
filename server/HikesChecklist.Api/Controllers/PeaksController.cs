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
        [FromQuery] string q,
        [FromQuery] string? country,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        if (string.IsNullOrWhiteSpace(q))
        {
            return BadRequest("Query parameter 'q' is required.");
        }

        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var effectiveCountry = country;
        var nameTerm = q;

        if (string.IsNullOrWhiteSpace(effectiveCountry))
        {
            var parsed = PeakSearchQueryParser.Parse(q);
            nameTerm = parsed.NameTerm;
            effectiveCountry = parsed.CountryCode;
        }

        var query = db.Peaks.AsNoTracking().Where(p => EF.Functions.Like(p.Name, $"%{nameTerm}%"));

        if (!string.IsNullOrWhiteSpace(effectiveCountry))
        {
            query = query.Where(p => p.CountryCode == effectiveCountry);
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderBy(p => p.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new PeakSummaryDto(p.Id, p.Name, p.CountryCode, p.ElevationMeters))
            .ToListAsync();

        return Ok(new PeakSearchResultDto(items, page, pageSize, totalCount));
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
            peak.FeatureCode));
    }
}
