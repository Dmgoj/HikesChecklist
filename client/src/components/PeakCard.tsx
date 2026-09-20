import { useState } from "react";
import { Link } from "react-router-dom";
import type { PeakSummary } from "../types";
import { VisitedToggleButton } from "./VisitedToggleButton";
import { BucketListToggleButton } from "./BucketListToggleButton";

interface Props {
  peak: PeakSummary;
  visited: boolean;
  onBucketList: boolean;
}

export function PeakCard({ peak, visited, onBucketList }: Props) {
  const [onList, setOnList] = useState(onBucketList);

  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid #eee" }}>
      <div>
        <Link to={`/peaks/${peak.id}`}>{peak.name}</Link>
        <span style={{ color: "#666", marginLeft: "0.5rem" }}>
          {peak.countryCode}
          {peak.elevationMeters ? ` · ${peak.elevationMeters}m` : ""}
        </span>
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <BucketListToggleButton
          key={`bucket-${peak.id}-${onList}`}
          peakId={peak.id}
          initialOnList={onList}
          onChange={setOnList}
        />
        <VisitedToggleButton
          key={`visited-${peak.id}`}
          peakId={peak.id}
          initialVisited={visited}
          onChange={(isVisited) => {
            if (isVisited) {
              setOnList(false);
            }
          }}
        />
      </div>
    </div>
  );
}
