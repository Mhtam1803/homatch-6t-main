import { CtaLink } from "@/components/shared/cta-link"

export function FinalCta() {
  return (
    <section aria-labelledby="cta-title" className="bg-white px-4 pb-20 sm:px-6 sm:pb-24 lg:px-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-navy px-6 py-16 text-center sm:px-12 sm:py-20">
        <span className="pointer-events-none absolute -bottom-24 -right-16 size-72 rounded-full bg-orange/90" aria-hidden />
        <span className="pointer-events-none absolute -left-20 -top-24 size-64 rounded-full bg-white/10" aria-hidden />
        <div className="relative mx-auto max-w-2xl space-y-8">
          <h2 id="cta-title" className="text-3xl font-extrabold leading-tight text-white sm:text-5xl">
            Your ideal home is closer than you think.
          </h2>
          <CtaLink href="/find-home" arrow className="w-full sm:w-auto">
            Find My Home
          </CtaLink>
        </div>
      </div>
    </section>
  )
}
