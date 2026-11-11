import { NextResponse } from "next/server"
import { generateHiddenNeeds } from "@/lib/ai/hidden-needs"
import { AiServiceError, toAiServiceError } from "@/lib/ai/errors"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json()
    if (!body || typeof body !== "object" || !("prompt" in body) || typeof body.prompt !== "string") {
      return NextResponse.json({ error: "prompt is required", state: "error" }, { status: 400 })
    }
    const prompt = body.prompt.trim()
    if (!prompt || prompt.length > 2_000) {
      return NextResponse.json({ error: "prompt is invalid", state: "error" }, { status: 400 })
    }
    return NextResponse.json({ needs: await generateHiddenNeeds(prompt), state: "generated", model: "openai/gpt-oss-20b" })
  } catch (error) {
    const serviceError = error instanceof AiServiceError ? error : toAiServiceError(error)
    return NextResponse.json({ error: serviceError.message, code: serviceError.code, state: "degraded" }, { status: serviceError.status })
  }
}
