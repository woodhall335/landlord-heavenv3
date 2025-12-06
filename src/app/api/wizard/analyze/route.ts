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
import { runDecisionEngine, checkEPCForSection21, type DecisionOutput } from '@/lib/decision-engine';
import { getLawProfile } from '@/lib/law-profile';

const analyzeSchema = z.object({
  case_id: z.string().min(1),
  // Optional Ask Heaven question for Q&A-style analysis
  question: z.string().optional(),
});

function computeRoute(facts: CaseFacts, jurisdiction: string, caseType: string): string {
  if (caseType === 'money_claim') return 'money_claim';
  if (jurisdiction === 'scotland') return 'notice_to_leave';
  if (facts.notice.notice_type) return facts.notice.notice_type;
  return 'standard_possession';
}

/**
 * Helper: detect if this case is really a money claim, based on route/meta.
 */
function isMoneyClaimCase(facts: CaseFacts): boolean {
  if (facts.court.route === 'money_claim') return true;

  const product = facts.meta?.product || '';
  const original = facts.meta?.original_product || '';

  const asString = (val: unknown) => (typeof val === 'string' ? val : '');
  const values = [asString(product), asString(original)];

  return values.some((val) => val.includes('money_claim'));
}

/**
 * Compute a richer case-strength score, with money-claim awareness.
 */
function computeStrength(facts: CaseFacts): { score: number; red_flags: string[]; compliance: string[] } {
  const red_flags: string[] = [];
  const compliance: string[] = [];

  let score = 50;

  const isMoneyClaim = isMoneyClaimCase(facts);
  const arrears = facts.issues.rent_arrears.total_arrears ?? 0;
  const hasArrearsFlag = facts.issues.rent_arrears.has_arrears === true;

  // =======================================
  // Common landlord risk factors
  // =======================================

  // Deposit protection problems are always bad
  if (facts.tenancy.deposit_protected === false) {
    red_flags.push(
      'Deposit does not appear to be protected – this can weaken your position and may affect other remedies.'
    );
    score -= 10;
  }

  // Country not set is always a compliance gap
  if (facts.property.country === null) {
    compliance.push(
      'Property country not specified – confirm whether this is England & Wales, Scotland or Northern Ireland.'
    );
  }

  // =======================================
  // Money claim–specific scoring
  // =======================================
  if (isMoneyClaim) {
    // 1. Core requirement: there must be arrears
    if (arrears > 0 || hasArrearsFlag) {
      score += 15;
    } else {
      red_flags.push(
        'No rent arrears recorded – a money claim usually requires a clear arrears figure. Update your arrears before issuing.'
      );
      score -= 25;
    }

    // 2. Arrears schedule / evidence of calculation
    const hasArrearsSchedule =
      (facts.issues.rent_arrears.arrears_items &&
        facts.issues.rent_arrears.arrears_items.length > 0) ||
      facts.money_claim.arrears_schedule_confirmed === true;

    if (hasArrearsSchedule) {
      score += 10;
    } else {
      compliance.push(
        'Add a rent schedule showing each rent period, amount due and amount paid – courts usually expect this in money claims.'
      );
      score -= 10;
    }

    // 3. Tenancy agreement + rent schedule uploads
    if (!facts.evidence.tenancy_agreement_uploaded) {
      compliance.push(
        'Upload your tenancy agreement or have a copy ready – the court may ask to see the written terms you rely on.'
      );
      score -= 5;
    }

    if (!facts.evidence.rent_schedule_uploaded) {
      compliance.push(
        'Upload your rent schedule or attach it to your bundle – it should match the arrears figures in your claim.'
      );
    }

    // 4. Pre-action steps / PAP-DEBT–style behaviour
    const lbaSent = facts.money_claim.lba_sent;
    const papServed = facts.money_claim.pap_documents_served;
    const preActionConfirmed = facts.money_claim.pre_action_deadline_confirmation;

    if (lbaSent === false || papServed === false) {
      red_flags.push(
        'Pre-action letters / information pack are not confirmed as sent – in England & Wales this can cause delays or cost orders.'
      );
      score -= 15;
    } else if (!lbaSent && !papServed) {
      compliance.push(
        'Confirm that you have sent a clear demand / Letter Before Claim and given the tenant time to respond before issuing.'
      );
    }

    if (preActionConfirmed === false) {
      red_flags.push(
        'You have not confirmed giving at least 14 days to respond before issuing – courts expect a reasonable response period.'
      );
      score -= 10;
    }

    // 5. Jurisdiction sanity checks – E&W small-claims style
    if (facts.property.country === 'england-wales') {
      if (arrears > 10000) {
        red_flags.push(
          'Total claim appears to be above £10,000 – this may fall outside the small-claims track. Check whether this product is suitable.'
        );
        score -= 10;
      }

      if (!facts.money_claim.court_jurisdiction_confirmed) {
        compliance.push(
          'Confirm that the tenant lives/works in England or Wales so the County Court has jurisdiction for your money claim.'
        );
      }
    }

    // 6. Damages with no itemisation
    const hasDamagesBasis =
      facts.money_claim.basis_of_claim === 'damages' ||
      facts.money_claim.basis_of_claim === 'both';
    const hasDamageItems = (facts.money_claim.damage_items || []).length > 0;

    if (hasDamagesBasis && !hasDamageItems) {
      compliance.push(
        'You indicated a claim for damages but did not list any damage items – add a short description and amount for each.'
      );
      score -= 5;
    }
  } else {
    // =======================================
    // Non-money-claim fallback (simple)
    // =======================================
    if (arrears > 0) {
      score += 10;
    } else if (hasArrearsFlag) {
      score += 5;
    }

    if (facts.notice.notice_date) {
      score += 5;
    } else {
      red_flags.push(
        'No notice date recorded – check that the correct notice has been served before issuing proceedings.'
      );
    }
  }

  // Clamp score between 0 and 100
  const finalScore = Math.min(100, Math.max(0, score));
  return { score: finalScore, red_flags, compliance };
}

