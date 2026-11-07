"use client"

import { Check } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface Option<T extends string> {
  value: T
  label: string
  icon?: LucideIcon
}

interface RadioCardsProps<T extends string> {
  name: string
  legend: string
  value: T
  options: Option<T>[]
  onChange: (v: T) => void
  columns?: string
}

/** Single-choice cards built on native radios for keyboard and screen-reader support. */
export function RadioCards<T extends string>({ name, legend, value, options, onChange, columns = "grid-cols-2 sm:grid-cols-4" }: RadioCardsProps<T>) {
  return (
    <fieldset>
      <legend className="sr-only">{legend}</legend>
      <div className={cn("grid gap-3", columns)}>
        {options.map((o) => {
          const selected = o.value === value
          return (
            <label
              key={o.value}
              className={cn(
                "relative flex min-h-[88px] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 bg-white px-3 py-4 text-center text-base font-semibold transition-all has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-orange",
                selected
                  ? "border-navy bg-sky text-navy shadow-soft"
                  : "border-border text-navy/75 hover:border-navy/40 hover:bg-sky/40",
              )}
            >
              <input
                type="radio"
                name={name}
                value={o.value}
                checked={selected}
                onChange={() => onChange(o.value)}
                className="sr-only"
              />
              {o.icon && <o.icon className={cn("size-6", selected ? "text-navy" : "text-navy/60")} aria-hidden />}
              <span>{o.label}</span>
              {selected && (
                <span className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-orange text-navy" aria-hidden>
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
              )}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

interface ToggleChipsProps<T extends string> {
  options: Option<T>[]
  selected: T[]
  onToggle: (v: T) => void
  size?: "md" | "sm"
}

/** Multi-choice toggles. Unselected state is deliberately neutral. */
export function ToggleChips<T extends string>({ options, selected, onToggle, size = "md" }: ToggleChipsProps<T>) {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map((o) => {
        const on = selected.includes(o.value)
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(o.value)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border-2 font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange",
              size === "md" ? "h-12 px-5 text-base" : "h-11 px-4 text-[15px]",
              on ? "border-navy bg-navy text-white shadow-soft" : "border-border bg-white text-navy/75 hover:border-navy/40 hover:bg-sky/40",
            )}
          >
            {on ? <Check className="size-4 text-orange" strokeWidth={3} aria-hidden /> : o.icon && <o.icon className="size-4 text-navy/50" aria-hidden />}
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
