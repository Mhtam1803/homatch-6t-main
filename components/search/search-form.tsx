"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  Bike,
  Building2,
  Bus,
  Car,
  Footprints,
  Home,
  MapPin,
  PawPrint,
  Snowflake,
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
import { cn } from "@/lib/utils"
import type {
  BedroomOption,
  FeatureKey,
  FurnishingCondition,
  InferredNeedKey,
  PersonalDetails,
  PropertyType,
  TransportMode,
  WorkplaceType,
} from "@/types/listing"

const transportOptions = [
  { value: "motorbike" as TransportMode, label: "Motorbike", icon: Bike },
  { value: "car" as TransportMode, label: "Car", icon: Car },
  { value: "bus" as TransportMode, label: "Bus", icon: Bus },
  { value: "walking" as TransportMode, label: "Walking", icon: Footprints },
]

const bedroomOptions = (Object.keys(bedroomLabels) as BedroomOption[]).map((value) => ({ value, label: bedroomLabels[value] }))

const workplaceOptions = [
  { value: "home" as WorkplaceType, label: "Work from home", icon: Home },
  { value: "office" as WorkplaceType, label: "Work at an office", icon: Building2 },
  { value: "unspecified" as WorkplaceType, label: "Not specified" },
]

const workHourOptions = [
  { value: "morning", label: "Morning shift (6 AM–12 PM)" },
  { value: "daytime", label: "Daytime (9 AM–6 PM)" },
  { value: "afternoon", label: "Afternoon shift (12 PM–6 PM)" },
  { value: "evening", label: "Evening shift (6 PM–10 PM)" },
  { value: "night", label: "Night shift (10 PM–6 AM)" },
  { value: "flexible", label: "Flexible hours" },
]

const propertyTypeOptions = [
  { value: "townhouse" as PropertyType, label: "Townhouse" },
  { value: "alley" as PropertyType, label: "Alley access" },
  { value: "owner" as PropertyType, label: "Direct from owner" },
  { value: "broker" as PropertyType, label: "Through an agent" },
  { value: "carAlley" as PropertyType, label: "Car-accessible alley" },
]

const furnishingOptions = [
  { value: "any" as FurnishingCondition, label: "No preference" },
  { value: "furnished" as FurnishingCondition, label: "Fully furnished" },
  { value: "basic" as FurnishingCondition, label: "Basic furnishings" },
  { value: "unfurnished" as FurnishingCondition, label: "Unfurnished" },
]

const featureOptions = [
  { value: "petFriendly" as FeatureKey, label: featureLabels.petFriendly, icon: PawPrint },
  { value: "balcony" as FeatureKey, label: featureLabels.balcony, icon: Trees },
  { value: "elevator" as FeatureKey, label: featureLabels.elevator, icon: ArrowUpDown },
  { value: "privateWc" as FeatureKey, label: featureLabels.privateWc },
  { value: "privateKitchen" as FeatureKey, label: featureLabels.privateKitchen },
  { value: "airConditioner" as FeatureKey, label: featureLabels.airConditioner, icon: Snowflake },
  { value: "washingMachine" as FeatureKey, label: featureLabels.washingMachine },
  { value: "parking" as FeatureKey, label: featureLabels.parking },
  { value: "window" as FeatureKey, label: featureLabels.window },
]

