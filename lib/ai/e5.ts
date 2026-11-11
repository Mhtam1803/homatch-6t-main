export const E5_MODEL = "Xenova/multilingual-e5-small"
export const E5_MODEL_IDENTIFIER = "intfloat/multilingual-e5-small"
export const E5_DIMENSIONS = 384
export const E5_ARTIFACT_VERSION = "v1"

export function normalizeVector(values: number[]): number[] {
  const norm = Math.sqrt(values.reduce((sum, value) => sum + value * value, 0))
  return norm === 0 ? values.map(() => 0) : values.map((value) => value / norm)
}

export function cosineSimilarity(left: number[], right: number[]): number {
  if (left.length !== E5_DIMENSIONS || right.length !== E5_DIMENSIONS) {
    throw new Error(`E5 vectors must have ${E5_DIMENSIONS} dimensions.`)
  }
  return left.reduce((sum, value, index) => sum + value * right[index], 0)
}

export function semanticQueryText(intent: { semantic_preferences: string | null }, criteria: Record<string, unknown>) {
  const lifestyle = typeof criteria.lifestyle === "string" ? criteria.lifestyle.trim() : ""
  const destination = typeof criteria.destination === "string" ? criteria.destination.trim() : ""
  return [intent.semantic_preferences, lifestyle, destination].filter(Boolean).join(". ").trim()
}
