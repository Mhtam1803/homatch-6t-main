import type { CommuteEstimate, Listing, SearchCriteria } from "@/types/listing"
import { cosineSimilarity, E5_DIMENSIONS } from "@/lib/ai/e5"
import type { RentalIntent } from "@/lib/ai/groq"
import { commuteScore } from "@/lib/ai/commute"

export interface VectorListing {
  id: string
  vector: number[]
  metadata?: Record<string, string | number | boolean | null>
}

export interface HybridResult {
  listing: Listing
  score: number
  semanticScore: number
  ruleScore: number
  matchedFields: string[]
  commute?: CommuteEstimate
}

export function filterHardConstraints(listings: Listing[], intent: RentalIntent, criteria: SearchCriteria) {
  return listings.filter((listing) => hardMatches(listing, intent, criteria))
}

function hardMatches(listing: Listing, intent: RentalIntent, criteria: SearchCriteria): boolean {
  if (intent.max_total_monthly_budget !== null && listing.totalMonthly > intent.max_total_monthly_budget) return false
  if (intent.bedrooms_min !== null && listing.bedrooms < intent.bedrooms_min) return false
  if (intent.area_min_m2 !== null && listing.areaM2 < intent.area_min_m2) return false
  if (intent.household_size !== null && listing.maxOccupants < intent.household_size) return false
  if (intent.pet_friendly === true && !listing.features.petFriendly) return false
  if (criteria.features.includes("petFriendly") && !listing.features.petFriendly) return false
  return true
}

function ruleScore(listing: Listing, intent: RentalIntent, criteria: SearchCriteria, commute?: CommuteEstimate) {
  const preferenceChecks = (criteria.chips ?? []).map((chip) => {
    switch (chip) {
      case "Quiet environment":
        return listing.features.quiet
      case "Suitable for remote work":
        return listing.amenities.remoteWorkFriendly
      case "Natural lighting":
        return listing.amenities.naturalLight
      case "Near school":
        return listing.amenities.nearSchool
      case "Near supermarket":
        return listing.amenities.nearSupermarket
      case "Playground":
        return listing.amenities.playground
      case "24/7 security":
        return listing.amenities.security24h
      case "Child friendly":
        return listing.amenities.childFriendly
      case "Near bus stop":
        return listing.amenities.nearBusStop
      case "Near metro":
        return listing.amenities.nearMetro
      default:
        return null
    }
  })
  const checks: Array<boolean | number | null> = [
    intent.quiet_environment === null ? null : listing.features.quiet === intent.quiet_environment,
    intent.balcony === null ? null : listing.features.balcony === intent.balcony,
    intent.elevator === null ? null : listing.features.elevator === intent.elevator,
    intent.parking === null ? null : listing.amenities.parking === intent.parking,
    intent.near_school === null ? null : listing.amenities.nearSchool === intent.near_school,
    criteria.features.length ? criteria.features.every((feature) => listing.features[feature]) : null,
    ...preferenceChecks,
    commute ? commuteScore(commute.durationMinutes) : null,
  ]
  const numericChecks = checks.reduce<number[]>((values, value) => {
    if (value !== null) values.push(typeof value === "boolean" ? Number(value) : value)
    return values
  }, [])
  return numericChecks.length ? numericChecks.reduce((sum, value) => sum + value, 0) / numericChecks.length : 0.5
}

function matchedFields(listing: Listing, intent: RentalIntent) {
  return [
    intent.pet_friendly === true && listing.features.petFriendly ? "pet-friendly" : null,
    intent.quiet_environment === true && listing.features.quiet ? "quiet environment" : null,
    intent.balcony === true && listing.features.balcony ? "balcony" : null,
    intent.near_school === true && listing.amenities.nearSchool ? "near school" : null,
    intent.max_total_monthly_budget !== null && listing.totalMonthly <= intent.max_total_monthly_budget ? "within budget" : null,
  ].filter((value): value is string => value !== null)
}

export function rankHybrid(
  listings: Listing[],
  vectors: VectorListing[],
  queryVector: number[],
  intent: RentalIntent,
  criteria: SearchCriteria,
  commuteByListingId: Map<string, CommuteEstimate> = new Map(),
): { results: HybridResult[]; hardConstraintCount: number } {
  if (queryVector.length !== E5_DIMENSIONS) throw new Error("Query vector has incompatible dimensions.")
  const vectorById = new Map(vectors.map((item) => [item.id, item.vector]))
  const eligible = filterHardConstraints(listings, intent, criteria)
  const results = eligible
    .map((listing) => {
      const vector = vectorById.get(listing.id)
      if (!vector || vector.length !== E5_DIMENSIONS) throw new Error(`Missing E5 vector for ${listing.id}.`)
      const semanticScore = Math.max(0, Math.min(1, (cosineSimilarity(queryVector, vector) + 1) / 2))
      const commute = commuteByListingId.get(listing.id)
      const rules = ruleScore(listing, intent, criteria, commute)
      return {
        listing,
        semanticScore,
        ruleScore: rules,
        score: Math.round((semanticScore * 0.6 + rules * 0.4) * 100),
        matchedFields: matchedFields(listing, intent),
        ...(commute ? { commute } : {}),
      }
    })
    .sort((left, right) => right.score - left.score || right.semanticScore - left.semanticScore)
    .slice(0, 10)
  return { results, hardConstraintCount: eligible.length }
}
