/**
 * Wizard API - Save Facts
 *
 * POST /api/wizard/save-facts
 * Persists wizard facts to both:
 * - case_facts.facts (source of truth)
 * - cases.collected_facts (mirrored copy)
 */

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient, logSupabaseAdminDiagnostics } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';
import { logMutation, getChangedKeys } from '@/lib/auth/audit-log';
import { checkMutationAllowed } from '@/lib/payments/edit-window-enforcement';
import { getCasePaymentStatus } from '@/lib/payments/entitlement';
import {
  getTenancyTierLabelForSku,
  getTenancyTierQuestionId,
  inferTenancySkuFromFacts,
  type TenancyJurisdiction,
} from '@/lib/tenancy/product-tier';

export const runtime = 'nodejs';

/**
 * Deep merge helper for wizard facts.
 * - Deep merges nested plain objects (eg issues, tenancy, parties, compliance)
 * - Arrays are treated as 'replace' (new array overwrites old, no element-wise merge)
 * - Null/undefined in source overwrites target value
 * - Primitives are replaced directly
 */
function deepMergeFacts(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = { ...target };

  for (const key of Object.keys(source)) {
    const sourceValue = source[key];
    const targetValue = result[key];

    // If source value is null or undefined, use it directly (explicit clear)
    if (sourceValue === null || sourceValue === undefined) {
      result[key] = sourceValue;
      continue;
    }

    // If source is an array, replace entirely (no element-wise merge)
    if (Array.isArray(sourceValue)) {
      result[key] = sourceValue;
      continue;
    }

    // If source is a plain object and target is also a plain object, deep merge
    if (
      typeof sourceValue === 'object' &&
      sourceValue !== null &&
      !Array.isArray(sourceValue) &&
      typeof targetValue === 'object' &&
      targetValue !== null &&
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMergeFacts(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>
      );
      continue;
    }

    // Otherwise, replace with source value
    result[key] = sourceValue;
  }

  return result;
}

