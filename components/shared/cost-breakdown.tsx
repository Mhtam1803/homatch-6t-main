import { formatVND } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { CostBreakdown as Cost } from "@/types/listing"

const rows: { key: keyof Cost; label: string }[] = [
  { key: "rent", label: "Base rent" },
  { key: "managementFee", label: "Management fee" },
  { key: "parkingFee", label: "Parking fee" },
  { key: "utilities", label: "Estimated utilities" },
]

export function CostBreakdown({ cost, total, className }: { cost: Cost; total: number; className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex h-3 overflow-hidden rounded-full bg-sky" aria-hidden>
        {rows.map((r, i) => (
          <div
            key={r.key}
            style={{ width: `${(cost[r.key] / total) * 100}%` }}
            className={cn(i === 0 ? "bg-navy" : i === 1 ? "bg-navy/60" : i === 2 ? "bg-navy/35" : "bg-navy/20")}
          />
        ))}
      </div>
      <dl className="space-y-2.5">
        {rows.map((r, i) => (
          <div key={r.key} className="flex items-center justify-between gap-4 text-base">
            <dt className="flex items-center gap-2 text-navy/75">
              <span
                aria-hidden
                className={cn("size-2.5 rounded-full", i === 0 ? "bg-navy" : i === 1 ? "bg-navy/60" : i === 2 ? "bg-navy/35" : "bg-navy/20")}
              />
              {r.label}
            </dt>
            <dd className="font-semibold text-navy">{formatVND(cost[r.key])}</dd>
          </div>
        ))}
      </dl>
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 rounded-2xl bg-orange px-3 py-3.5 sm:px-4">
        <span className="min-w-0 text-[11px] font-bold leading-tight text-navy sm:text-sm">Total monthly cost</span>
        <span className="whitespace-nowrap text-xs font-extrabold text-navy sm:text-base">{formatVND(total)}</span>
      </div>
    </div>
  )
}