/**
 * Build a richer case summary object, including money-claim readiness.
 */
function buildCaseSummary(facts: CaseFacts, jurisdiction: string) {
  const arrears = facts.issues.rent_arrears.total_arrears ?? 0;
  const hasArrears = facts.issues.rent_arrears.has_arrears === true;
  const damages =
    (facts.money_claim.damage_items || []).reduce(
      (sum, item) => sum + (item.amount || 0),
      0
    ) || 0;
  const other_charges =
    (facts.money_claim.other_charges || []).reduce(
      (sum, item) => sum + (item.amount || 0),
      0
    ) || 0;

  const isMoneyClaim = isMoneyClaimCase(facts);

  const hasArrearsSchedule =
    (facts.issues.rent_arrears.arrears_items &&
      facts.issues.rent_arrears.arrears_items.length > 0) ||
    facts.money_claim.arrears_schedule_confirmed === true;

  const lbaSent = facts.money_claim.lba_sent;
  const papServed = facts.money_claim.pap_documents_served;
  const preActionConfirmed = facts.money_claim.pre_action_deadline_confirmation;

  const missing_prerequisites: string[] = [];

  if (isMoneyClaim) {
    if (!(arrears > 0) && !hasArrears) {
      missing_prerequisites.push('Clear rent arrears figure');
    }
    if (!hasArrearsSchedule) {
      missing_prerequisites.push('Detailed rent arrears schedule');
    }
    if (!facts.evidence.tenancy_agreement_uploaded) {
      missing_prerequisites.push('Tenancy agreement evidence');
    }
    if (!facts.evidence.rent_schedule_uploaded) {
      missing_prerequisites.push('Rent schedule document upload');
    }
    if (!lbaSent && !papServed) {
      missing_prerequisites.push('Pre-action demand / Letter Before Claim');
    }
  }

  let pre_action_status: 'complete' | 'partial' | 'missing' | null = null;
  if (isMoneyClaim) {
    if ((lbaSent || papServed) && preActionConfirmed) {
      pre_action_status = 'complete';
    } else if (lbaSent || papServed) {
      pre_action_status = 'partial';
    } else {
      pre_action_status = 'missing';
    }
  }

  const ready_for_issue =
    isMoneyClaim && arrears > 0 && missing_prerequisites.length === 0
      ? true
      : isMoneyClaim
      ? false
      : null;

  return {
    jurisdiction,
    tenancy_type: facts.tenancy.tenancy_type,
    total_arrears: arrears,
    has_arrears: hasArrears,
    damages,
    other_charges,
    interest_rate: facts.money_claim.interest_rate,
    interest_start_date: facts.money_claim.interest_start_date,
    sheriffdom: facts.money_claim.sheriffdom,
    route: jurisdiction === 'scotland' ? 'simple_procedure' : 'money_claim',

    // Money-claim–focused extra fields
    is_money_claim: isMoneyClaim,
    ready_for_issue,
    missing_prerequisites,
    pre_action_status,
    evidence_overview: {
      tenancy_agreement_uploaded: facts.evidence.tenancy_agreement_uploaded,
      rent_schedule_uploaded: facts.evidence.rent_schedule_uploaded,
      bank_statements_uploaded: facts.evidence.bank_statements_uploaded,
      other_evidence_uploaded: facts.evidence.other_evidence_uploaded,
    },
  };
}

