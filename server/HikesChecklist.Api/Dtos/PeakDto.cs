namespace HikesChecklist.Api.Dtos;

public record PeakDto(
    int Id,
    long GeoNameId,
    string Name,
    string? AlternateNames,
    double Latitude,
    double Longitude,
    int? ElevationMeters,
    string CountryCode,
    string CountryName,
    string FeatureCode);
