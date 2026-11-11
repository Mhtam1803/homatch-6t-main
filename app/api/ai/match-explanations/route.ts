import { NextResponse } from "next/server"
import { generateGroqMatchExplanations } from "@/lib/ai/match-explanations"
import { AiServiceError, toAiServiceError } from "@/lib/ai/errors"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json()
    if (
      !body ||
      typeof body !== "object" ||
      !("criteria" in body) ||
      !("listing" in body) ||
      !body.criteria ||
      !body.listing ||
      typeof body.criteria !== "object" ||
      typeof body.listing !== "object"
    ) {
      return NextResponse.json({ error: "criteria and listing are required", state: "error" }, { status: 400 })
    }

    const result = await generateGroqMatchExplanations(
      body.criteria as Record<string, unknown>,
      body.listing as Record<string, unknown>,
    )
    return NextResponse.json({ ...result, state: "generated", model: "openai/gpt-oss-20b" })
  } catch (error) {
    const serviceError = error instanceof AiServiceError ? error : toAiServiceError(error)
    return NextResponse.json({ error: serviceError.message, code: serviceError.code, state: "degraded" }, { status: serviceError.status })
  }
}