export async function POST(request: NextRequest) {
  try {
    logSupabaseAdminDiagnostics({ route: '/api/wizard/save-facts', writesUsingAdmin: true });
    const body = await request.json();
    const { case_id, facts } = body;

    if (!case_id) {
      return NextResponse.json(
        { error: 'case_id is required' },
        { status: 400 }
      );
    }

    if (!facts || typeof facts !== 'object') {
      return NextResponse.json(
        { error: 'facts must be an object' },
        { status: 400 }
      );
    }

    // Check edit window - block if case has paid order with expired window
    const mutationCheck = await checkMutationAllowed(case_id);
    if (!mutationCheck.allowed) {
      return mutationCheck.errorResponse;
    }

    const supabase = await createServerSupabaseClient();

    // Admin client bypasses RLS - used for creating cases/case_facts for anonymous users
    const adminSupabase = createSupabaseAdminClient();

    // Try to get the user (but don't require auth for wizard saves)
    const { data: { user } } = await supabase.auth.getUser();

    // First, check if the case exists using admin client to support anonymous users
    const { data: existingCase, error: fetchError } = await adminSupabase
      .from('cases')
      .select('id, user_id, collected_facts')
      .eq('id', case_id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error fetching case:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch case' },
        { status: 500 }
      );
    }

    const paymentStatus = await getCasePaymentStatus(case_id);
    const entitlementProducts = paymentStatus.paidProducts;
    const lockedTenancySku = entitlementProducts.includes('ast_premium')
      ? 'ast_premium'
      : entitlementProducts.includes('ast_standard')
      ? 'ast_standard'
      : null;
    const purchasedProduct =
      paymentStatus.latestOrder?.product_type || lockedTenancySku || null;

    if (lockedTenancySku) {
      const requestedSku = inferTenancySkuFromFacts(facts);
      if (requestedSku && requestedSku !== lockedTenancySku) {
        const isUpgradeAttempt =
          requestedSku === 'ast_premium' && !entitlementProducts.includes('ast_premium');
        return NextResponse.json(
          {
            code: isUpgradeAttempt ? 'UPGRADE_REQUIRED' : 'PRODUCT_LOCKED',
            error: isUpgradeAttempt ? 'UPGRADE_REQUIRED' : 'PRODUCT_LOCKED',
            message: isUpgradeAttempt
              ? 'Upgrade required to access Premium tenancy agreement features.'
              : 'This case is locked to the purchased product.',
            purchased_product: purchasedProduct,
            requested_product: requestedSku,
            entitlements: entitlementProducts,
          },
          { status: isUpgradeAttempt ? 402 : 409 },
        );
      }
    }

    // Deep merge the new facts with existing facts
    // Uses deepMergeFacts to properly merge nested objects while treating arrays as replace
    const existingFacts = (existingCase?.collected_facts || {}) as Record<string, unknown>;
    const mergedFacts = deepMergeFacts(existingFacts, facts as Record<string, unknown>);

    if (lockedTenancySku && existingCase?.jurisdiction) {
      const jurisdiction = existingCase.jurisdiction as TenancyJurisdiction;
      const tierLabel = getTenancyTierLabelForSku(lockedTenancySku, jurisdiction);
      mergedFacts.product_tier = tierLabel;
      mergedFacts[getTenancyTierQuestionId(jurisdiction)] = tierLabel;
    }

    // Ensure __meta is always properly merged with required fields
    mergedFacts.__meta = {
      ...((existingFacts.__meta || {}) as Record<string, unknown>),
      ...((facts.__meta || {}) as Record<string, unknown>),
      case_id,
      updated_at: new Date().toISOString(),
      ...(paymentStatus.hasPaidOrder
        ? {
            purchased_product: purchasedProduct,
            entitlements: entitlementProducts,
          }
        : {}),
    };

    const timestamp = new Date().toISOString();

    if (existingCase) {
      // Update existing case - write to BOTH tables for consistency
      // 1. Update case_facts.facts (source of truth)
      // Use admin client to bypass RLS for anonymous users
      const { data: existingCaseFacts } = await adminSupabase
        .from('case_facts')
        .select('version')
        .eq('case_id', case_id)
        .maybeSingle();

      if (existingCaseFacts) {
        // Update existing case_facts row
        // Use admin client to bypass RLS for anonymous users
        const { error: caseFactsError } = await adminSupabase
          .from('case_facts')
          .update({
            facts: mergedFacts,
            version: (existingCaseFacts.version ?? 0) + 1,
            updated_at: timestamp,
          })
          .eq('case_id', case_id);

        if (caseFactsError) {
          console.error('Error updating case_facts:', caseFactsError);
          // Continue anyway - collected_facts is still useful
        }
      } else {
        // Create case_facts row if it doesn't exist
        // Use admin client to bypass RLS for anonymous users
        const { error: insertCaseFactsError } = await adminSupabase
          .from('case_facts')
          .insert({
            case_id,
            facts: mergedFacts,
            version: 1,
          });

        if (insertCaseFactsError) {
          console.error('Error creating case_facts:', insertCaseFactsError);
          // Continue anyway - collected_facts is still useful
        }
      }

      // 2. Update cases.collected_facts (mirrored copy)
      // Use admin client to bypass RLS for anonymous users
      const { error: updateError } = await adminSupabase
        .from('cases')
        .update({
          collected_facts: mergedFacts,
          updated_at: timestamp,
        })
        .eq('id', case_id);

      if (updateError) {
        console.error('Error updating case facts:', updateError);
        return NextResponse.json(
          { error: 'Failed to save facts' },
          { status: 500 }
        );
      }

      // Audit log for paid cases (non-blocking)
      const changedKeys = getChangedKeys(existingFacts, facts);
      if (changedKeys.length > 0) {
        logMutation({
          caseId: case_id,
          userId: user?.id || null,
          action: 'case_facts_update',
          changedKeys,
          metadata: { source: 'save-facts', fieldsUpdated: changedKeys.length },
        }).catch(() => {}); // Fire and forget
      }

      return NextResponse.json({
        success: true,
        message: 'Facts saved successfully',
      });
    } else {
      // Case doesn't exist - need to create it
      // Extract metadata from facts to set up the case
      const meta = facts?.__meta || {};
      const jurisdiction = meta.jurisdiction || 'england';
      const caseType = meta.case_type || 'money_claim';

      // Allow anonymous case creation (user_id can be null for "try before you buy")
      // Use admin client to bypass RLS for anonymous users
      const { error: insertError } = await adminSupabase
        .from('cases')
        .insert({
          id: case_id,
          user_id: user?.id || null, // Allow null for anonymous users
          case_type: caseType,
          jurisdiction: jurisdiction,
          collected_facts: mergedFacts,
          status: 'in_progress',
        });

      if (insertError) {
        console.error('Error creating case:', insertError);
        return NextResponse.json(
          { error: 'Failed to create case' },
          { status: 500 }
        );
      }

      // Also create case_facts row (source of truth)
      // Use admin client to bypass RLS for anonymous users
      const { error: insertCaseFactsError } = await adminSupabase
        .from('case_facts')
        .insert({
          case_id,
          facts: mergedFacts,
          version: 1,
        });

      if (insertCaseFactsError) {
        console.error('Error creating case_facts:', insertCaseFactsError);
        // Continue anyway - case was created successfully
      }

      return NextResponse.json({
        success: true,
        message: 'Case created and facts saved successfully',
      });
    }
  } catch (error) {
    console.error('Save facts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
