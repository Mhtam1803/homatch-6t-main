import { resolveLocationReference, type LocationReference } from "@/data/location-references"

const PELIAS_URL = "https://api.heigit.org/pelias/v1/search"
const TIMEOUT_MS = 8_000
const CACHE_TTL_MS = 10 * 60 * 1000
const MAX_RESULTS = 5
const MAX_RETRIES = 1

export type DestinationCandidate = LocationReference & {
  provider: "local" | "pelias"
  confidence?: number
}

type PeliasFeature = {
  id?: string
  label?: string
  confidence?: number
  geometry?: { coordinates?: unknown }
  properties?: {
    label?: string
    confidence?: number
    country_a?: string
    county?: string
    locality?: string
    region?: string
  }
}

const cache = new Map<string, { expiresAt: number; candidates: DestinationCandidate[] }>()

function normalize(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase()
}

function validHcmcCoordinate(coordinates: { lat: number; lng: number }) {
  return Number.isFinite(coordinates.lat) &&
    Number.isFinite(coordinates.lng) &&
    coordinates.lat >= 10.25 &&
    coordinates.lat <= 11.25 &&
    coordinates.lng >= 106.25 &&
    coordinates.lng <= 107.2
}

function parseFeature(feature: PeliasFeature): DestinationCandidate | null {
  const coordinates = feature.geometry?.coordinates
  if (!Array.isArray(coordinates) || typeof coordinates[0] !== "number" || typeof coordinates[1] !== "number") return null
  const point = { lng: coordinates[0], lat: coordinates[1] }
  if (!validHcmcCoordinate(point)) return null

  const properties = feature.properties ?? {}
  const country = typeof properties.country_a === "string" ? properties.country_a.toUpperCase() : ""
  const area = `${properties.locality ?? ""} ${properties.county ?? ""} ${properties.region ?? ""}`.toLocaleLowerCase()
  if (country && country !== "VNM") return null
  if (!country && !area.includes("ho chi minh") && !area.includes("hồ chí minh") && !area.includes("vietnam")) return null

  const label = feature.label ?? properties.label
  if (!label || label.length > 240) return null
  const confidence = feature.confidence ?? properties.confidence
  return {
    id: `pelias:${feature.id ?? `${point.lat},${point.lng}`}`,
    label,
    coordinates: point,
    aliases: [],
    source: PELIAS_URL,
    provider: "pelias",
    ...(typeof confidence === "number" ? { confidence } : {}),
  }
}

function isReliable(candidate: DestinationCandidate) {
  return candidate.provider === "local" || (candidate.confidence === undefined || candidate.confidence >= 0.7)
}

function retryDelayMs(response: Response) {
  const retryAfter = Number(response.headers.get("retry-after"))
  return Number.isFinite(retryAfter) ? Math.min(5_000, Math.max(500, retryAfter * 1_000)) : 1_000
}

export async function resolveDestination(destination: string): Promise<{
  status: "resolved" | "ambiguous" | "unavailable" | "not_requested"
  destination: DestinationCandidate | null
  candidates: DestinationCandidate[]
  reason?: string
}> {
  const query = destination.trim()
  if (!query) return { status: "not_requested", destination: null, candidates: [] }
  if (query.length > 200 || /[\u0000-\u001f]/.test(query)) {
    return { status: "unavailable", destination: null, candidates: [], reason: "Destination input is invalid." }
  }

  const local = resolveLocationReference(query)
  if (local) return { status: "resolved", destination: { ...local, provider: "local" }, candidates: [{ ...local, provider: "local" }] }

  const key = normalize(query)
  const cached = cache.get(key)
  if (cached && cached.expiresAt > Date.now()) return chooseCandidates(cached.candidates)

  const apiKey = process.env.ORS_API_KEY
  if (!apiKey) return { status: "unavailable", destination: null, candidates: [], reason: "ORS_API_KEY is not configured." }

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)
    try {
      const url = new URL(PELIAS_URL)
      url.searchParams.set("text", `${query}, Ho Chi Minh City, Vietnam`)
      url.searchParams.set("size", String(MAX_RESULTS))
      url.searchParams.set("boundary.country", "VNM")
      const response = await fetch(url, {
        headers: { Authorization: apiKey, Accept: "application/json" },
        signal: controller.signal,
      })
      if (response.status === 429 && attempt < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs(response)))
        continue
      }
      if (response.status === 429) return { status: "unavailable", destination: null, candidates: [], reason: "Geocoding rate limit reached." }
      if (response.status === 403) return { status: "unavailable", destination: null, candidates: [], reason: "Geocoding access was denied." }
      if (!response.ok) return { status: "unavailable", destination: null, candidates: [], reason: `Geocoding returned HTTP ${response.status}.` }

      const body = await response.json() as { features?: PeliasFeature[] }
      const candidates = (body.features ?? []).map(parseFeature).filter((candidate): candidate is DestinationCandidate => candidate !== null && isReliable(candidate))
      cache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, candidates })
      return chooseCandidates(candidates)
    } catch (error) {
      if (attempt === MAX_RETRIES) {
        return {
          status: "unavailable",
          destination: null,
          candidates: [],
          reason: error instanceof Error && error.name === "AbortError" ? "Geocoding timed out." : "Geocoding service is unavailable.",
        }
      }
    } finally {
      clearTimeout(timeout)
    }
  }
  return { status: "unavailable", destination: null, candidates: [], reason: "Geocoding service is unavailable." }
}

function chooseCandidates(candidates: DestinationCandidate[]) {
  if (candidates.length === 0) return { status: "unavailable" as const, destination: null, candidates, reason: "No reliable destination was found." }
  if (candidates.length === 1) return { status: "resolved" as const, destination: candidates[0], candidates }
  const first = candidates[0]
  const second = candidates[1]
  if (first.confidence !== undefined && first.confidence >= 0.9 && (second.confidence === undefined || first.confidence - second.confidence >= 0.15)) {
    return { status: "resolved" as const, destination: first, candidates }
  }
  return { status: "ambiguous" as const, destination: null, candidates, reason: "Multiple plausible destinations were found." }
}

export function clearGeocodeCache() {
  cache.clear()
}

export function validateDestinationCandidate(value: unknown): DestinationCandidate | null {
  if (!value || typeof value !== "object") return null
  const candidate = value as Partial<DestinationCandidate>
  if (typeof candidate.id !== "string" || typeof candidate.label !== "string" || !candidate.coordinates) return null
  if (!validHcmcCoordinate(candidate.coordinates)) return null
  return {
    id: candidate.id,
    label: candidate.label.slice(0, 240),
    coordinates: candidate.coordinates,
    aliases: [],
    source: typeof candidate.source === "string" ? candidate.source : PELIAS_URL,
    provider: candidate.provider === "local" ? "local" : "pelias",
    ...(typeof candidate.confidence === "number" ? { confidence: candidate.confidence } : {}),
  }
}
