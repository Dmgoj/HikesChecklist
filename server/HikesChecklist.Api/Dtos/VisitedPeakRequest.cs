using System.ComponentModel.DataAnnotations;

namespace HikesChecklist.Api.Dtos;

public record CreateVisitedPeakRequest(
    int PeakId,
    DateOnly VisitedOn,
    [StringLength(2000)] string? Notes);

public record UpdateVisitedPeakRequest(
    DateOnly VisitedOn,
    [StringLength(2000)] string? Notes);
