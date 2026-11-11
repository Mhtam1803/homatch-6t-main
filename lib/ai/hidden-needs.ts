import { z } from "zod"
import { AiServiceError, toAiServiceError } from "@/lib/ai/errors"
import { GROQ_MODEL } from "@/lib/ai/groq"

const hiddenNeedSchema = z.object({
  key: z.enum(["quietStudy", "workFromHome", "familySpace", "easyAccess"]),
  label: z.string().trim().min(8).max(100),
  reason: z.string().trim().min(12).max(180),
})

const hiddenNeedsResponseSchema = z.object({
  needs: z.array(hiddenNeedSchema).max(4),
})

export type AiHiddenNeeds = z.infer<typeof hiddenNeedsResponseSchema>["needs"]

export async function generateHiddenNeeds(prompt: string): Promise<AiHiddenNeeds> {
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
        temperature: 0,
        messages: [
          {
            role: "system",
            content:
              "Analyze the user's housing request in Vietnamese or English. Suggest only implicit housing needs clearly supported by the text. Do not invent preferences. Return at most four suggestions using only these keys: quietStudy, workFromHome, familySpace, easyAccess. Labels and reasons should be concise and meaningful in the user's language. These are suggestions for user confirmation, not confirmed requirements.",
          },
          { role: "user", content: prompt.trim().slice(0, 2_000) },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "hidden_rental_needs",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                needs: {
                  type: "array",
                  maxItems: 4,
                  items: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      key: { type: "string", enum: ["quietStudy", "workFromHome", "familySpace", "easyAccess"] },
                      label: { type: "string", minLength: 8, maxLength: 100 },
                      reason: { type: "string", minLength: 12, maxLength: 180 },
                    },
                    required: ["key", "label", "reason"],
                  },
                },
              },
              required: ["needs"],
            },
          },
        },
      }),
    })
    if (!response.ok) throw Object.assign(new Error(`Groq returned HTTP ${response.status}`), { status: response.status })
    const body = await response.json() as { choices?: Array<{ message?: { content?: string } }> }
    const content = body.choices?.[0]?.message?.content
    if (!content) throw new AiServiceError("INVALID_OUTPUT", "Groq returned no hidden-needs content.", 502)
    return hiddenNeedsResponseSchema.parse(JSON.parse(content)).needs
  } catch (error) {
    if (error instanceof AiServiceError) throw error
    if (error instanceof z.ZodError || error instanceof SyntaxError) {
      throw new AiServiceError("INVALID_OUTPUT", "Groq returned invalid hidden-needs JSON.", 502)
    }
    if (error instanceof Error && error.name === "AbortError") {
      throw new AiServiceError("TIMEOUT", "Groq hidden-needs analysis timed out.", 504)
    }
    throw toAiServiceError(error)
  } finally {
    clearTimeout(timeout)
  }
}
