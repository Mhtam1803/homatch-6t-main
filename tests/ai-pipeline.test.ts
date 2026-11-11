import assert from "node:assert/strict"
import test from "node:test"
import { E5_DIMENSIONS, normalizeVector, cosineSimilarity } from "@/lib/ai/e5"
import { rentalIntentSchema } from "@/lib/ai/groq"
import { rankHybrid } from "@/lib/ai/hybrid"
import { clearCommuteCache, commuteScore, estimateCommutes } from "@/lib/ai/commute"
import { resolveLocationReference } from "@/data/location-references"
import { clearGeocodeCache, resolveDestination } from "@/lib/ai/geocode"
import type { Listing, SearchCriteria } from "@/types/listing"

test("E5 vectors normalize and retain 384 dimensions", () => {
  const vector = normalizeVector(Array.from({ length: E5_DIMENSIONS }, () => 1))
  assert.equal(vector.length, E5_DIMENSIONS)
  assert.ok(Math.abs(cosineSimilarity(vector, vector) - 1) < 1e-12)
})

test("intent schema rejects unknown fields and accepts nullable fields", () => {
  const result = rentalIntentSchema.safeParse({
    location: "Thủ Đức",
    max_total_monthly_budget: 5000000,
    household_size: null,
    bedrooms_min: null,
    area_min_m2: null,
    property_type: null,
    furnishing: null,
    pet_friendly: true,
    balcony: null,
    quiet_environment: true,
    elevator: null,
    parking: null,
    near_school: true,
    near_workplace: null,
    lifestyle_needs: ["student", "quiet"],
    semantic_preferences: "quiet room near university",
    required_constraints: ["budget"],
    optional_preferences: [],
  })
  assert.equal(result.success, true)
  assert.equal(rentalIntentSchema.safeParse({}).success, false)
})

test("hybrid ranking applies hard budget and pet constraints before scoring", () => {
  const listing = {
    id: "HCM_001",
    totalMonthly: 4000000,
    bedrooms: 1,
    areaM2: 20,
    features: { petFriendly: true, balcony: false, elevator: false, quiet: true },
    amenities: { nearSchool: true },
    cost: { parkingFee: 0 },
  } as unknown as Listing
  const criteria = { budget: 5000000, features: [], personalDetails: {} } as unknown as SearchCriteria
  const intent = {
    location: null, max_total_monthly_budget: 5000000, household_size: null, bedrooms_min: null, area_min_m2: null,
    property_type: null, furnishing: null, pet_friendly: true, balcony: null, quiet_environment: true, elevator: null,
    parking: null, near_school: null, near_workplace: null, lifestyle_needs: [], semantic_preferences: "quiet",
    required_constraints: [], optional_preferences: [],
  }
  const vector = normalizeVector(Array.from({ length: 384 }, () => 1))
  const result = rankHybrid([listing], [{ id: listing.id, vector }], vector, intent, criteria)
  assert.equal(result.hardConstraintCount, 1)
  assert.equal(result.results[0].listing.id, "HCM_001")
})

test("hybrid score uses normalized semantic similarity at 60 percent and rules at 40 percent", () => {
  const listing = {
    id: "HCM_002",
    totalMonthly: 4000000,
    bedrooms: 1,
    areaM2: 20,
    maxOccupants: 1,
    features: { petFriendly: false, balcony: false, elevator: false, quiet: false },
    amenities: { nearSchool: false, parking: false },
    cost: { parkingFee: 0 },
  } as unknown as Listing
  const criteria = { budget: 5000000, features: [], personalDetails: {} } as unknown as SearchCriteria
  const intent = {
    location: null, max_total_monthly_budget: null, household_size: null, bedrooms_min: null, area_min_m2: null,
    property_type: null, furnishing: null, pet_friendly: null, balcony: null, quiet_environment: true, elevator: null,
    parking: null, near_school: null, near_workplace: null, lifestyle_needs: [], semantic_preferences: "quiet",
    required_constraints: [], optional_preferences: [],
  }
  const vector = normalizeVector(Array.from({ length: 384 }, () => 1))
  const result = rankHybrid([listing], [{ id: listing.id, vector }], vector, intent, criteria)
  assert.ok(Math.abs(result.results[0].semanticScore - 1) < 1e-12)
  assert.equal(result.results[0].ruleScore, 0)
  assert.equal(result.results[0].score, 60)
})

test("missing Groq credentials are represented without client-side access", () => {
  assert.equal("GROQ_API_KEY" in {}, false)
  assert.equal("NEXT_PUBLIC_GROQ_API_KEY" in {}, false)
})

test("verified destinations resolve without inventing unknown coordinates", () => {
  assert.equal(resolveLocationReference("UEL")?.id, "uel")
  assert.equal(resolveLocationReference("một công ty không rõ địa chỉ"), null)
})

test("dynamic destination geocoding resolves a validated HCMC candidate", async () => {
  const originalFetch = globalThis.fetch
  const originalKey = process.env.ORS_API_KEY
  process.env.ORS_API_KEY = "test-only"
  clearGeocodeCache()
  globalThis.fetch = async () => new Response(JSON.stringify({
    features: [{
      id: "venue.1",
      properties: { label: "Landmark 81, Ho Chi Minh City, Vietnam", country_a: "VNM", confidence: 0.8 },
      geometry: { coordinates: [106.722041, 10.794943] },
    }],
  }), { status: 200 })
  try {
    const result = await resolveDestination("Landmark 81")
    assert.equal(result.status, "resolved")
    assert.equal(result.destination?.label, "Landmark 81, Ho Chi Minh City, Vietnam")
    assert.deepEqual(result.destination?.coordinates, { lng: 106.722041, lat: 10.794943 })
  } finally {
    globalThis.fetch = originalFetch
    clearGeocodeCache()
    if (originalKey === undefined) delete process.env.ORS_API_KEY
    else process.env.ORS_API_KEY = originalKey
  }
})

