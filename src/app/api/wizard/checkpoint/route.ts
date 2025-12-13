/**
 * Wizard Checkpoint Endpoint
 *
 * Provides lightweight, real-time decision analysis as users progress through the wizard.
 * Loads WizardFacts from database, runs decision engine, and persists recommendations.
 *
 * Now compliant with ADR-001: loads WizardFacts from case_facts.facts via getOrCreateWizardFacts()
 * and persists recommended_route to cases table for preview/document generation.
 *
 * Audit item: B3 - Add lightweight decision endpoint for live flow checks
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server';
import { getOrCreateWizardFacts } from '@/lib/case-facts/store';
import { wizardFactsToCaseFacts } from '@/lib/case-facts/normalize';
import { runDecisionEngine } from '@/lib/decision-engine';
import type { DecisionInput } from '@/lib/decision-engine';
import { getLawProfile } from '@/lib/law-profile';

const checkpointSchema = z.object({
  case_id: z.string().uuid(),
  // Optional: can still accept direct facts for stateless usage (testing)
  facts: z.record(z.any()).optional(),
  jurisdiction: z.string().optional(),
  product: z.string().optional(),
  case_type: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = checkpointSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid request',
          missingFields: ['case_id'],
          reason: 'case_id is required and must be a valid UUID',
        },
        { status: 400 }
      );
    }

    const { case_id, facts: providedFacts, jurisdiction: providedJurisdiction, product: providedProduct, case_type: providedCaseType } = validation.data;

    const user = await getServerUser().catch(() => null);
    const supabase = await createServerSupabaseClient();

    // Load case from database
    let query = supabase.from('cases').select('*').eq('id', case_id);
    if (user) {
      query = query.eq('user_id', user.id);
    } else {
      query = query.is('user_id', null);
    }

    const { data: caseData, error: caseError } = await query.single();

    if (caseError || !caseData) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Case not found',
          reason: 'The specified case_id does not exist or you do not have access to it',
        },
        { status: 404 }
      );
    }

    const caseRow = caseData as {
      id: string;
      jurisdiction: string;
      case_type: string;
      user_id: string | null;
      wizard_progress: number | null;
    };

    // Use case data from DB, falling back to provided values
    const jurisdiction = caseRow.jurisdiction || providedJurisdiction;
    const case_type = caseRow.case_type || providedCaseType;
    const product = providedProduct || ((caseData as any).product) || (case_type === 'money_claim' ? 'money_claim' : case_type === 'tenancy_agreement' ? 'tenancy_agreement' : 'complete_pack');

    // Validate required fields
    if (!jurisdiction) {
      return NextResponse.json(
        {
          ok: false,
          error: 'jurisdiction is required',
          missingFields: ['jurisdiction'],
          reason: 'Cannot determine jurisdiction from case or request',
        },
        { status: 400 }
      );
    }

  if (!['england-wales', 'scotland', 'northern-ireland'].includes(jurisdiction)) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Invalid jurisdiction',
        missingFields: [],
        reason: `jurisdiction must be one of: england-wales, scotland, northern-ireland (got: ${jurisdiction})`,
      },
      { status: 400 }
    );
  }

  // Northern Ireland gating: only tenancy agreements are supported for V1
  if (
    jurisdiction === 'northern-ireland' &&
    case_type !== 'tenancy_agreement' &&
    product !== 'tenancy_agreement'
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: 'NI_EVICTION_MONEY_CLAIM_NOT_SUPPORTED',
        message:
          'Only tenancy agreements are available for Northern Ireland. Eviction and money claim workflows are not currently supported.',
        reason:
          'We currently support tenancy agreements for Northern Ireland. For England & Wales and Scotland, we support evictions (notices and court packs) and money claims. Northern Ireland eviction and money claim support is planned for Q2 2026.',
        supported: {
          'northern-ireland': ['tenancy_agreement'],
          'england-wales': ['notice_only', 'complete_pack', 'money_claim', 'tenancy_agreement'],
          scotland: ['notice_only', 'complete_pack', 'money_claim', 'tenancy_agreement'],
        },
      },
      { status: 400 }
    );
  }

  // Default to eviction if not specified
  const effectiveCaseType = case_type || 'eviction';
    const effectiveProduct = product || 'notice_only';

    // Early return for money claims (no decision engine needed for checkpoint)
    if (effectiveCaseType === 'money_claim') {
      return NextResponse.json({
        ok: true,
        status: 'ok',
        blocking_issues: [],
        warnings: [],
        summary: 'Money claim workflow - decision engine not applicable for checkpoint',
      });
    }

    // ADR-001 COMPLIANCE: Load WizardFacts from case_facts.facts (canonical source of truth)
    // Use providedFacts as fallback only for testing/stateless usage
    const wizardFacts = providedFacts || await getOrCreateWizardFacts(supabase, case_id);

    // Normalize WizardFacts to CaseFacts (domain model)
    // Missing fields will be null, which the decision engine handles gracefully
    const caseFacts = wizardFactsToCaseFacts(wizardFacts);

    // Run decision engine with partial data
    const decisionInput: DecisionInput = {
      jurisdiction: jurisdiction as 'england-wales' | 'scotland' | 'northern-ireland',
      product: effectiveProduct as 'notice_only' | 'complete_pack' | 'money_claim',
      case_type: effectiveCaseType as 'eviction' | 'money_claim' | 'tenancy_agreement',
      facts: caseFacts,
    };

    const decision = runDecisionEngine(decisionInput);

    // Get law profile for version tracking and legal metadata
    const law_profile = getLawProfile(jurisdiction, effectiveCaseType);

    // ROUTE INTENT PRIORITY LOGIC:
    // For notice_only product, explicit user route selection (eviction_route_intent) takes precedence
    // over decision engine "smart recommend". Complete pack can still use smart recommend.
    const userRouteIntent =
      (wizardFacts as any).eviction_route_intent ||
      (wizardFacts as any).eviction_route ||
      null;

    let finalRecommendedRoute: string | null = null;

    if (effectiveProduct === 'notice_only' && userRouteIntent) {
      // For notice_only: User intent wins
      if (Array.isArray(userRouteIntent)) {
        // User selected multiple routes - use first one (or prioritize section_8)
        const normalized = userRouteIntent.map((r) =>
          String(r).toLowerCase().includes('section_8') || String(r).toLowerCase().includes('section 8')
            ? 'section_8'
            : String(r).toLowerCase().includes('section_21') || String(r).toLowerCase().includes('section 21')
            ? 'section_21'
            : r
        );
        finalRecommendedRoute = normalized.includes('section_8')
          ? 'section_8'
          : normalized[0] || null;
      } else if (typeof userRouteIntent === 'string') {
        const lower = userRouteIntent.toLowerCase();
        if (lower.includes('section_8') || lower.includes('section 8')) {
          finalRecommendedRoute = 'section_8';
        } else if (lower.includes('section_21') || lower.includes('section 21')) {
          finalRecommendedRoute = 'section_21';
        } else {
          finalRecommendedRoute = userRouteIntent;
        }
      }
    } else {
      // For complete_pack or when no explicit user intent: Decision engine wins
      finalRecommendedRoute =
        decision.recommended_routes.length > 0 ? decision.recommended_routes[0] : null;
    }

    if (finalRecommendedRoute) {
      try {
        await supabase
          .from('cases')
          .update({
            recommended_route: finalRecommendedRoute,
          } as any)
          .eq('id', case_id);
      } catch (updateError) {
        console.error('Failed to persist recommended_route:', updateError);
        // Non-fatal - continue with response
      }
    }

    // Format response for wizard UI
    const response = {
      ok: true,
      status: 'ok',
      case_id,
      recommended_route: finalRecommendedRoute,
      allowed_routes: decision.allowed_routes, // ✅ NEW: Routes user CAN legally use
      blocked_routes: decision.blocked_routes, // ✅ NEW: Routes that are blocked
      route_explanations: decision.route_explanations, // ✅ NEW: Plain-English explanations
      blocking_issues: decision.blocking_issues.filter(b => b.severity === 'blocking'),
      warnings: [
        ...decision.warnings,
        ...decision.blocking_issues.filter(b => b.severity === 'warning').map(w => w.description),
      ],
      recommended_routes: decision.recommended_routes,
      recommended_grounds: decision.recommended_grounds.map(g => ({
        code: g.code,
        title: g.title,
        type: g.type,
        weight: g.weight,
        success_probability: g.success_probability,
      })),
      pre_action_requirements: decision.pre_action_requirements,
      summary: decision.analysis_summary,
      // Include minimal metadata for UI context
      jurisdiction,
      product: effectiveProduct,
      completeness_hint: getCompletenessHint(caseFacts, jurisdiction),
      // Legal change framework metadata
      law_profile,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Checkpoint error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to run checkpoint analysis',
        reason: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Provides a hint about what key information is still missing.
 * Helps the wizard UI prompt users for critical fields.
 */
