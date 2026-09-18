namespace HikesChecklist.Api.Dtos;

public record CreateVisitedPeakRequest(int PeakId, DateOnly VisitedOn, string? Notes);

public record UpdateVisitedPeakRequest(DateOnly VisitedOn, string? Notes);
