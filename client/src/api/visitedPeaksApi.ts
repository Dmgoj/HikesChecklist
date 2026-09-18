import { apiFetch } from "./client";
import type { VisitedPeak } from "../types";

export function getVisitedPeaks(): Promise<VisitedPeak[]> {
  return apiFetch("/api/visited-peaks");
}

export function markVisited(peakId: number, visitedOn: string, notes?: string): Promise<VisitedPeak> {
  return apiFetch("/api/visited-peaks", {
    method: "POST",
    body: JSON.stringify({ peakId, visitedOn, notes }),
  });
}

export function updateVisited(peakId: number, visitedOn: string, notes?: string): Promise<VisitedPeak> {
  return apiFetch(`/api/visited-peaks/${peakId}`, {
    method: "PUT",
    body: JSON.stringify({ visitedOn, notes }),
  });
}

export function unmarkVisited(peakId: number): Promise<void> {
  return apiFetch(`/api/visited-peaks/${peakId}`, { method: "DELETE" });
}
