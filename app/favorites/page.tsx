"use client"

import Link from "next/link"
import { Heart } from "lucide-react"
import { useHomatch } from "@/components/providers/homatch-provider"
import { PropertyCard } from "@/components/shared/property-card"
import { getListings } from "@/data/listings"

const listings = getListings()

export default function FavoritesPage() {
  const { favorites } = useHomatch()
  const favoriteListings = listings.filter((listing) => favorites.includes(listing.id))

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky/60 via-white to-white pb-20">
      <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 sm:pt-16">
        <header className="mb-10 space-y-3">
          <p className="text-sm font-bold uppercase tracking-wider text-orange-ink">Your saved homes</p>
          <h1 className="flex items-center gap-3 text-4xl font-extrabold leading-tight text-navy sm:text-5xl">
            Favorites <Heart className="size-8 fill-orange text-orange" aria-hidden />
          </h1>
          <p className="text-lg text-navy/70">
            {favoriteListings.length
              ? `You saved ${favoriteListings.length} ${favoriteListings.length === 1 ? "home" : "homes"} to come back to.`
              : "Tap the heart on a home to save it here and come back to it later."}
          </p>
        </header>

        {favoriteListings.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favoriteListings.map((listing) => (
              <PropertyCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <section className="rounded-3xl border border-border bg-white px-6 py-14 text-center shadow-soft">
            <Heart className="mx-auto size-10 text-orange" aria-hidden />
            <h2 className="mt-4 text-2xl font-extrabold text-navy">No saved homes yet</h2>
            <p className="mx-auto mt-2 max-w-lg text-base text-navy/70">
              Browse the homes and tap the heart on any place you like. Your saved homes will stay in this browser.
            </p>
            <Link
              href="/homes"
              className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-orange px-6 text-base font-bold text-navy shadow-soft transition-colors hover:bg-orange/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
            >
              Browse homes
            </Link>
          </section>
        )}
      </div>
    </main>
  )
}
