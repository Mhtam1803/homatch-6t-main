import type { CommuteEstimate, InferredNeedKey, Listing, SearchCriteria } from "@/types/listing"

export interface RankedListing {
  listing: Listing
  score: number
  matchedNeeds: string[]
  commute?: CommuteEstimate
}

function needIsMatched(need: InferredNeedKey, listing: Listing): boolean {
  switch (need) {
    case "quietStudy":
    case "workFromHome":
      return listing.features.quiet
    case "familySpace":
      return listing.bedrooms >= 2
    case "easyAccess":
      return listing.features.elevator
  }
}

function normalizeLocation(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLocaleLowerCase()
}

function getChipMatch(chip: string, listing: Listing): boolean | null {
  switch (chip) {
    case "Quiet environment":
      return listing.features.quiet
    case "Pet friendly":
      return listing.features.petFriendly
    case "Natural lighting":
      return listing.amenities.naturalLight
    case "Suitable for remote work":
      return listing.amenities.remoteWorkFriendly
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
}

export function rankListings(listings: Listing[], criteria: SearchCriteria | null): RankedListing[] {
  if (!criteria) return listings.map((listing) => ({ listing, score: 0, matchedNeeds: [] }))

  const normalizedDestination = normalizeLocation(criteria.destination)
  const knownDestinationDistricts = listings
    .map((listing) => listing.district)
    .filter((district, index, districts) => districts.indexOf(district) === index)
    .filter((district) => normalizedDestination.includes(normalizeLocation(district.replace(/\s+(ward|commune)$/i, ""))))

  return listings
    .map((listing) => {
      const budgetScore = listing.totalMonthly <= criteria.budget
        ? 1
        : Math.max(0, 1 - ((listing.totalMonthly - criteria.budget) / criteria.budget) * 2)
      const bedroomScore = criteria.bedroom === "any"
        ? null
        : criteria.bedroom === "studio" || criteria.bedroom === "1"
          ? Number(listing.bedrooms <= 1)
          : criteria.bedroom === "2"
            ? Number(listing.bedrooms === 2) + Number(listing.bedrooms > 2) * 0.5
            : Number(listing.bedrooms >= 3)
      const selectedPreferences = [
        ...criteria.features.map((feature) => listing.features[feature]),
        ...criteria.chips
          .map((chip) => getChipMatch(chip, listing))
          .filter((matched): matched is boolean => matched !== null),
      ]
      const featureScore = selectedPreferences.length
        ? selectedPreferences.filter(Boolean).length / selectedPreferences.length
        : null
      const inferredNeeds = criteria.inferredNeeds
      const matchedNeeds = inferredNeeds
        .filter((need) => needIsMatched(need.key, listing))
        .map((need) => need.label)
      const inferredScore = inferredNeeds.length ? matchedNeeds.length / inferredNeeds.length : null
      const locationScore = knownDestinationDistricts.length
        ? Number(knownDestinationDistricts.some((district) => normalizeLocation(district) === normalizeLocation(listing.district)))
        : null

      const weightedScores = [
        { score: budgetScore, weight: 35 },
        ...(bedroomScore === null ? [] : [{ score: bedroomScore, weight: 25 }]),
        ...(featureScore === null ? [] : [{ score: featureScore, weight: 20 }]),
        ...(inferredScore === null ? [] : [{ score: inferredScore, weight: 20 }]),
        ...(locationScore === null ? [] : [{ score: locationScore, weight: 15 }]),
      ]
      const totalWeight = weightedScores.reduce((total, item) => total + item.weight, 0)
      const score = Math.round(
        (weightedScores.reduce((total, item) => total + item.score * item.weight, 0) / totalWeight) * 100,
      )

      return { listing, score, matchedNeeds }
    })
    .sort((a, b) => b.score - a.score || a.listing.totalMonthly - b.listing.totalMonthly)
}
