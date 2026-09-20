import { apiFetch } from "./client";
import type { BucketListEntry } from "../types";

export function getBucketList(): Promise<BucketListEntry[]> {
  return apiFetch("/api/bucket-list");
}

export function addToBucketList(peakId: number): Promise<BucketListEntry> {
  return apiFetch("/api/bucket-list", {
    method: "POST",
    body: JSON.stringify({ peakId }),
  });
}

export function removeFromBucketList(peakId: number): Promise<void> {
  return apiFetch(`/api/bucket-list/${peakId}`, { method: "DELETE" });
}
