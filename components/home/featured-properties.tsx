import { PropertyCard } from "@/components/shared/property-card"
import { SectionHeading } from "@/components/shared/section-heading"
import { getListings } from "@/data/listings"

export function FeaturedProperties() {
  const listings = getListings().slice(0, 3)
  return (
    <section aria-labelledby="featured-title" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading id="featured-title" eyebrow="Featured homes" title="Explore homes worth coming home to." />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => (
            <PropertyCard key={l.id} listing={l} />
          ))}
        </div>
      </div>
    </section>
  )
}
