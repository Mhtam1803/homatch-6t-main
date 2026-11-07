"use client"

import Link from "next/link"
import { PropertyCard } from "@/components/shared/property-card"
import { useHomatch } from "@/components/providers/homatch-provider"
import { listings } from "@/data/listings"
import { rankListings } from "@/lib/matching"

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
  const recommendations = criteria
    ? rankListings(listings.filter((listing) => listing.id !== currentListingId), criteria).slice(0, 3)
    : getSimilarities(currentListingId).map((listing) => ({ listing, score: undefined }))

  return (
    <section aria-labelledby="recommended-homes-title" className="mt-16 border-t border-border pt-12">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <h2 id="recommended-homes-title" className="text-3xl font-extrabold text-navy">
            {criteria ? "More homes that fit your search" : "Similar homes you may like"}
          </h2>
          <p className="text-base text-navy/70">
            {criteria
              ? "Recommendations use your saved search preferences."
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
