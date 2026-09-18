import { Link } from "react-router-dom";
import type { PeakSummary } from "../types";
import { VisitedToggleButton } from "./VisitedToggleButton";

interface Props {
  peak: PeakSummary;
  visited: boolean;
}

export function PeakCard({ peak, visited }: Props) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid #eee" }}>
      <div>
        <Link to={`/peaks/${peak.id}`}>{peak.name}</Link>
        <span style={{ color: "#666", marginLeft: "0.5rem" }}>
          {peak.countryCode}
          {peak.elevationMeters ? ` · ${peak.elevationMeters}m` : ""}
        </span>
      </div>
      <VisitedToggleButton peakId={peak.id} initialVisited={visited} />
    </div>
  );
}
