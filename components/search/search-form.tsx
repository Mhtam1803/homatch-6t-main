"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  Bike,
  Bus,
  Car,
  Footprints,
  Home,
  MapPin,
  PawPrint,
  Sparkles,
  Trees,
  Volume1,
  ArrowUpDown,
} from "lucide-react"
import { BudgetSlider } from "@/components/search/budget-slider"
import { MatchingLoader, matchingMessages } from "@/components/search/matching-loader"
import { RadioCards, ToggleChips } from "@/components/search/option-group"
import { useHomatch } from "@/components/providers/homatch-provider"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { bedroomLabels, featureLabels } from "@/lib/format"
import { inferHiddenNeeds } from "@/lib/hidden-needs"
import { cn } from "@/lib/utils"
import type { BedroomOption, FeatureKey, InferredNeedKey, TransportMode } from "@/types/listing"

const transportOptions = [
  { value: "motorbike" as TransportMode, label: "Motorbike", icon: Bike },
  { value: "car" as TransportMode, label: "Car", icon: Car },
  { value: "bus" as TransportMode, label: "Bus", icon: Bus },
  { value: "walking" as TransportMode, label: "Walking", icon: Footprints },
]

const bedroomOptions = (Object.keys(bedroomLabels) as BedroomOption[]).map((value) => ({ value, label: bedroomLabels[value] }))

const featureOptions = [
  { value: "petFriendly" as FeatureKey, label: featureLabels.petFriendly, icon: PawPrint },
  { value: "balcony" as FeatureKey, label: featureLabels.balcony, icon: Trees },
  { value: "elevator" as FeatureKey, label: featureLabels.elevator, icon: ArrowUpDown },
  { value: "quiet" as FeatureKey, label: featureLabels.quiet, icon: Volume1 },
]

const chipOptions = [
  "Quiet environment",
  "Pet friendly",
  "Suitable for remote work",
  "Natural lighting",
].map((v) => ({ value: v, label: v }))

const placeholder = `Tell us about your lifestyle, habits, and what matters most to you...

Example: I'm a university student at UEL. I need a quiet apartment for studying at night, must allow cats, have good natural lighting, and be within 20 minutes of my university by motorbike.`

function FormSection({ number, title, subtitle, children }: { number: string; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-border bg-white p-6 shadow-soft sm:p-8">
      <header className="mb-8 flex items-start gap-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-extrabold text-white">{number}</span>
        <div>
          <h2 className="text-2xl font-extrabold text-navy">{title}</h2>
          {subtitle && <p className="mt-1 text-base text-navy/70">{subtitle}</p>}
        </div>
      </header>
      <div className="space-y-10">{children}</div>
    </section>
  )
}

function Field({ label, htmlFor, children, hint }: { label: string; htmlFor?: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-3">
      <div>
        {htmlFor ? (
          <label htmlFor={htmlFor} className="text-lg font-bold text-navy">
            {label}
          </label>
        ) : (
          <h3 className="text-lg font-bold text-navy">{label}</h3>
        )}
        {hint && <p className="mt-0.5 text-base text-navy/70">{hint}</p>}
      </div>
      {children}
    </div>
  )
}

