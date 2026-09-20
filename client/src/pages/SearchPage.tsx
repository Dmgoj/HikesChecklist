import { useEffect, useState } from "react";
import { searchPeaks, getCountries, type SortBy, type SortDir } from "../api/peaksApi";
import { getVisitedPeaks } from "../api/visitedPeaksApi";
import { getBucketList } from "../api/bucketListApi";
import { PeakCard } from "../components/PeakCard";
import { useAuth } from "../auth/useAuth";
import type { CountryOption, PeakSummary } from "../types";

const ELEVATION_BUCKETS = [
  { label: "Any elevation", min: undefined, max: undefined },
  { label: "< 1000m", min: undefined, max: 1000 },
  { label: "1000 - 2000m", min: 1000, max: 2000 },
  { label: "2000 - 3000m", min: 2000, max: 3000 },
  { label: "3000 - 4000m", min: 3000, max: 4000 },
  { label: "4000 - 5000m", min: 4000, max: 5000 },
  { label: "5000 - 6000m", min: 5000, max: 6000 },
  { label: "6000m+", min: 6000, max: undefined },
] as const;

export function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PeakSummary[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [visitedIds, setVisitedIds] = useState<Set<number>>(new Set());
  const [bucketListIds, setBucketListIds] = useState<Set<number>>(new Set());
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [countryFilter, setCountryFilter] = useState("");
  const [elevationBucketIndex, setElevationBucketIndex] = useState(0);
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const { isAuthenticated } = useAuth();
  const pageSize = 20;

  function toggleSort(column: SortBy) {
    if (sortBy === column) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortDir("asc");
    }
    setPage(1);
  }

  function sortArrow(column: SortBy) {
    if (sortBy !== column) {
      return "";
    }
    return sortDir === "asc" ? " ▲" : " ▼";
  }

  useEffect(() => {
    getCountries().then(setCountries);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      getVisitedPeaks().then((visited) => setVisitedIds(new Set(visited.map((v) => v.peakId))));
      getBucketList().then((bucketList) => setBucketListIds(new Set(bucketList.map((b) => b.peakId))));
    } else {
      setVisitedIds(new Set());
      setBucketListIds(new Set());
    }
  }, [isAuthenticated]);

  const hasFilter = countryFilter !== "" || elevationBucketIndex !== 0;
  const canSearch = query.trim().length >= 2 || hasFilter;

  useEffect(() => {
    if (!canSearch) {
      setResults([]);
      setTotalCount(0);
      return;
    }

    const bucket = ELEVATION_BUCKETS[elevationBucketIndex];

    const timeout = setTimeout(() => {
      setLoading(true);
      searchPeaks(query.trim(), page, pageSize, {
        country: countryFilter || undefined,
        minElevation: bucket.min,
        maxElevation: bucket.max,
        sortBy,
        sortDir,
      })
        .then((res) => {
          setResults(res.items);
          setTotalCount(res.totalCount);
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, page, countryFilter, elevationBucketIndex, canSearch, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div style={{ maxWidth: 640, margin: "2rem auto" }}>
      <h1>Search Peaks</h1>
      <input
        type="text"
        placeholder="Search by name (e.g. Everest), or leave blank and use the filters below"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setPage(1);
        }}
        style={{ width: "100%", padding: "0.5rem" }}
      />
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
        <select
          value={countryFilter}
          onChange={(e) => {
            setCountryFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All countries</option>
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={elevationBucketIndex}
          onChange={(e) => {
            setElevationBucketIndex(Number(e.target.value));
            setPage(1);
          }}
        >
          {ELEVATION_BUCKETS.map((bucket, index) => (
            <option key={bucket.label} value={index}>
              {bucket.label}
            </option>
          ))}
        </select>
      </div>
      {loading && <p>Searching...</p>}
      {!loading && canSearch && results.length === 0 && <p>No peaks found.</p>}
      {results.length > 0 && (
        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", fontSize: "0.9em", color: "#666" }}>
          <button
            onClick={() => toggleSort("name")}
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer", font: "inherit", color: "inherit" }}
          >
            Sort by name{sortArrow("name")}
          </button>
          <button
            onClick={() => toggleSort("elevation")}
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer", font: "inherit", color: "inherit" }}
          >
            Sort by elevation{sortArrow("elevation")}
          </button>
        </div>
      )}
      <div style={{ marginTop: "0.5rem" }}>
        {results.map((peak) => (
          <PeakCard
            key={peak.id}
            peak={peak}
            visited={visitedIds.has(peak.id)}
            onBucketList={bucketListIds.has(peak.id)}
          />
        ))}
      </div>
      {totalCount > pageSize && (
        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
