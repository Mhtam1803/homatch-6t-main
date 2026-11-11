import { NextResponse } from "next/server"
import { getListings } from "@/data/listings"
import { loadE5Artifact } from "@/lib/ai/artifact"
import { filterHardConstraints, rankHybrid } from "@/lib/ai/hybrid"
import { rentalIntentSchema } from "@/lib/ai/groq"
import { AiServiceError, toAiServiceError } from "@/lib/ai/errors"
import { estimateCommutes } from "@/lib/ai/commute"
import { resolveDestination, validateDestinationCandidate, type DestinationCandidate } from "@/lib/ai/geocode"
import type { SearchCriteria } from "@/types/listing"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const body = await request.json() as { criteria?: SearchCriteria; intent?: unknown; queryVector?: unknown }
    const intent = rentalIntentSchema.parse(body.intent)
    if (!body.criteria || !Array.isArray(body.queryVector) || body.queryVector.length !== 384) {
      return NextResponse.json({ error: "criteria and a 384-dimensional E5 queryVector are required." }, { status: 400 })
    }
    const queryVector = body.queryVector.map(Number)
    if (queryVector.some((value) => !Number.isFinite(value))) {
      return NextResponse.json({ error: "queryVector contains invalid values." }, { status: 400 })
    }
    const listings = getListings()
    const selectedDestination = validateDestinationCandidate((body as { selectedDestination?: unknown }).selectedDestination)
    const destinationResult = selectedDestination
      ? { status: "resolved" as const, destination: selectedDestination, candidates: [selectedDestination] }
      : await resolveDestination(body.criteria.destination)
    if (destinationResult.status === "ambiguous") {
      return NextResponse.json({
        state: "destination_ambiguous",
        destination: body.criteria.destination,
        candidates: destinationResult.candidates,
      }, { status: 409 })
    }
    const eligibleListings = filterHardConstraints(listings, intent, body.criteria)
    const commuteResult = await estimateCommutes(eligibleListings, destinationResult.destination as DestinationCandidate | null)
    const ranked = rankHybrid(listings, loadE5Artifact(), queryVector, intent, body.criteria, commuteResult.estimates)
    return NextResponse.json({
      state: "results",
      hardConstraintCount: ranked.hardConstraintCount,
      commute: {
        status: commuteResult.status,
        destination: destinationResult.destination?.label ?? null,
        reason: commuteResult.reason ?? null,
      },
      results: ranked.results.map(({ listing, ...result }) => ({ id: listing.id, ...result })),
    })
  } catch (error) {
    const serviceError = error instanceof AiServiceError ? error : toAiServiceError(error)
    return NextResponse.json({ error: serviceError.message, code: serviceError.code, state: "degraded" }, { status: serviceError.status })
  }
}
