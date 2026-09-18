import { apiFetch } from "./client";
import type { PeakDetail, PeakSearchResult } from "../types";

export function searchPeaks(
  query: string,
  page = 1,
  pageSize = 20,
  country?: string
): Promise<PeakSearchResult> {
  const params = new URLSearchParams({ q: query, page: String(page), pageSize: String(pageSize) });
  if (country) {
    params.set("country", country);
  }
  return apiFetch(`/api/peaks/search?${params.toString()}`);
}

export function getPeak(id: number): Promise<PeakDetail> {
  return apiFetch(`/api/peaks/${id}`);
}
