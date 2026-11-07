"use client"

import dynamic from "next/dynamic"
import type { Listing } from "@/types/listing"

const ResultsMap = dynamic(() => import("@/components/map/results-map"), {
  ssr: false,
  loading: () => <div className="size-full animate-pulse bg-sky" aria-hidden />,
})

interface MapSectionProps {
  listings: Listing[]
}

const legend = [
  { label: "Listing location (number follows list order)", swatch: "rounded-full bg-orange" },
]

export function MapSection({ listings }: MapSectionProps) {
  return (
    <section aria-labelledby="map-title" className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="map-title" className="text-3xl font-extrabold text-navy">
            Listing locations
          </h2>
          <p className="mt-1 text-base text-navy/70">Select a marker to preview a listing.</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border shadow-soft">
        <div className="h-[420px] sm:h-[520px]">
          <ResultsMap listings={listings} />
        </div>
        <ul aria-label="Map legend" className="flex flex-wrap gap-x-6 gap-y-2 border-t border-border bg-white px-5 py-4">
          {legend.map((l) => (
            <li key={l.label} className="flex items-center gap-2 text-sm font-semibold text-navy">
              <span className={`size-4 ${l.swatch}`} aria-hidden /> {l.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
