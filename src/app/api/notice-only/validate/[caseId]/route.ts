/**
 * Notice Only Validation API
 *
 * GET /api/notice-only/validate/[caseId]
 *
 * Lightweight validation endpoint for Notice Only cases.
 * Used by the preview page to check for blocking issues WITHOUT generating documents.
 * This avoids the "Route section_21 is not available for wales/notice_only" error
 * that occurs when calling /api/documents/generate for Wales routes.
 *
 * Returns:
 * - 200 OK if validation passes (case is ready for checkout)
 * - 422 with blocking_issues if validation fails
 * - 404 if case not found
 */

import { NextResponse } from 'next/server';
import { createAdminClient, createServerSupabaseClient, tryGetServerUser } from '@/lib/supabase/server';
import { validateForPreview } from '@/lib/validation/previewValidation';
import { validateNoticeOnlyCase } from '@/lib/validation/notice-only-case-validator';
import { normalizeSection8Facts } from '@/lib/wizard/normalizeSection8Facts';
import { deriveCanonicalJurisdiction, type CanonicalJurisdiction } from '@/lib/types/jurisdiction';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const resolvedParams = await params;
    const caseId = resolvedParams.caseId;

    if (!caseId) {
      return NextResponse.json({ error: 'Case ID required' }, { status: 400 });
    }

    console.log('[NOTICE-VALIDATE-API] Validating case:', caseId);

    const user = await tryGetServerUser();
    const supabase = user ? await createServerSupabaseClient() : createAdminClient();

    let query = supabase.from('cases').select('*').eq('id', caseId);
    if (user) {
      query = query.eq('user_id', user.id);
    }

    const { data, error: fetchError } = await query.single();

    if (fetchError || !data) {
      console.error('[NOTICE-VALIDATE-API] Case not found:', fetchError);
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const caseRow = data as any;
    const wizardFacts = caseRow.wizard_facts || caseRow.collected_facts || caseRow.facts || {};

    // Normalize Section 8 facts
    normalizeSection8Facts(wizardFacts);

    // Determine jurisdiction
    const jurisdiction = deriveCanonicalJurisdiction(caseRow.jurisdiction, wizardFacts) as CanonicalJurisdiction;

    if (!jurisdiction) {
      return NextResponse.json(
        {
          code: 'INVALID_JURISDICTION',
          error: 'Invalid or missing jurisdiction',
          blocking_issues: [{
            code: 'INVALID_JURISDICTION',
            description: 'A supported jurisdiction is required.',
          }],
          warnings: [],
        },
        { status: 422 }
      );
    }

    if (jurisdiction === 'northern-ireland') {
      return NextResponse.json(
        {
          code: 'NI_NOTICE_PREVIEW_UNSUPPORTED',
          error: 'Eviction notices are not supported in Northern Ireland',
          blocking_issues: [{
            code: 'NI_NOT_SUPPORTED',
            description: 'Eviction notices are not supported in Northern Ireland. Tenancy agreements remain available.',
          }],
          warnings: [],
        },
        { status: 422 }
      );
    }

    // Determine selected route with jurisdiction-aware fallback
    let selectedRoute =
      wizardFacts.selected_notice_route ||
      wizardFacts.eviction_route ||
      wizardFacts.eviction_route_intent ||
      wizardFacts.route_recommendation?.recommended_route;

    // Normalize Wales routes
    if (jurisdiction === 'wales' && selectedRoute) {
      if (selectedRoute === 'section_173' || selectedRoute === 'fault_based') {
        selectedRoute = `wales_${selectedRoute}`;
      }
    }

    // Wales route salvage
    if (jurisdiction === 'wales') {
      const isEnglandRoute = selectedRoute === 'section_21' || selectedRoute === 'section_8';
      const isUnknownRoute = !selectedRoute || (
        selectedRoute !== 'wales_section_173' &&
        selectedRoute !== 'wales_fault_based'
      );

      if (isEnglandRoute || isUnknownRoute) {
        const hasFaultGrounds = Array.isArray(wizardFacts.wales_fault_grounds) &&
          wizardFacts.wales_fault_grounds.length > 0;
        selectedRoute = hasFaultGrounds ? 'wales_fault_based' : 'wales_section_173';
        console.log('[NOTICE-VALIDATE-API] Wales route salvage:', { resolved: selectedRoute });
      }
    }

    // Default route if none specified
    if (!selectedRoute) {
      if (jurisdiction === 'scotland') {
        selectedRoute = 'notice_to_leave';
      } else if (jurisdiction === 'wales') {
        selectedRoute = 'wales_section_173';
      } else {
        selectedRoute = 'section_8';
      }
    }

    console.log('[NOTICE-VALIDATE-API] Validating:', { jurisdiction, route: selectedRoute });

    // Run unified validation
    const validationError = validateForPreview({
      jurisdiction,
      product: 'notice_only',
      route: selectedRoute,
      facts: wizardFacts,
      caseId,
    });

    if (validationError) {
      const errorBody = await validationError.json();
      console.warn('[NOTICE-VALIDATE-API] Validation blocked:', {
        caseId,
        code: errorBody.code,
      });
      return NextResponse.json(errorBody, { status: 422 });
    }

    // Run notice-only specific validation
    if (selectedRoute === 'section_8') {
      const noticeValidation = validateNoticeOnlyCase(wizardFacts);

      if (!noticeValidation.valid) {
        const primaryError = noticeValidation.errors[0];
        return NextResponse.json(
          {
            code: primaryError?.code || 'NOTICE_ONLY_VALIDATION_FAILED',
            error: primaryError?.message || 'Notice-only case validation failed',
            blocking_issues: noticeValidation.errors.map(e => ({
              code: e.code,
              description: e.message,
            })),
            warnings: noticeValidation.warnings.map(w => ({
              code: w.code,
              description: w.message,
            })),
          },
          { status: 422 }
        );
      }
    }

    console.log('[NOTICE-VALIDATE-API] Validation passed:', { caseId, jurisdiction, route: selectedRoute });

    return NextResponse.json({
      ok: true,
      caseId,
      jurisdiction,
      route: selectedRoute,
      product: 'notice_only',
    });
  } catch (err: any) {
    console.error('[NOTICE-VALIDATE-API] Error:', err);
    return NextResponse.json(
      {
        error: true,
        message: err?.message || 'Validation failed',
      },
      { status: 500 }
    );
  }
}
