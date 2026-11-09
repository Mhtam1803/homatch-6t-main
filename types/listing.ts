export type TransportMode = "motorbike" | "car" | "bus" | "walking"

export type WorkplaceType = "home" | "office" | "unspecified"

export type PropertyType = "townhouse" | "alley" | "owner" | "broker" | "carAlley"

export type AccessHours = "any" | "flexible" | "restricted"

export type FurnishingCondition = "any" | "furnished" | "basic" | "unfurnished"

export type BedroomOption = "any" | "studio" | "1" | "2" | "3+"

export type FeatureKey = "petFriendly" | "balcony" | "elevator" | "quiet"

export type InferredNeedKey = "quietStudy" | "workFromHome" | "familySpace" | "easyAccess"

export interface InferredNeed {
  key: InferredNeedKey
  label: string
  reason: string
}

export interface PersonalDetails {
  fullName: string
  age: number | null
  phone: string
  email: string
  occupation: string
  workplaceType: WorkplaceType
  workHours: string
  adults: number
  children: number
  infants: number
}

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
  transport: TransportMode[]
  budget: number
  bedroom: BedroomOption
  features: FeatureKey[]
  personalDetails: PersonalDetails
  propertyTypes: PropertyType[]
  accessHours: AccessHours
  furnishing: FurnishingCondition
  lifestyle: string
  chips: string[]
  inferredNeeds: InferredNeed[]
}
