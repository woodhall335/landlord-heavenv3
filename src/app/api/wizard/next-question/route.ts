/**
 * Wizard API - Get Next MQS Question
 *
 * POST /api/wizard/next-question
 * Uses deterministic MQS flows (no AI) to find the next unanswered question
 * ALLOWS ANONYMOUS ACCESS
 */

import { NextResponse } from 'next/server';
import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server';
import { getNextMQSQuestion, loadMQS, type MasterQuestionSet, type ProductType } from '@/lib/wizard/mqs-loader';
import { getOrCreateWizardFacts } from '@/lib/case-facts/store';
import type { ExtendedWizardQuestion } from '@/lib/wizard/types';
import { getNextQuestion as getNextAIQuestion } from '@/lib/ai';
import { wizardFactsToCaseFacts } from '@/lib/case-facts/normalize';
import type { CaseFacts } from '@/lib/case-facts/schema';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

function isQuestionAnswered(question: ExtendedWizardQuestion, facts: Record<string, any>): boolean {
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

function deriveProduct(caseType: string, collectedFacts: Record<string, any>): ProductType | null {
  const metaProduct = collectedFacts?.__meta?.product as ProductType | undefined;
  const isMetaCompatible =
    (caseType === 'eviction' && (metaProduct === 'notice_only' || metaProduct === 'complete_pack')) ||
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
  const answeredCount = mqs.questions.filter((q) => isQuestionAnswered(q, facts)).length;
  return Math.round((answeredCount / mqs.questions.length) * 100);
}

function hasStringValue(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasArrayValue(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0;
}

function getMoneyClaimMissingEssentials(facts: CaseFacts, jurisdiction: string): string[] {
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

  if (!facts.money_claim.lba_date && !facts.money_claim.demand_letter_date) missing.push('pre_action_letter_date');
  if (!facts.money_claim.lba_response_deadline) missing.push('pre_action_response_deadline');
  if (!hasArrayValue(facts.money_claim.lba_method)) missing.push('pre_action_service_method');
  if (jurisdiction === 'england-wales' && !hasArrayValue(facts.money_claim.pap_documents_sent)) {
    missing.push('pap_documents_sent');
  }
  if (jurisdiction === 'scotland' && facts.money_claim.pre_action_deadline_confirmation === null) {
    missing.push('rule_3_1_response_window');
  }
  if (facts.money_claim.pap_documents_served !== true) missing.push('service_confirmation');

  const hasArrearsEvidence =
    facts.money_claim.arrears_schedule_confirmed === true || facts.evidence.rent_schedule_uploaded === true;
  if (!hasArrearsEvidence) missing.push('arrears_schedule_or_ledger');

  if (!hasStringValue(facts.money_claim.attempts_to_resolve)) missing.push('attempts_to_resolve');
  if (facts.money_claim.charge_interest === null) missing.push('interest_choice');

  const hasEvidenceFlags =
    hasArrayValue(facts.money_claim.evidence_types_available) ||
    facts.evidence.tenancy_agreement_uploaded ||
    facts.evidence.rent_schedule_uploaded ||
    facts.money_claim.arrears_schedule_confirmed === true;
  if (!hasEvidenceFlags) missing.push('evidence_flags');

  if (!hasArrayValue(facts.money_claim.enforcement_preferences)) missing.push('enforcement_preferences');

  return missing;
}

export async function POST(request: Request) {
  try {
    const user = await getServerUser().catch(() => null);
    const { case_id } = await request.json();

    if (!case_id || typeof case_id !== 'string') {
      return NextResponse.json({ error: 'Invalid case_id' }, { status: 400 });
    }

    // Create properly typed Supabase client
    const supabase = await createServerSupabaseClient();

    let query = supabase.from('cases').select('*').eq('id', case_id);
    if (user) {
      query = query.eq('user_id', user.id);
    } else {
      query = query.is('user_id', null);
    }

    const { data, error: caseError } = await query.single();

    if (caseError || !data) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    // Type assertion: we know data exists after the null check
    const caseRow = data as { id: string; jurisdiction: string; case_type: string; collected_facts: any };

    // Northern Ireland gating: only tenancy agreements are supported
    if (caseRow.jurisdiction === 'northern-ireland' && caseRow.case_type !== 'tenancy_agreement') {
      return NextResponse.json(
        { error: 'Only tenancy agreements are available for Northern Ireland. Eviction and money claim workflows are not currently supported.' },
        { status: 400 }
      );
    }

    const product = deriveProduct(caseRow.case_type, (caseRow.collected_facts as Record<string, any>) || {});
    const mqs = product ? loadMQS(product, caseRow.jurisdiction) : null;

    const facts = await getOrCreateWizardFacts(supabase, case_id);

    if (!mqs) {
      const aiResponse = await getNextAIQuestion({
        case_type: caseRow.case_type as any,
        jurisdiction: caseRow.jurisdiction as any,
        collected_facts: facts,
      });

      return NextResponse.json({
        next_question: aiResponse.next_question,
        is_complete: aiResponse.is_complete,
        progress: aiResponse.is_complete ? 100 : caseRow.wizard_progress || 0,
      });
    }

    const nextQuestion = getNextMQSQuestion(mqs, facts);
    const progress = computeProgress(mqs, facts);

    if (!nextQuestion) {
      if (caseRow.case_type === 'money_claim') {
        const caseFacts = wizardFactsToCaseFacts(facts as any);
        const missingEssentials = getMoneyClaimMissingEssentials(caseFacts, caseRow.jurisdiction);

        if (missingEssentials.length) {
          await supabase.from('cases').update({ wizard_progress: progress } as any).eq('id', case_id);

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
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
