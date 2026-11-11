import Image from "next/image"
import Link from "next/link"
import { BedDouble, MapPin, Ruler } from "lucide-react"
import { FavoriteButton } from "@/components/shared/favorite-button"
import { formatVND } from "@/lib/format"
import type { Listing } from "@/types/listing"

export function PropertyCard({ listing, matchScore }: { listing: Listing; matchScore?: number }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-white shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift">
      <Link
        href={`/property/${listing.id}`}
        aria-label={`View details for ${listing.title}`}
        className="absolute inset-0 z-0 rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
      />
      <div className="relative z-10 aspect-[4/3] overflow-hidden pointer-events-none">
        <Image
          src={listing.images[0].src || "/placeholder.svg"}
          alt={listing.images[0].alt}
          fill
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <FavoriteButton listingId={listing.id} listingTitle={listing.title} className="pointer-events-auto absolute right-3 top-3" />
        {matchScore !== undefined && (
          <span
            aria-label={`Estimated match: ${matchScore}%`}
            className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-extrabold text-navy shadow-soft"
          >
            Match <span className="text-base text-orange-ink">{matchScore}%</span>
          </span>
        )}
      </div>
      <div className="relative z-10 flex flex-1 flex-col gap-4 p-6 pointer-events-none">
        <div>
          <h3 className="text-xl font-bold text-navy">{listing.title}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-base text-navy/70">
            <MapPin className="size-4" aria-hidden /> {listing.district}, Ho Chi Minh City
          </p>
        </div>
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-base font-medium text-navy">
          <li className="flex items-center gap-1.5">
            <BedDouble className="size-4 text-navy/70" aria-hidden /> {listing.bedroomLabel}
          </li>
          <li className="flex items-center gap-1.5">
            <Ruler className="size-4 text-navy/70" aria-hidden /> {listing.areaM2} m²
          </li>
        </ul>
        <div className="mt-auto flex items-end justify-between gap-3 border-t border-border pt-4">
          <div>
            <p className="text-sm font-medium text-navy/70">Total monthly cost</p>
            <p className="text-xl font-extrabold text-navy">{formatVND(listing.totalMonthly)}</p>
          </div>
          <Link
            href={`/property/${listing.id}`}
            className="pointer-events-auto inline-flex h-11 items-center rounded-full bg-orange px-5 text-sm font-bold text-navy transition-colors hover:bg-orange/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
          >
            View Details<span className="sr-only">: {listing.title}</span>
          </Link>
        </div>
      </div>
    </article>
  )
}
