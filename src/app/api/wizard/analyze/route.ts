/**
 * Wizard API - Analyze
 *
 * POST /api/wizard/analyze
 * Analyzes the case using deterministic rules and returns recommendations
 * ALLOWS ANONYMOUS ACCESS
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server';
import { getOrCreateWizardFacts } from '@/lib/case-facts/store';
import { wizardFactsToCaseFacts } from '@/lib/case-facts/normalize';
import type { CaseFacts } from '@/lib/case-facts/schema';

const analyzeSchema = z.object({
  case_id: z.string().min(1),
  question: z.string().trim().max(1200).optional(),
});

function computeRoute(facts: CaseFacts, jurisdiction: string, caseType: string): string {
  if (caseType === 'money_claim') return 'money_claim';
  if (jurisdiction === 'scotland') return 'notice_to_leave';
  if (facts.notice.notice_type) return facts.notice.notice_type;
  return 'standard_possession';
}

function computeStrength(facts: CaseFacts): { score: number; red_flags: string[]; compliance: string[] } {
  const redFlags: string[] = [];
  const compliance: string[] = [];
  let score = 50;

  if (facts.issues.rent_arrears.total_arrears && facts.issues.rent_arrears.total_arrears > 0) {
    score += 10;
  }

  if (facts.notice.notice_date) {
    score += 5;
  } else {
    redFlags.push('Notice has not been served');
  }

  if (facts.tenancy.deposit_protected === false) {
    redFlags.push('Deposit not protected');
    score -= 10;
  }

  if (facts.property.country === null) {
    compliance.push('Property country not specified');
  }

  return { score: Math.min(100, Math.max(0, score)), red_flags: redFlags, compliance };
}

function buildCaseSummary(facts: CaseFacts, jurisdiction: string) {
  const arrears = facts.issues.rent_arrears.total_arrears;
  const hasArrears = facts.issues.rent_arrears.has_arrears;
  const damages = facts.money_claim.damage_items?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
  const otherCharges = facts.money_claim.other_charges?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;

  return {
    jurisdiction,
    tenancy_type: facts.tenancy.tenancy_type,
    total_arrears: arrears,
    has_arrears: hasArrears,
    damages,
    other_charges: otherCharges,
    interest_rate: facts.money_claim.interest_rate,
    interest_start_date: facts.money_claim.interest_start_date,
    sheriffdom: facts.money_claim.sheriffdom,
    route: jurisdiction === 'scotland' ? 'simple_procedure' : 'money_claim',
  };
}

function craftAskHeavenAnswer(question: string | undefined, facts: CaseFacts, jurisdiction: string) {
  if (!question) return null;

  const arrears = facts.issues.rent_arrears.total_arrears;
  const interestRate = facts.money_claim.interest_rate ?? (jurisdiction === 'scotland' ? 8 : 8);
  const hasDamages = (facts.money_claim.damage_items || []).length > 0;
  const hasOther = (facts.money_claim.other_charges || []).length > 0;

  const baseSummary = [
    `Jurisdiction: ${jurisdiction === 'scotland' ? 'Scotland (Simple Procedure Form 3A)' : 'England & Wales (N1 Claim Form)'}.`,
    arrears ? `Current arrears noted around £${arrears}.` : 'Arrears total not provided yet.',
    hasDamages ? 'Damages have been entered in the wizard.' : 'No damages recorded.',
    hasOther ? 'Other charges are listed.' : 'No other charges recorded.',
  ].join(' ');

  return `${baseSummary} We use a simple ${interestRate}% per annum interest line with a daily rate in the particulars where permitted. ` +
    'If you need to update amounts, continue the wizard or edit the case facts, then regenerate your documents. This response is informational — it is not legal advice.';
}

export async function POST(request: Request) {
  try {
    const user = await getServerUser();
    const body = await request.json();
    const validation = analyzeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'case_id is required and must be a valid UUID' },
        { status: 400 }
      );
    }

    const { case_id, question } = validation.data;

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
      console.error('Case not found:', caseError);
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    // Type assertion: we know data exists after the null check
    const caseData = data as { id: string; jurisdiction: string; case_type: string; user_id: string | null; wizard_progress: number | null };

    // Northern Ireland gating: only tenancy agreements are supported
    if (caseData.jurisdiction === 'northern-ireland' && caseData.case_type !== 'tenancy_agreement') {
      return NextResponse.json(
        { error: 'Only tenancy agreements are available for Northern Ireland. Eviction and money claim analysis is not currently supported.' },
        { status: 400 }
      );
    }

    // Load flat WizardFacts from DB and convert to nested CaseFacts for analysis
    const wizardFacts = await getOrCreateWizardFacts(supabase, case_id);
    const facts = wizardFactsToCaseFacts(wizardFacts);
    const route = computeRoute(facts, caseData.jurisdiction, caseData.case_type);
    const { score, red_flags, compliance } = computeStrength(facts);
    const summary = buildCaseSummary(facts, caseData.jurisdiction);
    const askHeavenAnswer = craftAskHeavenAnswer(question, facts, caseData.jurisdiction);

    await supabase
      .from('cases')
      .update({
        recommended_route: route,
        red_flags: red_flags as any, // Supabase types red_flags as Json
        compliance_issues: compliance as any, // Supabase types compliance_issues as Json
        success_probability: score,
        wizard_progress: caseData.wizard_progress ?? 0,
      } as any)
      .eq('id', case_id);

    const previewDocuments: { id: string; document_type: string; document_title: string }[] = [];

    if (caseData.user_id) {
      const htmlContent = `<h1>Preview - ${route}</h1><p>Case strength: ${score}%</p>`;
      const { data, error: docError} = await supabase
        .from('documents')
        .insert({
          user_id: caseData.user_id,
          case_id,
          document_type: route,
          document_title: 'Preview document',
          jurisdiction: caseData.jurisdiction,
          html_content: htmlContent,
          is_preview: true,
        } as any)
        .select()
        .single();

      if (!docError && data) {
        const docRow = data as { id: string; document_type: string; document_title: string };
        previewDocuments.push({
          id: docRow.id,
          document_type: docRow.document_type,
          document_title: docRow.document_title,
        });
      }
    }

    return NextResponse.json({
      case_id,
      recommended_route: route,
      case_strength_score: score,
      red_flags,
      compliance_issues: compliance,
      preview_documents: previewDocuments,
      case_summary: summary,
      ask_heaven_answer: askHeavenAnswer,
    });
  } catch (error: any) {
    console.error('Analyze case error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
