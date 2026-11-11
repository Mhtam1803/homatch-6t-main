"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { MapSection } from "@/components/map/map-section"
import { useHomatch } from "@/components/providers/homatch-provider"
import { ResultCard } from "@/components/results/result-card"
import { SearchSummary } from "@/components/results/search-summary"
import { getListings } from "@/data/listings"
import { rankListings } from "@/lib/matching"
import { embedBrowserQuery, browserE5ModelName } from "@/lib/ai/browser-e5"
import { semanticQueryText } from "@/lib/ai/e5"
import type { RentalIntent } from "@/lib/ai/groq"
import type { RankedListing } from "@/lib/matching"
import type { CommuteEstimate } from "@/types/listing"
import type { DestinationCandidate } from "@/lib/ai/geocode"

const listings = getListings()
export const MATCH_RESULTS_STORAGE_KEY = "homatch-ai-match-results"

export function ResultsView() {
  const { criteria } = useHomatch()
  const [semanticRanked, setSemanticRanked] = useState<RankedListing[] | null>(null)
  const [status, setStatus] = useState<"idle" | "parsing" | "embedding" | "ranking" | "results" | "degraded">("idle")
  const [statusMessage, setStatusMessage] = useState("")
  const [destinationCandidates, setDestinationCandidates] = useState<DestinationCandidate[]>([])
  const [selectedDestination, setSelectedDestination] = useState<DestinationCandidate | null>(null)
  const completedCriteriaRef = useRef<string | null>(null)

  const fallbackRanked = useMemo(() => rankListings(listings, criteria), [criteria])

  useEffect(() => {
    if (!criteria) {
      setSemanticRanked(null)
      setStatus("idle")
      return
    }

    const criteriaKey = JSON.stringify({ criteria, selectedDestination })
    if (completedCriteriaRef.current === criteriaKey) return
    completedCriteriaRef.current = criteriaKey

    const run = async () => {
      try {
        setDestinationCandidates([])
        setStatus("parsing")
        setStatusMessage("Parsing your explicit preferences...")
        const safeCriteria = {
          ...criteria,
          personalDetails: {
            adults: criteria.personalDetails.adults,
            children: criteria.personalDetails.children,
            infants: criteria.personalDetails.infants,
            occupation: criteria.personalDetails.occupation,
            workplaceType: criteria.personalDetails.workplaceType,
          },
        }
        const intentResponse = await fetch("/api/ai/intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ criteria: safeCriteria }),
        })
        if (!intentResponse.ok) throw new Error("Intent parsing is unavailable.")
        const intentPayload = await intentResponse.json() as { intent: RentalIntent }

        setStatus("embedding")
        setStatusMessage(`Preparing ${browserE5ModelName()} embeddings in your browser...`)
        const query = semanticQueryText(intentPayload.intent, safeCriteria)
        const queryVector = await embedBrowserQuery(query || "rental home")

        setStatus("ranking")
        setStatusMessage("Applying hard constraints and semantic ranking...")
        const recommendationResponse = await fetch("/api/recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ criteria: safeCriteria, intent: intentPayload.intent, queryVector, selectedDestination }),
        })
        if (recommendationResponse.status === 409) {
          const ambiguousPayload = await recommendationResponse.json() as { state?: string; candidates?: DestinationCandidate[] }
          if (ambiguousPayload.state === "destination_ambiguous" && Array.isArray(ambiguousPayload.candidates)) {
            setDestinationCandidates(ambiguousPayload.candidates)
            setStatus("results")
            setStatusMessage("Select the destination that matches your search before commute estimates are calculated.")
            return
          }
        }
        if (!recommendationResponse.ok) throw new Error("Semantic listing vectors are unavailable.")
        const recommendationPayload = await recommendationResponse.json() as {
          results: Array<{ id: string; score: number; matchedFields: string[]; commute?: CommuteEstimate }>
          hardConstraintCount: number
          commute: { status: "available" | "unavailable" | "not_requested"; destination: string | null; reason: string | null }
        }
        const byId = new Map(listings.map((listing) => [listing.id, listing]))
        if (completedCriteriaRef.current === criteriaKey) {
          setSemanticRanked(recommendationPayload.results.flatMap((result) => {
            const listing = byId.get(result.id)
            return listing ? [{ listing, score: result.score, matchedNeeds: result.matchedFields, commute: result.commute }] : []
          }))
          setStatus("results")
          setStatusMessage(
            recommendationPayload.hardConstraintCount === 0
              ? "No listings satisfy every stated hard constraint. Try relaxing your budget, bedroom, or pet requirement."
              : recommendationPayload.commute.status === "available"
                ? "Ranked with multilingual E5 similarity, preferences, and estimated driving commute."
                : "Ranked with multilingual E5 similarity and interpretable preferences. Commute unavailable.",
          )
        }
      } catch (error) {
        if (completedCriteriaRef.current === criteriaKey) {
          setSemanticRanked(null)
          setStatus("degraded")
          setStatusMessage(error instanceof Error ? `${error.message} Showing rule-based fallback results (not E5 semantic ranking).` : "AI ranking is unavailable. Showing rule-based fallback results (not E5 semantic ranking).")
        }
      }
    }
    void run()
  }, [criteria, selectedDestination])

  const rankedListings = semanticRanked ?? fallbackRanked

  useEffect(() => {
    if (!criteria || rankedListings.length === 0) return
    try {
      sessionStorage.setItem(
        MATCH_RESULTS_STORAGE_KEY,
        JSON.stringify({
          criteriaKey: JSON.stringify(criteria),
          scores: Object.fromEntries(rankedListings.map(({ listing, score }) => [listing.id, score])),
        }),
      )
    } catch (error) {
      console.error("Could not save AI match results for detail recommendations.", error)
    }
  }, [criteria, rankedListings])

  return (
    <main className="bg-gradient-to-b from-sky/60 via-white to-white pb-24">
      <div className="mx-auto max-w-6xl space-y-10 px-4 pt-10 sm:px-6 sm:pt-14">
        <Link
          href="/find-home"
          className="inline-flex items-center gap-2 text-base font-bold text-navy underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
        >
          <ArrowLeft className="size-4" aria-hidden /> Back to search
        </Link>

        <header className="space-y-3">
          <h1 className="text-4xl font-extrabold text-navy sm:text-5xl">
            {criteria ? "Your best matches" : "Rental listings"}
          </h1>
          <p className="text-lg text-navy/70 sm:text-xl">
            {criteria
              ? "Homes are ranked using multilingual similarity, hard constraints, selected preferences, and estimated driving commute when a verified destination is available."
              : `Search for a home to see estimated match scores. You can also browse all ${listings.length} current listings below.`}
          </p>
        </header>

        {criteria && (
          <div className="rounded-2xl border border-border bg-white px-5 py-4 text-sm text-navy/75" role="status" aria-live="polite">
            <strong className="text-navy">
              {status === "degraded" ? "Degraded ranking: " : status === "results" ? "AI ranking: " : "AI pipeline: "}
            </strong>
            {statusMessage || "Preparing..."}
          </div>
        )}

        {destinationCandidates.length > 0 && (
          <section className="rounded-3xl border border-orange/40 bg-orange/10 p-5 sm:p-6" aria-labelledby="destination-choice-title">
            <h2 id="destination-choice-title" className="text-lg font-extrabold text-navy">Which destination did you mean?</h2>
            <p className="mt-1 text-sm text-navy/70">Choose a verified location before we calculate estimated driving commute.</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {destinationCandidates.map((candidate) => (
                <button
                  key={candidate.id}
                  type="button"
                  onClick={() => {
                    setSelectedDestination(candidate)
                    setDestinationCandidates([])
                  }}
                  className="rounded-2xl border-2 border-white bg-white p-4 text-left font-semibold text-navy shadow-sm transition-colors hover:border-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
                >
                  <span className="block">{candidate.label}</span>
                  <span className="mt-1 block text-xs font-medium text-navy/60">Location verified by HeiGIT Pelias</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {criteria && <SearchSummary criteria={criteria} />}

        {rankedListings.length > 0 ? (
          <>
            <div className="space-y-8">
              {rankedListings.map(({ listing, score, matchedNeeds, commute }, index) => (
                <ResultCard
                  key={listing.id}
                  listing={listing}
                  rank={index + 1}
                  matchScore={criteria ? score : undefined}
                  matchedNeeds={matchedNeeds}
                  commute={commute}
                  commuteRequested={Boolean(criteria?.destination)}
                />
              ))}
            </div>
            <MapSection listings={listings} />
          </>
        ) : (
          <div className="rounded-3xl border border-border bg-white p-8 text-center text-lg text-navy/70">
            No listings are available right now.
          </div>
        )}

        <div className="text-center">
          <Link
            href="/find-home"
            className="inline-flex h-12 items-center gap-2 rounded-full border-2 border-navy px-7 text-base font-bold text-navy transition-colors hover:bg-navy hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
          >
            <ArrowLeft className="size-4" aria-hidden /> Try a different search
          </Link>
        </div>
      </div>
    </main>
  )
}
