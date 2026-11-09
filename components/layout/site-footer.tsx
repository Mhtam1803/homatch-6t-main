import Link from "next/link"
import { Mail, MapPin, Phone } from "lucide-react"
import { Logo } from "@/components/layout/logo"

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/find-home", label: "Find a Home" },
  { href: "/homes", label: "Browse Homes" },
  { href: "/favorites", label: "Favorites" },
  { href: "/about", label: "About Us" },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.4fr_1.2fr] lg:px-8">
        <div className="space-y-4">
          <Logo variant="full" className="h-24 mix-blend-multiply" />
          <p className="max-w-xs text-base font-semibold italic text-navy">Less swiping, better living.</p>
        </div>

        <nav aria-label="Footer" className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-orange-ink">Quick links</h2>
          <ul className="space-y-3">
            {quickLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-base font-medium text-navy/80 transition-colors hover:text-navy hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-orange-ink">About Homatch</h2>
          <p className="max-w-sm text-base leading-relaxed text-navy/80">
            Homatch is an AI-powered rental matching startup helping students and young professionals find homes that fit
            their lifestyle in Ho Chi Minh City.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-orange-ink">Contact</h2>
          <ul className="space-y-3 text-base text-navy/80">
            <li className="flex items-center gap-3">
              <Mail className="size-4 shrink-0 text-navy" aria-hidden /> hello@homatch.example
            </li>
            <li className="flex items-center gap-3">
              <Phone className="size-4 shrink-0 text-navy" aria-hidden /> +84 000 000 000
            </li>
            <li className="flex items-center gap-3">
              <MapPin className="size-4 shrink-0 text-navy" aria-hidden /> Ho Chi Minh City, Vietnam
            </li>
          </ul>
          <p className="text-sm text-navy/60">Contact details are placeholders.</p>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-navy/70 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Homatch. All rights reserved.</p>
          <p>Listing details are shown as supplied; utility costs are estimates.</p>
        </div>
      </div>
    </footer>
  )
}
