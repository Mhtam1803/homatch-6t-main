"use client"

import { pipeline } from "@huggingface/transformers"
import { E5_DIMENSIONS, E5_MODEL, normalizeVector } from "@/lib/ai/e5"

type Extractor = (text: string, options: { pooling: "mean"; normalize: true }) => Promise<{ data: ArrayLike<number>; dims?: number[] }>

let extractorPromise: Promise<Extractor> | null = null

async function getExtractor(): Promise<Extractor> {
  if (!extractorPromise) {
    extractorPromise = pipeline("feature-extraction", E5_MODEL, {
      dtype: "q8",
    }) as unknown as Promise<Extractor>
  }
  return extractorPromise
}

export async function embedBrowserQuery(query: string): Promise<number[]> {
  const extractor = await getExtractor()
  const output = await extractor(`query: ${query}`, { pooling: "mean", normalize: true })
  const values = Array.from(output.data)
  if (values.length !== E5_DIMENSIONS) throw new Error(`Browser E5 returned ${values.length} dimensions.`)
  return normalizeVector(values)
}

export function browserE5ModelName() {
  return E5_MODEL
}
