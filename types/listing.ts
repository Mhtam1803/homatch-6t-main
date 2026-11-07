export type TransportMode = "motorbike" | "car" | "bus" | "walking"

export type BedroomOption = "studio" | "1" | "2" | "3+"

export type FeatureKey = "petFriendly" | "balcony" | "elevator" | "quiet"

export interface CostBreakdown {
  rent: number
  managementFee: number
  parkingFee: number
  utilities: number
}

export interface Listing {
  id: string
  title: string
  district: string
  address: string
  bedrooms: number
  bedroomLabel: string
  areaM2: number
  images: { src: string; alt: string }[]
  cost: CostBreakdown
  totalMonthly: number
  features: Record<FeatureKey, boolean>
  description: string
  coordinates: { lat: number; lng: number }
}

export interface SearchCriteria {
  destination: string
  transport: TransportMode
  budget: number
  bedroom: BedroomOption
  features: FeatureKey[]
  lifestyle: string
  chips: string[]
}
