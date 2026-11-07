import type { Metadata } from "next"
import { ResultsView } from "@/components/results/results-view"

export const metadata: Metadata = {
  title: "Rental listings",
  description: "Browse rental listings in Ho Chi Minh City with photos and estimated monthly costs.",
}

export default function ResultsPage() {
  return <ResultsView />
}