function getCompletenessHint(
  facts: any,
  jurisdiction: string
): { missing_critical: string[]; completeness_percent: number } {
  const missing: string[] = [];
  let totalFields = 0;
  let providedFields = 0;

  const criticalFields = [
    { path: 'parties.landlord.name', label: 'Landlord name' },
    { path: 'parties.tenants', label: 'Tenant details' },
    { path: 'property.address_line1', label: 'Property address' }, // ✅ matches CaseFacts
    { path: 'tenancy.start_date', label: 'Tenancy start date' },
    { path: 'tenancy.rent_amount', label: 'Rent amount' },
  ];

  // Add jurisdiction-specific critical fields
  if (jurisdiction === 'england-wales') {
    criticalFields.push(
      { path: 'tenancy.deposit_protected', label: 'Deposit protection status' },
      { path: 'tenancy.deposit_amount', label: 'Deposit amount' }
    );
  }

  if (jurisdiction === 'scotland') {
    criticalFields.push(
      { path: 'issues.rent_arrears.pre_action_confirmed', label: 'Pre-action requirements (for arrears)' }
    );
  }

  for (const field of criticalFields) {
    totalFields++;
    const value = getNestedValue(facts, field.path);
    if (value === null || value === undefined || value === '') {
      missing.push(field.label);
    } else {
      providedFields++;
    }
  }

  const completeness_percent = totalFields > 0 ? Math.round((providedFields / totalFields) * 100) : 0;

  return {
    missing_critical: missing,
    completeness_percent,
  };
}

/**
 * Helper to safely access nested object properties
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}
