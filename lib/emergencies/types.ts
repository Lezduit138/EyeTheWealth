// ETW — Emergency Intelligence: Common types & interface
// Every adapter must implement AdapterFn and return NormalizedEvent[]

export type DisasterType = "FLOOD" | "EARTHQUAKE" | "CYCLONE" | "LANDSLIDE" | "FIRE" | "DROUGHT" | "OTHER";
export type Severity = "Low" | "Moderate" | "Severe" | "Extreme";
export type DistrictConfidence = "HIGH" | "MEDIUM" | "LOW";

export interface AffectedDistrict {
  name: string;
  confidence: DistrictConfidence;
  reason?: string; // e.g. "bounding box match" | "name match" | "alias match"
}

export interface NormalizedEvent {
  title: string;
  disasterType: DisasterType;
  severity: Severity | null;
  description: string | null;
  reportedAt: Date;
  sourceName: string;
  sourceUrl: string;
  sourceEventId: string; // unique ID from source for deduplication
  affectedDistricts: AffectedDistrict[];
  rawData: Record<string, unknown>;
}

export interface AdapterResult {
  events: NormalizedEvent[];
  errors: string[];
  adapterName: string;
  fetchedAt: Date;
}

export type AdapterFn = () => Promise<AdapterResult>;

// Maharashtra bounding box (approximate)
export const MAHARASHTRA_BBOX = {
  minLat: 15.6,
  maxLat: 22.1,
  minLon: 72.6,
  maxLon: 80.9,
};

export function isInMaharashtra(lat: number, lon: number): boolean {
  return (
    lat >= MAHARASHTRA_BBOX.minLat &&
    lat <= MAHARASHTRA_BBOX.maxLat &&
    lon >= MAHARASHTRA_BBOX.minLon &&
    lon <= MAHARASHTRA_BBOX.maxLon
  );
}

// District name aliases (common spellings / alternate names)
export const DISTRICT_ALIASES: Record<string, string> = {
  "Aurangabad": "Aurangabad",
  "Chhatrapati Sambhajinagar": "Aurangabad",
  "Sambhajinagar": "Aurangabad",
  "Greater Mumbai": "Mumbai City",
  "Bombay": "Mumbai City",
  "Mumbai": "Mumbai City",
  "Mumbai Suburbs": "Mumbai Suburban",
  "Osmanabad": "Osmanabad",
  "Dharashiv": "Osmanabad",
  "Ratnagiri": "Ratnagiri",
  "Raigad": "Raigad",
  "Kolhapur": "Kolhapur",
  "Satara": "Satara",
  "Sangli": "Sangli",
  "Solapur": "Solapur",
  "Nasik": "Nashik",
  "Nashik": "Nashik",
  "Thane": "Thane",
  "Palghar": "Palghar",
  "Pune": "Pune",
  "Nagpur": "Nagpur",
  "Amravati": "Amravati",
  "Yavatmal": "Yavatmal",
  "Wardha": "Wardha",
  "Chandrapur": "Chandrapur",
  "Gadchiroli": "Gadchiroli",
  "Gondia": "Gondia",
  "Bhandara": "Bhandara",
  "Akola": "Akola",
  "Washim": "Washim",
  "Buldhana": "Buldhana",
  "Jalgaon": "Jalgaon",
  "Dhule": "Dhule",
  "Nandurbar": "Nandurbar",
  "Ahmednagar": "Ahmednagar",
  "Ahilyanagar": "Ahmednagar",
  "Latur": "Latur",
  "Nanded": "Nanded",
  "Hingoli": "Hingoli",
  "Parbhani": "Parbhani",
  "Jalna": "Jalna",
  "Beed": "Beed",
  "Bid": "Beed",
  "Sindhudurg": "Sindhudurg",
};

export const VALID_DISTRICTS = Object.values(DISTRICT_ALIASES).filter((v, i, a) => a.indexOf(v) === i);

export function normalizeDistrict(raw: string): AffectedDistrict | null {
  const trimmed = raw.trim();
  // Direct match
  if (DISTRICT_ALIASES[trimmed]) {
    return { name: DISTRICT_ALIASES[trimmed], confidence: "HIGH", reason: "name match" };
  }
  // Case-insensitive match
  const lower = trimmed.toLowerCase();
  for (const [alias, canonical] of Object.entries(DISTRICT_ALIASES)) {
    if (alias.toLowerCase() === lower) {
      return { name: canonical, confidence: "HIGH", reason: "alias match" };
    }
  }
  // Fuzzy: contains match
  for (const [alias, canonical] of Object.entries(DISTRICT_ALIASES)) {
    if (lower.includes(alias.toLowerCase()) || alias.toLowerCase().includes(lower)) {
      return { name: canonical, confidence: "MEDIUM", reason: "partial match" };
    }
  }
  return null;
}

