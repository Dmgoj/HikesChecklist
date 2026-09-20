import { useEffect, useState } from "react";
import { searchPeaks } from "../api/peaksApi";
import { getVisitedPeaks } from "../api/visitedPeaksApi";
import { getBucketList } from "../api/bucketListApi";
import { PeakCard } from "../components/PeakCard";
import { useAuth } from "../auth/useAuth";
import type { PeakSummary } from "../types";

export function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PeakSummary[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [visitedIds, setVisitedIds] = useState<Set<number>>(new Set());
  const [bucketListIds, setBucketListIds] = useState<Set<number>>(new Set());
  const { isAuthenticated } = useAuth();
  const pageSize = 20;

  useEffect(() => {
    if (isAuthenticated) {
      getVisitedPeaks().then((visited) => setVisitedIds(new Set(visited.map((v) => v.peakId))));
      getBucketList().then((bucketList) => setBucketListIds(new Set(bucketList.map((b) => b.peakId))));
    } else {
      setVisitedIds(new Set());
      setBucketListIds(new Set());
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setTotalCount(0);
      return;
    }

    const timeout = setTimeout(() => {
      setLoading(true);
      searchPeaks(query, page, pageSize)
        .then((res) => {
          setResults(res.items);
          setTotalCount(res.totalCount);
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, page]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div style={{ maxWidth: 640, margin: "2rem auto" }}>
      <h1>Search Peaks</h1>
      <input
        type="text"
        placeholder="Search by name, optionally with a country (e.g. Dolomiti Italy)"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setPage(1);
        }}
        style={{ width: "100%", padding: "0.5rem" }}
      />
      {loading && <p>Searching...</p>}
      {!loading && query.trim().length >= 2 && results.length === 0 && <p>No peaks found.</p>}
      <div style={{ marginTop: "1rem" }}>
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
