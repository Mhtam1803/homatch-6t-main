"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { MapSection } from "@/components/map/map-section"
import { ResultCard } from "@/components/results/result-card"
import { getListings } from "@/data/listings"

const listings = getListings()

export function ResultsView() {
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
          <h1 className="text-4xl font-extrabold text-navy sm:text-5xl">Rental listings</h1>
          <p className="text-lg text-navy/70 sm:text-xl">
            Browse {listings.length} homes from the current Ho Chi Minh City listings dataset.
          </p>
        </header>

        {listings.length > 0 ? (
          <>
            <div className="space-y-8">
              {listings.map((listing, index) => (
                <ResultCard key={listing.id} listing={listing} rank={index + 1} />
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
