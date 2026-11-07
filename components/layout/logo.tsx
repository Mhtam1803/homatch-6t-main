import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface LogoProps {
  variant?: "wordmark" | "full"
  className?: string
  priority?: boolean
}

// Intrinsic sizes of the supplied logo files; width/height keep the original proportions.
const sizes = {
  wordmark: { src: "/images/homatch-logo-wordmark.png", width: 1102, height: 639 },
  full: { src: "/images/homatch-logo.png", width: 1102, height: 731 },
}

export function Logo({ variant = "wordmark", className, priority }: LogoProps) {
  const s = sizes[variant]
  return (
    <Link href="/" aria-label="Homatch – Less swiping, better living. Home" className="inline-flex shrink-0 rounded-lg">
      <Image
        src={s.src || "/placeholder.svg"}
        alt="Homatch logo"
        width={s.width}
        height={s.height}
        priority={priority}
        className={cn("h-12 w-auto", className)}
      />
    </Link>
  )
}
