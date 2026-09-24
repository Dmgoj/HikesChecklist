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

// Caches search results and peak details for this page visit only (cleared on reload). Avoids
// re-hitting the API when the user pages back and forth or re-selects a filter combo they already
// viewed - the underlying data (seeded once via ingestion) doesn't change during a session.
const searchCache = new Map<string, PeakSearchResult>();
const peakCache = new Map<number, PeakDetail>();
let countriesCache: CountryOption[] | null = null;

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
  params.sort();
  const cacheKey = params.toString();

  const cached = searchCache.get(cacheKey);
  if (cached) {
    return Promise.resolve(cached);
  }

  return apiFetch<PeakSearchResult>(`/api/peaks/search?${cacheKey}`).then((result) => {
    searchCache.set(cacheKey, result);
    return result;
  });
}

export function getPeak(id: number): Promise<PeakDetail> {
  const cached = peakCache.get(id);
  if (cached) {
    return Promise.resolve(cached);
  }

  return apiFetch<PeakDetail>(`/api/peaks/${id}`).then((result) => {
    peakCache.set(id, result);
    return result;
  });
}

export function getCountries(): Promise<CountryOption[]> {
  if (countriesCache) {
    return Promise.resolve(countriesCache);
  }

  return apiFetch<CountryOption[]>("/api/peaks/countries").then((result) => {
    countriesCache = result;
    return result;
  });
}

// Visited/bucket-list toggles change a peak's status but not its search-result row shape, so the
// cached search pages would still show it correctly on next render - but the detail page's own
// visited/bucket-list flags are fetched separately (not part of PeakDetail), so no invalidation
// is needed here. This exists for the rare case a peak's core data changes underneath a session
// (re-ingestion while the app is open) - not expected in normal use, but cheap to provide.
export function clearPeaksCache(): void {
  searchCache.clear();
  peakCache.clear();
  countriesCache = null;
}
