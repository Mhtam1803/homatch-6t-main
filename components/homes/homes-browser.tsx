"use client"

import { Search, SlidersHorizontal } from "lucide-react"
import { useMemo, useState } from "react"
import { PropertyCard } from "@/components/shared/property-card"
import { Input } from "@/components/ui/input"
import type { Listing } from "@/types/listing"

type SortOption = "default" | "price-asc" | "price-desc"

export function HomesBrowser({ listings }: { listings: Listing[] }) {
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<SortOption>("default")

  const visibleListings = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase()
    const filtered = normalizedQuery
      ? listings.filter((listing) =>
          [listing.id, listing.title, listing.address, listing.district].some((value) =>
            value.toLocaleLowerCase().includes(normalizedQuery),
          ),
        )
      : [...listings]

    if (sort === "price-asc") {
      return filtered.sort((a, b) => a.totalMonthly - b.totalMonthly)
    }
    if (sort === "price-desc") {
      return filtered.sort((a, b) => b.totalMonthly - a.totalMonthly)
    }
    return filtered
  }, [listings, query, sort])

  return (
    <>
      <div className="mb-6 rounded-3xl border border-border bg-white p-4 shadow-soft sm:p-5">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <label className="block" htmlFor="home-search">
            <span className="mb-2 block text-sm font-bold text-navy">Search homes</span>
            <span className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-navy/50" aria-hidden />
              <Input
                id="home-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by area, address, title, or listing ID"
                className="h-12 rounded-2xl border-2 pl-11"
              />
            </span>
          </label>

          <label className="block md:min-w-64" htmlFor="home-sort">
            <span className="mb-2 flex items-center gap-2 text-sm font-bold text-navy">
              <SlidersHorizontal className="size-4 text-orange-ink" aria-hidden />
              Sort by
            </span>
            <select
              id="home-sort"
              value={sort}
              onChange={(event) => setSort(event.target.value as SortOption)}
              className="h-12 w-full rounded-2xl border-2 border-border bg-white px-4 text-base font-semibold text-navy outline-none transition-colors focus:border-navy focus:ring-2 focus:ring-orange/30"
            >
              <option value="default">Recommended order</option>
              <option value="price-asc">Price: Low to high</option>
              <option value="price-desc">Price: High to low</option>
            </select>
          </label>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
        <h2 className="text-lg font-bold text-navy">Available homes</h2>
        <p className="text-sm font-semibold text-navy/70">
          {visibleListings.length} {visibleListings.length === 1 ? "home" : "homes"}
        </p>
      </div>

      {visibleListings.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleListings.map((listing) => (
            <PropertyCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-border bg-white px-6 py-16 text-center shadow-soft">
          <Search className="mx-auto size-8 text-orange-ink" aria-hidden />
          <h2 className="mt-4 text-xl font-extrabold text-navy">No homes found</h2>
          <p className="mt-2 text-navy/70">Try another area, address, title, or listing ID.</p>
        </div>
      )}
    </>
  )
}
