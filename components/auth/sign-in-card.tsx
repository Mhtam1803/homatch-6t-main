"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { DemoBadge } from "@/components/shared/section-heading"

export function SignInCard() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address.")
      return
    }
    router.push("/find-home")
  }

  return (
    <div className="w-full max-w-md space-y-6 rounded-3xl border border-border bg-white p-8 shadow-lift">
      <div className="space-y-2 text-center">
        <DemoBadge>Prototype – no real accounts</DemoBadge>
        <h1 className="pt-2 text-3xl font-extrabold text-navy">Welcome back</h1>
        <p className="text-base text-navy/70">Sign in to keep your favorite homes in one place.</p>
      </div>
      <form onSubmit={submit} noValidate className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-base font-bold text-navy">
            Email
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setError("")
            }}
            placeholder="you@example.com"
            aria-invalid={!!error}
            aria-describedby={error ? "email-error" : undefined}
            className="h-12 rounded-xl border-2 text-base md:text-base"
          />
          {error && (
            <p id="email-error" role="alert" className="text-sm font-semibold text-destructive">
              {error}
            </p>
          )}
        </div>
        <button
          type="submit"
          className="h-12 w-full rounded-full bg-orange text-base font-bold text-navy shadow-soft transition-colors hover:bg-orange/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
        >
          Continue
        </button>
      </form>
      <p className="text-center text-sm text-navy/70">
        Just browsing?{" "}
        <Link href="/find-home" className="font-bold text-navy underline underline-offset-4">
          Find a home
        </Link>
      </p>
    </div>
  )
}
