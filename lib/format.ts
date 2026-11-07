import type { BedroomOption, FeatureKey, TransportMode } from "@/types/listing"

export function formatVND(value: number): string {
  return `${new Intl.NumberFormat("en-US").format(value)} VND`
}

export function formatMillions(value: number): string {
  const m = value / 1_000_000
  return `${Number.isInteger(m) ? m : m.toFixed(1)}M VND`
}

export const transportLabels: Record<TransportMode, string> = {
  motorbike: "Motorbike",
  car: "Car",
  bus: "Bus",
  walking: "Walking",
}

export const bedroomLabels: Record<BedroomOption, string> = {
  any: "Any",
  studio: "Studio",
  "1": "1 Bedroom",
  "2": "2 Bedrooms",
  "3+": "3+ Bedrooms",
}

export const featureLabels: Record<FeatureKey, string> = {
  petFriendly: "Pet Friendly",
  balcony: "Balcony",
  elevator: "Elevator",
  quiet: "Quiet Environment",
}
