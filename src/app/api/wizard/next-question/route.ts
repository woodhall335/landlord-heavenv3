/**
 * Wizard API - Get Next MQS Question
 *
 * POST /api/wizard/next-question
 * Uses deterministic MQS flows (no AI) to find the next unanswered question
 * ALLOWS ANONYMOUS ACCESS
 */

import { NextResponse } from 'next/server';
import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server';
import {
  getNextMQSQuestion,
  loadMQS,
  normalizeAskOnceFacts,
  questionIsApplicable,
  type MasterQuestionSet,
  type ProductType,
} from '@/lib/wizard/mqs-loader';
import { getOrCreateWizardFacts } from '@/lib/case-facts/store';
import type { ExtendedWizardQuestion } from '@/lib/wizard/types';
import { getNextQuestion as getNextAIQuestion } from '@/lib/ai';
import { wizardFactsToCaseFacts } from '@/lib/case-facts/normalize';
import type { CaseFacts } from '@/lib/case-facts/schema';
import { applyDocumentIntelligence } from '@/lib/wizard/document-intel';
import { getReviewNavigation } from '@/lib/wizard/review-navigation';
import { deriveCanonicalJurisdiction } from '@/lib/types/jurisdiction';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type CaseRow = {
  id: string;
  jurisdiction: string;
  case_type: string;
  collected_facts: any;
  wizard_progress: number | null;
  wizard_completed_at: string | null;
};

function getValueAtPath(facts: Record<string, any>, path: string): unknown {
  return path
    .split('.')
    .filter(Boolean)
    .reduce((acc: any, key) => {
      if (acc === undefined || acc === null) return undefined;
      const resolvedKey = Number.isInteger(Number(key)) ? Number(key) : key;
      return acc[resolvedKey as keyof typeof acc];
    }, facts);
}

function isQuestionAnswered(
  question: ExtendedWizardQuestion,
  facts: Record<string, any>
): boolean {
  if (question.maps_to && question.maps_to.length > 0) {
    return question.maps_to.every((path) => {
      const value = getValueAtPath(facts, path);
      if (value === null || value === undefined) return false;
      if (typeof value === 'string') return value.trim().length > 0;
      return true;
    });
  }

  // For questions without maps_to, check if answered directly by question ID
  const fallbackValue = facts[question.id];
  if (fallbackValue === null || fallbackValue === undefined) return false;
  if (typeof fallbackValue === 'string') return fallbackValue.trim().length > 0;
  return true;
}

function deriveProduct(
  caseType: string,
  collectedFacts: Record<string, any>
): ProductType | null {
  const metaProduct = collectedFacts?.__meta?.product as ProductType | undefined;
  const isMetaCompatible =
    (caseType === 'eviction' &&
      (metaProduct === 'notice_only' || metaProduct === 'complete_pack')) ||
    (caseType === 'money_claim' && metaProduct === 'money_claim') ||
    (caseType === 'tenancy_agreement' && metaProduct === 'tenancy_agreement');

  if (metaProduct && isMetaCompatible) return metaProduct;
  if (metaProduct && !isMetaCompatible) return null;
  if (caseType === 'money_claim') return 'money_claim';
  if (caseType === 'tenancy_agreement') return 'tenancy_agreement';
  if (caseType === 'eviction') return 'complete_pack';
  return null;
}

function computeProgress(mqs: MasterQuestionSet, facts: Record<string, any>): number {
  if (!mqs.questions.length) return 100;
  const applicable = mqs.questions.filter((q) => questionIsApplicable(mqs, q, facts));
  const answeredCount = applicable.filter((q) => isQuestionAnswered(q, facts)).length;
  return Math.round((answeredCount / applicable.length) * 100);
}

