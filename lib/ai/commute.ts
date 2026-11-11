import { getListings } from "@/data/listings"
import type { CommuteEstimate, Listing } from "@/types/listing"
import type { LocationReference } from "@/data/location-references"

const ORS_BASE_URL = "https://api.heigit.org/openrouteservice/v2"
const ORS_TIMEOUT_MS = 10_000
const CACHE_TTL_MS = 5 * 60 * 1000
const MAX_RETRIES = 1
const MAX_SCORE_SECONDS = 60 * 60

type MatrixResponse = {
  durations?: Array<Array<number | null>>
  distances?: Array<Array<number | null>>
}

type CachedMatrix = {
  expiresAt: number
  estimates: Map<string, CommuteEstimate>
}

const matrixCache = new Map<string, CachedMatrix>()

function validCoordinate(coordinate: { lat: number; lng: number }) {
  return Number.isFinite(coordinate.lat) &&
    Number.isFinite(coordinate.lng) &&
    coordinate.lat >= -90 &&
    coordinate.lat <= 90 &&
    coordinate.lng >= -180 &&
    coordinate.lng <= 180
}

function retryDelayMs(response: Response) {
  const retryAfter = Number(response.headers.get("retry-after"))
  return Number.isFinite(retryAfter) ? Math.min(5_000, Math.max(500, retryAfter * 1_000)) : 1_000
}

function cacheKey(destination: LocationReference, listings: Listing[]) {
  return `${destination.id}:${listings.map((listing) => listing.id).sort().join(",")}`
}

export function commuteScore(durationMinutes: number): number {
  return Math.max(0, Math.min(1, 1 - (durationMinutes * 60) / MAX_SCORE_SECONDS))
}

export async function estimateCommutes(
  listings: Listing[],
  destination: LocationReference | null,
): Promise<{ status: "available" | "unavailable" | "not_requested"; estimates: Map<string, CommuteEstimate>; reason?: string }> {
  if (!destination) return { status: "not_requested", estimates: new Map() }
  const key = cacheKey(destination, listings)
  const cached = matrixCache.get(key)
  if (cached && cached.expiresAt > Date.now()) return { status: "available", estimates: cached.estimates }

  const apiKey = process.env.ORS_API_KEY
  if (!apiKey) return { status: "unavailable", estimates: new Map(), reason: "ORS_API_KEY is not configured." }
  const validListings = listings.filter((listing) => validCoordinate(listing.coordinates))
  if (!validListings.length) return { status: "unavailable", estimates: new Map(), reason: "No listing coordinates are available." }

  const destinationIndex = validListings.length
  const locations = [
    ...validListings.map((listing) => [listing.coordinates.lng, listing.coordinates.lat]),
    [destination.coordinates.lng, destination.coordinates.lat],
  ]
  const payload = {
    locations,
    sources: validListings.map((_, index) => index),
    destinations: [destinationIndex],
    metrics: ["duration", "distance"],
    units: "km",
  }

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), ORS_TIMEOUT_MS)
    try {
      const response = await fetch(`${ORS_BASE_URL}/matrix/driving-car`, {
        method: "POST",
        headers: { Authorization: apiKey, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })
      if (response.status === 429 && attempt < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs(response)))
        continue
      }
      if (!response.ok) {
        return { status: "unavailable", estimates: new Map(), reason: `OpenRouteService returned HTTP ${response.status}.` }
      }
      const matrix = await response.json() as MatrixResponse
      const estimates = new Map<string, CommuteEstimate>()
      validListings.forEach((listing, index) => {
        const durationSeconds = matrix.durations?.[index]?.[0]
        const distanceKm = matrix.distances?.[index]?.[0]
        if (typeof durationSeconds !== "number" || !Number.isFinite(durationSeconds) || typeof distanceKm !== "number" || !Number.isFinite(distanceKm)) return
        estimates.set(listing.id, {
          destinationId: destination.id,
          destinationLabel: destination.label,
          durationMinutes: Math.max(1, Math.round(durationSeconds / 60)),
          distanceKm: Math.round(distanceKm * 10) / 10,
          profile: "driving-car",
        })
      })
      if (!estimates.size) return { status: "unavailable", estimates, reason: "OpenRouteService returned no reachable routes." }
      matrixCache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, estimates })
      return { status: "available", estimates }
    } catch (error) {
      if (attempt === MAX_RETRIES) {
        return { status: "unavailable", estimates: new Map(), reason: error instanceof Error && error.name === "AbortError" ? "OpenRouteService timed out." : "OpenRouteService request failed." }
      }
    } finally {
      clearTimeout(timeout)
    }
  }
  return { status: "unavailable", estimates: new Map(), reason: "OpenRouteService request failed." }
}

export function clearCommuteCache() {
  matrixCache.clear()
}

export function listingCoordinatesAreValid() {
  return getListings().every((listing) => validCoordinate(listing.coordinates))
}
