import type { Metadata } from "next"
import { SearchForm } from "@/components/search/search-form"

export const metadata: Metadata = {
  title: "Find My Home",
  description: "Tell Homatch your destination, budget and lifestyle. We'll match you with rental homes in Ho Chi Minh City that fit your life.",
}

export default function FindHomePage() {
  return (
    <main className="bg-gradient-to-b from-sky/60 via-white to-white pb-20">
      <div className="mx-auto max-w-3xl px-4 pt-12 sm:px-6 sm:pt-16">
        <header className="mb-10 space-y-4 text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-orange-ink">Find my home</p>
          <h1 className="text-4xl font-extrabold leading-tight text-navy sm:text-5xl">Let&apos;s find a place that feels like home.</h1>
          <p className="text-lg text-navy/70 sm:text-xl">Tell us what you need. We&apos;ll find the homes that fit your life.</p>
        </header>
        <SearchForm />
      </div>
    </main>
  )
}
