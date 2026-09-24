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
    return <p style={{ padding: "56px 40px", color: "var(--color-text-muted)" }}>Loading...</p>;
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 40px 64px" }}>
      <div className="mono" style={{ fontSize: 12, letterSpacing: 3, textTransform: "uppercase", color: "var(--color-accent)", marginBottom: 14 }}>
        Your log
      </div>
      <h1 style={{ margin: "0 0 32px", fontFamily: "var(--font-display)", fontSize: 44, letterSpacing: 0.3, textTransform: "uppercase" }}>
        Visited Peaks
      </h1>

      {visited.length === 0 && (
        <p style={{ color: "var(--color-text-muted)" }}>You haven't marked any peaks as visited yet.</p>
      )}

      {visited.map((v) => (
        <div
          key={v.peakId}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, padding: "18px 12px", borderTop: "1px solid var(--color-border)" }}
        >
          <div>
            <Link to={`/peaks/${v.peakId}`} className="link" style={{ fontWeight: 700, fontSize: 17 }}>
              {v.peakName}
            </Link>
            <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginTop: 4 }}>
              {v.countryCode}
              {v.elevationMeters ? ` · ${v.elevationMeters}m` : ""} · Visited{" "}
              {editingPeakId === v.peakId ? (
                <input
                  type="date"
                  defaultValue={v.visitedOn}
                  autoFocus
                  className="input"
                  style={{ padding: "2px 6px", fontSize: 13, display: "inline-block" }}
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
                  style={{ cursor: "pointer", textDecoration: "underline dotted", color: "var(--color-accent-text)" }}
                >
                  {v.visitedOn}
                </span>
              )}
              {v.notes ? ` · ${v.notes}` : ""}
            </div>
          </div>
          <button onClick={() => handleUnmark(v.peakId)} className="btn btn-ghost">
            Unmark
          </button>
        </div>
      ))}
    </div>
  );
}
