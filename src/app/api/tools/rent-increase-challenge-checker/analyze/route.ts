import { NextResponse } from 'next/server';
import { z } from 'zod';

import { createAdminClient } from '@/lib/supabase/server';
import {
  buildRentCheckerResult,
  scrapeLiveComparables,
  type RentCheckerInput,
} from '@/lib/section13';

export const runtime = 'nodejs';

const payloadSchema = z.object({
  sessionId: z.string().optional().nullable(),
  userType: z.literal('landlord'),
  postcode: z.string().min(3),
  bedrooms: z.number().int().min(0).max(20),
  propertyType: z.enum(['flat', 'house', 'room', 'hmo', 'other']),
  furnishedStatus: z.enum(['unfurnished', 'part_furnished', 'furnished']),
  currentRent: z.number().positive(),
  rentFrequency: z.enum(['weekly', 'fortnightly', '4-weekly', 'monthly']),
  proposedRent: z.number().positive().nullable().optional(),
  tenancyStartDate: z.string().min(10),
  lastRentIncreaseDate: z.string().nullable().optional(),
  desiredIncreaseStartDate: z.string().nullable().optional(),
  propertyCondition: z.enum(['below_average', 'average', 'good', 'excellent']),
  billsIncluded: z.boolean(),
  comparableEvidenceAvailable: z.enum(['yes', 'no', 'not_sure']),
  tenantAlreadyObjected: z.boolean(),
});

async function persistResult(input: RentCheckerInput, result: ReturnType<typeof buildRentCheckerResult>) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('rent_checker_results' as any)
      .insert({
        session_id: result.sessionId,
        user_type: input.userType,
        postcode_outcode: result.postcodeOutcode,
        bedrooms: input.bedrooms,
        current_rent: result.currentRent,
        proposed_rent: result.proposedRent,
        market_low: result.marketLow,
        market_median: result.marketMedian,
        market_high: result.marketHigh,
        comparable_count: result.comparableCount,
        source_backed_count: result.sourceBackedCount,
        fresh_comparable_count: result.freshComparableCount,
        evidence_strength: result.evidenceStrength.toLowerCase(),
        challenge_risk: result.challengeRisk,
        recommended_product: result.recommendedProduct,
        result_state: result.resultState,
        raw_input: input,
        raw_result: result,
      })
      .select('id')
      .single();

    if (error) {
      console.error('[rent-checker/analyze] Failed to persist result', error);
      return null;
    }

    return (data as { id?: string } | null)?.id ?? null;
  } catch (error) {
    console.warn('[rent-checker/analyze] Persistence unavailable', error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = payloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const input = parsed.data;
    if (input.proposedRent == null) {
      return NextResponse.json(
        { error: 'Landlords must enter the proposed rent to calculate supportability.' },
        { status: 400 }
      );
    }

    const scrape = await scrapeLiveComparables(input.postcode, input.bedrooms);
    if (!scrape.success) {
      return NextResponse.json(
        {
          error: scrape.summary,
          sourceStatuses: scrape.sourceStatuses,
          code: scrape.reason,
        },
        { status: 422 }
      );
    }

    const result = buildRentCheckerResult({
      input,
      comparables: scrape.comparables,
      scrapeSource: scrape.source,
      scrapeSummary: scrape.summary,
    });

    const resultId = await persistResult(input, result);

    return NextResponse.json({
      success: true,
      result: {
        ...result,
        resultId,
      },
    });
  } catch (error: any) {
    console.error('[rent-checker/analyze] error', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to analyse rent position' },
      { status: 500 }
    );
  }
}
