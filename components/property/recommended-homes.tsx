"use client"

import Link from "next/link"
import { PropertyCard } from "@/components/shared/property-card"
import { useHomatch } from "@/components/providers/homatch-provider"
import { listings } from "@/data/listings"
import { MATCH_RESULTS_STORAGE_KEY } from "@/components/results/results-view"
import { rankListings } from "@/lib/matching"
import { useEffect, useMemo, useState } from "react"

function getSimilarities(currentId: string) {
  const current = listings.find((listing) => listing.id === currentId)
  if (!current) return listings.filter((listing) => listing.id !== currentId).slice(0, 3)

  return listings
    .filter((listing) => listing.id !== currentId)
    .map((listing) => {
      const bedroomSimilarity = Math.max(0, 1 - Math.abs(listing.bedrooms - current.bedrooms) / 4)
      const featureKeys = Object.keys(current.features) as (keyof typeof current.features)[]
      const featureSimilarity =
        featureKeys.filter((feature) => listing.features[feature] === current.features[feature]).length /
        featureKeys.length
      return {
        listing,
        similarity: bedroomSimilarity * 0.6 + featureSimilarity * 0.4,
      }
    })
    .sort((a, b) => b.similarity - a.similarity || a.listing.totalMonthly - b.listing.totalMonthly)
    .map(({ listing }) => listing)
    .slice(0, 3)
}

export function RecommendedHomes({ currentListingId }: { currentListingId: string }) {
  const { criteria } = useHomatch()
  const [savedScores, setSavedScores] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!criteria) return
    try {
      const saved = sessionStorage.getItem(MATCH_RESULTS_STORAGE_KEY)
      if (!saved) return
      const parsed: unknown = JSON.parse(saved)
      if (!parsed || typeof parsed !== "object" || !("scores" in parsed) || !("criteriaKey" in parsed)) return
      const savedCriteriaKey = (parsed as { criteriaKey?: unknown }).criteriaKey
      if (savedCriteriaKey !== JSON.stringify(criteria)) return
      const scores = (parsed as { scores?: unknown }).scores
      if (!scores || typeof scores !== "object") return
      const validScores = Object.fromEntries(
        Object.entries(scores).filter((entry): entry is [string, number] => typeof entry[1] === "number" && Number.isFinite(entry[1])),
      )
      setSavedScores(validScores)
    } catch (error) {
      console.error("Could not restore AI match results for detail recommendations.", error)
    }
  }, [criteria])

  const recommendations = useMemo(() => {
    if (!criteria) return getSimilarities(currentListingId).map((listing) => ({ listing, score: undefined }))
    const scored = listings
      .filter((listing) => listing.id !== currentListingId && savedScores[listing.id] !== undefined)
      .sort((a, b) => savedScores[b.id] - savedScores[a.id])
      .slice(0, 3)
      .map((listing) => ({ listing, score: savedScores[listing.id] }))

    return scored.length > 0
      ? scored
      : rankListings(listings.filter((listing) => listing.id !== currentListingId), criteria)
          .slice(0, 3)
          .map(({ listing }) => ({ listing, score: undefined }))
  }, [criteria, currentListingId, savedScores])

  return (
    <section aria-labelledby="recommended-homes-title" className="mt-16 border-t border-border pt-12">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <h2 id="recommended-homes-title" className="text-3xl font-extrabold text-navy">
            {criteria ? "More high-match homes" : "Similar homes you may like"}
          </h2>
          <p className="text-base text-navy/70">
            {criteria
              ? "Top matches from your current Find My Home results."
              : "Search by your preferences to see estimated match percentages."}
          </p>
        </div>
        {!criteria && (
          <Link
            href="/find-home"
            className="inline-flex h-11 items-center rounded-full bg-orange px-5 text-sm font-bold text-navy transition-colors hover:bg-orange/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
          >
            Find a home
          </Link>
        )}
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {recommendations.map(({ listing, score }) => (
          <PropertyCard key={listing.id} listing={listing} matchScore={score} />
        ))}
      </div>
    </section>
  )
}
