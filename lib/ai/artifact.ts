import fs from "node:fs"
import path from "node:path"
import { AiServiceError } from "@/lib/ai/errors"
import { E5_ARTIFACT_VERSION, E5_DIMENSIONS, E5_MODEL_IDENTIFIER } from "@/lib/ai/e5"
import type { VectorListing } from "@/lib/ai/hybrid"

const artifactPath = path.join(process.cwd(), "data", "embeddings", "listings-multilingual-e5-small-384.json")

export function loadE5Artifact(): VectorListing[] {
  if (!fs.existsSync(artifactPath)) {
    throw new AiServiceError("MISSING_ARTIFACT", "E5 listing vectors are unavailable. Generate the offline artifact first.", 503)
  }
  let artifact: { version?: string; model?: string; dimensions?: number; embeddings?: VectorListing[] }
  try {
    artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"))
  } catch {
    throw new AiServiceError("INCOMPATIBLE_ARTIFACT", "E5 vector artifact is invalid JSON.", 500)
  }
  if (artifact.version !== E5_ARTIFACT_VERSION || artifact.model !== E5_MODEL_IDENTIFIER || artifact.dimensions !== E5_DIMENSIONS || !Array.isArray(artifact.embeddings)) {
    throw new AiServiceError("INCOMPATIBLE_ARTIFACT", "E5 vector artifact metadata is incompatible.", 500)
  }
  if (artifact.embeddings.length !== 100 || new Set(artifact.embeddings.map((item) => item.id)).size !== 100) {
    throw new AiServiceError("INCOMPATIBLE_ARTIFACT", "E5 vector artifact must contain 100 unique listings.", 500)
  }
  if (artifact.embeddings.some((item) => !/^HCM_\d{3}$/.test(item.id) || item.vector.length !== E5_DIMENSIONS)) {
    throw new AiServiceError("INCOMPATIBLE_ARTIFACT", "E5 vector artifact contains invalid IDs or dimensions.", 500)
  }
  return artifact.embeddings
}
