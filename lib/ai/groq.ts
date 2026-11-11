import { z } from "zod"
import { AiServiceError, toAiServiceError } from "@/lib/ai/errors"

export const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-20b"
export const INTENT_MAX_INPUT_LENGTH = 2_000

const nullableString = z.string().nullable()
const nullableNumber = z.number().finite().nullable()
const nullableBoolean = z.boolean().nullable()

export const rentalIntentSchema = z.object({
  location: nullableString,
  max_total_monthly_budget: nullableNumber,
  household_size: nullableNumber,
  bedrooms_min: nullableNumber,
  area_min_m2: nullableNumber,
  property_type: nullableString,
  furnishing: nullableString,
  pet_friendly: nullableBoolean,
  balcony: nullableBoolean,
  quiet_environment: nullableBoolean,
  elevator: nullableBoolean,
  parking: nullableBoolean,
  near_school: nullableBoolean,
  near_workplace: nullableBoolean,
  lifestyle_needs: z.array(z.string()),
  semantic_preferences: nullableString,
  required_constraints: z.array(z.string()),
  optional_preferences: z.array(z.string()),
})

export type RentalIntent = z.infer<typeof rentalIntentSchema>

function getGroqKey() {
  if (!process.env.GROQ_API_KEY) {
    throw new AiServiceError("MISSING_CREDENTIAL", "GROQ_API_KEY is not configured.", 503)
  }
  return process.env.GROQ_API_KEY
}

function safeSearchContext(criteria: Record<string, unknown>) {
  return {
    destination: typeof criteria.destination === "string" ? criteria.destination.slice(0, 200) : "",
    budget: typeof criteria.budget === "number" ? criteria.budget : null,
    bedroom: typeof criteria.bedroom === "string" ? criteria.bedroom : null,
    features: Array.isArray(criteria.features) ? criteria.features.filter((item): item is string => typeof item === "string") : [],
    propertyTypes: Array.isArray(criteria.propertyTypes) ? criteria.propertyTypes.filter((item): item is string => typeof item === "string") : [],
    furnishing: typeof criteria.furnishing === "string" ? criteria.furnishing : null,
    transport: Array.isArray(criteria.transport) ? criteria.transport.filter((item): item is string => typeof item === "string") : [],
    chips: Array.isArray(criteria.chips) ? criteria.chips.filter((item): item is string => typeof item === "string") : [],
    household: criteria.personalDetails && typeof criteria.personalDetails === "object"
      ? (() => {
          const details = criteria.personalDetails as Record<string, unknown>
          return {
            adults: typeof details.adults === "number" ? details.adults : null,
            children: typeof details.children === "number" ? details.children : null,
            infants: typeof details.infants === "number" ? details.infants : null,
            occupation: typeof details.occupation === "string" ? details.occupation.slice(0, 100) : "",
            workplaceType: typeof details.workplaceType === "string" ? details.workplaceType : null,
          }
        })()
      : null,
  }
}

const intentJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    location: { type: ["string", "null"] },
    max_total_monthly_budget: { type: ["number", "null"] },
    household_size: { type: ["number", "null"] },
    bedrooms_min: { type: ["number", "null"] },
    area_min_m2: { type: ["number", "null"] },
    property_type: { type: ["string", "null"] },
    furnishing: { type: ["string", "null"] },
    pet_friendly: { type: ["boolean", "null"] },
    balcony: { type: ["boolean", "null"] },
    quiet_environment: { type: ["boolean", "null"] },
    elevator: { type: ["boolean", "null"] },
    parking: { type: ["boolean", "null"] },
    near_school: { type: ["boolean", "null"] },
    near_workplace: { type: ["boolean", "null"] },
    lifestyle_needs: { type: "array", items: { type: "string" } },
    semantic_preferences: { type: ["string", "null"] },
    required_constraints: { type: "array", items: { type: "string" } },
    optional_preferences: { type: "array", items: { type: "string" } },
  },
  required: [
    "location",
    "max_total_monthly_budget",
    "household_size",
    "bedrooms_min",
    "area_min_m2",
    "property_type",
    "furnishing",
    "pet_friendly",
    "balcony",
    "quiet_environment",
    "elevator",
    "parking",
    "near_school",
    "near_workplace",
    "lifestyle_needs",
    "semantic_preferences",
    "required_constraints",
    "optional_preferences",
  ],
} as const

export async function parseGroqIntent(criteria: Record<string, unknown>): Promise<RentalIntent> {
  const lifestyle = typeof criteria.lifestyle === "string" ? criteria.lifestyle.trim().slice(0, INTENT_MAX_INPUT_LENGTH) : ""
  const context = JSON.stringify(safeSearchContext(criteria))
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 12_000)
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getGroqKey()}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: GROQ_MODEL,
          temperature: 0,
          messages: [
            {
              role: "system",
              content: "Extract only explicitly stated rental requirements and preferences. Support Vietnamese and English. Unknown values must be null; never infer or invent. Structured form values are authoritative. Do not output contact information.",
            },
            {
              role: "user",
              content: `Structured search fields:\n${context}\n\nLifestyle request:\n${lifestyle || "(empty)"}`,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "rental_intent",
              strict: true,
              schema: intentJsonSchema,
            },
          },
        }),
      })
      if (response.ok) {
        const body = await response.json() as { choices?: Array<{ message?: { content?: string } }> }
        const content = body.choices?.[0]?.message?.content
        if (!content) throw new AiServiceError("INVALID_OUTPUT", "Groq returned no intent content.", 502)
        return rentalIntentSchema.parse(JSON.parse(content))
      }
      if (response.status === 429 && attempt === 0) {
        const retryAfter = Number(response.headers.get("retry-after"))
        const delayMs = Number.isFinite(retryAfter) ? Math.min(10_000, Math.max(1_000, retryAfter * 1_000)) : 2_000
        await new Promise((resolve) => setTimeout(resolve, delayMs))
        continue
      }
      const error = new Error(`Groq returned HTTP ${response.status}`)
      throw Object.assign(error, { status: response.status })
    } catch (error) {
      if (error instanceof AiServiceError) throw error
      if (error instanceof z.ZodError || error instanceof SyntaxError) {
        throw new AiServiceError("INVALID_OUTPUT", "Groq returned invalid rental intent JSON.", 502)
      }
      if (error instanceof Error && error.name === "AbortError") {
        throw new AiServiceError("TIMEOUT", "Groq intent parsing timed out.", 504)
      }
      throw toAiServiceError(error)
    } finally {
      clearTimeout(timeout)
    }
  }
  throw new AiServiceError("RATE_LIMITED", "The Groq rate limit was reached after one bounded retry.", 429)
}
