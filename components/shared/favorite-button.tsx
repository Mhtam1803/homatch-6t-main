"use client"

import { Heart } from "lucide-react"
import { useHomatch } from "@/components/providers/homatch-provider"
import { cn } from "@/lib/utils"

interface FavoriteButtonProps {
  listingId: string
  listingTitle: string
  className?: string
}

export function FavoriteButton({ listingId, listingTitle, className }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useHomatch()
  const saved = isFavorite(listingId)

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(listingId)}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${listingTitle} from favorites` : `Save ${listingTitle} to favorites`}
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-full bg-white/95 text-navy shadow-soft transition-all hover:scale-105 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange",
        className,
      )}
    >
      <Heart className={cn("size-5 transition-colors", saved ? "fill-orange text-orange" : "text-navy")} />
    </button>
  )
}
