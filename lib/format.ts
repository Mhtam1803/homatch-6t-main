import type {
  AccessHours,
  BedroomOption,
  FeatureKey,
  FurnishingCondition,
  PropertyType,
  TransportMode,
} from "@/types/listing"

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

export const propertyTypeLabels: Record<PropertyType, string> = {
  townhouse: "Townhouse",
  alley: "Alley access",
  owner: "Direct from owner",
  broker: "Through an agent",
  carAlley: "Car-accessible alley",
}

export const accessHoursLabels: Record<AccessHours, string> = {
  any: "Any access hours",
  flexible: "Flexible access hours",
  restricted: "Set access hours",
}

export const furnishingLabels: Record<FurnishingCondition, string> = {
  any: "Any furnishing",
  furnished: "Fully furnished",
  basic: "Basic furnishings",
  unfurnished: "Unfurnished",
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
