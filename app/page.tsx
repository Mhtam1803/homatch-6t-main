import { FeatureSection } from "@/components/home/feature-section"
import { FeaturedProperties } from "@/components/home/featured-properties"
import { FinalCta } from "@/components/home/final-cta"
import { Hero } from "@/components/home/hero"
import { HowItWorks } from "@/components/home/how-it-works"

export default function HomePage() {
  return (
    <main>
      <Hero />
      <FeatureSection />
      <HowItWorks />
      <FeaturedProperties />
      <FinalCta />
    </main>
  )
}
