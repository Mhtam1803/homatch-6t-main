import Image from "next/image"
import Link from "next/link"
import { ArrowRight, BedDouble, MapPin, Ruler } from "lucide-react"
import { CostBreakdown } from "@/components/shared/cost-breakdown"
import { FavoriteButton } from "@/components/shared/favorite-button"
import { featureLabels, formatVND } from "@/lib/format"
import type { CommuteEstimate, FeatureKey, Listing } from "@/types/listing"

export function ResultCard({
  listing,
  rank,
  matchScore,
  matchedNeeds = [],
  commute,
  commuteRequested = false,
}: {
  listing: Listing
  rank: number
  matchScore?: number
  matchedNeeds?: string[]
  commute?: CommuteEstimate
  commuteRequested?: boolean
}) {
  const availableFeatures = (Object.keys(listing.features) as FeatureKey[]).filter((feature) => listing.features[feature])
  const detailHref = matchScore === undefined
    ? `/property/${listing.id}`
    : `/property/${listing.id}?matchScore=${encodeURIComponent(matchScore)}`

  return (
    <article
      id={`listing-${listing.id}`}
      aria-labelledby={`listing-title-${listing.id}`}
      className="group relative scroll-mt-28 overflow-hidden rounded-3xl border border-border bg-white shadow-soft transition-shadow hover:shadow-lift"
    >
      <Link
        href={detailHref}
        aria-label={`View details for ${listing.title}`}
        className="absolute inset-0 z-0 rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
      />
      <div className="relative z-10 grid pointer-events-none lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="relative min-h-72 lg:min-h-full">
          <Image
            src={listing.images[0].src || "/placeholder.svg"}
            alt={listing.images[0].alt}
            fill
            priority={rank <= 3}
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover"
          />
          <span className="absolute left-4 top-4 flex h-11 items-center rounded-full bg-navy px-5 text-lg font-extrabold text-white shadow-soft">
            #{rank}
          </span>
          <FavoriteButton listingId={listing.id} listingTitle={listing.title} className="pointer-events-auto absolute right-4 top-4" />
        </div>

        <div className="space-y-6 p-6 sm:p-8">
          <header className="flex items-start justify-between gap-4">
            <div>
              <h3 id={`listing-title-${listing.id}`} className="text-2xl font-extrabold text-navy">
                {listing.title}
              </h3>
              {matchScore !== undefined && (
                <p
                  aria-label={`Estimated match: ${matchScore}%`}
                  className="mt-3 inline-flex items-center gap-2 rounded-full bg-orange/25 px-4 py-2 text-base font-extrabold text-navy"
                >
                  Estimated match <span className="text-xl">{matchScore}%</span>
                </p>
              )}
              <p className="mt-1 flex items-center gap-1.5 text-base text-navy/70">
                <MapPin className="size-4" aria-hidden /> {listing.district}, Ho Chi Minh City
              </p>
            </div>
          </header>

          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-base font-semibold text-navy">
            <li className="flex items-center gap-2">
              <BedDouble className="size-5 text-orange" aria-hidden /> {listing.bedroomLabel}
            </li>
            <li className="flex items-center gap-2">
              <Ruler className="size-5 text-orange" aria-hidden /> {listing.areaM2} m²
            </li>
          </ul>

          {commuteRequested && (
            <p className="text-sm font-semibold text-navy/70">
              {commute ? (
                <>Estimated driving commute to {commute.destinationLabel}: {commute.durationMinutes} min ({commute.distanceKm} km)</>
              ) : (
                "Commute unavailable"
              )}
            </p>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-navy/70">All-in monthly cost</h4>
              <CostBreakdown cost={listing.cost} total={listing.totalMonthly} />
            </div>
            <div>
              <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-navy/70">Features</h4>
              <ul className="flex flex-wrap gap-2">
                {availableFeatures.map((feature) => (
                  <li key={feature} className="rounded-full bg-sky px-3.5 py-1.5 text-sm font-semibold text-navy">
                    {featureLabels[feature]}
                  </li>
                ))}
                {availableFeatures.length === 0 && <li className="text-sm text-navy/60">No listed features</li>}
              </ul>
            </div>
          </div>

          {matchedNeeds.length > 0 && (
            <p className="text-sm font-semibold text-navy/70">
              Matches inferred priorities: {matchedNeeds.join(", ")}
            </p>
          )}

          <p className="line-clamp-3 text-base leading-relaxed text-navy/80">{listing.description}</p>

          <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
            <div>
              <p className="text-sm font-medium text-navy/70">Total monthly cost</p>
              <p className="text-2xl font-extrabold text-navy">{formatVND(listing.totalMonthly)}</p>
            </div>
            <Link
              href={detailHref}
              className="pointer-events-auto group inline-flex h-12 items-center gap-2 rounded-full bg-orange px-7 text-base font-bold text-navy shadow-soft transition-all hover:bg-orange/90 hover:shadow-lift focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
            >
              View Details<span className="sr-only">: {listing.title}</span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          </footer>
        </div>
      </div>
    </article>
  )
}