const chipOptions = [
  "Quiet environment",
  "Suitable for remote work",
  "Natural lighting",
  "Near school",
  "Near supermarket",
  "Playground",
  "24/7 security",
  "Child friendly",
  "Near bus stop",
  "Near metro",
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

  const [personalDetails, setPersonalDetails] = useState<PersonalDetails>({
    fullName: "",
    age: null,
    phone: "",
    email: "",
    occupation: "",
    workplaceType: "unspecified",
    workHours: "",
    adults: 0,
    children: 0,
    infants: 0,
  })
  const [destination, setDestination] = useState("")
  const [transport, setTransport] = useState<TransportMode[]>([])
  const [budget, setBudget] = useState(40_000_000)
  const [bedroom, setBedroom] = useState<BedroomOption>("any")
  const [features, setFeatures] = useState<FeatureKey[]>([])
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([])
  const [furnishing, setFurnishing] = useState<FurnishingCondition>("any")
  const [lifestyle, setLifestyle] = useState("")
  const [chips, setChips] = useState<string[]>([])
  const [acceptedNeeds, setAcceptedNeeds] = useState<InferredNeedKey[]>([])
  const [inferredNeeds, setInferredNeeds] = useState<{ key: InferredNeedKey; label: string; reason: string }[]>([])
  const [isAnalyzingNeeds, setIsAnalyzingNeeds] = useState(false)
  const [needsAnalysisFailed, setNeedsAnalysisFailed] = useState(false)
  const [loadingStep, setLoadingStep] = useState<number | null>(null)

  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    const t = timers.current
    return () => t.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    const prompt = lifestyle.trim()
    if (!prompt) {
      setInferredNeeds([])
      setAcceptedNeeds([])
      setIsAnalyzingNeeds(false)
      setNeedsAnalysisFailed(false)
      return
    }

    const controller = new AbortController()
    const timer = setTimeout(() => {
      setIsAnalyzingNeeds(true)
      setNeedsAnalysisFailed(false)
      fetch("/api/ai/hidden-needs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ prompt }),
      })
        .then(async (response) => {
          if (!response.ok) throw new Error("Hidden-needs analysis failed.")
          const data = await response.json() as { needs?: unknown }
          if (!Array.isArray(data.needs)) throw new Error("Hidden-needs response was invalid.")
          const needs = data.needs.filter(
            (need): need is { key: InferredNeedKey; label: string; reason: string } =>
              Boolean(need) &&
              typeof need === "object" &&
              "key" in need &&
              "label" in need &&
              "reason" in need &&
              typeof need.key === "string" &&
              typeof need.label === "string" &&
              typeof need.reason === "string",
          )
          setInferredNeeds(needs)
          setAcceptedNeeds((current) => current.filter((key) => needs.some((need) => need.key === key)))
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") return
          setInferredNeeds([])
          setAcceptedNeeds([])
          setNeedsAnalysisFailed(true)
        })
        .finally(() => setIsAnalyzingNeeds(false))
    }, 700)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [lifestyle])

  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v])
  const updatePersonalDetails = <K extends keyof PersonalDetails>(key: K, value: PersonalDetails[K]) =>
    setPersonalDetails((current) => ({ ...current, [key]: value }))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()

    setCriteria({
      personalDetails,
      destination: destination.trim(),
      transport,
      budget,
      bedroom,
      features,
      propertyTypes,
      furnishing,
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
        <FormSection number="1" title="About you and your household" subtitle="Share a few details to help us find a home that fits your situation.">
          <div className="grid gap-8 md:grid-cols-2">
            <Field label="Full name" htmlFor="full-name">
              <Input
                id="full-name"
                autoComplete="name"
                value={personalDetails.fullName}
                onChange={(e) => updatePersonalDetails("fullName", e.target.value)}
                className="h-14 rounded-2xl border-2 bg-white text-base md:text-base"
              />
            </Field>
            <Field label="Age" htmlFor="age">
              <Input
                id="age"
                type="number"
                min={0}
                max={120}
                value={personalDetails.age ?? ""}
                onChange={(e) => updatePersonalDetails("age", e.target.value === "" ? null : Number(e.target.value))}
                className="h-14 rounded-2xl border-2 bg-white text-base md:text-base"
              />
            </Field>
            <Field label="Phone number" htmlFor="phone">
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                value={personalDetails.phone}
                onChange={(e) => updatePersonalDetails("phone", e.target.value)}
                className="h-14 rounded-2xl border-2 bg-white text-base md:text-base"
              />
            </Field>
            <Field label="Email" htmlFor="email">
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={personalDetails.email}
                onChange={(e) => updatePersonalDetails("email", e.target.value)}
                className="h-14 rounded-2xl border-2 bg-white text-base md:text-base"
              />
            </Field>
            <Field label="Occupation" htmlFor="occupation">
              <Input
                id="occupation"
                autoComplete="organization-title"
                value={personalDetails.occupation}
                onChange={(e) => updatePersonalDetails("occupation", e.target.value)}
                className="h-14 rounded-2xl border-2 bg-white text-base md:text-base"
              />
            </Field>
            <Field label="Workplace">
              <RadioCards
                name="workplace"
                legend="Workplace"
                value={personalDetails.workplaceType}
                options={workplaceOptions}
                onChange={(value) => updatePersonalDetails("workplaceType", value)}
                columns="grid-cols-1 sm:grid-cols-3"
              />
            </Field>
            <Field label="Work hours" htmlFor="work-hours" hint="For example, 9 AM–6 PM or night shifts.">
              <select
                id="work-hours"
                value={personalDetails.workHours}
                onChange={(e) => updatePersonalDetails("workHours", e.target.value)}
                className="h-14 w-full rounded-2xl border-2 border-border bg-white px-4 text-base text-navy outline-none transition-colors focus:border-navy focus:ring-2 focus:ring-navy/10"
              >
                <option value="">Select your usual work hours</option>
                {workHourOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="How many people will live in the home?" hint="Please include the number of adults, children, and babies under 2.">
            <div className="grid gap-4 sm:grid-cols-3">
              {([
                ["adults", "Adults"],
                ["children", "Children"],
                ["infants", "Babies under 2"],
              ] as const).map(([key, label]) => (
                <label key={key} className="space-y-2 text-base font-semibold text-navy" htmlFor={`residents-${key}`}>
                  <span className="block">{label}</span>
                  <Input
                    id={`residents-${key}`}
                    type="number"
                    min={0}
                    step={1}
                    value={personalDetails[key]}
                    onChange={(e) => updatePersonalDetails(key, Math.max(0, Math.floor(Number(e.target.value) || 0)))}
                    className="h-14 rounded-2xl border-2 bg-white text-base md:text-base"
                  />
                </label>
              ))}
            </div>
          </Field>
        </FormSection>

        <FormSection number="2" title="Your home preferences" subtitle="Keep your search filters and choose any home details that matter to you.">
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

            <Field label="How do you travel?" hint="Select all that apply.">
              <ToggleChips
                options={transportOptions}
                selected={transport}
                onToggle={(value) => setTransport((current) => toggle(current, value))}
              />
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

            <Field label="Property type" hint="Choose any that fit your search.">
              <ToggleChips
                options={propertyTypeOptions}
                selected={propertyTypes}
                onToggle={(value) => setPropertyTypes((current) => toggle(current, value))}
              />
            </Field>

            <Field label="Furnishing condition">
              <RadioCards
                name="furnishing"
                legend="Preferred furnishing condition"
                value={furnishing}
                options={furnishingOptions}
                onChange={setFurnishing}
              />
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

        <FormSection number="3" title="Tell us what matters most" subtitle="Add any other needs that the filters did not cover. This section is optional.">
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
              hint={isAnalyzingNeeds ? "AI is analyzing your message..." : needsAnalysisFailed ? "AI suggestions are unavailable right now." : "AI suggestions based on your message. Choose which ones matter to you."}
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