test("ambiguous geocoding requires user selection", async () => {
  const originalFetch = globalThis.fetch
  const originalKey = process.env.ORS_API_KEY
  process.env.ORS_API_KEY = "test-only"
  clearGeocodeCache()
  globalThis.fetch = async () => new Response(JSON.stringify({
    features: [
      { id: "place.1", properties: { label: "HUTECH University, District 9, Vietnam", country_a: "VNM", confidence: 0.75 }, geometry: { coordinates: [106.78, 10.86] } },
      { id: "place.2", properties: { label: "HUTECH University, Binh Thanh, Vietnam", country_a: "VNM", confidence: 0.74 }, geometry: { coordinates: [106.71, 10.8] } },
    ],
  }), { status: 200 })
  try {
    const result = await resolveDestination("HUTECH University")
    assert.equal(result.status, "ambiguous")
    assert.equal(result.destination, null)
    assert.equal(result.candidates.length, 2)
  } finally {
    globalThis.fetch = originalFetch
    clearGeocodeCache()
    if (originalKey === undefined) delete process.env.ORS_API_KEY
    else process.env.ORS_API_KEY = originalKey
  }
})

test("missing geocoding credentials do not invent destination coordinates", async () => {
  const originalKey = process.env.ORS_API_KEY
  delete process.env.ORS_API_KEY
  clearGeocodeCache()
  try {
    const result = await resolveDestination("Unknown fictional destination")
    assert.equal(result.status, "unavailable")
    assert.equal(result.destination, null)
    assert.equal(result.candidates.length, 0)
  } finally {
    if (originalKey === undefined) delete process.env.ORS_API_KEY
    else process.env.ORS_API_KEY = originalKey
  }
})

test("shorter driving commute receives a higher commute score", () => {
  assert.ok(commuteScore(12) > commuteScore(35))
  assert.equal(commuteScore(60), 0)
})

test("commute data changes criteria score without changing semantic weight", () => {
  const listing = {
    id: "HCM_003",
    totalMonthly: 4000000,
    bedrooms: 1,
    areaM2: 20,
    maxOccupants: 1,
    features: { petFriendly: false, balcony: false, elevator: false, quiet: false },
    amenities: { nearSchool: false, parking: false },
    cost: { parkingFee: 0 },
  } as unknown as Listing
  const criteria = { budget: 5000000, features: [], chips: [], personalDetails: {} } as unknown as SearchCriteria
  const intent = {
    location: null, max_total_monthly_budget: null, household_size: null, bedrooms_min: null, area_min_m2: null,
    property_type: null, furnishing: null, pet_friendly: null, balcony: null, quiet_environment: null, elevator: null,
    parking: null, near_school: null, near_workplace: null, lifestyle_needs: [], semantic_preferences: "home",
    required_constraints: [], optional_preferences: [],
  }
  const vector = normalizeVector(Array.from({ length: 384 }, () => 1))
  const commute = { destinationId: "uel", destinationLabel: "UEL", durationMinutes: 12, distanceKm: 2, profile: "driving-car" as const }
  const result = rankHybrid([listing], [{ id: listing.id, vector }], vector, intent, criteria, new Map([[listing.id, commute]]))
  assert.equal(result.results[0].score, 92)
  assert.equal(result.results[0].commute?.durationMinutes, 12)
})

test("ORS 429 is retried once and matrix results are mapped", async () => {
  const originalFetch = globalThis.fetch
  const originalKey = process.env.ORS_API_KEY
  let calls = 0
  process.env.ORS_API_KEY = "test-only"
  clearCommuteCache()
  globalThis.fetch = async () => {
    calls += 1
    if (calls === 1) return new Response("rate limited", { status: 429, headers: { "retry-after": "0" } })
    return new Response(JSON.stringify({ durations: [[720]], distances: [[3.4]] }), { status: 200 })
  }
  try {
    const result = await estimateCommutes(
      [{ id: "HCM_001", coordinates: { lat: 10.87, lng: 106.77 } } as Listing],
      resolveLocationReference("UEL"),
    )
    assert.equal(calls, 2)
    assert.equal(result.status, "available")
    assert.equal(result.estimates.get("HCM_001")?.durationMinutes, 12)
  } finally {
    globalThis.fetch = originalFetch
    if (originalKey === undefined) delete process.env.ORS_API_KEY
    else process.env.ORS_API_KEY = originalKey
  }
})

test("unreachable routes and missing coordinates are reported unavailable", async () => {
  const originalFetch = globalThis.fetch
  const originalKey = process.env.ORS_API_KEY
  process.env.ORS_API_KEY = "test-only"
  clearCommuteCache()
  globalThis.fetch = async () => new Response(JSON.stringify({ durations: [[null]], distances: [[null]] }), { status: 200 })
  try {
    const result = await estimateCommutes(
      [{ id: "HCM_BAD", coordinates: { lat: Number.NaN, lng: 106.77 } } as Listing],
      resolveLocationReference("UEL"),
    )
    assert.equal(result.status, "unavailable")
  } finally {
    globalThis.fetch = originalFetch
    if (originalKey === undefined) delete process.env.ORS_API_KEY
    else process.env.ORS_API_KEY = originalKey
  }
})
