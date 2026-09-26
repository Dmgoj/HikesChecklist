import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBucketList, removeFromBucketList } from "../api/bucketListApi";
import { VisitedToggleButton } from "../components/VisitedToggleButton";
import type { BucketListEntry } from "../types";

export function BucketListPage() {
  const [bucketList, setBucketList] = useState<BucketListEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    getBucketList()
      .then(setBucketList)
      .finally(() => setLoading(false));
  }

  async function handleRemove(peakId: number) {
    await removeFromBucketList(peakId);
    setBucketList((prev) => prev.filter((b) => b.peakId !== peakId));
  }

  function handleMarkedVisited(peakId: number, visited: boolean) {
    if (visited) {
      setBucketList((prev) => prev.filter((b) => b.peakId !== peakId));
    }
  }

  if (loading) {
    return <p style={{ padding: "56px 40px", color: "var(--color-text-muted)" }}>Loading...</p>;
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 40px 64px" }}>
      <div className="mono" style={{ fontSize: 12, letterSpacing: 3, textTransform: "uppercase", color: "var(--color-accent)", marginBottom: 14 }}>
        Wishlist
      </div>
      <h1 style={{ margin: "0 0 32px", fontFamily: "var(--font-display)", fontSize: 44, letterSpacing: 0.3, textTransform: "uppercase" }}>
        Bucket List
      </h1>

      {bucketList.length === 0 && (
        <p style={{ color: "var(--color-text-muted)" }}>You haven't added any peaks to your bucket list yet.</p>
      )}

      {bucketList.map((b) => (
        <div
          key={b.peakId}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, padding: "18px 12px", borderTop: "1px solid var(--color-border)" }}
        >
          <div>
            <Link to={`/peaks/${b.peakId}`} className="link" style={{ fontWeight: 700, fontSize: 17 }}>
              {b.peakName}
            </Link>
            <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginTop: 4 }}>
              {b.countryCode}
              {b.elevationMeters ? ` · ${b.elevationMeters}m` : ""}
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <VisitedToggleButton
              peakId={b.peakId}
              initialVisited={false}
              onChange={(visited) => handleMarkedVisited(b.peakId, visited)}
            />
            <button onClick={() => handleRemove(b.peakId)} className="btn btn-ghost">
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
