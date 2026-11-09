"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowRight, Menu, X } from "lucide-react"
import { Logo } from "@/components/layout/logo"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const links = [
  { href: "/", label: "Home" },
  { href: "/find-home", label: "Find a Home" },
  { href: "/homes", label: "Browse Homes" },
  { href: "/about", label: "About Us" },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    if (href.startsWith("/#")) return false
    return pathname === href || pathname.startsWith(href + "/")
  }

  const ctaClass = cn(
    buttonVariants(),
    "h-11 rounded-full bg-orange px-5 text-sm font-bold text-navy shadow-soft hover:bg-orange/90",
  )

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo className="h-14" priority />

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={cn(
                "relative rounded-full px-4 py-2 text-[15px] font-semibold text-navy/75 transition-colors hover:bg-sky hover:text-navy",
                isActive(l.href) && "bg-sky text-navy",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/sign-in"
            className={cn(buttonVariants({ variant: "ghost" }), "h-11 rounded-full px-5 text-[15px] font-semibold text-navy")}
          >
            Sign In
          </Link>
          <Link href="/find-home" className={ctaClass}>
            Get Started
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className="inline-flex size-11 items-center justify-center rounded-full text-navy transition-colors hover:bg-sky lg:hidden"
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open && (
        <div id="mobile-nav" className="animate-in fade-in slide-in-from-top-2 border-t border-border bg-white lg:hidden">
          <nav aria-label="Mobile" className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={isActive(l.href) ? "page" : undefined}
                className={cn(
                  "rounded-xl px-4 py-3.5 text-base font-semibold text-navy transition-colors hover:bg-sky",
                  isActive(l.href) && "bg-sky",
                )}
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-3 grid gap-2 border-t border-border pt-4">
              <Link
                href="/sign-in"
                className={cn(buttonVariants({ variant: "outline" }), "h-12 rounded-full border-navy/20 text-base font-semibold text-navy")}
              >
                Sign In
              </Link>
              <Link href="/find-home" className={cn(ctaClass, "h-12 text-base")}>
                Get Started <ArrowRight className="ml-1 size-4" />
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