/**
 * Structured case health types for the UI.
 */
type CaseHealthSeverity = 'ok' | 'warning' | 'risk' | 'blocker';

interface CaseHealthIssue {
  code: string;
  severity: CaseHealthSeverity;
  title: string;
  message: string;
}

interface CaseHealth {
  product: 'money_claim' | 'eviction' | 'tenancy_agreement' | 'generic';
  jurisdiction: string;
  overall_status: 'ready_to_issue' | 'needs_work' | 'cannot_issue_yet';
  can_issue: boolean;
  strength: 'strong' | 'medium' | 'weak' | 'unknown';
  total_red_flags: number;
  blockers: CaseHealthIssue[];
  risks: CaseHealthIssue[];
  warnings: CaseHealthIssue[];
  positives: string[];
}

/**
 * Map our scoring + summary into a structured case_health object
 * for money-claim cases.
 */
function buildCaseHealth(
  facts: CaseFacts,
  jurisdiction: string,
  caseType: string,
  strengthScore: number,
  summary: ReturnType<typeof buildCaseSummary>,
  red_flags: string[],
  compliance: string[]
): CaseHealth | null {
  const isMoneyClaim = isMoneyClaimCase(facts) || caseType === 'money_claim';
  if (!isMoneyClaim) return null;

  const blockers: CaseHealthIssue[] = [];
  const risks: CaseHealthIssue[] = [];
  const warnings: CaseHealthIssue[] = [];
  const positives: string[] = [];

  const arrears = summary.total_arrears ?? 0;

  // Positives
  if (arrears > 0) {
    positives.push(`Arrears recorded at around £${arrears}.`);
  }
  if (summary.pre_action_status === 'complete') {
    positives.push('Pre-action steps recorded as complete (letter + response period).');
  } else if (summary.pre_action_status === 'partial') {
    positives.push('Some pre-action steps have been recorded, but not all details are complete yet.');
  }
  if (summary.evidence_overview.tenancy_agreement_uploaded) {
    positives.push('Tenancy agreement marked as available.');
  }
  if (summary.evidence_overview.rent_schedule_uploaded) {
    positives.push('Rent schedule marked as uploaded.');
  }

  // Missing prerequisites from summary
  for (const item of summary.missing_prerequisites || []) {
    const lower = item.toLowerCase();
    const issue: CaseHealthIssue = {
      code: `missing_${lower.replace(/[^a-z0-9]+/gi, '_')}`,
      severity: 'risk',
      title: `Missing: ${item}`,
      message: `You have not yet provided: ${item}. Add this before relying on the claim pack.`,
    };

    if (item === 'Clear rent arrears figure' || item === 'Pre-action demand / Letter Before Claim') {
      issue.severity = 'blocker';
    }

    if (issue.severity === 'blocker') {
      blockers.push(issue);
    } else {
      risks.push(issue);
    }
  }

  // Map red_flags into risks/blockers
  red_flags.forEach((flag, idx) => {
    const lower = flag.toLowerCase();
    const issue: CaseHealthIssue = {
      code: `red_flag_${idx + 1}`,
      severity: 'risk',
      title: 'Risk identified',
      message: flag,
    };

    if (
      lower.includes('no rent arrears') ||
      lower.includes('pre-action letters') ||
      lower.includes('no notice date') ||
      lower.includes('less than 14 days') ||
      lower.includes('no arrears recorded')
    ) {
      issue.severity = 'blocker';
    }

    if (issue.severity === 'blocker') {
      blockers.push(issue);
    } else {
      risks.push(issue);
    }
  });

  // Map compliance items into warnings
  compliance.forEach((c, idx) => {
    warnings.push({
      code: `compliance_${idx + 1}`,
      severity: 'warning',
      title: 'Compliance check',
      message: c,
    });
  });

  const totalRedFlags = blockers.length + risks.length + warnings.length;

  let overall_status: CaseHealth['overall_status'] = 'needs_work';
  let can_issue = true;

  if (blockers.length > 0) {
    overall_status = 'cannot_issue_yet';
    can_issue = false;
  } else if (totalRedFlags === 0 && summary.ready_for_issue === true) {
    overall_status = 'ready_to_issue';
    can_issue = true;
  } else {
    overall_status = 'needs_work';
    can_issue = true;
  }

  let strength: CaseHealth['strength'] = 'unknown';
  if (overall_status === 'ready_to_issue' && strengthScore >= 70) {
    strength = 'strong';
  } else if (strengthScore >= 40) {
    strength = 'medium';
  } else if (strengthScore > 0) {
    strength = 'weak';
  }

  return {
    product: 'money_claim',
    jurisdiction,
    overall_status,
    can_issue,
    strength,
    total_red_flags: totalRedFlags,
    blockers,
    risks,
    warnings,
    positives,
  };
}

