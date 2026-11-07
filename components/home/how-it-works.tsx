import { SectionHeading } from "@/components/shared/section-heading"

const steps = [
  { number: "01", title: "Tell us your lifestyle." },
  { number: "02", title: "Set your budget and location." },
  { number: "03", title: "Let AI find your matches." },
  { number: "04", title: "Discover your Top 3 homes." },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-title" className="scroll-mt-20 bg-cream py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading id="how-title" eyebrow="How it works" title="Your perfect home in 4 simple steps." />

        <ol className="relative mt-14 grid gap-8 md:grid-cols-4 md:gap-6">
          <span
            className="absolute left-[12.5%] right-[12.5%] top-7 hidden h-0.5 bg-gradient-to-r from-navy/20 via-orange to-navy/20 md:block"
            aria-hidden
          />
          <span className="absolute bottom-6 left-7 top-6 w-0.5 bg-navy/15 md:hidden" aria-hidden />
          {steps.map((s, i) => (
            <li key={s.number} className="relative flex gap-5 md:flex-col md:items-center md:gap-5 md:text-center">
              <span
                className={`relative z-10 flex size-14 shrink-0 items-center justify-center rounded-full text-lg font-extrabold shadow-soft ${
                  i === 3 ? "bg-orange text-navy" : "bg-navy text-white"
                }`}
              >
                {s.number}
              </span>
              <p className="self-center text-lg font-bold text-navy md:max-w-[12rem]">{s.title}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
