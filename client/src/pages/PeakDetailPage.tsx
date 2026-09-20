import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPeak } from "../api/peaksApi";
import { getVisitedPeaks } from "../api/visitedPeaksApi";
import { PeakMap } from "../components/PeakMap";
import { VisitedToggleButton } from "../components/VisitedToggleButton";
import { useAuth } from "../auth/useAuth";
import type { PeakDetail } from "../types";

export function PeakDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [peak, setPeak] = useState<PeakDetail | null>(null);
  const [visited, setVisited] = useState(false);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    const peakPromise = getPeak(Number(id));
    const visitedPromise = isAuthenticated
      ? getVisitedPeaks().then((list) => list.some((v) => v.peakId === Number(id)))
      : Promise.resolve(false);

    Promise.all([peakPromise, visitedPromise])
      .then(([peakResult, visitedResult]) => {
        setPeak(peakResult);
        setVisited(visitedResult);
      })
      .finally(() => setLoading(false));
  }, [id, isAuthenticated]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!peak) {
    return <p>Peak not found.</p>;
  }

  return (
    <div style={{ maxWidth: 640, margin: "2rem auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>{peak.name}</h1>
        <VisitedToggleButton key={peak.id} peakId={peak.id} initialVisited={visited} onChange={setVisited} />
      </div>
      <ul>
        <li>Country: {peak.countryCode}</li>
        <li>Elevation: {peak.elevationMeters ? `${peak.elevationMeters}m` : "Unknown"}</li>
        <li>
          Coordinates: {peak.latitude.toFixed(4)}, {peak.longitude.toFixed(4)}
        </li>
        {peak.alternateNames && <li>Also known as: {peak.alternateNames}</li>}
      </ul>
      <div style={{ marginTop: "1rem" }}>
        <PeakMap name={peak.name} latitude={peak.latitude} longitude={peak.longitude} />
      </div>
    </div>
  );
}
