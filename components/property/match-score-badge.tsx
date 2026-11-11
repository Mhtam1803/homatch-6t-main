"use client"

import { useEffect, useState } from "react"

export function useMatchScore(listingId: string) {
  const [score, setScore] = useState<number | null>(null)

  useEffect(() => {
    try {
      const scoreFromUrl = new URLSearchParams(window.location.search).get("matchScore")
      if (scoreFromUrl !== null) {
        const parsedScore = Number(scoreFromUrl)
        if (Number.isFinite(parsedScore)) {
          setScore(parsedScore)
          return
        }
      }
    } catch (error) {
      console.error("Could not read the listing match score.", error)
    }
  }, [listingId])

  return score
}

export function MatchScoreBadge({ listingId }: { listingId: string }) {
  const score = useMatchScore(listingId)

  if (score === null) return null

  return (
    <span
      aria-label={`Estimated match: ${score}%`}
      className="inline-flex items-center gap-2 rounded-full bg-orange px-4 py-2 text-sm font-extrabold text-navy shadow-soft"
    >
      Estimated match <span className="text-lg">{score}%</span>
    </span>
  )
}
