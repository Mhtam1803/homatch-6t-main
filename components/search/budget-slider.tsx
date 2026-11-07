"use client"

import { Slider } from "@/components/ui/slider"
import { formatMillions, formatVND } from "@/lib/format"

const MIN = 2_000_000
const MAX = 40_000_000
const STEP = 500_000

interface BudgetSliderProps {
  value: number
  onChange: (v: number) => void
}

export function BudgetSlider({ value, onChange }: BudgetSliderProps) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-sky/60 p-5 text-center sm:p-6">
        <p id="budget-label" className="text-sm font-bold uppercase tracking-wider text-navy/70">
          Maximum monthly budget
        </p>
        <p className="mt-2 text-4xl font-extrabold text-navy sm:text-5xl" aria-live="polite">
          {formatVND(value)}
        </p>
      </div>

      <Slider
        aria-labelledby="budget-label"
        min={MIN}
        max={MAX}
        step={STEP}
        value={[value]}
        onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : v)}
        className="px-1 py-3 [&_[data-slot=slider-range]]:bg-orange [&_[data-slot=slider-thumb]]:size-7 [&_[data-slot=slider-thumb]]:border-2 [&_[data-slot=slider-thumb]]:border-navy [&_[data-slot=slider-thumb]]:shadow-soft [&_[data-slot=slider-track]]:h-2.5 [&_[data-slot=slider-track]]:bg-border"
      />
      <div className="flex justify-between text-sm font-semibold text-navy/70">
        <span>{formatMillions(MIN)}</span>
        <span>{formatMillions(MAX)}</span>
      </div>
      <p className="text-base text-navy/70">Includes rent, management fees, parking, and estimated utilities.</p>
    </div>
  )
}