export function SearchForm() {
  const router = useRouter()
  const { setCriteria } = useHomatch()

  const [destination, setDestination] = useState("")
  const [transport, setTransport] = useState<TransportMode>("motorbike")
  const [budget, setBudget] = useState(40_000_000)
  const [bedroom, setBedroom] = useState<BedroomOption>("any")
  const [features, setFeatures] = useState<FeatureKey[]>([])
  const [lifestyle, setLifestyle] = useState("")
  const [chips, setChips] = useState<string[]>([])
  const [acceptedNeeds, setAcceptedNeeds] = useState<InferredNeedKey[]>([])
  const [loadingStep, setLoadingStep] = useState<number | null>(null)
  const inferredNeeds = useMemo(() => inferHiddenNeeds(lifestyle), [lifestyle])

  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    const t = timers.current
    return () => t.forEach(clearTimeout)
  }, [])

  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()

    setCriteria({
      destination: destination.trim(),
      transport,
      budget,
      bedroom,
      features,
      lifestyle: lifestyle.trim(),
      chips,
      inferredNeeds: inferredNeeds.filter((need) => acceptedNeeds.includes(need.key)),
    })

    setLoadingStep(0)
    matchingMessages.forEach((_, i) => {
      if (i > 0) timers.current.push(setTimeout(() => setLoadingStep(i), i * 850))
    })
    timers.current.push(setTimeout(() => router.push("/results"), matchingMessages.length * 850 + 200))
  }

  return (
    <>
      <form onSubmit={submit} noValidate className="space-y-8">
        <FormSection number="1" title="Browse with filters" subtitle="Pick any filters you care about. Leave the rest open.">
          <div className="grid gap-8 md:grid-cols-2">
            <Field label="Where do you need to be?" htmlFor="destination" hint="Optional: enter a workplace, university, or area.">
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-orange" aria-hidden />
                <Input
                  id="destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="UEL, Linh Xuan, Thu Duc"
                  autoComplete="off"
                  className="h-14 rounded-2xl border-2 bg-white pl-12 text-base md:text-base"
                />
              </div>
            </Field>

            <Field label="How do you travel?">
              <RadioCards name="transport" legend="How do you travel?" value={transport} options={transportOptions} onChange={setTransport} />
            </Field>

            <Field label="What's your maximum monthly budget?" hint="Leave at the maximum to include every budget.">
              <BudgetSlider value={budget} onChange={setBudget} />
            </Field>

            <Field label="How many bedrooms?">
              <RadioCards
                name="bedroom"
                legend="Bedrooms"
                value={bedroom}
                options={bedroomOptions}
                onChange={setBedroom}
                columns="grid-cols-2 sm:grid-cols-3"
              />
            </Field>

            <Field label="Home features" hint="Choose any features you prefer.">
              <ToggleChips options={featureOptions} selected={features} onToggle={(v) => setFeatures((f) => toggle(f, v))} />
            </Field>

            <Field label="Quick preferences" hint="Select any that matter to you.">
              <ToggleChips
                size="sm"
                options={chipOptions}
                selected={chips}
                onToggle={(v) => setChips((current) => toggle(current, v))}
              />
            </Field>
          </div>
        </FormSection>

        <FormSection number="2" title="Add your own needs (optional)" subtitle="You can skip this and search using the filters above.">
          <Field label="Anything else we should know?" htmlFor="lifestyle" hint="For example: I study late and need a quiet place that allows cats.">
            <Textarea
              id="lifestyle"
              value={lifestyle}
              onChange={(e) => setLifestyle(e.target.value)}
              placeholder={placeholder}
              rows={7}
              className="min-h-44 rounded-2xl border-2 bg-white p-4 text-base leading-relaxed md:text-base"
            />
          </Field>

          {inferredNeeds.length > 0 && (
            <Field
              label="Possible hidden needs"
              hint="Prototype keyword-based suggestions (not AI yet). Choose which ones matter to you."
            >
              <div className="space-y-3" role="group" aria-label="Possible hidden needs">
                {inferredNeeds.map((need) => {
                  const selected = acceptedNeeds.includes(need.key)
                  return (
                    <button
                      key={need.key}
                      type="button"
                      aria-pressed={selected}
                      onClick={() =>
                        setAcceptedNeeds((current) =>
                          selected ? current.filter((key) => key !== need.key) : [...current, need.key],
                        )
                      }
                      className={cn(
                        "flex w-full items-start gap-3 rounded-2xl border-2 p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange",
                        selected ? "border-navy bg-sky/60" : "border-border bg-white hover:border-navy/40",
                      )}
                    >
                      <Sparkles className="mt-0.5 size-5 shrink-0 text-orange" aria-hidden />
                      <span className="flex-1">
                        <span className="block font-bold text-navy">{need.label}</span>
                        <span className="mt-1 block text-sm text-navy/70">{need.reason}</span>
                      </span>
                      <span className="shrink-0 text-sm font-bold text-orange-ink">{selected ? "Added" : "Add"}</span>
                    </button>
                  )
                })}
              </div>
            </Field>
          )}
        </FormSection>

        <div className="rounded-3xl bg-sky/60 p-6 text-center sm:p-8">
          <button
            type="submit"
            className="group inline-flex h-16 w-full items-center justify-center gap-3 rounded-full bg-orange px-10 text-lg font-extrabold text-navy shadow-soft transition-all hover:bg-orange/90 hover:shadow-lift focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy sm:w-auto sm:min-w-80"
          >
            <Sparkles className="size-5" aria-hidden />
            Find My Home
            <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" aria-hidden />
          </button>
          <p className="mt-4 flex items-center justify-center gap-2 text-sm text-navy/70">
            <Home className="size-4" aria-hidden /> Your selected priorities help rank matching homes.
          </p>
        </div>
      </form>

      {loadingStep !== null && <MatchingLoader step={loadingStep} />}
    </>
  )
}
