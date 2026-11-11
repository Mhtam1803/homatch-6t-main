import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, BedDouble, Mail, MapPin, Ruler } from "lucide-react"
import { Gallery } from "@/components/property/gallery"
import { RecommendedHomes } from "@/components/property/recommended-homes"
import { MatchScoreBadge } from "@/components/property/match-score-badge"
import { WhyMatch } from "@/components/property/why-match"
import { CostBreakdown } from "@/components/shared/cost-breakdown"
import { FavoriteButton } from "@/components/shared/favorite-button"
import { getListingById, listings } from "@/data/listings"
import { featureLabels } from "@/lib/format"
import type { FeatureKey } from "@/types/listing"

export function generateStaticParams() {
  return listings.map((l) => ({ id: l.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const listing = getListingById(id)
  return listing ? { title: listing.title, description: listing.description } : { title: "Home not found" }
}

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const listing = getListingById(id)
  if (!listing) notFound()

  const featureKeys = Object.keys(listing.features) as FeatureKey[]

  return (
    <main className="bg-gradient-to-b from-sky/50 via-white to-white pb-24">
      <div className="mx-auto max-w-7xl space-y-8 px-4 pt-10 sm:px-6 sm:pt-12 lg:px-8">
        <Link
          href="/results"
          className="inline-flex items-center gap-2 text-base font-bold text-navy underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
        >
          <ArrowLeft className="size-4" aria-hidden /> Back to results
        </Link>

        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold text-navy sm:text-5xl">{listing.title}</h1>
            <p className="flex items-center gap-2 text-lg text-navy/70">
              <MapPin className="size-5 text-orange" aria-hidden /> {listing.address}
            </p>
            <MatchScoreBadge listingId={listing.id} />
          </div>
          <FavoriteButton listingId={listing.id} listingTitle={listing.title} />
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(360px,0.8fr)]">
          <div className="space-y-8">
            <div>
              <Gallery images={listing.images} />
              <p className="mt-2 text-center text-xs italic text-navy/60">
                * Interior photos are illustrative representations for demonstration purposes.
              </p>
            </div>

            <section aria-labelledby="overview" className="space-y-4 rounded-3xl border border-border bg-white p-6 shadow-soft sm:p-8">
              <h2 id="overview" className="text-2xl font-extrabold text-navy">
                About this home
              </h2>
              <ul className="flex flex-wrap gap-x-6 gap-y-2 text-base font-semibold text-navy">
                <li className="flex items-center gap-2">
                  <BedDouble className="size-5 text-orange" aria-hidden /> {listing.bedroomLabel}
                </li>
                <li className="flex items-center gap-2">
                  <Ruler className="size-5 text-orange" aria-hidden /> {listing.areaM2} m²
                </li>
              </ul>
              <p className="text-lg leading-relaxed text-navy/85">{listing.description}</p>
              <ul className="flex flex-wrap gap-2 border-t border-border pt-5">
                {featureKeys.map((k) => (
                  <li
                    key={k}
                    className={
                      listing.features[k]
                        ? "rounded-full bg-navy px-4 py-1.5 text-sm font-semibold text-white"
                        : "rounded-full border border-border px-4 py-1.5 text-sm font-semibold text-navy/60 line-through"
                    }
                  >
                    {featureLabels[k]}
                    <span className="sr-only">{listing.features[k] ? " (available)" : " (not available)"}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start" aria-label="Monthly costs">
            <section aria-labelledby="cost" className="rounded-3xl border border-border bg-white p-6 shadow-soft sm:p-8">
              <h2 id="cost" className="mb-5 text-xl font-extrabold text-navy">
                All-in monthly cost
              </h2>
              <CostBreakdown cost={listing.cost} total={listing.totalMonthly} />
              <p className="mt-4 text-sm text-navy/70">Utility costs are estimates for one person. Water costs may vary with occupant count.</p>
              <a
                href={`mailto:hello@homatch.example?subject=${encodeURIComponent(`Interest in ${listing.title}`)}`}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-navy px-5 py-3.5 text-base font-extrabold text-white transition-colors hover:bg-navy/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
              >
                <Mail className="size-5 text-orange" aria-hidden />
                Contact Homatch
              </a>
              <p className="mt-3 text-center text-xs text-navy/60">Ask our team about this demo listing.</p>
            </section>
          </aside>
        </div>

        <WhyMatch listing={listing} />
        <RecommendedHomes currentListingId={listing.id} />
      </div>
    </main>
  )
}
