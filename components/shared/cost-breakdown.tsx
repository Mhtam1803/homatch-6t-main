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
      <div className="flex items-center justify-between gap-4 rounded-2xl bg-orange px-4 py-3.5">
        <span className="text-base font-bold text-navy">Total monthly cost</span>
        <span className="text-lg font-extrabold text-navy">{formatVND(total)}</span>
      </div>
    </div>
  )
}
