import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { PropertyCard } from "@/components/shared/property-card"
import { getListings } from "@/data/listings"

export const metadata: Metadata = {
  title: "Browse Homes",
  description: "Browse all available rental homes in Ho Chi Minh City.",
}

export default function HomesPage() {
  const listings = getListings()

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky/60 via-white to-white pb-20">
      <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 sm:pt-16">
        <header className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-bold uppercase tracking-wider text-orange-ink">Homatch listings</p>
            <h1 className="text-4xl font-extrabold leading-tight text-navy sm:text-5xl">Browse all homes</h1>
            <p className="text-lg text-navy/70">
              Explore rental homes across Ho Chi Minh City and compare their monthly costs.
            </p>
          </div>
          <Link
            href="/find-home"
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-orange px-6 text-base font-bold text-navy shadow-soft transition-colors hover:bg-orange/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
          >
            Find your match <ArrowRight className="size-4" aria-hidden />
          </Link>
        </header>

        <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-lg font-bold text-navy">Available homes</h2>
          <p className="text-sm font-semibold text-navy/70">{listings.length} homes</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <PropertyCard key={listing.id} listing={listing} />
          ))}
        </div>
      </div>
    </main>
  )
}
