import { Receipt, Route, Sparkles } from "lucide-react"
import { SectionHeading } from "@/components/shared/section-heading"

const features = [
  {
    icon: Sparkles,
    title: "Smart AI Matching",
    description: "We understand what makes a home right for you, beyond basic filters.",
  },
  {
    icon: Route,
    title: "Real-Time Commute",
    description: "Find a home that fits your daily journey.",
  },
  {
    icon: Receipt,
    title: "Transparent Living Costs",
    description: "See the complete monthly cost before making a decision.",
  },
]

export function FeatureSection() {
  return (
    <section aria-labelledby="features-title" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading id="features-title" eyebrow="Why Homatch" title="Finding your next home, reimagined." />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {features.map((f) => (
            <article
              key={f.title}
              className="group rounded-3xl border border-border bg-sky/50 p-8 transition-all hover:-translate-y-1 hover:bg-white hover:shadow-lift"
            >
              <span className="relative flex size-14 items-center justify-center rounded-2xl bg-white text-navy shadow-soft">
                <f.icon className="size-7" aria-hidden />
                <span className="absolute -right-1 -top-1 size-3.5 rounded-full bg-orange" aria-hidden />
              </span>
              <h3 className="mt-6 text-xl font-bold text-navy">{f.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-navy/75">{f.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
