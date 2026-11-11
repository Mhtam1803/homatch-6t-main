import { NextResponse } from "next/server"
import { parseGroqIntent } from "@/lib/ai/groq"
import { AiServiceError, toAiServiceError } from "@/lib/ai/errors"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json()
    if (!body || typeof body !== "object" || !("criteria" in body)) {
      return NextResponse.json({ error: "criteria is required", state: "error" }, { status: 400 })
    }
    const criteria = (body as { criteria: Record<string, unknown> }).criteria
    if (!criteria || typeof criteria.lifestyle !== "string" || criteria.lifestyle.length > 2_000) {
      return NextResponse.json({ error: "criteria is invalid", state: "error" }, { status: 400 })
    }
    return NextResponse.json({ intent: await parseGroqIntent(criteria), state: "parsed", model: "openai/gpt-oss-20b" })
  } catch (error) {
    const serviceError = error instanceof AiServiceError ? error : toAiServiceError(error)
    return NextResponse.json({ error: serviceError.message, code: serviceError.code, state: "degraded" }, { status: serviceError.status })
  }
}
