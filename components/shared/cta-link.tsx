import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface CtaLinkProps {
  href: string
  children: React.ReactNode
  variant?: "primary" | "secondary" | "navy"
  arrow?: boolean
  className?: string
}

const variants = {
  primary: "bg-orange text-navy shadow-soft hover:bg-orange/90 hover:shadow-lift",
  secondary: "border border-navy/25 bg-white text-navy hover:border-navy hover:bg-sky",
  navy: "bg-navy text-white hover:bg-navy/90",
}

export function CtaLink({ href, children, variant = "primary", arrow, className }: CtaLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex h-14 items-center justify-center gap-2 rounded-full px-8 text-base font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy",
        variants[variant],
        className,
      )}
    >
      {children}
      {arrow && <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" aria-hidden />}
    </Link>
  )
}
