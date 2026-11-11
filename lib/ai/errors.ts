export type AiErrorCode =
  | "MISSING_CREDENTIAL"
  | "INVALID_CREDENTIAL"
  | "RATE_LIMITED"
  | "TIMEOUT"
  | "API_ERROR"
  | "INVALID_OUTPUT"
  | "MISSING_ARTIFACT"
  | "INCOMPATIBLE_ARTIFACT"
  | "INVALID_REQUEST"

export class AiServiceError extends Error {
  constructor(
    public readonly code: AiErrorCode,
    message: string,
    public readonly status = 503,
  ) {
    super(message)
    this.name = "AiServiceError"
  }
}

export function toAiServiceError(error: unknown): AiServiceError {
  if (error instanceof AiServiceError) return error

  const message = error instanceof Error ? error.message : "The AI service request failed."
  const status = typeof error === "object" && error !== null && "status" in error
    ? Number((error as { status?: unknown }).status)
    : undefined
  if (status === 429) return new AiServiceError("RATE_LIMITED", "The Groq rate limit was reached.", 429)
  if (status === 401 || status === 403) return new AiServiceError("INVALID_CREDENTIAL", "The Groq credential was rejected.", 502)
  const normalized = message.toLowerCase()
  if (normalized.includes("429") || normalized.includes("rate")) {
    return new AiServiceError("RATE_LIMITED", "The Groq rate limit was reached.", 429)
  }
  if (normalized.includes("401") || normalized.includes("403") || normalized.includes("api key")) {
    return new AiServiceError("INVALID_CREDENTIAL", "The Gemini credential was rejected.", 502)
  }
  if (normalized.includes("timeout") || normalized.includes("timed out") || normalized.includes("abort")) {
    return new AiServiceError("TIMEOUT", "The Groq request timed out.", 504)
  }
  return new AiServiceError("API_ERROR", "The Groq request failed.", 502)
}
