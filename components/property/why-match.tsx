"use client"

import { Check, LoaderCircle, MapPin, Sparkles } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useHomatch } from "@/components/providers/homatch-provider"
import { useMatchScore } from "@/components/property/match-score-badge"
import { featureLabels } from "@/lib/format"
import type { Listing } from "@/types/listing"

function getPreferenceMatch(chip: string, listing: Listing): boolean {
  switch (chip) {
    case "Quiet environment":
      return listing.features.quiet
    case "Suitable for remote work":
      return listing.amenities.remoteWorkFriendly
    case "Natural lighting":
      return listing.amenities.naturalLight
    case "Near school":
      return listing.amenities.nearSchool
    case "Near supermarket":
      return listing.amenities.nearSupermarket
    case "Playground":
      return listing.amenities.playground
    case "24/7 security":
      return listing.amenities.security24h
    case "Child friendly":
      return listing.amenities.childFriendly
    case "Near bus stop":
      return listing.amenities.nearBusStop
    case "Near metro":
      return listing.amenities.nearMetro
    default:
      return false
  }
}

export function WhyMatch({ listing }: { listing: Listing }) {
  const { criteria } = useHomatch()
  const matchScore = useMatchScore(listing.id)
  const [aiExplanations, setAiExplanations] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationFailed, setGenerationFailed] = useState(false)

  const fallbackExplanations = useMemo(() => {
    const explanations: string[] = []
    if (criteria && listing.totalMonthly <= criteria.budget) {
      explanations.push(`At ${listing.totalMonthly.toLocaleString("en-US")} VND per month, this home stays within your stated budget.`)
    }

    if (criteria) {
      criteria.features.forEach((feature) => {
        if (listing.features[feature]) {
          explanations.push(`${featureLabels[feature]} supports the home features you selected for your daily routine.`)
        }
      })

      criteria.chips.forEach((chip) => {
        if (getPreferenceMatch(chip, listing)) {
          explanations.push(`${chip} makes this home a practical fit for the lifestyle you described.`)
        }
      })
    }

    if (explanations.length === 0) {
      if (listing.amenities.airConditioner) explanations.push("Air conditioning helps keep the living space comfortable throughout the day.")
      if (listing.features.quiet) explanations.push("The quiet environment can make the home more comfortable for rest and study.")
      if (listing.amenities.naturalLight) explanations.push("Natural lighting helps create a brighter, more pleasant living space.")
      if (listing.features.balcony) explanations.push("The balcony gives you an additional open-air space at home.")
      if (listing.amenities.security24h) explanations.push("24/7 security provides an extra layer of reassurance for residents.")
    }

    return Array.from(new Set(explanations)).slice(0, 4)
  }, [criteria, listing])

  useEffect(() => {
    if (!criteria || matchScore === null) return

    const controller = new AbortController()
    setIsGenerating(true)
    setGenerationFailed(false)
    fetch("/api/ai/match-explanations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        criteria: {
          destination: criteria.destination,
          budget: criteria.budget,
          bedroom: criteria.bedroom,
          features: criteria.features,
          propertyTypes: criteria.propertyTypes,
          furnishing: criteria.furnishing,
          chips: criteria.chips,
          lifestyle: criteria.lifestyle.slice(0, 2_000),
          household: {
            adults: criteria.personalDetails.adults,
            children: criteria.personalDetails.children,
            infants: criteria.personalDetails.infants,
          },
        },
        listing: {
          title: listing.title,
          totalMonthly: listing.totalMonthly,
          bedrooms: listing.bedrooms,
          areaM2: listing.areaM2,
          features: listing.features,
          amenities: listing.amenities,
          description: listing.description.slice(0, 500),
        },
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          setGenerationFailed(true)
          return
        }
        const data = await response.json() as { explanations?: unknown }
        if (Array.isArray(data.explanations) && data.explanations.every((item) => typeof item === "string")) {
          setAiExplanations(data.explanations.slice(0, 4))
        } else {
          setGenerationFailed(true)
        }
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return
        setGenerationFailed(true)
      })
      .finally(() => setIsGenerating(false))

    return () => controller.abort()
  }, [criteria, listing, matchScore])

  if (!criteria || matchScore === null) return null

  const visibleExplanations = aiExplanations.length > 0 ? aiExplanations : fallbackExplanations

  return (
    <section
      aria-labelledby="why-match-title"
      className="relative overflow-hidden rounded-3xl border border-orange/30 bg-gradient-to-br from-orange/15 via-white to-sky/50 p-6 shadow-soft sm:p-8"
    >
      <div className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-orange/20 blur-2xl" aria-hidden />
      <div className="relative">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-orange text-navy shadow-soft">
            <Sparkles className="size-5" aria-hidden />
          </span>
          <div>
            <h2 id="why-match-title" className="text-2xl font-extrabold text-navy">
              Why it matches
            </h2>
            <p className="mt-1 text-sm text-navy/70">
              {aiExplanations.length > 0
                ? "AI-generated reasons based on your search and this home’s verified listing data."
                : criteria && !generationFailed
                  ? "Preparing a tailored explanation from your search and this home’s verified listing data."
                  : "Verified listing highlights based on this home’s available data."}
            </p>
          </div>
        </div>

        <ul className="mt-6 grid gap-3 sm:grid-cols-2" aria-label="Why this home matches">
          {visibleExplanations.map((explanation) => (
            <li key={explanation} className="flex items-start gap-3 rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-sm font-bold leading-relaxed text-navy shadow-sm">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-navy text-orange" aria-hidden>
                  <Check className="size-4" strokeWidth={3} />
                </span>
                {explanation}
            </li>
          ))}
          {isGenerating && (
            <li className="flex items-center gap-3 rounded-2xl border border-orange/30 bg-orange/10 px-4 py-3 text-sm font-semibold text-navy/75 sm:col-span-2">
              <LoaderCircle className="size-5 animate-spin text-orange-ink" aria-hidden />
              AI is preparing a more tailored explanation...
            </li>
          )}
          {criteria?.destination && (
            <li className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-sm font-bold text-navy shadow-sm sm:col-span-2">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-navy text-orange" aria-hidden>
                <MapPin className="size-3.5" />
              </span>
              Your search destination is {criteria.destination}.
            </li>
          )}
        </ul>
      </div>
    </section>
  )
}
