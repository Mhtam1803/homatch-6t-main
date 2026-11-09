"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import type {
  AccessHours,
  BedroomOption,
  FeatureKey,
  FurnishingCondition,
  InferredNeed,
  PersonalDetails,
  PropertyType,
  SearchCriteria,
  TransportMode,
  WorkplaceType,
} from "@/types/listing"

const SEARCH_CRITERIA_STORAGE_KEY = "homatch-search-criteria"

function isPersonalDetails(value: unknown): value is PersonalDetails {
  if (!value || typeof value !== "object") return false
  const details = value as Record<string, unknown>
  const workplaceTypes: WorkplaceType[] = ["home", "office", "unspecified"]

  return (
    typeof details.fullName === "string" &&
    (details.age === null || (typeof details.age === "number" && Number.isFinite(details.age))) &&
    typeof details.phone === "string" &&
    typeof details.email === "string" &&
    typeof details.occupation === "string" &&
    typeof details.workplaceType === "string" &&
    workplaceTypes.includes(details.workplaceType as WorkplaceType) &&
    typeof details.workHours === "string" &&
    typeof details.adults === "number" &&
    Number.isInteger(details.adults) &&
    details.adults >= 0 &&
    typeof details.children === "number" &&
    Number.isInteger(details.children) &&
    details.children >= 0 &&
    typeof details.infants === "number" &&
    Number.isInteger(details.infants) &&
    details.infants >= 0
  )
}

function parseSearchCriteria(value: unknown): SearchCriteria | null {
  if (!value || typeof value !== "object") return null
  const criteria = value as Record<string, unknown>
  const transports: TransportMode[] = ["motorbike", "car", "bus", "walking"]
  const bedrooms: BedroomOption[] = ["any", "studio", "1", "2", "3+"]
  const features: FeatureKey[] = ["petFriendly", "balcony", "elevator", "quiet"]
  const propertyTypes: PropertyType[] = ["townhouse", "alley", "owner", "broker", "carAlley"]
  const accessHours: AccessHours[] = ["any", "flexible", "restricted"]
  const furnishingOptions: FurnishingCondition[] = ["any", "furnished", "basic", "unfurnished"]
  const inferredNeedKeys: InferredNeed["key"][] = ["quietStudy", "workFromHome", "familySpace", "easyAccess"]
  const transportValues = Array.isArray(criteria.transport) ? criteria.transport : [criteria.transport]
  const savedDetails = criteria.personalDetails
  let personalDetails: PersonalDetails
  if (savedDetails === undefined) {
    personalDetails = {
      fullName: "",
      age: null,
      phone: "",
      email: "",
      occupation: "",
      workplaceType: "unspecified",
      workHours: "",
      adults: 0,
      children: 0,
      infants: 0,
    }
  } else if (isPersonalDetails(savedDetails)) {
    personalDetails = savedDetails
  } else {
    return null
  }

  const isValid =
    typeof criteria.destination === "string" &&
    transportValues.every((transport) => typeof transport === "string" && transports.includes(transport as TransportMode)) &&
    typeof criteria.budget === "number" &&
    Number.isFinite(criteria.budget) &&
    typeof criteria.bedroom === "string" &&
    bedrooms.includes(criteria.bedroom as BedroomOption) &&
    Array.isArray(criteria.features) &&
    criteria.features.every((feature) => typeof feature === "string" && features.includes(feature as FeatureKey)) &&
    (criteria.propertyTypes === undefined ||
      (Array.isArray(criteria.propertyTypes) &&
        criteria.propertyTypes.every((type) => typeof type === "string" && propertyTypes.includes(type as PropertyType)))) &&
    (criteria.accessHours === undefined ||
      (typeof criteria.accessHours === "string" && accessHours.includes(criteria.accessHours as AccessHours))) &&
    (criteria.furnishing === undefined ||
      (typeof criteria.furnishing === "string" && furnishingOptions.includes(criteria.furnishing as FurnishingCondition))) &&
    (savedDetails === undefined || isPersonalDetails(savedDetails)) &&
    typeof criteria.lifestyle === "string" &&
    Array.isArray(criteria.chips) &&
    criteria.chips.every((chip) => typeof chip === "string") &&
    Array.isArray(criteria.inferredNeeds) &&
    criteria.inferredNeeds.every(
      (need) =>
        need &&
        typeof need === "object" &&
        typeof need.key === "string" &&
        inferredNeedKeys.includes(need.key as InferredNeed["key"]) &&
        typeof need.label === "string" &&
        typeof need.reason === "string",
    )
  if (!isValid) return null

  return {
    destination: criteria.destination as string,
    transport: transportValues.filter((transport): transport is TransportMode => typeof transport === "string" && transports.includes(transport as TransportMode)),
    budget: criteria.budget as number,
    bedroom: criteria.bedroom as BedroomOption,
    features: criteria.features as FeatureKey[],
    personalDetails,
    propertyTypes: (criteria.propertyTypes as PropertyType[] | undefined) ?? [],
    accessHours: (criteria.accessHours as AccessHours | undefined) ?? "any",
    furnishing: (criteria.furnishing as FurnishingCondition | undefined) ?? "any",
    lifestyle: criteria.lifestyle as string,
    chips: criteria.chips as string[],
    inferredNeeds: criteria.inferredNeeds as InferredNeed[],
  }
}

interface HomatchState {
  criteria: SearchCriteria | null
  setCriteria: (c: SearchCriteria) => void
  favorites: string[]
  isFavorite: (id: string) => boolean
  toggleFavorite: (id: string) => void
}

const HomatchContext = createContext<HomatchState | null>(null)

export function HomatchProvider({ children }: { children: React.ReactNode }) {
  const [criteria, setCriteria] = useState<SearchCriteria | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    try {
      const savedCriteria = sessionStorage.getItem(SEARCH_CRITERIA_STORAGE_KEY)
      if (!savedCriteria) return

      const parsed: unknown = JSON.parse(savedCriteria)
      const restoredCriteria = parseSearchCriteria(parsed)
      if (restoredCriteria) {
        setCriteria(restoredCriteria)
      } else {
        sessionStorage.removeItem(SEARCH_CRITERIA_STORAGE_KEY)
      }
    } catch (error) {
      console.error("Could not restore the saved Homatch search criteria.", error)
    }
  }, [])

  const saveCriteria = useCallback((nextCriteria: SearchCriteria) => {
    setCriteria(nextCriteria)
    try {
      sessionStorage.setItem(
        SEARCH_CRITERIA_STORAGE_KEY,
        JSON.stringify({ ...nextCriteria, lifestyle: "" }),
      )
    } catch (error) {
      console.error("Could not save the Homatch search criteria for this browser session.", error)
    }
  }, [])

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))
  }, [])

  const value = useMemo<HomatchState>(
    () => ({
      criteria,
      setCriteria: saveCriteria,
      favorites,
      isFavorite: (id) => favorites.includes(id),
      toggleFavorite,
    }),
    [criteria, favorites, saveCriteria, toggleFavorite],
  )

  return <HomatchContext.Provider value={value}>{children}</HomatchContext.Provider>
}

export function useHomatch() {
  const ctx = useContext(HomatchContext)
  if (!ctx) throw new Error("useHomatch must be used within HomatchProvider")
  return ctx
}
