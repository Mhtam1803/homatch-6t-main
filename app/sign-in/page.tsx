import type { Metadata } from "next"
import { SignInCard } from "@/components/auth/sign-in-card"

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Homatch account to save favorite homes.",
}

export default function SignInPage() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-gradient-to-b from-sky/60 to-white px-4 py-16">
      <SignInCard />
    </main>
  )
}