function hasStringValue(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasArrayValue(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0;
}

function getMoneyClaimMissingEssentials(
  facts: CaseFacts,
  jurisdiction: string
): string[] {
  const missing: string[] = [];

  if (!hasStringValue(facts.parties.landlord?.name)) missing.push('landlord_name');
  if (!facts.parties.tenants?.length || !hasStringValue(facts.parties.tenants[0]?.name)) {
    missing.push('tenant_name');
  }
  if (!hasStringValue(facts.property.address_line1)) missing.push('property_address');
  if (facts.tenancy.rent_amount === null) missing.push('rent_amount');
  if (!hasStringValue(facts.money_claim?.basis_of_claim)) missing.push('basis_of_claim');

  const hasBreakdown =
    (facts.issues.rent_arrears.total_arrears ?? 0) > 0 ||
    (facts.money_claim.damage_items || []).length > 0 ||
    (facts.money_claim.other_charges || []).length > 0;
  if (!hasBreakdown) missing.push('claim_breakdown');

  if (!facts.money_claim.lba_date && !facts.money_claim.demand_letter_date) {
    missing.push('pre_action_letter_date');
  }
  if (!facts.money_claim.lba_response_deadline) {
    missing.push('pre_action_response_deadline');
  }
  if (!hasArrayValue(facts.money_claim.lba_method)) {
    missing.push('pre_action_service_method');
  }
  if ((jurisdiction === 'england' || jurisdiction === 'wales') && !hasArrayValue(facts.money_claim.pap_documents_sent)) {
    missing.push('pap_documents_sent');
  }
  if (jurisdiction === 'scotland' && facts.money_claim.pre_action_deadline_confirmation === null) {
    missing.push('rule_3_1_response_window');
  }
  if (facts.money_claim.pap_documents_served !== true) {
    missing.push('service_confirmation');
  }

  const hasArrearsEvidence =
    facts.money_claim.arrears_schedule_confirmed === true ||
    facts.evidence.rent_schedule_uploaded === true;
  if (!hasArrearsEvidence) missing.push('arrears_schedule_or_ledger');

  if (!hasStringValue(facts.money_claim.attempts_to_resolve)) {
    missing.push('attempts_to_resolve');
  }
  if (facts.money_claim.charge_interest === null) {
    missing.push('interest_choice');
  }

  const hasEvidenceFlags =
    hasArrayValue(facts.money_claim.evidence_types_available) ||
    facts.evidence.tenancy_agreement_uploaded ||
    facts.evidence.rent_schedule_uploaded ||
    facts.money_claim.arrears_schedule_confirmed === true;
  if (!hasEvidenceFlags) missing.push('evidence_flags');

  if (!hasArrayValue(facts.money_claim.enforcement_preferences)) {
    missing.push('enforcement_preferences');
  }

  return missing;
}

export async function POST(request: Request) {
  try {
    const user = await getServerUser().catch(() => null);
    const { case_id, mode, include_answered, review_mode, current_question_id, target_question_id } = await request.json();
    const isReviewMode = mode === 'edit' || include_answered === true || review_mode === true;

    if (!case_id || typeof case_id !== 'string') {
      return NextResponse.json({ error: 'Invalid case_id' }, { status: 400 });
    }

    // Create properly typed Supabase client
    const supabase = await createServerSupabaseClient();

    // RLS policies handle access control - no need for manual user_id filtering
    const { data, error: caseError } = await supabase
      .from('cases')
      .select('*')
      .eq('id', case_id)
      .single();

    if (caseError || !data) {
      const { handleCaseFetchError } = await import('@/lib/api/error-handling');
      const errorResponse = handleCaseFetchError(caseError, data, 'wizard/next-question', case_id);
      if (errorResponse) {
        return errorResponse;
      }
    }

    const caseRow = data as CaseRow;

    const canonicalJurisdiction = deriveCanonicalJurisdiction(
      caseRow.jurisdiction,
      caseRow.collected_facts,
    );

    if (!canonicalJurisdiction) {
      return NextResponse.json({
        code: 'INVALID_JURISDICTION',
        error: 'INVALID_JURISDICTION',
        user_message: 'Jurisdiction must be one of england, wales, scotland, or northern-ireland.',
        blocking_issues: [],
        warnings: [],
      }, { status: 422 });
    }

    // Northern Ireland gating: only tenancy agreements are supported
    if (canonicalJurisdiction === 'northern-ireland' && caseRow.case_type !== 'tenancy_agreement') {
      return NextResponse.json(
        {
          // IMPORTANT: keep this a stable machine-readable code (do NOT import constants inside the function)
          code: 'NI_EVICTION_MONEY_CLAIM_NOT_SUPPORTED',
          error: 'NI_EVICTION_MONEY_CLAIM_NOT_SUPPORTED',
          user_message:
            'We currently support tenancy agreements for Northern Ireland. For England & Wales and Scotland, we support evictions (notices and court packs) and money claims. Northern Ireland eviction and money claim support is planned for Q2 2026.',
          supported: {
            'northern-ireland': ['tenancy_agreement'],
            england: ['notice_only', 'complete_pack', 'money_claim', 'tenancy_agreement'],
            wales: ['notice_only', 'complete_pack', 'money_claim', 'tenancy_agreement'],
            scotland: ['notice_only', 'complete_pack', 'money_claim', 'tenancy_agreement'],
          },
          blocking_issues: [],
          warnings: [],
        },
        { status: 422 }
      );
    }

    const product = deriveProduct(
      caseRow.case_type,
      (caseRow.collected_facts as Record<string, any>) || {}
    );
    const mqs = product ? loadMQS(product, canonicalJurisdiction) : null;

    const facts = await getOrCreateWizardFacts(supabase, case_id);

    if (!mqs) {
      const aiResponse = await getNextAIQuestion({
        case_type: caseRow.case_type as any,
        jurisdiction: canonicalJurisdiction,
        collected_facts: facts,
      });

      return NextResponse.json({
        next_question: aiResponse.next_question,
        is_complete: aiResponse.is_complete,
        progress: aiResponse.is_complete ? 100 : caseRow.wizard_progress || 0,
      });
    }

    const docIntel = applyDocumentIntelligence(facts);
    const hydratedFacts = normalizeAskOnceFacts(docIntel.facts, mqs);
    const progress = computeProgress(mqs, hydratedFacts);

    // ====================================================================================
    // TARGET QUESTION ID: Jump directly to a specific question (for validation issue links)
    // ====================================================================================
    // This allows users to click on validation issues and navigate directly to the question
    // that can fix the issue, preserving case context (case_id, type, jurisdiction, product).
    if (target_question_id && mqs) {
      const targetQuestion = mqs.questions.find(q => q.id === target_question_id);

      if (targetQuestion) {
        await supabase
          .from('cases')
          .update({ wizard_progress: progress } as any)
          .eq('id', case_id);

        return NextResponse.json({
          next_question: targetQuestion,
          is_complete: false,
          progress,
          jumped_to: target_question_id,
        });
      }
      // If target question not found, fall through to normal behavior
      console.warn(`[WIZARD] Target question not found: ${target_question_id}`);
    }

    if (isReviewMode && mqs) {
      const { nextQuestion: reviewQuestion, isComplete: reviewComplete } = getReviewNavigation(
        mqs,
        hydratedFacts,
        current_question_id,
      );

      await supabase
        .from('cases')
        .update({ wizard_progress: progress } as any)
        .eq('id', case_id);

      return NextResponse.json({
        next_question: reviewQuestion,
        is_complete: reviewComplete,
        progress,
      });
    }

    let nextQuestion = getNextMQSQuestion(mqs, hydratedFacts);

    // Auto-mark info-type questions as "viewed" so they don't get returned again
    if (nextQuestion && nextQuestion.inputType === 'info') {
      const { updateWizardFacts } = await import('@/lib/case-facts/store');

      // Mark this info question as viewed by setting a marker in facts
      await updateWizardFacts(
        supabase,
        case_id,
        (currentFacts) => ({
          ...currentFacts,
          [nextQuestion!.id]: '_info_viewed',
        }),
        {}
      );

      // Since we just marked it as viewed, get the NEXT question after this info page
      // This allows the current info page to be displayed once, then skipped on next call
      const updatedFacts = {
        ...hydratedFacts,
        [nextQuestion.id]: '_info_viewed',
      };
      const questionAfterInfo = getNextMQSQuestion(mqs, updatedFacts);

      // Return the info question this time (so it gets displayed)
      // But next time /next-question is called, it will skip to questionAfterInfo
    }

    if (!nextQuestion) {
      // MQS thinks we're done – for money claim, sanity-check essentials first
      if (caseRow.case_type === 'money_claim') {
        const caseFacts = wizardFactsToCaseFacts(facts as any);
        const missingEssentials = getMoneyClaimMissingEssentials(
          caseFacts,
          caseRow.jurisdiction
        );

        if (missingEssentials.length) {
          await supabase
            .from('cases')
            .update({ wizard_progress: progress } as any)
            .eq('id', case_id);

          const aiResponse = await getNextAIQuestion({
            case_type: caseRow.case_type as any,
            jurisdiction: caseRow.jurisdiction as any,
            collected_facts: facts,
          });

          return NextResponse.json({
            next_question: aiResponse.next_question,
            is_complete: false,
            progress,
            missing_essentials: missingEssentials,
          });
        }
      }

      await supabase
        .from('cases')
        .update({
          wizard_progress: 100,
          wizard_completed_at: new Date().toISOString(),
        } as any)
        .eq('id', case_id);

      return NextResponse.json({
        next_question: null,
        is_complete: true,
        progress: 100,
      });
    }

    await supabase
      .from('cases')
      .update({ wizard_progress: progress } as any)
      .eq('id', case_id);

    return NextResponse.json({
      next_question: nextQuestion,
      is_complete: false,
      progress,
    });
  } catch (error: any) {
    if (error?.message === 'Unauthorized - Please log in') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('Next question error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}