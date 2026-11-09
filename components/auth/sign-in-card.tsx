"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase"
import { useHomatch } from "@/components/providers/homatch-provider"

type SignInMethod = "otp" | "password"

function normalizeVietnamesePhone(value: string): string | null {
  const phone = value.replace(/[\s()-]/g, "")
  const digits = phone.replace(/^\+/, "")
  if (!/^\d{9,12}$/.test(digits)) return null
  if (phone.startsWith("+")) return `+${digits}`
  if (digits.startsWith("84")) return `+${digits}`
  return `+84${digits.replace(/^0/, "")}`
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong. Please try again."
}

export function SignInCard() {
  const router = useRouter()
  const { phone: signedInPhone, signOut } = useHomatch()
  const [method, setMethod] = useState<SignInMethod>("otp")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const changeMethod = (nextMethod: SignInMethod) => {
    setMethod(nextMethod)
    setOtpSent(false)
    setOtp("")
    setError("")
    setMessage("")
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setMessage("")

    if (!isSupabaseConfigured()) {
      setError("Sign in is not configured yet. Add the Supabase project values to .env.local.")
      return
    }

    const normalizedPhone = normalizeVietnamesePhone(phone)
    if (!normalizedPhone) {
      setError("Enter a valid phone number, such as 0912345678 or +84912345678.")
      return
    }

    const supabase = getSupabaseClient()
    if (!supabase) {
      setError("Could not connect to the sign-in service.")
      return
    }

    setBusy(true)
    try {
      if (method === "otp" && !otpSent) {
        const { error: sendError } = await supabase.auth.signInWithOtp({
          phone: normalizedPhone,
          options: { shouldCreateUser: false },
        })
        if (sendError) throw sendError
        setPhone(normalizedPhone)
        setOtpSent(true)
        setMessage("A verification code has been sent to your phone.")
        return
      }

      if (method === "otp") {
        if (!/^\d{6}$/.test(otp)) {
          setError("Enter the 6-digit verification code.")
          return
        }
        const { error: verifyError } = await supabase.auth.verifyOtp({
          phone: normalizedPhone,
          token: otp,
          type: "sms",
        })
        if (verifyError) throw verifyError
      } else {
        if (!password) {
          setError("Enter your password.")
          return
        }
        const { error: signInError } = await supabase.auth.signInWithPassword({
          phone: normalizedPhone,
          password,
        })
        if (signInError) throw signInError
      }

      router.push("/favorites")
    } catch (caughtError) {
      setError(getErrorMessage(caughtError))
    } finally {
      setBusy(false)
    }
  }

  const handleSignOut = async () => {
    setBusy(true)
    setError("")
    try {
      await signOut()
    } catch (caughtError) {
      setError(getErrorMessage(caughtError))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-6 rounded-3xl border border-border bg-white p-8 shadow-lift">
      <div className="space-y-2 text-center">
        <h1 className="pt-2 text-3xl font-extrabold text-navy">{signedInPhone ? "You're signed in" : "Welcome back"}</h1>
        <p className="text-base text-navy/70">
          {signedInPhone ? `Signed in with ${signedInPhone}` : "Sign in to keep your favorite homes in one place."}
        </p>
      </div>

      {signedInPhone ? (
        <div className="space-y-4">
          <Link
            href="/favorites"
            className="flex h-12 w-full items-center justify-center rounded-full bg-orange text-base font-bold text-navy shadow-soft transition-colors hover:bg-orange/90"
          >
            View saved homes
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={busy}
            className="h-12 w-full rounded-full border-2 border-border text-base font-bold text-navy transition-colors hover:bg-sky disabled:opacity-60"
          >
            {busy ? "Signing out..." : "Sign out"}
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 rounded-full bg-sky/60 p-1" aria-label="Sign-in method">
            <button
              type="button"
              aria-pressed={method === "otp"}
              onClick={() => changeMethod("otp")}
              className={`h-10 rounded-full text-sm font-bold transition-colors ${method === "otp" ? "bg-white text-navy shadow-soft" : "text-navy/70"}`}
            >
              SMS verification code
            </button>
            <button
              type="button"
              aria-pressed={method === "password"}
              onClick={() => changeMethod("password")}
              className={`h-10 rounded-full text-sm font-bold transition-colors ${method === "password" ? "bg-white text-navy shadow-soft" : "text-navy/70"}`}
            >
              Password
            </button>
          </div>

          <form onSubmit={submit} noValidate className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="phone" className="text-base font-bold text-navy">
                Phone number
              </label>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                disabled={otpSent && method === "otp"}
                value={phone}
                onChange={(event) => {
                  setPhone(event.target.value)
                  setError("")
                }}
                placeholder="0912345678"
                aria-invalid={!!error}
                aria-describedby={error ? "sign-in-error" : undefined}
                className="h-12 rounded-xl border-2 text-base md:text-base"
              />
            </div>

            {method === "password" && (
              <div className="space-y-2">
                <label htmlFor="password" className="text-base font-bold text-navy">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-12 rounded-xl border-2 text-base md:text-base"
                />
              </div>
            )}

            {method === "otp" && otpSent && (
              <div className="space-y-2">
                <label htmlFor="otp" className="text-base font-bold text-navy">
                  6-digit verification code
                </label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="h-12 rounded-xl border-2 text-base tracking-[0.3em] md:text-base"
                />
              </div>
            )}

            {error && (
              <p id="sign-in-error" role="alert" className="text-sm font-semibold text-destructive">
                {error}
              </p>
            )}
            {message && <p role="status" className="text-sm font-semibold text-navy/80">{message}</p>}

            <button
              type="submit"
              disabled={busy}
              className="h-12 w-full rounded-full bg-orange text-base font-bold text-navy shadow-soft transition-colors hover:bg-orange/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy
                ? "Please wait..."
                : method === "password"
                  ? "Sign in"
                  : otpSent
                    ? "Verify code"
                    : "Send verification code"}
            </button>

            {method === "otp" && otpSent && (
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false)
                  setOtp("")
                  setMessage("")
                  setError("")
                }}
                className="w-full text-sm font-semibold text-navy underline underline-offset-4"
              >
                Use a different phone number
              </button>
            )}
          </form>
        </>
      )}

      {error && signedInPhone && (
        <p role="alert" className="text-sm font-semibold text-destructive">
          {error}
        </p>
      )}

      <p className="text-center text-sm text-navy/70">
        Just browsing?{" "}
        <Link href="/homes" className="font-bold text-navy underline underline-offset-4">
          Browse homes
        </Link>
      </p>
    </div>
  )
}
