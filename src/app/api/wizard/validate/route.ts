/**
 * Wizard Validation API
 *
 * POST /api/wizard/validate
 * Runs preview-stage validation against a case to surface blocking issues early.
 * Called during "Edit answers" flow after answer changes to provide immediate feedback.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { validateFlow, create422Response } from '@/lib/validation/validateFlow';
import { deriveCanonicalJurisdiction, normalizeJurisdiction } from '@/lib/types/jurisdiction';
import type { Product } from '@/lib/jurisdictions/capabilities/matrix';
import type { CaseRow } from '@/lib/supabase/database-types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const validateSchema = z.object({
  case_id: z.string().min(1),
  stage: z.enum(['wizard', 'preview', 'generate']).optional().default('preview'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedBody = validateSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsedBody.error.format() },
        { status: 400 },
      );
    }

    const { case_id, stage } = parsedBody.data;
    const supabase = await createServerSupabaseClient();

    // Load case data
    const { data: caseData, error: fetchError } = await supabase
      .from('cases')
      .select('*')
      .eq('id', case_id)
      .single();

    if (fetchError || !caseData) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 },
      );
    }

    // Type the case data properly
    const typedCaseData = caseData as CaseRow;
    const collectedFacts = (typedCaseData.collected_facts as Record<string, any>) || {};

    // Derive jurisdiction
    let canonicalJurisdiction =
      deriveCanonicalJurisdiction(typedCaseData.jurisdiction, collectedFacts) ||
      normalizeJurisdiction(typedCaseData.jurisdiction);

    if (!canonicalJurisdiction && typedCaseData.case_type === 'eviction') {
      canonicalJurisdiction = 'england';
    }

    if (!canonicalJurisdiction) {
      return NextResponse.json(
        {
          ok: false,
          code: 'INVALID_JURISDICTION',
          error: 'INVALID_JURISDICTION',
          user_message: 'Jurisdiction must be one of england, wales, scotland, or northern-ireland.',
          blocking_issues: [],
          warnings: [],
        },
        { status: 422 },
      );
    }

    // Derive product
    const metaProduct = collectedFacts?.__meta?.product as string | undefined;
    let product: Product;
    if (metaProduct) {
      product = metaProduct as Product;
    } else if (typedCaseData.case_type === 'money_claim') {
      product = 'money_claim';
    } else if (typedCaseData.case_type === 'tenancy_agreement') {
      product = 'tenancy_agreement';
    } else {
      // Default to notice_only for eviction flows
      product = 'notice_only';
    }

    // Derive route
    const selectedRoute =
      collectedFacts.selected_notice_route ||
      collectedFacts.route_recommendation?.recommended_route ||
      collectedFacts.selected_route ||
      (typedCaseData.case_type === 'eviction' ? 'section_8' : product);

    // Run validation at requested stage (defaults to preview)
    console.log(`[WIZARD/VALIDATE] Running ${stage}-stage validation for case ${case_id}`);

    const validationResult = validateFlow({
      jurisdiction: canonicalJurisdiction as any,
      product,
      route: selectedRoute,
      stage,
      facts: collectedFacts,
      caseId: case_id,
    });

    // Return validation results
    if (!validationResult.ok) {
      return NextResponse.json(
        {
          ok: false,
          ...create422Response(validationResult),
        },
        { status: 200 }, // Return 200 so client can read the response easily
      );
    }

    return NextResponse.json({
      ok: true,
      blocking_issues: [],
      warnings: validationResult.warnings.map(w => ({
        code: w.code,
        fields: w.fields,
        affected_question_id: w.affected_question_id,
        alternate_question_ids: w.alternate_question_ids,
        user_fix_hint: w.user_fix_hint,
      })),
    });
  } catch (error: any) {
    console.error('[WIZARD/VALIDATE] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
