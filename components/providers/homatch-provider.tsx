"use client"

import { createContext, useCallback, useContext, useMemo, useState } from "react"
import type { SearchCriteria } from "@/types/listing"

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

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))
  }, [])

  const value = useMemo<HomatchState>(
    () => ({
      criteria,
      setCriteria,
      favorites,
      isFavorite: (id) => favorites.includes(id),
      toggleFavorite,
    }),
    [criteria, favorites, toggleFavorite],
  )

  return <HomatchContext.Provider value={value}>{children}</HomatchContext.Provider>
}

export function useHomatch() {
  const ctx = useContext(HomatchContext)
  if (!ctx) throw new Error("useHomatch must be used within HomatchProvider")
  return ctx
}
