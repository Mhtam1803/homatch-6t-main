"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { formatVND } from "@/lib/format"
import type { Listing } from "@/types/listing"

interface ResultsMapProps {
  listings: Listing[]
}

const rankStyles: Record<number, string> = {
  1: "background:#FF8A3D;color:#0B2D6B;border:3px solid #fff;width:44px;height:44px;font-size:18px",
  2: "background:#0B2D6B;color:#fff;border:3px solid #fff;width:38px;height:38px;font-size:16px",
  3: "background:#E8F0FF;color:#0B2D6B;border:3px solid #0B2D6B;width:38px;height:38px;font-size:16px",
}

function rankIcon(rank: number) {
  const size = rank === 1 ? 44 : 38
  const style = rankStyles[rank] ?? rankStyles[3]
  return L.divIcon({
    className: "homatch-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
    html: `<div style="${style};border-radius:9999px;display:flex;align-items:center;justify-content:center;font-weight:800;box-shadow:0 6px 16px rgba(11,45,107,.35)">${rank}</div>`,
  })
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, css: string, text?: string) {
  const node = document.createElement(tag)
  node.style.cssText = css
  if (text) node.textContent = text
  return node
}

export default function ResultsMap({ listings }: ResultsMapProps) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const firstListing = listings[0]
    const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView(
      firstListing ? [firstListing.coordinates.lat, firstListing.coordinates.lng] : [10.8231, 106.6297],
      12,
    )
    mapRef.current = map

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    const bounds = L.latLngBounds([])

    listings.forEach((l, i) => {
      const rank = i + 1
      const marker = L.marker([l.coordinates.lat, l.coordinates.lng], {
        icon: rankIcon(rank),
        title: `#${rank} ${l.title}`,
        zIndexOffset: 1000 - i * 100,
      }).addTo(map)
      bounds.extend([l.coordinates.lat, l.coordinates.lng])

      const wrap = el("div", "font-family:inherit")
      const img = el("img", "width:100%;height:110px;object-fit:cover;display:block") as HTMLImageElement
      img.src = l.images[0].src
      img.alt = l.images[0].alt
      const body = el("div", "padding:12px 16px 16px")
      body.append(el("div", "font-size:12px;font-weight:800;color:#b8480f", `Listing #${rank}`))
      body.append(el("div", "font-size:16px;font-weight:800;color:#0B2D6B;margin-top:2px", l.title))
      body.append(el("div", "font-size:13px;color:#4a5d85;margin-top:2px", `${l.district} · ${l.areaM2} m²`))
      body.append(el("div", "font-size:15px;font-weight:800;color:#0B2D6B;margin-top:4px", formatVND(l.totalMonthly)))
      const btn = el(
        "button",
        "margin-top:10px;width:100%;height:40px;border:0;border-radius:9999px;background:#FF8A3D;color:#0B2D6B;font-weight:800;font-size:14px;cursor:pointer;font-family:inherit",
        "View Details",
      ) as HTMLButtonElement
      btn.type = "button"
      btn.addEventListener("click", () => router.push(`/property/${l.id}`))
      body.append(btn)
      wrap.append(img, body)
      marker.bindPopup(wrap)
    })

    if (listings.length > 0) map.fitBounds(bounds, { padding: [48, 48], maxZoom: 13 })

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [listings, router])

  return <div ref={containerRef} className="size-full" role="application" aria-label="Map of rental listings" />
}
