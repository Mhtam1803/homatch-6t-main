"use client"

import { Check, Sparkles } from "lucide-react"
import { Logo } from "@/components/layout/logo"
import { cn } from "@/lib/utils"

export const matchingMessages = [
  "Understanding your lifestyle...",
  "Finding homes that match your needs...",
  "Calculating your monthly living costs...",
  "Preparing your best matches...",
]

export function MatchingLoader({ step }: { step: number }) {
  const progress = ((step + 1) / matchingMessages.length) * 100
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Matching in progress"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-white/95 p-6 backdrop-blur animate-in fade-in"
    >
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex justify-center">
          <span className="relative flex size-28 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-orange/25" aria-hidden />
            <span className="absolute inset-3 animate-pulse rounded-full bg-sky" aria-hidden />
            <Sparkles className="relative size-10 text-orange" aria-hidden />
          </span>
        </div>

        <div aria-live="polite" className="min-h-[3.5rem]">
          <p className="text-2xl font-extrabold text-navy">{matchingMessages[step]}</p>
        </div>

        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          aria-label="Matching progress"
          className="h-2.5 overflow-hidden rounded-full bg-sky"
        >
          <div className="h-full rounded-full bg-orange transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
        </div>

        <ul className="space-y-2 text-left">
          {matchingMessages.map((m, i) => (
            <li key={m} className={cn("flex items-center gap-3 text-base font-medium transition-colors", i <= step ? "text-navy" : "text-navy/40")}>
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full",
                  i < step ? "bg-navy text-white" : i === step ? "bg-orange text-navy" : "bg-sky text-transparent",
                )}
                aria-hidden
              >
                <Check className="size-3.5" strokeWidth={3} />
              </span>
              {m.replace("...", "")}
            </li>
          ))}
        </ul>

        <p className="text-sm text-navy/60">Simulated AI matching – no real data is being processed.</p>
        <div className="flex justify-center opacity-90">
          <Logo className="h-12" />
        </div>
      </div>
    </div>
  )
}
