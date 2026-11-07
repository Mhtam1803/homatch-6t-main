import { cn } from "@/lib/utils"

interface SectionHeadingProps {
  eyebrow?: string
  title: string
  description?: string
  align?: "left" | "center"
  className?: string
  id?: string
}

export function SectionHeading({ eyebrow, title, description, align = "center", className, id }: SectionHeadingProps) {
  return (
    <div className={cn("max-w-2xl space-y-3", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <p className="text-sm font-bold uppercase tracking-wider text-orange-ink">{eyebrow}</p>}
      <h2 id={id} className="text-3xl font-extrabold leading-tight text-navy sm:text-4xl">
        {title}
      </h2>
      {description && <p className="text-lg leading-relaxed text-navy/70">{description}</p>}
    </div>
  )
}

export function DemoBadge({ children = "Demo data", className }: { children?: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-orange/50 bg-cream px-3 py-1 text-xs font-bold uppercase tracking-wide text-orange-ink",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-orange" aria-hidden />
      {children}
    </span>
  )
}
