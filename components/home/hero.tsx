import Image from "next/image"
import { Clock, Receipt, ShieldCheck, Sparkles } from "lucide-react"
import { CtaLink } from "@/components/shared/cta-link"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-sky/70 via-white to-white">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
        <div className="animate-in fade-in slide-in-from-bottom-4 space-y-7 duration-700">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-navy shadow-soft">
            <Sparkles className="size-4 text-orange" aria-hidden /> AI-powered rental matching in Ho Chi Minh City
          </span>
          <h1 className="text-5xl font-extrabold leading-[1.05] text-navy sm:text-6xl lg:text-7xl">
            Less swiping, <span className="text-orange">better living.</span>
          </h1>
          <p className="text-xl font-semibold text-navy sm:text-2xl">
            Your lifestyle deserves more than just a place to stay.
          </p>
          <p className="max-w-xl text-lg leading-relaxed text-navy/75">
            Discover your ideal home with AI-powered matching that understands your lifestyle, budget, and daily commute.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <CtaLink href="/find-home" arrow className="w-full sm:w-auto">
              Find My Home
            </CtaLink>
            <CtaLink href="/#how-it-works" variant="secondary" className="w-full sm:w-auto">
              How It Works
            </CtaLink>
          </div>
          <p className="flex items-center gap-2 text-base font-semibold text-navy/80">
            <ShieldCheck className="size-5 text-navy" aria-hidden />
            Smarter matching. Transparent costs. Better living.
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-lg animate-in fade-in zoom-in-95 duration-1000 lg:max-w-none">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-lift sm:aspect-[5/6] lg:aspect-[4/5]">
            <Image
              src="/images/hero-apartment.jpg"
              alt="Bright modern apartment living room with floor-to-ceiling windows overlooking the city"
              fill
              priority
              sizes="(min-width: 1024px) 560px, 100vw"
              className="object-cover"
            />
          </div>

          <div className="absolute -left-2 top-8 flex animate-float items-center gap-3 rounded-2xl bg-white p-3 pr-5 shadow-lift sm:-left-8">
            <span className="flex size-11 items-center justify-center rounded-xl bg-orange/15 text-orange-ink">
              <Sparkles className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-xl font-extrabold leading-none text-navy">98%</p>
              <p className="mt-1 text-sm font-semibold text-navy/70">Lifestyle Match</p>
            </div>
          </div>

          <div className="absolute -right-2 top-1/2 flex animate-float-slow items-center gap-3 rounded-2xl bg-white p-3 pr-5 shadow-lift sm:-right-6">
            <span className="flex size-11 items-center justify-center rounded-xl bg-sky text-navy">
              <Clock className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-xl font-extrabold leading-none text-navy">12 min</p>
              <p className="mt-1 text-sm font-semibold text-navy/70">Commute</p>
            </div>
          </div>

          <div className="absolute -bottom-5 left-4 flex animate-float items-center gap-3 rounded-2xl bg-white p-3 pr-5 shadow-lift sm:left-8">
            <span className="flex size-11 items-center justify-center rounded-xl bg-cream text-orange-ink">
              <Receipt className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-semibold text-navy/70">All-In Cost</p>
              <p className="mt-0.5 text-xl font-extrabold leading-none text-navy">7.1M VND</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
