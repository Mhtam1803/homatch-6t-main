import type { Metadata } from "next"
import Image from "next/image"
import { Calculator, HeartHandshake, Route, ShieldCheck } from "lucide-react"
import { CtaLink } from "@/components/shared/cta-link"
import { SectionHeading } from "@/components/shared/section-heading"

export const metadata: Metadata = {
  title: "About Us",
  description: "Homatch helps renters in Ho Chi Minh City find homes that fit their lifestyle, commute and true monthly cost, with less swiping.",
}

const values = [
  { icon: HeartHandshake, title: "Lifestyle first", text: "We start with how you live, not just how many bedrooms you want." },
  { icon: Calculator, title: "Honest costs", text: "Rent plus fees, parking and utilities, so the monthly number is the real one." },
  { icon: Route, title: "Commute that counts", text: "Matches reflect the way you actually travel to work or class." },
  { icon: ShieldCheck, title: "Transparent matching", text: "Every recommendation explains why it fits, in plain language." },
]

export default function AboutPage() {
  return (
    <main>
      <section className="bg-gradient-to-b from-sky/60 to-white py-16 sm:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
          <div className="space-y-6">
            <p className="text-sm font-bold uppercase tracking-wider text-orange-ink">About Homatch</p>
            <h1 className="text-4xl font-extrabold leading-tight text-navy sm:text-5xl">Less swiping, better living.</h1>
            <p className="text-lg leading-relaxed text-navy/80 sm:text-xl">
              Finding a rental in Ho Chi Minh City shouldn&apos;t mean scrolling through hundreds of listings. Homatch listens to how you live, then
              shows a few homes that truly fit, with the full monthly cost and commute made clear.
            </p>
            <CtaLink href="/find-home" arrow>
              Find My Home
            </CtaLink>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-lift">
            <Image
              src="/images/about-city.jpg"
              alt="Ho Chi Minh City skyline with modern apartment buildings and greenery"
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="values" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionHeading id="values" eyebrow="What we believe" title="Built around real renters" description="Four principles guide every match." />
        <ul className="mt-12 grid gap-6 sm:grid-cols-2">
          {values.map((v) => (
            <li key={v.title} className="flex gap-5 rounded-3xl border border-border bg-white p-6 shadow-soft">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-sky text-navy">
                <v.icon className="size-7" aria-hidden />
              </span>
              <div>
                <h3 className="text-xl font-bold text-navy">{v.title}</h3>
                <p className="mt-1 text-base leading-relaxed text-navy/75">{v.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
