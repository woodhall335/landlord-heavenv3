/**
 * Wizard Checkpoint Endpoint
 *
 * Provides lightweight, real-time decision analysis as users progress through the wizard.
 * Accepts partial WizardFacts and returns early warnings and blocking issues.
 *
 * Audit item: B3 - Add lightweight decision endpoint for live flow checks
 */

import { NextRequest, NextResponse } from 'next/server';
import { normalizeCaseFacts } from '@/lib/case-facts/normalize';
import { runDecisionEngine } from '@/lib/decision-engine';
import type { DecisionInput } from '@/lib/decision-engine';
import { getLawProfile } from '@/lib/law-profile';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { facts, jurisdiction, product, case_type } = body;

    // Validate required fields
    if (!jurisdiction) {
      return NextResponse.json(
        { error: 'jurisdiction is required' },
        { status: 400 }
      );
    }

  if (!['england-wales', 'scotland', 'northern-ireland'].includes(jurisdiction)) {
    return NextResponse.json(
      { error: 'Invalid jurisdiction' },
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
        error:
          'Only tenancy agreements are available for Northern Ireland. Eviction and money claim workflows are not currently supported.',
        message:
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

    // Early return for money claims (no decision engine needed)
    if (effectiveCaseType === 'money_claim') {
      return NextResponse.json({
        status: 'ok',
        blocking_issues: [],
        warnings: [],
        summary: 'Money claim workflow - decision engine not applicable',
      });
    }

    // Normalize partial WizardFacts to CaseFacts
    // Missing fields will be null, which the decision engine handles gracefully
    const caseFacts = normalizeCaseFacts(facts || {});

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

    // Format response for wizard UI
    const response = {
      status: 'ok',
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
        error: 'Failed to run checkpoint analysis',
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

  // Check critical fields for all jurisdictions
  const criticalFields = [
    { path: 'parties.landlord.name', label: 'Landlord name' },
    { path: 'parties.tenants', label: 'Tenant details' },
    { path: 'property.address.line1', label: 'Property address' },
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
