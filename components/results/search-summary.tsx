import Link from "next/link"
import { Bike, Bus, Car, Footprints, MapPin, Pencil, Wallet } from "lucide-react"
import {
  bedroomLabels,
  featureLabels,
  formatVND,
  furnishingLabels,
  propertyTypeLabels,
  transportLabels,
} from "@/lib/format"
import type { SearchCriteria, TransportMode } from "@/types/listing"

const transportIcons: Record<TransportMode, typeof Bike> = { motorbike: Bike, car: Car, bus: Bus, walking: Footprints }

export function SearchSummary({ criteria }: { criteria: SearchCriteria }) {
  const TransportIcon = transportIcons[criteria.transport[0] ?? "motorbike"]
  const prefs = [
    ...(criteria.bedroom === "any" ? [] : [bedroomLabels[criteria.bedroom]]),
    ...criteria.features.map((f) => featureLabels[f]),
    ...criteria.propertyTypes.map((type) => propertyTypeLabels[type]),
    ...(criteria.furnishing === "any" ? [] : [furnishingLabels[criteria.furnishing]]),
    ...criteria.chips,
  ]

  return (
    <section aria-labelledby="summary-title" className="rounded-3xl border border-border bg-white p-6 shadow-soft sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 id="summary-title" className="text-xl font-extrabold text-navy">
          Your search
        </h2>
        <Link
          href="/find-home"
          className="inline-flex h-11 items-center gap-2 rounded-full border-2 border-navy px-5 text-sm font-bold text-navy transition-colors hover:bg-navy hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
        >
          <Pencil className="size-4" aria-hidden /> Edit search
        </Link>
      </div>
      <dl className="grid gap-6 sm:grid-cols-3">
        <div className="flex gap-3">
          <MapPin className="mt-0.5 size-5 shrink-0 text-orange" aria-hidden />
          <div>
            <dt className="text-sm font-medium text-navy/70">Destination</dt>
            <dd className="text-base font-bold text-navy">{criteria.destination || "Any area"}</dd>
          </div>
        </div>
        <div className="flex gap-3">
          <Wallet className="mt-0.5 size-5 shrink-0 text-orange" aria-hidden />
          <div>
            <dt className="text-sm font-medium text-navy/70">Monthly budget</dt>
            <dd className="text-base font-bold text-navy">{formatVND(criteria.budget)}</dd>
          </div>
        </div>
        <div className="flex gap-3">
          <TransportIcon className="mt-0.5 size-5 shrink-0 text-orange" aria-hidden />
          <div>
            <dt className="text-sm font-medium text-navy/70">Transportation</dt>
            <dd className="text-base font-bold text-navy">
              {criteria.transport.length ? criteria.transport.map((mode) => transportLabels[mode]).join(", ") : "No preference"}
            </dd>
          </div>
        </div>
      </dl>
      <div className="mt-6 border-t border-border pt-5">
        <p className="mb-3 text-sm font-medium text-navy/70">Preferences</p>
        <ul className="flex flex-wrap gap-2">
          {prefs.map((p) => (
            <li key={p} className="rounded-full bg-sky px-3.5 py-1.5 text-sm font-semibold text-navy">
              {p}
            </li>
          ))}
        </ul>
      </div>
      {criteria.inferredNeeds.length > 0 && (
        <div className="mt-5 border-t border-border pt-5">
          <p className="mb-3 text-sm font-medium text-navy/70">Priorities inferred from your description</p>
          <ul className="flex flex-wrap gap-2">
            {criteria.inferredNeeds.map((need) => (
              <li key={need.key} className="rounded-full bg-orange/20 px-3.5 py-1.5 text-sm font-semibold text-navy">
                {need.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
