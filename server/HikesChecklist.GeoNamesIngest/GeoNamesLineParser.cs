using System.Globalization;

namespace HikesChecklist.GeoNamesIngest;

public static class GeoNamesLineParser
{
    private static readonly HashSet<string> MountainFeatureCodes = new(StringComparer.OrdinalIgnoreCase)
    {
        "MT", "MTS", "PK"
    };

    // GeoNames allCountries.txt columns (0-indexed):
    // 0 geonameid, 1 name, 3 alternatenames, 4 latitude, 5 longitude,
    // 6 feature class, 7 feature code, 8 country code,
    // 15 elevation, 16 dem, 17 timezone, 18 modification date
    public static GeoNamesRecord? TryParseMountainLine(string line)
    {
        var fields = line.Split('\t');
        if (fields.Length < 19)
        {
            return null;
        }

        if (fields[6] != "T" || !MountainFeatureCodes.Contains(fields[7]))
        {
            return null;
        }

        if (!long.TryParse(fields[0], NumberStyles.Integer, CultureInfo.InvariantCulture, out var geoNameId))
        {
            return null;
        }

        if (!double.TryParse(fields[4], NumberStyles.Float, CultureInfo.InvariantCulture, out var latitude) ||
            !double.TryParse(fields[5], NumberStyles.Float, CultureInfo.InvariantCulture, out var longitude))
        {
            return null;
        }

        int? elevation = null;
        if (int.TryParse(fields[15], NumberStyles.Integer, CultureInfo.InvariantCulture, out var ele) && ele != 0)
        {
            elevation = ele;
        }
        else if (int.TryParse(fields[16], NumberStyles.Integer, CultureInfo.InvariantCulture, out var dem) && dem != 0)
        {
            elevation = dem;
        }

        var modifiedAt = DateTime.TryParse(fields[18], CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsedDate)
            ? DateTime.SpecifyKind(parsedDate, DateTimeKind.Utc)
            : DateTime.UtcNow;

        return new GeoNamesRecord(
            geoNameId,
            fields[1],
            fields[3],
            latitude,
            longitude,
            fields[7],
            fields[8],
            elevation,
            fields[17],
            modifiedAt);
    }
}
