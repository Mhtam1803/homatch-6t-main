import { z } from "zod"
import { AiServiceError, toAiServiceError } from "@/lib/ai/errors"
import { GROQ_MODEL } from "@/lib/ai/groq"

const matchExplanationSchema = z.object({
  explanations: z.array(z.string().trim().min(12).max(180)).min(1).max(4),
})

export type MatchExplanation = z.infer<typeof matchExplanationSchema>

export async function generateGroqMatchExplanations(
  criteria: Record<string, unknown>,
  listing: Record<string, unknown>,
): Promise<MatchExplanation> {
  const key = process.env.GROQ_API_KEY
  if (!key) throw new AiServiceError("MISSING_CREDENTIAL", "GROQ_API_KEY is not configured.", 503)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12_000)
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: "Write 1 to 4 concise, meaningful rental-match explanations in English. Use only facts explicitly present in the supplied search criteria and listing data. Explain why each fact matters to this renter, not just the amenity name. Never invent commute times, availability, prices, or preferences. Return only the requested JSON.",
          },
          {
            role: "user",
            content: `Search criteria:\n${JSON.stringify(criteria)}\n\nListing facts:\n${JSON.stringify(listing)}`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "match_explanations",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                explanations: {
                  type: "array",
                  minItems: 1,
                  maxItems: 4,
                  items: { type: "string", minLength: 12, maxLength: 180 },
                },
              },
              required: ["explanations"],
            },
          },
        },
      }),
    })
    if (!response.ok) throw Object.assign(new Error(`Groq returned HTTP ${response.status}`), { status: response.status })
    const body = await response.json() as { choices?: Array<{ message?: { content?: string } }> }
    const content = body.choices?.[0]?.message?.content
    if (!content) throw new AiServiceError("INVALID_OUTPUT", "Groq returned no match explanations.", 502)
    return matchExplanationSchema.parse(JSON.parse(content))
  } catch (error) {
    if (error instanceof AiServiceError) throw error
    if (error instanceof z.ZodError || error instanceof SyntaxError) {
      throw new AiServiceError("INVALID_OUTPUT", "Groq returned invalid match explanations.", 502)
    }
    if (error instanceof Error && error.name === "AbortError") {
      throw new AiServiceError("TIMEOUT", "Groq match explanations timed out.", 504)
    }
    throw toAiServiceError(error)
  } finally {
    clearTimeout(timeout)
  }
}
