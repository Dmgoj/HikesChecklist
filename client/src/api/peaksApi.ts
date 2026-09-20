import { apiFetch } from "./client";
import type { CountryOption, PeakDetail, PeakSearchResult } from "../types";

export interface SearchFilters {
  country?: string;
  minElevation?: number;
  maxElevation?: number;
}

export function searchPeaks(
  query: string,
  page = 1,
  pageSize = 20,
  filters: SearchFilters = {}
): Promise<PeakSearchResult> {
  const params = new URLSearchParams({ q: query, page: String(page), pageSize: String(pageSize) });
  if (filters.country) {
    params.set("country", filters.country);
  }
  if (filters.minElevation !== undefined) {
    params.set("minElevation", String(filters.minElevation));
  }
  if (filters.maxElevation !== undefined) {
    params.set("maxElevation", String(filters.maxElevation));
  }
  return apiFetch(`/api/peaks/search?${params.toString()}`);
}

export function getPeak(id: number): Promise<PeakDetail> {
  return apiFetch(`/api/peaks/${id}`);
}

export function getCountries(): Promise<CountryOption[]> {
  return apiFetch("/api/peaks/countries");
}
