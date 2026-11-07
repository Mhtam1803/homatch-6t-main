"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { MapSection } from "@/components/map/map-section"
import { useHomatch } from "@/components/providers/homatch-provider"
import { ResultCard } from "@/components/results/result-card"
import { SearchSummary } from "@/components/results/search-summary"
import { getListings } from "@/data/listings"
import { rankListings } from "@/lib/matching"

const listings = getListings()

export function ResultsView() {
  const { criteria } = useHomatch()
  const rankedListings = rankListings(listings, criteria)

  return (
    <main className="bg-gradient-to-b from-sky/60 via-white to-white pb-24">
      <div className="mx-auto max-w-6xl space-y-10 px-4 pt-10 sm:px-6 sm:pt-14">
        <Link
          href="/find-home"
          className="inline-flex items-center gap-2 text-base font-bold text-navy underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
        >
          <ArrowLeft className="size-4" aria-hidden /> Back to search
        </Link>

        <header className="space-y-3">
          <h1 className="text-4xl font-extrabold text-navy sm:text-5xl">
            {criteria ? "Your best matches" : "Rental listings"}
          </h1>
          <p className="text-lg text-navy/70 sm:text-xl">
            {criteria
              ? "Homes are ranked using available listing data: budget, home type, selected priorities, and a matching area when available. Commute time and unsupported preferences are not scored yet."
              : `Search for a home to see estimated match scores. You can also browse all ${listings.length} current listings below.`}
          </p>
        </header>

        {criteria && <SearchSummary criteria={criteria} />}

        {rankedListings.length > 0 ? (
          <>
            <div className="space-y-8">
              {rankedListings.map(({ listing, score, matchedNeeds }, index) => (
                <ResultCard
                  key={listing.id}
                  listing={listing}
                  rank={index + 1}
                  matchScore={criteria ? score : undefined}
                  matchedNeeds={matchedNeeds}
                />
              ))}
            </div>
            <MapSection listings={listings} />
          </>
        ) : (
          <div className="rounded-3xl border border-border bg-white p-8 text-center text-lg text-navy/70">
            No listings are available right now.
          </div>
        )}

        <div className="text-center">
          <Link
            href="/find-home"
            className="inline-flex h-12 items-center gap-2 rounded-full border-2 border-navy px-7 text-base font-bold text-navy transition-colors hover:bg-navy hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
          >
            <ArrowLeft className="size-4" aria-hidden /> Try a different search
          </Link>
        </div>
      </div>
    </main>
  )
}