export function mapBboxToDistricts(
  lat: number,
  lon: number
): AffectedDistrict[] {
  if (!isInMaharashtra(lat, lon)) return [];
  // Approximate district bounding boxes (centroid-based, for MVP)
  const DISTRICT_CENTROIDS: Array<{ name: string; lat: number; lon: number; radius: number }> = [
    { name: "Mumbai City", lat: 18.94, lon: 72.83, radius: 0.3 },
    { name: "Mumbai Suburban", lat: 19.12, lon: 72.89, radius: 0.5 },
    { name: "Thane", lat: 19.22, lon: 73.02, radius: 1.0 },
    { name: "Pune", lat: 18.52, lon: 73.86, radius: 1.2 },
    { name: "Nashik", lat: 19.99, lon: 73.79, radius: 1.2 },
    { name: "Aurangabad", lat: 19.88, lon: 75.34, radius: 1.2 },
    { name: "Nagpur", lat: 21.15, lon: 79.09, radius: 1.2 },
    { name: "Kolhapur", lat: 16.70, lon: 74.24, radius: 1.0 },
    { name: "Solapur", lat: 17.69, lon: 75.90, radius: 1.2 },
    { name: "Amravati", lat: 20.93, lon: 77.75, radius: 1.0 },
    { name: "Raigad", lat: 18.52, lon: 73.18, radius: 1.0 },
    { name: "Ratnagiri", lat: 17.00, lon: 73.31, radius: 1.0 },
    { name: "Sindhudurg", lat: 16.35, lon: 73.69, radius: 0.8 },
    { name: "Palghar", lat: 19.70, lon: 72.77, radius: 0.8 },
    { name: "Jalgaon", lat: 21.00, lon: 75.56, radius: 1.2 },
    { name: "Dhule", lat: 20.90, lon: 74.78, radius: 0.9 },
    { name: "Nandurbar", lat: 21.37, lon: 74.24, radius: 0.9 },
    { name: "Ahmednagar", lat: 19.09, lon: 74.74, radius: 1.3 },
    { name: "Satara", lat: 17.69, lon: 74.01, radius: 1.1 },
    { name: "Sangli", lat: 16.86, lon: 74.57, radius: 1.0 },
    { name: "Latur", lat: 18.40, lon: 76.56, radius: 1.1 },
    { name: "Osmanabad", lat: 18.17, lon: 76.04, radius: 1.0 },
    { name: "Nanded", lat: 19.16, lon: 77.31, radius: 1.1 },
    { name: "Hingoli", lat: 19.72, lon: 77.14, radius: 0.9 },
    { name: "Parbhani", lat: 19.27, lon: 76.78, radius: 1.0 },
    { name: "Jalna", lat: 19.84, lon: 75.88, radius: 1.0 },
    { name: "Beed", lat: 18.99, lon: 75.76, radius: 1.1 },
    { name: "Buldhana", lat: 20.53, lon: 76.18, radius: 1.1 },
    { name: "Akola", lat: 20.71, lon: 77.00, radius: 0.9 },
    { name: "Washim", lat: 20.10, lon: 77.14, radius: 0.8 },
    { name: "Yavatmal", lat: 20.40, lon: 78.13, radius: 1.2 },
    { name: "Wardha", lat: 20.75, lon: 78.60, radius: 0.9 },
    { name: "Chandrapur", lat: 19.96, lon: 79.30, radius: 1.1 },
    { name: "Gadchiroli", lat: 20.18, lon: 80.00, radius: 1.3 },
    { name: "Gondia", lat: 21.46, lon: 80.20, radius: 0.9 },
    { name: "Bhandara", lat: 21.17, lon: 79.65, radius: 0.8 },
  ];

  const matches: AffectedDistrict[] = [];
  for (const d of DISTRICT_CENTROIDS) {
    const dist = Math.sqrt(Math.pow(lat - d.lat, 2) + Math.pow(lon - d.lon, 2));
    if (dist <= d.radius) {
      matches.push({ name: d.name, confidence: dist < d.radius * 0.5 ? "HIGH" : "MEDIUM", reason: "bounding box match" });
    }
  }
  return matches;
}
