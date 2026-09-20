import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBucketList, removeFromBucketList } from "../api/bucketListApi";
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

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div style={{ maxWidth: 640, margin: "2rem auto" }}>
      <h1>Bucket List</h1>
      {bucketList.length === 0 && <p>You haven't added any peaks to your bucket list yet.</p>}
      {bucketList.map((b) => (
        <div key={b.peakId} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid #eee" }}>
          <div>
            <Link to={`/peaks/${b.peakId}`}>{b.peakName}</Link>
            <div style={{ color: "#666", fontSize: "0.9em" }}>
              {b.countryCode}
              {b.elevationMeters ? ` · ${b.elevationMeters}m` : ""}
            </div>
          </div>
          <button onClick={() => handleRemove(b.peakId)}>Remove</button>
        </div>
      ))}
    </div>
  );
}
