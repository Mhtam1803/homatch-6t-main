import type { Metadata } from "next"
import { SearchForm } from "@/components/search/search-form"
import { PropertyCard } from "@/components/shared/property-card"
import { getListings } from "@/data/listings"

const initialListings = getListings().slice(0, 20)

export const metadata: Metadata = {
  title: "Find My Home",
  description: "Tell Homatch your destination, budget and lifestyle. We'll match you with rental homes in Ho Chi Minh City that fit your life.",
}

export default function FindHomePage() {
  return (
    <main className="bg-gradient-to-b from-sky/60 via-white to-white pb-20">
      <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 sm:pt-16">
        <header className="mb-10 space-y-4 text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-orange-ink">Find my home</p>
          <h1 className="text-4xl font-extrabold leading-tight text-navy sm:text-5xl">Find a home that fits your life.</h1>
          <p className="text-lg text-navy/70 sm:text-xl">
            Start with the filters, or add a short description of what you need. The description is optional.
          </p>
        </header>
        <SearchForm />

        <section aria-labelledby="browse-homes-title" className="mt-16">
          <header className="mb-8 space-y-2">
            <h2 id="browse-homes-title" className="text-3xl font-extrabold text-navy">
              Browse available homes
            </h2>
            <p className="text-base text-navy/70">
              Explore homes from our listings. Use the filters above to see your best matches.
            </p>
          </header>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {initialListings.map((listing) => (
              <PropertyCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
