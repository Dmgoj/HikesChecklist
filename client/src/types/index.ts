export interface PeakSummary {
  id: number;
  name: string;
  countryCode: string;
  elevationMeters: number | null;
}

export interface PeakDetail {
  id: number;
  geoNameId: number;
  name: string;
  alternateNames: string | null;
  latitude: number;
  longitude: number;
  elevationMeters: number | null;
  countryCode: string;
  featureCode: string;
}

export interface PeakSearchResult {
  items: PeakSummary[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface VisitedPeak {
  peakId: number;
  peakName: string;
  latitude: number;
  longitude: number;
  elevationMeters: number | null;
  countryCode: string;
  visitedOn: string;
  notes: string | null;
}

export interface BucketListEntry {
  peakId: number;
  peakName: string;
  latitude: number;
  longitude: number;
  elevationMeters: number | null;
  countryCode: string;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  email: string;
}