/**
 * Ask Heaven answer: solicitor-flavoured narrative based on CaseFacts.
 */
function craftAskHeavenAnswer(
  question: string | undefined,
  facts: CaseFacts,
  jurisdiction: string
) {
  if (!question) return null;

  const { score, red_flags, compliance } = computeStrength(facts);
  const summary = buildCaseSummary(facts, jurisdiction);
  const arrears = facts.issues.rent_arrears.total_arrears;
  const interestRate =
    facts.money_claim.interest_rate ?? (jurisdiction === 'scotland' ? 8 : 8);
  const hasDamages = (facts.money_claim.damage_items || []).length > 0;
  const hasOther = (facts.money_claim.other_charges || []).length > 0;
  const isMoneyClaim = isMoneyClaimCase(facts);

  const baseSummary = [
    `Jurisdiction: ${
      jurisdiction === 'scotland'
        ? 'Scotland (Simple Procedure Form 3A)'
        : 'England & Wales (N1 County Court money claim)'
    }.`,
    arrears
      ? `Current arrears in your answers are around £${arrears}.`
      : 'No clear arrears total has been entered yet.',
    hasDamages
      ? 'You have indicated a claim for damages.'
      : 'No damages have been recorded so far.',
    hasOther
      ? 'You have listed other charges (fees/expenses).'
      : 'No additional charges have been listed.',
  ].join(' ');

  const strengthLine = isMoneyClaim
    ? `Based on your answers so far, our internal check puts your money-claim readiness at about ${score}%.`
    : `Based on your answers so far, your case strength score is about ${score}%.`;

  let issuesLine = '';

  if (red_flags.length) {
    const topFlags = red_flags.slice(0, 3);
    issuesLine =
      ' Key risks identified at this stage: ' +
      topFlags.map((f, idx) => `${idx + 1}. ${f}`).join(' ');
  } else if (compliance.length) {
    const topCompliance = compliance.slice(0, 3);
    issuesLine =
      ' There are a few housekeeping items you should tidy up before relying on this pack: ' +
      topCompliance.map((c, idx) => `${idx + 1}. ${c}`).join(' ');
  }

  let readinessLine = '';
  if (isMoneyClaim) {
    if (summary.ready_for_issue === true) {
      readinessLine =
        ' On the information you have given, the claim looks broadly ready to issue, provided your evidence matches your answers.';
    } else if (summary.ready_for_issue === false) {
      if (summary.missing_prerequisites && summary.missing_prerequisites.length) {
        readinessLine =
          ' At the moment this does not look fully ready to issue. You are missing: ' +
          summary.missing_prerequisites.join(', ') +
          '. Fix these gaps, then regenerate your documents before filing.';
      } else {
        readinessLine =
          ' Some details are still incomplete – review your arrears, pre-action steps and evidence before issuing your claim.';
      }
    }
  }

  const interestLine =
    ` We apply a simple ${interestRate}% per annum statutory interest line with a daily rate in the particulars where permitted.` +
    ' You can adjust the dates or amounts in the wizard and regenerate the documents if your figures change.';

  const disclaimer =
    ' This explanation is for information only and is not legal advice. Courts make their own decisions, and a strong claim on paper can still be defended or refused if the facts or evidence do not support it.';

  return [baseSummary, strengthLine, issuesLine, readinessLine, interestLine, disclaimer]
    .filter(Boolean)
    .join(' ');
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
    const caseData = data as {
      id: string;
      jurisdiction: string;
      case_type: string;
      user_id: string | null;
      wizard_progress: number | null;
    };

    // Northern Ireland gating: only tenancy agreements are supported
    if (caseData.jurisdiction === 'northern-ireland' && caseData.case_type !== 'tenancy_agreement') {
      return NextResponse.json(
        {
          error:
            'Only tenancy agreements are available for Northern Ireland. Eviction and money claim analysis is not currently supported.',
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

    // Load flat WizardFacts from DB and convert to nested CaseFacts for analysis
    const wizardFacts = await getOrCreateWizardFacts(supabase, case_id);
    const facts = wizardFactsToCaseFacts(wizardFacts);

    const route = computeRoute(facts, caseData.jurisdiction, caseData.case_type);
    const { score, red_flags, compliance } = computeStrength(facts);
    const summary = buildCaseSummary(facts, caseData.jurisdiction);
    const askHeavenAnswer = craftAskHeavenAnswer(
      question,
      facts,
      caseData.jurisdiction
    );

    // NEW: compute structured case_health block for the UI (money-claim aware)
    const caseHealth = buildCaseHealth(
      facts,
      caseData.jurisdiction,
      caseData.case_type,
      score,
      summary,
      red_flags,
      compliance
    );

    // RUN DECISION ENGINE for eviction cases (Audit B2: integrate decision engine)
    let decisionEngineOutput: DecisionOutput | null = null;
    if (caseData.case_type === 'eviction') {
      try {
        decisionEngineOutput = runDecisionEngine({
          jurisdiction: caseData.jurisdiction as 'england-wales' | 'scotland' | 'northern-ireland',
          product: facts.meta.product as any || 'notice_only',
          case_type: 'eviction',
          facts,
        });

        // Merge decision engine blocking issues into red_flags
        decisionEngineOutput.blocking_issues.forEach(block => {
          if (block.severity === 'blocking') {
            red_flags.push(`${block.route.toUpperCase()} BLOCKED: ${block.description} - ${block.action_required}`);
          }
        });

        // Merge decision engine warnings into compliance
        decisionEngineOutput.warnings.forEach(warning => {
          compliance.push(warning);
        });

        // Check EPC rating for S21 (Audit D2: M6)
        const tenancyStartDate = facts.tenancy.start_date;
        const epcRating = (wizardFacts as any).epc_rating;
        if (decisionEngineOutput.recommended_routes.includes('section_21')) {
          const epcCheck = checkEPCForSection21(tenancyStartDate, epcRating);
          if (epcCheck.warning) {
            decisionEngineOutput.warnings.push(epcCheck.warning);
            compliance.push(epcCheck.warning);
          }
        }
      } catch (error) {
        console.error('Decision engine error:', error);
        // Don't block analysis if decision engine fails
      }
    }

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

    const previewDocuments: {
      id: string;
      document_type: string;
      document_title: string;
    }[] = [];

    if (caseData.user_id) {
      const htmlContent = `<h1>Preview - ${route}</h1><p>Case strength: ${score}%</p>`;
      const { data: docData, error: docError } = await supabase
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

      if (!docError && docData) {
        const docRow = docData as {
          id: string;
          document_type: string;
          document_title: string;
        };
        previewDocuments.push({
          id: docRow.id,
          document_type: docRow.document_type,
          document_title: docRow.document_title,
        });
      }
    }

        // Get law profile for version tracking and legal metadata
    const law_profile = getLawProfile(caseData.jurisdiction, caseData.case_type);

    // Derived fields for final analysis UI (non-blocking, informative only)
    const case_strength_band =
      score >= 70 ? 'strong' : score >= 40 ? 'medium' : score > 0 ? 'weak' : 'unknown';

    let is_court_ready: boolean | null = null;
    let readiness_summary: string | null = null;
    let recommended_route_label: string = route;

    // Human-friendly route labels for the UI
    if (caseData.case_type === 'eviction') {
      if (caseData.jurisdiction === 'england-wales') {
        if (route === 'section_21') {
          recommended_route_label =
            'Section 21 possession (accelerated or standard, depending on compliance)';
        } else if (route === 'section_8') {
          recommended_route_label = 'Section 8 standard possession (N5 + N119)';
        } else if (route === 'notice_only') {
          recommended_route_label = 'Notice-only route (serve notice now, claim later)';
        } else if (route === 'standard_possession') {
          recommended_route_label = 'Standard possession (N5 + N119)';
        }
      } else if (caseData.jurisdiction === 'scotland') {
        if (route === 'notice_to_leave') {
          recommended_route_label = 'Notice to Leave + Form E (First-tier Tribunal)';
        }
      }
    } else if (caseData.case_type === 'money_claim') {
      recommended_route_label = 'Money claim (County Court / Simple Procedure)';
    }

    // Readiness flags - NEVER used to block generation or payment, only for messaging
    if (caseData.case_type === 'eviction' && decisionEngineOutput) {
      const hasBlocking = decisionEngineOutput.blocking_issues?.some(
        (block) => block.severity === 'blocking'
      );
      is_court_ready = !hasBlocking;

      if (hasBlocking) {
        readiness_summary =
          'You are not fully ready to file your claim today. We will still generate your full eviction pack, including notices, court forms, and a procedural guide to help you fix the issues identified.';
      } else {
        readiness_summary =
          'You appear ready to file your claim based on the information provided. We will generate your full eviction pack with court forms, notices, and a filing checklist.';
      }
    } else if (caseHealth) {
      // Money-claim case health
      is_court_ready = caseHealth.overall_status === 'ready_to_issue';
      if (caseHealth.overall_status === 'ready_to_issue') {
        readiness_summary =
          'You appear ready to issue your money claim based on the information provided. We will generate your full pack with N1 / Simple Procedure forms and a filing checklist.';
      } else if (caseHealth.overall_status === 'needs_work') {
        readiness_summary =
          'Your money claim needs further work, but we will still generate your pack and highlight what to fix before issuing.';
      }
    }

    return NextResponse.json({
      case_id,
      recommended_route: route,
      recommended_route_label,
      case_strength_score: score,
      case_strength_band,
      is_court_ready,
      readiness_summary,
      red_flags,
      compliance_issues: compliance,
      preview_documents: previewDocuments,
      case_summary: summary,
      ask_heaven_answer: askHeavenAnswer,
      case_health: caseHealth,
      // Decision engine output (for eviction cases)
      decision_engine: decisionEngineOutput,
      // Legal change framework metadata
      law_profile,
    });

  } catch (error: any) {
    console.error('Analyze case error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
