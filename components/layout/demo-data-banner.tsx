"use client"

import { useState } from "react"
import { X } from "lucide-react"

/**
 * Site-wide demo-data disclosure banner.
 * Required by dataset v4 README: the app must show an overall demo-data
 * disclosure in a persistent, obvious place so users are not misled into
 * believing these are real vacancies.
 *
 * Dismissible within a session (sessionStorage key "homatch_demo_dismissed").
 */
export function DemoDataBanner() {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false
    return sessionStorage.getItem("homatch_demo_dismissed") === "1"
  })

  if (dismissed) return null

  function dismiss() {
    sessionStorage.setItem("homatch_demo_dismissed", "1")
    setDismissed(true)
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="relative z-50 flex items-center justify-center gap-3 bg-orange px-4 py-2.5 text-center text-sm font-semibold text-navy"
    >
      <span>
        🛈 All listings on this site are <strong>fictional demo data</strong> and photos are{" "}
        <strong>illustrative interior representations</strong> for development and testing. They are
        not real rentals and do not depict verified rental vacancies.
      </span>
      <button
        onClick={dismiss}
        aria-label="Dismiss demo data notice"
        className="shrink-0 rounded-full p-1 transition-colors hover:bg-navy/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  )
}

