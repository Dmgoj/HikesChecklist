import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getVisitedPeaks, unmarkVisited, updateVisited } from "../api/visitedPeaksApi";
import type { VisitedPeak } from "../types";

export function VisitedListPage() {
  const [visited, setVisited] = useState<VisitedPeak[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPeakId, setEditingPeakId] = useState<number | null>(null);

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    getVisitedPeaks()
      .then(setVisited)
      .finally(() => setLoading(false));
  }

  async function handleUnmark(peakId: number) {
    await unmarkVisited(peakId);
    setVisited((prev) => prev.filter((v) => v.peakId !== peakId));
  }

  async function handleDateChange(peak: VisitedPeak, newDate: string) {
    setEditingPeakId(null);
    if (!newDate || newDate === peak.visitedOn) {
      return;
    }
    const updated = await updateVisited(peak.peakId, newDate, peak.notes ?? undefined);
    setVisited((prev) => prev.map((v) => (v.peakId === peak.peakId ? updated : v)));
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div style={{ maxWidth: 640, margin: "2rem auto" }}>
      <h1>My Visited Peaks</h1>
      {visited.length === 0 && <p>You haven't marked any peaks as visited yet.</p>}
      {visited.map((v) => (
        <div key={v.peakId} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid #eee" }}>
          <div>
            <Link to={`/peaks/${v.peakId}`}>{v.peakName}</Link>
            <div style={{ color: "#666", fontSize: "0.9em" }}>
              {v.countryCode}
              {v.elevationMeters ? ` · ${v.elevationMeters}m` : ""} · Visited{" "}
              {editingPeakId === v.peakId ? (
                <input
                  type="date"
                  defaultValue={v.visitedOn}
                  autoFocus
                  onBlur={(e) => handleDateChange(v, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleDateChange(v, e.currentTarget.value);
                    } else if (e.key === "Escape") {
                      setEditingPeakId(null);
                    }
                  }}
                />
              ) : (
                <span
                  onDoubleClick={() => setEditingPeakId(v.peakId)}
                  title="Double-click to edit"
                  style={{ cursor: "pointer", textDecoration: "underline dotted" }}
                >
                  {v.visitedOn}
                </span>
              )}
              {v.notes ? ` · ${v.notes}` : ""}
            </div>
          </div>
          <button onClick={() => handleUnmark(v.peakId)}>Unmark</button>
        </div>
      ))}
    </div>
  );
}
