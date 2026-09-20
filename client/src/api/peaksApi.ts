import { apiFetch } from "./client";
import type { CountryOption, PeakDetail, PeakSearchResult } from "../types";

export type SortBy = "name" | "elevation";
export type SortDir = "asc" | "desc";

export interface SearchFilters {
  country?: string;
  minElevation?: number;
  maxElevation?: number;
  sortBy?: SortBy;
  sortDir?: SortDir;
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
  if (filters.sortBy) {
    params.set("sortBy", filters.sortBy);
  }
  if (filters.sortDir) {
    params.set("sortDir", filters.sortDir);
  }
  return apiFetch(`/api/peaks/search?${params.toString()}`);
}

export function getPeak(id: number): Promise<PeakDetail> {
  return apiFetch(`/api/peaks/${id}`);
}

export function getCountries(): Promise<CountryOption[]> {
  return apiFetch("/api/peaks/countries");
}
