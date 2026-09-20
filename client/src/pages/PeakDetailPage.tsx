import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPeak } from "../api/peaksApi";
import { PeakMap } from "../components/PeakMap";
import type { PeakDetail } from "../types";

export function PeakDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [peak, setPeak] = useState<PeakDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getPeak(Number(id))
      .then(setPeak)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!peak) {
    return <p>Peak not found.</p>;
  }

  return (
    <div style={{ maxWidth: 640, margin: "2rem auto" }}>
      <h1>{peak.name}</h1>
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
