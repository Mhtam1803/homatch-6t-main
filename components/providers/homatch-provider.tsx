"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import type { BedroomOption, FeatureKey, InferredNeed, SearchCriteria, TransportMode } from "@/types/listing"

const SEARCH_CRITERIA_STORAGE_KEY = "homatch-search-criteria"

function isSearchCriteria(value: unknown): value is SearchCriteria {
  if (!value || typeof value !== "object") return false
  const criteria = value as Record<string, unknown>
  const transports: TransportMode[] = ["motorbike", "car", "bus", "walking"]
  const bedrooms: BedroomOption[] = ["any", "studio", "1", "2", "3+"]
  const features: FeatureKey[] = ["petFriendly", "balcony", "elevator", "quiet"]
  const inferredNeedKeys: InferredNeed["key"][] = ["quietStudy", "workFromHome", "familySpace", "easyAccess"]

  return (
    typeof criteria.destination === "string" &&
    typeof criteria.transport === "string" &&
    transports.includes(criteria.transport as TransportMode) &&
    typeof criteria.budget === "number" &&
    Number.isFinite(criteria.budget) &&
    typeof criteria.bedroom === "string" &&
    bedrooms.includes(criteria.bedroom as BedroomOption) &&
    Array.isArray(criteria.features) &&
    criteria.features.every((feature) => typeof feature === "string" && features.includes(feature as FeatureKey)) &&
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
  )
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
      if (isSearchCriteria(parsed)) {
        setCriteria(parsed)
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
