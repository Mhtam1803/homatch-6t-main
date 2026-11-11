export type TransportMode = "motorbike" | "car" | "bus" | "walking"

export type WorkplaceType = "home" | "office" | "unspecified"

export type PropertyType = "townhouse" | "alley" | "owner" | "broker" | "carAlley"

export type FurnishingCondition = "any" | "furnished" | "basic" | "unfurnished"

export type BedroomOption = "any" | "studio" | "1" | "2" | "3+"

export type FeatureKey =
  | "petFriendly"
  | "balcony"
  | "elevator"
  | "quiet"
  | "privateWc"
  | "privateKitchen"
  | "airConditioner"
  | "washingMachine"
  | "naturalLight"
  | "remoteWorkFriendly"
  | "nearSchool"
  | "nearSupermarket"
  | "playground"
  | "security24h"
  | "childFriendly"
  | "parking"
  | "nearBusStop"
  | "nearMetro"
  | "window"

export type InferredNeedKey = "quietStudy" | "workFromHome" | "familySpace" | "easyAccess"

export type TargetSegment = "student" | "young_professional" | "couple_family" | "premium"

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

/** Extended amenity flags added in dataset v4 */
export interface AmenitiesV4 {
  privateWc: boolean
  privateKitchen: boolean
  airConditioner: boolean
  washingMachine: boolean
  naturalLight: boolean
  remoteWorkFriendly: boolean
  nearSchool: boolean
  nearSupermarket: boolean
  playground: boolean
  security24h: boolean
  childFriendly: boolean
  parking: boolean
  nearBusStop: boolean
  nearMetro: boolean
  window: boolean
}

export interface Listing {
  id: string
  title: string
  district: string
  address: string
  bedrooms: number
  maxOccupants: number
  bedroomLabel: string
  areaM2: number
  images: { src: string; alt: string }[]
  cost: CostBreakdown
  totalMonthly: number
  features: Record<FeatureKey, boolean>
  /** Extended amenity flags from dataset v4 */
  amenities: AmenitiesV4
  description: string
  coordinates: { lat: number; lng: number }
  /** Design-quota segment tag – not an eligibility filter */
  targetSegment: TargetSegment
  /** Provenance metadata – marks this as demo data, not a real vacancy */
  synthetic: true
  referenceNote: string
}

export interface SearchCriteria {
  destination: string
  transport: TransportMode[]
  budget: number
  bedroom: BedroomOption
  features: FeatureKey[]
  personalDetails: PersonalDetails
  propertyTypes: PropertyType[]
  furnishing: FurnishingCondition
  lifestyle: string
  chips: string[]
  inferredNeeds: InferredNeed[]
}

export interface CommuteEstimate {
  destinationId: string
  destinationLabel: string
  durationMinutes: number
  distanceKm: number
  profile: "driving-car"
}
