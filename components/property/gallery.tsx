"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

export function Gallery({ images }: { images: { src: string; alt: string }[] }) {
  const [active, setActive] = useState(0)
  return (
    <div className="space-y-3">
      <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-sky shadow-soft">
        <Image
          key={images[active].src}
          src={images[active].src || "/placeholder.svg"}
          alt={images[active].alt}
          fill
          priority
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-cover animate-in fade-in duration-300"
        />
      </div>
      <ul className="grid grid-cols-4 gap-3" aria-label="Photo thumbnails">
        {images.map((img, i) => (
          <li key={img.src}>
            <button
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show photo ${i + 1}: ${img.alt}`}
              aria-current={i === active}
              className={cn(
                "relative block aspect-[4/3] w-full overflow-hidden rounded-2xl border-2 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange",
                i === active ? "border-orange" : "border-transparent opacity-75 hover:opacity-100",
              )}
            >
              <Image src={img.src || "/placeholder.svg"} alt="" fill sizes="160px" className="object-cover" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
