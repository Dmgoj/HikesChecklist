namespace HikesChecklist.Api.Services;

public record ParsedPeakQuery(string NameTerm, string? CountryCode);

public static class PeakSearchQueryParser
{
    // Tries progressively longer trailing word-groups of `q` as a country-name prefix (e.g. "cr" -> Costa Rica/Croatia,
    // "costa r" -> Costa Rica). Only commits to a country match when it is unambiguous - if the trailing text prefix-matches
    // more than one country name, it's treated as part of the peak name instead (better to search too broadly than guess wrong).
    public static ParsedPeakQuery Parse(string q)
    {
        var words = q.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (words.Length < 2)
        {
            return new ParsedPeakQuery(q.Trim(), null);
        }

        for (var take = 1; take < words.Length; take++)
        {
            var candidate = string.Join(' ', words[^take..]);
            var matches = CountryNames.ByCode
                .Where(kvp => kvp.Value.StartsWith(candidate, StringComparison.OrdinalIgnoreCase))
                .ToList();

            if (matches.Count == 1)
            {
                var nameTerm = string.Join(' ', words[..^take]).Trim();
                if (nameTerm.Length > 0)
                {
                    return new ParsedPeakQuery(nameTerm, matches[0].Key);
                }
            }
        }

        return new ParsedPeakQuery(q.Trim(), null);
    }
}
