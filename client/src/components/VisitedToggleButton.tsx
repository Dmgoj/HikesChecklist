import { useState } from "react";
import { markVisited, unmarkVisited } from "../api/visitedPeaksApi";
import { useAuth } from "../auth/useAuth";

interface Props {
  peakId: number;
  initialVisited: boolean;
  onChange?: (visited: boolean) => void;
}

export function VisitedToggleButton({ peakId, initialVisited, onChange }: Props) {
  const { isAuthenticated } = useAuth();
  const [visited, setVisited] = useState(initialVisited);
  const [busy, setBusy] = useState(false);

  if (!isAuthenticated) {
    return null;
  }

  async function handleClick() {
    setBusy(true);
    try {
      if (visited) {
        await unmarkVisited(peakId);
        setVisited(false);
        onChange?.(false);
      } else {
        await markVisited(peakId, new Date().toISOString().slice(0, 10));
        setVisited(true);
        onChange?.(true);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <button onClick={handleClick} disabled={busy}>
      {visited ? "Visited ✓" : "Mark as visited"}
    </button>
  );
}
