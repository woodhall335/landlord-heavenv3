/**
 * Wizard API - Analyze
 *
 * POST /api/wizard/analyze
 * Analyzes the case using deterministic rules and returns recommendations
 * ALLOWS ANONYMOUS ACCESS
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerUser } from '@/lib/supabase/server';
import { createSupabaseAdminClient, logSupabaseAdminDiagnostics } from '@/lib/supabase/admin';
import { getOrCreateWizardFacts } from '@/lib/case-facts/store';
import { wizardFactsToCaseFacts } from '@/lib/case-facts/normalize';
import type { CaseFacts } from '@/lib/case-facts/schema';
import { runDecisionEngine, checkEPCForSection21, type DecisionOutput } from '@/lib/decision-engine';
import {
  augmentDecisionOutputWithRouteScope,
  formatBlockingIssueAsRedFlag,
  type RouteScopedDecisionOutput,
} from '@/lib/decision-engine/routeScopedBlockingIssues';
import { getLawProfile } from '@/lib/law-profile';
import { normalizeJurisdiction } from '@/lib/types/jurisdiction';
import { getSelectedGrounds } from '@/lib/grounds';
import { enrichEnglandSection8SupportContext } from '@/lib/england-possession/support-document-context';
import { validateEnglandPost2026WizardFacts } from '@/lib/england-possession/post-2026-validation';
import { assertCaseReadAccess } from '@/lib/auth/case-access';

export const runtime = 'nodejs';

const analyzeSchema = z.object({
  case_id: z.string().uuid(),
  // Optional Ask Heaven question for Q&A-style analysis
  question: z.string().optional(),
});

type EvidenceSnapshot = {
  tenancy_agreement_uploaded: boolean;
  rent_schedule_uploaded: boolean;
  correspondence_uploaded: boolean;
  damage_photos_uploaded: boolean;
  authority_letters_uploaded: boolean;
  bank_statements_uploaded: boolean;
  other_evidence_uploaded: boolean;
  files: Array<{ id?: string; category?: string; file_name?: string }>;
};

function normaliseEvidence(facts: CaseFacts): EvidenceSnapshot {
  const files = Array.isArray((facts as any)?.evidence?.files)
    ? ((facts as any).evidence.files as any[])
    : [];

  const lc = (val: string | undefined) => (typeof val === 'string' ? val.toLowerCase() : '');

  const hasCategory = (keywords: string[]) =>
    files.some((file) => {
      const cat = lc(file.category || file.label || file.question_id || file.file_name);
      return keywords.some((kw) => cat.includes(kw));
    });

  return {
    tenancy_agreement_uploaded:
      (facts as any)?.evidence?.tenancy_agreement_uploaded === true || hasCategory(['tenancy']),
    rent_schedule_uploaded:
      (facts as any)?.evidence?.rent_schedule_uploaded === true || hasCategory(['rent', 'arrears']),
    correspondence_uploaded: hasCategory(['correspondence', 'email', 'text', 'message']),
    damage_photos_uploaded: hasCategory(['damage', 'photo', 'picture', 'image']),
    authority_letters_uploaded: hasCategory(['council', 'police', 'authority', 'asb']),
    bank_statements_uploaded:
      (facts as any)?.evidence?.bank_statements_uploaded === true || hasCategory(['bank', 'statement']),
    other_evidence_uploaded:
      (facts as any)?.evidence?.other_evidence_uploaded === true || files.length > 0,
    files,
  };
}

function computeRoute(facts: CaseFacts, jurisdiction: string, caseType: string, wizardFacts?: any): string {
  if (caseType === 'money_claim') return 'money_claim';
  if (caseType === 'tenancy_agreement') return 'tenancy_agreement';
  if (caseType === 'rent_increase') {
    return wizardFacts?.section13?.selectedPlan ||
      wizardFacts?.section13?.selected_plan ||
      wizardFacts?.section13?.product ||
      wizardFacts?.selectedPlan ||
      wizardFacts?.selected_plan ||
      'section13_standard';
  }
  if (jurisdiction === 'scotland') return 'notice_to_leave';
  // Check user's explicit eviction_route selection from Case Basics first
  if (wizardFacts?.eviction_route) return wizardFacts.eviction_route;
  if (wizardFacts?.selected_notice_route) return wizardFacts.selected_notice_route;
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

function hasText(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeGroundLabel(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const match = value.toLowerCase().match(/(?:ground[_\s-]*)?(\d+[a-z]*)/);
  return match?.[1] || null;
}

function getSelectedSection8GroundIds(facts: CaseFacts): string[] {
  const selected = facts.issues.section8_grounds.selected_grounds || [];
  return Array.from(new Set(selected.map(normalizeGroundLabel).filter((ground): ground is string => !!ground)));
}

function getMonthlyRentForScoring(facts: CaseFacts): number | null {
  const rent = facts.tenancy.rent_amount;
  if (!rent || rent <= 0) return null;

  switch (facts.tenancy.rent_frequency) {
    case 'weekly':
      return Number(((rent * 52) / 12).toFixed(2));
    case 'fortnightly':
      return Number(((rent * 26) / 12).toFixed(2));
    case 'quarterly':
      return Number((rent / 3).toFixed(2));
    case 'yearly':
      return Number((rent / 12).toFixed(2));
    case 'monthly':
    case 'other':
    default:
      return rent;
  }
}

/**
 * Compute a richer case-strength score, with money-claim and eviction awareness.
 * This is a readiness/confidence indicator, not a guarantee of court outcome.
 */
export function computeStrength(
  facts: CaseFacts,
  caseType: string = 'eviction'
): { score: number; red_flags: string[]; compliance: string[] } {
  const red_flags: string[] = [];
  const compliance: string[] = [];

  let score = 50;

  const isMoneyClaim = isMoneyClaimCase(facts);
  const arrears = facts.issues.rent_arrears.total_arrears ?? 0;
  const hasArrearsFlag = facts.issues.rent_arrears.has_arrears === true;
  const evidence = normaliseEvidence(facts);

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
      score += 20;
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

    // 3. Evidence readiness. The money-claim wizard no longer collects uploads,
    // so these are practical reminders rather than score penalties.
    if (!facts.evidence.tenancy_agreement_uploaded) {
      compliance.push(
        'Have the tenancy agreement ready to attach or exhibit if the tenant disputes the rent terms.'
      );
    }

    if (!facts.evidence.rent_schedule_uploaded) {
      compliance.push(
        'Check the rent schedule generated from your answers and keep any rent account or payment record that supports it.'
      );
    }

    // 4. Pre-action steps / PAP-DEBT–style behaviour
    const lbaSent =
      facts.money_claim.letter_before_claim_sent === true ||
      Boolean(facts.money_claim.pap_letter_date) ||
      facts.money_claim.lba_sent === true;
    const willGenerateLetter = facts.money_claim.generate_pap_documents === true;
    const papServed = facts.money_claim.pap_documents_served;
    const preActionConfirmed = facts.money_claim.pre_action_deadline_confirmation;

    if ((lbaSent === false || papServed === false) && !willGenerateLetter) {
      red_flags.push(
        'Pre-action letters / information pack are not confirmed as sent – in England & Wales this can cause delays or cost orders.'
      );
      score -= 15;
    } else if (!lbaSent && !papServed && !willGenerateLetter) {
      compliance.push(
        'Confirm that you have sent a clear demand / Letter Before Claim and given the tenant time to respond before issuing.'
      );
    }

    if (preActionConfirmed === false && !willGenerateLetter) {
      compliance.push(
        'Before issuing, make sure the tenant has had the 30-day PAP Debt response period after the Letter Before Claim.'
      );
    }

    // 5. Jurisdiction sanity checks – E&W small-claims style
    if (facts.property.country === 'england' || facts.property.country === 'wales') {
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
  } else if (caseType === 'tenancy_agreement') {
    score = 65;

    const hasProperty =
      hasText(facts.property.address_line1) ||
      hasText(facts.property.address?.line1) ||
      hasText((facts as any).property_address_line1);
    const hasPostcode =
      hasText(facts.property.postcode) ||
      hasText(facts.property.address?.postcode) ||
      hasText((facts as any).property_address_postcode);
    const hasLandlord = hasText(facts.parties.landlord.name) || hasText((facts as any).landlord_full_name);
    const hasTenant =
      facts.parties.tenants.some((tenant) => hasText(tenant.name)) ||
      (Array.isArray((facts as any).tenants) && (facts as any).tenants.length > 0);
    const hasRent = Boolean(facts.tenancy.rent_amount && facts.tenancy.rent_amount > 0);
    const hasStartDate = hasText(facts.tenancy.start_date) || hasText((facts as any).tenancy_start_date);

    if (hasProperty && hasPostcode) score += 8;
    else {
      compliance.push('Check the property address and postcode before generating the agreement.');
      score -= 8;
    }

    if (hasLandlord) score += 7;
    else {
      compliance.push('Add the landlord name exactly as it should appear in the agreement.');
      score -= 7;
    }

    if (hasTenant) score += 7;
    else {
      compliance.push('Add every tenant or occupier who should be named in the agreement.');
      score -= 7;
    }

    if (hasRent) score += 5;
    else {
      compliance.push('Check the rent amount and payment frequency before generating the agreement.');
      score -= 5;
    }

    if (hasStartDate) score += 5;
    else {
      compliance.push('Add the tenancy start date before generating the agreement.');
      score -= 5;
    }

    if ((facts.tenancy as any).deposit_taken === true && facts.tenancy.deposit_protected === false) {
      compliance.push('If a deposit is taken, make sure the deposit protection and prescribed information steps are completed on time.');
    }
  } else if (caseType === 'rent_increase') {
    score = 65;

    const section13 = (facts as any).section13 || {};
    const currentRent =
      Number(section13?.tenancy?.currentRentAmount || section13?.current_rent_amount || facts.tenancy.rent_amount || 0);
    const proposedRent =
      Number(section13?.proposal?.proposedRentAmount || section13?.proposed_rent_amount || (facts as any).new_rent_amount || 0);
    const effectiveDate =
      section13?.proposal?.proposedStartDate ||
      section13?.proposal?.effectiveDate ||
      section13?.proposed_start_date ||
      (facts as any).rent_increase_effective_date;
    const serviceDate =
      section13?.proposal?.serviceDate ||
      section13?.notice_service_date ||
      (facts as any).notice_service_date;

    if (currentRent > 0) score += 6;
    else {
      compliance.push('Check the current rent before preparing the Section 13 notice.');
      score -= 6;
    }

    if (proposedRent > 0) score += 6;
    else {
      compliance.push('Add the proposed rent before preparing the Section 13 notice.');
      score -= 6;
    }

    if (hasText(effectiveDate)) score += 6;
    else {
      compliance.push('Add the date the new rent should start so the Form 4A timing can be checked.');
      score -= 6;
    }

    if (hasText(serviceDate)) score += 4;
    else {
      compliance.push('Record the expected service date and method so the Section 13 service record is complete.');
    }
  } else {
    // =======================================
    // Eviction/readiness scoring
    // =======================================
    const selectedGroundIds = getSelectedSection8GroundIds(facts);
    const hasSelectedGrounds = selectedGroundIds.length > 0;
    const hasGround8 = selectedGroundIds.includes('8');
    const hasArrearsSchedule = facts.issues.rent_arrears.arrears_items.length > 0;
    const monthlyRent = getMonthlyRentForScoring(facts);
    const ground8Threshold = monthlyRent ? monthlyRent * 3 : null;

    if (arrears > 0) {
      score += 10;
    } else if (hasArrearsFlag) {
      score += 5;
    }

    if (hasArrearsSchedule) {
      score += 5;
    } else if (arrears > 0 || hasArrearsFlag) {
      compliance.push(
        'Add a rent schedule showing each rent period, amount due and amount paid so the arrears evidence is court-ready.'
      );
      score -= 5;
    }

    if (hasSelectedGrounds) {
      score += 5;
    } else {
      compliance.push('Select the possession grounds relied on so the notice and court claim can be assessed properly.');
      score -= 5;
    }

    if (hasGround8 && ground8Threshold !== null) {
      if (arrears >= ground8Threshold) {
        score += 5;
      } else {
        red_flags.push('Ground 8 is selected but the arrears appear below the current three-month rent threshold.');
        score -= 10;
      }
    } else if (hasGround8) {
      compliance.push('Add the rent amount and frequency so Ground 8 threshold strength can be checked.');
    }

    if (facts.notice.notice_date) {
      score += 5;
    } else {
      red_flags.push(
        'No notice date recorded – check that the correct notice has been served before issuing proceedings.'
      );
    }

    if (facts.notice.service_date || facts.notice.service_method) {
      score += 5;
    } else {
      compliance.push('Add the notice service date and method so service evidence can be checked.');
    }

    const hasCoreParties =
      hasText(facts.parties.landlord.name) &&
      facts.parties.tenants.some((tenant) => hasText(tenant.name)) &&
      (hasText(facts.property.address_line1) || hasText(facts.property.address?.line1)) &&
      (hasText(facts.property.postcode) || hasText(facts.property.address?.postcode));

    if (hasCoreParties) {
      score += 5;
    } else {
      compliance.push('Complete landlord, tenant and property details so the court-facing forms are fully populated.');
      score -= 5;
    }

    if (evidence.tenancy_agreement_uploaded || evidence.other_evidence_uploaded) {
      score += 5;
    } else {
      compliance.push('Have the tenancy agreement, rent account and any correspondence ready for the court bundle.');
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

  // Pre-action letter status - check the correct fields from PreActionSection
  // User selected "Yes, I've already sent it": letter_before_claim_sent=true OR pap_letter_date is set
  // User selected "No, generate for me": generate_pap_documents=true
  const lbaSent = facts.money_claim.letter_before_claim_sent === true ||
    facts.money_claim.pap_letter_date ||
    facts.money_claim.lba_sent;
  const willGenerateLetter = facts.money_claim.generate_pap_documents === true;
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
    // Evidence documents are no longer uploaded in the wizard. They should be
    // held ready for filing or a defended claim, but they are not prerequisites
    // for generating the pack.
    // Pre-action is satisfied if: already sent OR we'll generate it for them
    if (!lbaSent && !papServed && !willGenerateLetter) {
      missing_prerequisites.push('Pre-action demand / Letter Before Claim');
    }
  }

  let pre_action_status: 'complete' | 'partial' | 'missing' | null = null;
  if (isMoneyClaim) {
    if ((lbaSent || papServed) && preActionConfirmed) {
      pre_action_status = 'complete';
    } else if (lbaSent || papServed || willGenerateLetter) {
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
    // Interest: only include if user explicitly opted in
    charge_interest: facts.money_claim.charge_interest === true,
    interest_rate: facts.money_claim.charge_interest === true ? facts.money_claim.interest_rate : null,
    interest_start_date: facts.money_claim.charge_interest === true ? facts.money_claim.interest_start_date : null,
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
    positives.push('PAP Debt paperwork is recorded or will be generated; wait the response period before issuing.');
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
      message: `You still need: ${item}. Add this before relying on the claim pack.`,
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
      lower.includes('30-day pap') ||
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
  } else if (blockers.length === 0 && risks.length === 0 && strengthScore >= 75 && arrears > 0) {
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
  jurisdiction: string,
  caseType: string = 'eviction'
) {
  if (!question) return null;

  const { score, red_flags, compliance } = computeStrength(facts, caseType);
  const summary = buildCaseSummary(facts, jurisdiction);
  const arrears = facts.issues.rent_arrears.total_arrears;
  // Interest: only show if user explicitly opted in via charge_interest === true
  const claimInterest = facts.money_claim.charge_interest === true;
  const interestRate = claimInterest ? (facts.money_claim.interest_rate ?? 8) : null;
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
        ' On the information you have given, the claim looks broadly ready to prepare, provided your evidence matches your answers and any required PAP response period has run before you issue.';
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

  // Interest line: only include if user explicitly opted in
  const interestLine = claimInterest && interestRate
    ? ` We apply a simple ${interestRate}% per annum statutory interest line with a daily rate in the particulars where permitted.` +
      ' You can adjust the dates or amounts in the wizard and regenerate the documents if your figures change.'
    : '';

  const disclaimer =
    ' This explanation is for information only and is not legal advice. Courts make their own decisions, and a strong claim on paper can still be defended or refused if the facts or evidence do not support it.';

  return [baseSummary, strengthLine, issuesLine, readinessLine, interestLine, disclaimer]
    .filter(Boolean)
    .join(' ');
}

export async function POST(request: Request) {
  try {
    logSupabaseAdminDiagnostics({ route: '/api/wizard/analyze', writesUsingAdmin: true });
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

    // Use admin client to bypass RLS - we do our own access control below
    const adminSupabase = createSupabaseAdminClient();

    // Fetch the case using admin client (bypasses RLS)
    const { data, error: caseError } = await adminSupabase
      .from('cases')
      .select('*')
      .eq('id', case_id)
      .single();

    if (caseError || !data) {
      console.error('Case not found:', caseError);
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    // Type assertion for the case record properties we need
    const caseData = data as {
      id: string;
      jurisdiction: string;
      case_type: string;
      user_id: string | null;
      wizard_progress: number | null;
    };

    const accessError = assertCaseReadAccess({
      request,
      user,
      caseRow: caseData as { user_id: string | null; session_token?: string | null },
    });

    if (accessError) {
      console.error('Access denied to case:', { case_id, userId: user?.id, caseUserId: caseData.user_id });
      return accessError;
    }

    let canonicalJurisdiction = normalizeJurisdiction(caseData.jurisdiction);

    // Load flat WizardFacts from DB and convert to nested CaseFacts for analysis
    const wizardFacts = await getOrCreateWizardFacts(adminSupabase, case_id);
    const facts = wizardFactsToCaseFacts(wizardFacts);
    if ((wizardFacts as any)?.section13) {
      (facts as any).section13 = (wizardFacts as any).section13;
    }

    if (!canonicalJurisdiction) {
      canonicalJurisdiction =
        normalizeJurisdiction((caseData as any)?.property_location) ||
        normalizeJurisdiction(facts.property.country as string | null);
    }

    if (canonicalJurisdiction === 'england' && facts.property.country === 'wales') {
      canonicalJurisdiction = 'wales';
    }

    if (!canonicalJurisdiction) {
      return NextResponse.json(
        {
          error: 'INVALID_JURISDICTION',
          message: 'Jurisdiction must be one of england, wales, scotland, or northern-ireland.',
        },
        { status: 400 }
      );
    }

    // Northern Ireland gating: only tenancy agreements are supported
    if (canonicalJurisdiction === 'northern-ireland' && caseData.case_type !== 'tenancy_agreement') {
      return NextResponse.json(
        {
          // IMPORTANT: stable machine-readable code (no imports inside the handler)
          code: 'NI_EVICTION_MONEY_CLAIM_NOT_SUPPORTED',
          error: 'NI_EVICTION_MONEY_CLAIM_NOT_SUPPORTED',
          user_message:
            'Northern Ireland: tenancy agreements only (eviction notices planned). England & Wales and Scotland support evictions (notices and court packs) and money claims where available.',
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

    const evidence = normaliseEvidence(facts);
    facts.evidence.tenancy_agreement_uploaded = evidence.tenancy_agreement_uploaded;
    facts.evidence.rent_schedule_uploaded = evidence.rent_schedule_uploaded;
    facts.evidence.bank_statements_uploaded = evidence.bank_statements_uploaded;
    facts.evidence.other_evidence_uploaded = evidence.other_evidence_uploaded;
    const evidence_overview = {
      tenancy_agreement_uploaded: evidence.tenancy_agreement_uploaded,
      rent_schedule_uploaded: evidence.rent_schedule_uploaded,
      correspondence_uploaded: evidence.correspondence_uploaded,
      damage_photos_uploaded: evidence.damage_photos_uploaded,
      authority_letters_uploaded: evidence.authority_letters_uploaded,
      bank_statements_uploaded: evidence.bank_statements_uploaded,
      other_evidence_uploaded: evidence.other_evidence_uploaded,
      files: evidence.files,
    };

    const route = computeRoute(facts, canonicalJurisdiction, caseData.case_type, wizardFacts);
    const product =
      (facts.meta?.product as string | undefined) ||
      (facts.meta?.original_product as string | undefined) ||
      (caseData as any)?.product ||
      (caseData.case_type === 'eviction' ? 'complete_pack' : caseData.case_type);
    const { score, red_flags, compliance } = computeStrength(facts, caseData.case_type);
    const summary = buildCaseSummary(facts, canonicalJurisdiction);
    const askHeavenAnswer = craftAskHeavenAnswer(
      question,
      facts,
      canonicalJurisdiction,
      caseData.case_type
    );

    // NEW: compute structured case_health block for the UI (money-claim aware)
    const caseHealth = buildCaseHealth(
      facts,
      canonicalJurisdiction,
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
          jurisdiction: canonicalJurisdiction,
          product: facts.meta.product as any || 'notice_only',
          case_type: 'eviction',
          facts,
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

    // Ground-aware evidence suggestions for eviction cases
    // Only show suggestions relevant to the user's selected grounds
    if (caseData.case_type === 'eviction') {
      // Get user's selected grounds from wizard facts
      const selectedGrounds: string[] = getSelectedGrounds(wizardFacts as any);
      const normalizeGround = (g: string) => g.replace(/^ground\s*/i, '').trim();
      const normalizedSelectedGrounds = selectedGrounds.map(normalizeGround);

      // Check if arrears grounds (8, 10, 11) are selected
      const hasArrearsGrounds = normalizedSelectedGrounds.some(g => ['8', '10', '11'].includes(g));
      // Check if damage/deterioration grounds (13, 15) are selected
      const hasDamageGrounds = normalizedSelectedGrounds.some(g => ['13', '15'].includes(g));
      // Check if ASB grounds (14, 14ZA) are selected
      const hasASBGrounds = normalizedSelectedGrounds.some(g => ['14', '14ZA', '14A'].includes(g));

      // Tenancy agreement is always relevant
      if (!evidence.tenancy_agreement_uploaded) {
        compliance.push('If you have it, a copy of your tenancy agreement will strengthen your case.');
      }

      // Rent schedule only relevant for arrears grounds
      if (hasArrearsGrounds && !evidence.rent_schedule_uploaded) {
        compliance.push('A detailed rent schedule showing arrears will support your arrears claim.');
      }

      // Correspondence is generally useful but phrased conditionally
      if (!evidence.correspondence_uploaded) {
        compliance.push('If available, correspondence with the tenant about the issues can support your case.');
      }

      // Damage photos only relevant for damage/deterioration grounds
      if (hasDamageGrounds && !evidence.damage_photos_uploaded) {
        compliance.push('Photographs of damage will support your property deterioration claim.');
      }

      // Council/police letters only relevant for ASB grounds
      if (hasASBGrounds && !evidence.authority_letters_uploaded) {
        compliance.push('Council or police correspondence will significantly strengthen your ASB case.');
      }
    }

    // ROUTE INTENT PRIORITY LOGIC:
    // For notice_only product: ALWAYS use decision engine auto-routing (no user override)
    // If S21 is blocked, auto-route to S8 (or Notice to Leave in Scotland)
    // For complete_pack: Use decision engine recommendation

    let finalRecommendedRoute: string | null = null;
    let route_override: {
      from?: string;
      to: string;
      reason: string;
      blocking_issues?: string[];
    } | null = null;

    if (product === 'notice_only' && decisionEngineOutput) {
      // NOTICE_ONLY: Respect user's explicit route selection when that route is allowed
      // Only auto-route when user's selection is blocked or no explicit selection made

      const allowedRoutes = decisionEngineOutput.allowed_routes || [];
      const recommendedRoute = decisionEngineOutput.recommended_routes[0] || null;
      const blockedRoutes = decisionEngineOutput.blocked_routes || [];

      // Check for user's explicit route selection (eviction_route from CaseBasicsSection)
      const userExplicitRoute = (wizardFacts as any).eviction_route ||
                                (wizardFacts as any).selected_notice_route ||
                                null;

      // If user explicitly selected a route and it's allowed, use it
      if (userExplicitRoute && !blockedRoutes.includes(userExplicitRoute)) {
        finalRecommendedRoute = userExplicitRoute;

        // If decision engine recommended a different route, log it but respect user choice
        if (recommendedRoute && recommendedRoute !== userExplicitRoute) {
          console.log(`[NOTICE_ONLY] User explicitly selected ${userExplicitRoute}, respecting choice (decision engine recommended ${recommendedRoute})`);
        }
      }
      // If user selected a blocked route, auto-route to alternative
      else if (userExplicitRoute && blockedRoutes.includes(userExplicitRoute)) {
        const fallbackRoute =
          userExplicitRoute === 'section_21'
            ? 'section_8'
            : userExplicitRoute === 'section_8' && allowedRoutes.includes('section_21')
            ? 'section_21'
            : recommendedRoute || (canonicalJurisdiction === 'scotland'
              ? 'notice_to_leave'
              : canonicalJurisdiction === 'wales'
              ? 'wales_section_173'
              : 'section_8');
        finalRecommendedRoute = fallbackRoute;

        const blockingIssues = decisionEngineOutput.blocking_issues
          .filter(b => b.route === userExplicitRoute && b.severity === 'blocking')
          .map(b => b.description);

        const routeExplanation = decisionEngineOutput.route_explanations?.[userExplicitRoute as keyof typeof decisionEngineOutput.route_explanations] ||
          `${userExplicitRoute.replace('_', ' ')} is not available due to compliance issues.`;

        route_override = {
          from: userExplicitRoute,
          to: fallbackRoute,
          reason: routeExplanation,
          blocking_issues: blockingIssues.length > 0 ? blockingIssues : undefined,
        };
      }
      // If S21 is blocked (legacy check for when no explicit selection)
      else if (blockedRoutes.includes('section_21')) {
        const fallbackRoute =
          canonicalJurisdiction === 'scotland'
            ? 'notice_to_leave'
            : canonicalJurisdiction === 'wales'
            ? 'wales_section_173'
            : 'section_8';
        finalRecommendedRoute = fallbackRoute;

        const blockingIssues = decisionEngineOutput.blocking_issues
          .filter(b => b.route === 'section_21' && b.severity === 'blocking')
          .map(b => b.description);

        const routeExplanation = decisionEngineOutput.route_explanations?.section_21 ||
          'Section 21 is not available due to compliance issues.';

        route_override = {
          from: 'section_21',
          to: fallbackRoute,
          reason: routeExplanation,
          blocking_issues: blockingIssues.length > 0 ? blockingIssues : undefined,
        };
      } else if (recommendedRoute) {
        // No explicit user selection - use decision engine recommendation
        finalRecommendedRoute = recommendedRoute;
      } else if (allowedRoutes.length > 0) {
        // Fallback to first allowed route
        finalRecommendedRoute = allowedRoutes[0];
      } else {
        // Ultimate fallback
        finalRecommendedRoute =
          canonicalJurisdiction === 'scotland'
            ? 'notice_to_leave'
            : canonicalJurisdiction === 'wales'
            ? 'wales_section_173'
            : 'section_8';
      }
    } else if (decisionEngineOutput) {
      // For complete_pack: Respect user's explicit route selection if valid
      // Check both selected_notice_route and eviction_route (user's Case Basics selection)
      const userSelectedRoute = (wizardFacts as any).selected_notice_route ||
                                 (wizardFacts as any).eviction_route ||
                                 null;
      const allowedRoutes = decisionEngineOutput.allowed_routes || [];
      const blockedRoutes = decisionEngineOutput.blocked_routes || [];

      if (userSelectedRoute) {
        // User explicitly selected a route - use it if allowed
        if (blockedRoutes.includes(userSelectedRoute)) {
          // User's selected route is blocked - auto-route to alternative
          const fallbackRoute =
            userSelectedRoute === 'section_21'
              ? 'section_8'
              : userSelectedRoute === 'section_8'
              ? (allowedRoutes.includes('section_21') ? 'section_21' : 'section_8')
              : decisionEngineOutput.recommended_routes[0] || route;

          finalRecommendedRoute = fallbackRoute;

          const blockingIssues = decisionEngineOutput.blocking_issues
            .filter(b => b.route === userSelectedRoute && b.severity === 'blocking')
            .map(b => b.description);

          route_override = {
            from: userSelectedRoute,
            to: fallbackRoute,
            reason: decisionEngineOutput.route_explanations?.[userSelectedRoute as keyof typeof decisionEngineOutput.route_explanations] ||
              `${userSelectedRoute.replace('_', ' ')} is not available due to compliance issues.`,
            blocking_issues: blockingIssues.length > 0 ? blockingIssues : undefined,
          };
        } else {
          // User's selected route is allowed - use it
          finalRecommendedRoute = userSelectedRoute;
        }
      } else {
        // No explicit user selection - use decision engine recommendation
        finalRecommendedRoute = decisionEngineOutput.recommended_routes[0] || route;
      }
    } else {
      // Fallback if no decision engine output
      finalRecommendedRoute = route;
    }

    if (
      caseData.case_type === 'eviction' &&
      canonicalJurisdiction === 'england' &&
      finalRecommendedRoute === 'section_8' &&
      product === 'notice_only' &&
      decisionEngineOutput
    ) {
      const post2026Validation = validateEnglandPost2026WizardFacts(wizardFacts as Record<string, any>);
      const post2026BlockingIssues = post2026Validation.blockingIssues.map((issue) => ({
        route: 'section_8',
        issue: issue.code,
        description: issue.message,
        action_required: issue.code === 'NOTICE_PERIOD_TOO_SHORT'
          ? 'Update the notice expiry date in Final notice service details.'
          : 'Update the highlighted notice answers before continuing.',
        severity: 'blocking' as const,
        legal_basis: issue.legalBasis,
        fields: issue.fields,
        affected_question_id: issue.code === 'NOTICE_PERIOD_TOO_SHORT'
          ? 'notice_expiry_date'
          : issue.fields[0],
        target_step: issue.code === 'NOTICE_PERIOD_TOO_SHORT'
          ? 'review'
          : undefined,
      }));

      if (post2026BlockingIssues.length > 0) {
        const existingKeys = new Set(
          decisionEngineOutput.blocking_issues.map((issue) => `${issue.route}:${issue.issue}`),
        );
        decisionEngineOutput = {
          ...decisionEngineOutput,
          blocking_issues: [
            ...decisionEngineOutput.blocking_issues,
            ...post2026BlockingIssues.filter((issue) => !existingKeys.has(`${issue.route}:${issue.issue}`)),
          ],
        };
      }
    }

    const routeScopedDecisionEngineOutput: RouteScopedDecisionOutput | null =
      caseData.case_type === 'eviction'
        ? augmentDecisionOutputWithRouteScope(decisionEngineOutput, finalRecommendedRoute || route)
        : null;

    routeScopedDecisionEngineOutput?.selected_route_blocking_issues.forEach((issue) => {
      red_flags.push(formatBlockingIssueAsRedFlag(issue));
    });

    await adminSupabase
      .from('cases')
      .update({
        recommended_route: finalRecommendedRoute,
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
      requiredToFile?: boolean;
    }[] = [];

    if (caseData.case_type === 'eviction') {
      const isNoticeOnly = product === 'notice_only';
      if (canonicalJurisdiction === 'scotland') {
        previewDocuments.push(
          { id: 'notice_to_leave', document_type: 'notice', document_title: 'Notice to Leave' },
          {
            id: 'form_e',
            document_type: 'tribunal_form',
            document_title: 'Form E (application)',
            requiredToFile: !isNoticeOnly,
          },
          {
            id: 'guidance',
            document_type: 'guidance',
            document_title: 'Eviction roadmap & service checklist',
          },
        );
      } else if (canonicalJurisdiction === 'wales') {
        previewDocuments.push(
          {
            id: 'rhw16_or_rhw17',
            document_type: 'notice',
            document_title: 'Section 173 notice (RHW16/17)',
          },
          {
            id: 'rhw23',
            document_type: 'notice',
            document_title: 'RHW23 breach notice',
          },
          {
            id: 'service_proofs',
            document_type: 'guidance',
            document_title: 'Service checklist & certificates of service',
          },
        );
      } else {
        // England: Show route-specific notices based on recommended route
        const isEnglandPost2026Route = canonicalJurisdiction === 'england';
        const isSection21Route = finalRecommendedRoute === 'section_21' ||
                                  finalRecommendedRoute === 'accelerated_possession' ||
                                  finalRecommendedRoute === 'accelerated_section21';
        const isSection8Route = finalRecommendedRoute === 'section_8' ||
                                 finalRecommendedRoute === 'section8_notice';

        if (isEnglandPost2026Route) {
          previewDocuments.push(
            {
              id: 's8_notice',
              document_type: 'notice',
            document_title: 'Form 3A notice',
            },
          );
        } else if (isSection21Route) {
          previewDocuments.push(
            {
              id: 's21_notice',
              document_type: 'notice',
              document_title: 'Section 21 notice (Form 6A)',
            },
          );
        } else if (isSection8Route) {
          previewDocuments.push(
            {
              id: 's8_notice',
              document_type: 'notice',
            document_title: 'Form 3A notice',
            },
          );
        } else {
          // Fallback: show both if route is unclear
          previewDocuments.push(
            {
              id: 's8_notice',
              document_type: 'notice',
              document_title: canonicalJurisdiction === 'england'
            ? 'Form 3A notice'
                : 'Section 8 notice',
            },
          );
        }

        previewDocuments.push(
          {
            id: 'service_proofs',
            document_type: 'guidance',
            document_title: 'Service checklist & certificates of service',
          },
        );

        if (!isNoticeOnly) {
          previewDocuments.push(
            {
              id: 'n5',
              document_type: 'court_form',
              document_title: 'N5 claim form',
              requiredToFile: true,
            },
            {
              id: 'n119',
              document_type: 'court_form',
              document_title: 'N119 particulars of claim',
              requiredToFile: true,
            },
          );
        }
      }
    }

        // Get law profile for version tracking and legal metadata
    const law_profile = getLawProfile(canonicalJurisdiction, caseData.case_type);

    // Derived fields for final analysis UI (non-blocking, informative only)
    const case_strength_band =
      score >= 70 ? 'strong' : score >= 40 ? 'medium' : score > 0 ? 'weak' : 'unknown';

    let is_court_ready: boolean | null = null;
    let readiness_summary: string | null = null;
    let drafting_preview:
      | { title: string; paragraphs: string[]; checklist: string[] }
      | null = null;
    // Use finalRecommendedRoute for the label since that's what's actually recommended
    const effectiveRoute = finalRecommendedRoute || route;
    let recommended_route_label: string = effectiveRoute;

    // Human-friendly route labels for the UI
    if (caseData.case_type === 'eviction') {
      if (canonicalJurisdiction === 'england') {
        if (effectiveRoute === 'section_21') {
          recommended_route_label =
            'Legacy Section 21 route (not used for England private-rented claims on or after 1 May 2026)';
        } else if (effectiveRoute === 'section_8') {
          recommended_route_label = 'England possession route (Form 3A notice plus N5/N119 claim pack)';
        } else if (effectiveRoute === 'notice_only') {
          recommended_route_label = 'Notice-only route (serve Form 3A now, claim later)';
        } else if (effectiveRoute === 'standard_possession') {
          recommended_route_label = 'England possession route (Form 3A notice plus N5/N119 claim pack)';
        }
      } else if (canonicalJurisdiction === 'wales') {
        if (effectiveRoute === 'wales_section_173') {
          recommended_route_label = 'Section 173 notice (no fault)';
        } else if (effectiveRoute === 'wales_fault_based') {
          recommended_route_label = 'Section 157/159 breach notice (RHW23)';
        }
      } else if (canonicalJurisdiction === 'scotland') {
        if (effectiveRoute === 'notice_to_leave') {
          recommended_route_label = 'Notice to Leave + Form E (First-tier Tribunal)';
        }
      }
    } else if (caseData.case_type === 'money_claim') {
      recommended_route_label = 'Money claim (County Court / Simple Procedure)';
    } else if (caseData.case_type === 'tenancy_agreement') {
      recommended_route_label = 'Tenancy agreement document pack';
    } else if (caseData.case_type === 'rent_increase') {
      recommended_route_label =
        effectiveRoute === 'section13_defensive'
          ? 'Section 13 tribunal-ready rent increase pack'
          : 'Section 13 supported rent increase pack';
    }

    // Readiness flags - NEVER used to block generation or payment, only for messaging
    if (caseData.case_type === 'eviction' && routeScopedDecisionEngineOutput) {
      const hasBlocking = routeScopedDecisionEngineOutput.selected_route_has_blockers;
      is_court_ready = !hasBlocking;

      if (hasBlocking) {
        readiness_summary =
          product === 'notice_only'
            ? 'You are not fully ready to file your claim today. We will generate your notice pack and service guidance, and highlight what to fix before issuing a claim.'
            : 'You are not fully ready to file your claim today. We will still generate your full eviction pack, including notices, court forms, and a procedural guide to help you fix the issues identified.';
      } else {
        readiness_summary =
          product === 'notice_only'
            ? 'You appear ready to serve notice based on the information provided. We will generate your notice pack with service checklist and evidence prompts.'
            : 'You appear ready to file your claim based on the information provided. We will generate your full eviction pack with court forms, notices, and a filing checklist.';
      }
    } else if (caseHealth) {
      // Money-claim case health
      is_court_ready = caseHealth.overall_status === 'ready_to_issue';
      if (caseHealth.overall_status === 'ready_to_issue') {
        readiness_summary =
          'Your money claim looks ready to prepare from the answers provided. We will generate the claim pack, evidence prompts, PAP-Debt documents, and filing checklist; check the documents against your records before issuing.';
      } else if (caseHealth.overall_status === 'needs_work') {
        readiness_summary =
          'Your money claim can still be prepared, but a few details should be checked before issuing. We will generate the pack and highlight the points to review.';
      }
    } else if (caseData.case_type === 'tenancy_agreement') {
      is_court_ready = red_flags.length === 0;
      readiness_summary =
        compliance.length > 0
          ? 'Your tenancy agreement can be prepared from the answers provided. Check the highlighted setup points before you sign or serve the pack.'
          : 'Your tenancy agreement answers look ready for document generation. Check the final agreement against your records before signing.';
    } else if (caseData.case_type === 'rent_increase') {
      is_court_ready = red_flags.length === 0;
      readiness_summary =
        compliance.length > 0
          ? 'Your Section 13 rent increase pack can be prepared, but check the highlighted timing, rent, and service points before serving.'
          : 'Your Section 13 rent increase answers look ready for document generation. Check the Form 4A, market evidence, and service record before serving.';
    }

    const wf = wizardFacts as any;

    if (caseData.case_type === 'eviction' && canonicalJurisdiction === 'england' && effectiveRoute === 'section_8') {
      const selectedGrounds = getSelectedGrounds(wizardFacts as any);

      if (selectedGrounds.length > 0) {
        const draftingContext = enrichEnglandSection8SupportContext({
          ...wf,
          property_address:
            wf?.property_address ||
            [
              facts.property?.address_line1,
              facts.property?.address_line2,
              facts.property?.city,
              facts.property?.postcode,
            ]
              .filter((part): part is string => typeof part === 'string' && part.trim().length > 0)
              .join(', '),
          landlord_full_name: wf?.landlord_full_name || facts.parties?.landlord?.name,
          tenant_full_name: wf?.tenant_full_name || facts.parties?.tenants?.[0]?.name,
          court_name: wf?.court_name || 'County Court',
          ground_codes: selectedGrounds,
          selected_grounds: selectedGrounds,
          tenancy_start_date: wf?.tenancy_start_date || facts.tenancy?.start_date,
          notice_service_date: wf?.notice_served_date || wf?.service_date || wf?.notice_date,
          notice_expiry_date: wf?.notice_expiry_date || wf?.earliest_possession_date,
          earliest_proceedings_date:
            wf?.earliest_proceedings_date || wf?.notice_expiry_date || wf?.earliest_possession_date,
          rent_amount: wf?.rent_amount || facts.tenancy?.rent_amount,
          rent_frequency: wf?.rent_frequency || facts.tenancy?.rent_frequency,
          total_arrears: wf?.total_arrears || facts.issues?.rent_arrears?.total_arrears,
        });

        drafting_preview = {
          title: draftingContext.preview_summary.shortTitle,
          paragraphs: draftingContext.preview_summary.narrativeParagraphs,
          checklist: draftingContext.preview_summary.readinessItems,
        };
      }
    }

    // Build case_facts object for review page consumption
    // Contains persisted wizard facts relevant to grounds selection and review display
    // IMPORTANT: Include Section 21 compliance fields for Review page validation
    const caseFacts = {
      section8_grounds: getSelectedGrounds(wizardFacts as any),
      include_recommended_grounds: wf?.include_recommended_grounds || false,
      // Check both flat and nested locations for arrears_items (notice_only stores in nested location)
      arrears_items: wf?.arrears_items ||
                     wf?.issues?.rent_arrears?.arrears_items || [],
      recommended_grounds: routeScopedDecisionEngineOutput?.recommended_grounds || decisionEngineOutput?.recommended_grounds || [],
      jurisdiction: canonicalJurisdiction,
      eviction_route: wf?.eviction_route || null,
      selected_notice_route: wf?.selected_notice_route || null,
      // Wales fault-based grounds for document list display
      wales_fault_grounds: wf?.wales_fault_grounds || [],

      // Section 21 compliance fields - CRITICAL for Review page validation
      // These fields may be at top-level or nested in compliance/section21/property containers
      // The Review page uses buildSection21ValidationInputFromFacts() which expects these fields
      deposit_taken: wf?.deposit_taken ?? wf?.compliance?.deposit_taken ?? wf?.tenancy?.deposit_taken,
      deposit_amount: wf?.deposit_amount ?? wf?.compliance?.deposit_amount ?? wf?.tenancy?.deposit_amount,
      deposit_protected: wf?.deposit_protected ?? wf?.deposit_protected_scheme ?? wf?.compliance?.deposit_protected,
      deposit_scheme: wf?.deposit_scheme ?? wf?.deposit_scheme_name ?? wf?.compliance?.deposit_scheme,
      prescribed_info_served: wf?.prescribed_info_served ?? wf?.prescribed_info_given ?? wf?.compliance?.prescribed_info_served,

      // Gas safety
      has_gas_appliances: wf?.has_gas_appliances ?? wf?.property_has_gas ?? wf?.property?.has_gas_appliances,
      gas_safety_cert_served: wf?.gas_safety_cert_served ?? wf?.gas_certificate_provided ?? wf?.compliance?.gas_safety_cert_served,

      // EPC - support both key variants
      epc_served: wf?.epc_served ?? wf?.epc_provided ?? wf?.compliance?.epc_served ?? wf?.property?.epc_served,
      epc_provided: wf?.epc_provided ?? wf?.epc_served ?? wf?.compliance?.epc_provided ?? wf?.property?.epc_provided,

      // How to Rent - support all key variants
      how_to_rent_served: wf?.how_to_rent_served ?? wf?.how_to_rent_provided ?? wf?.how_to_rent_given ?? wf?.compliance?.how_to_rent_served,
      how_to_rent_provided: wf?.how_to_rent_provided ?? wf?.how_to_rent_served ?? wf?.how_to_rent_given ?? wf?.compliance?.how_to_rent_provided,

      // Licensing
      licensing_required: wf?.licensing_required ?? wf?.property?.licensing_required,
      has_valid_licence: wf?.has_valid_licence ?? wf?.has_license ?? wf?.property?.has_valid_licence,

      // Retaliatory eviction
      improvement_notice_served: wf?.improvement_notice_served ?? wf?.compliance?.improvement_notice_served,
      no_retaliatory_notice: wf?.no_retaliatory_notice ?? wf?.compliance?.no_retaliatory_notice,

      // Tenancy dates
      tenancy_start_date: wf?.tenancy_start_date ?? wf?.tenancy?.start_date,

      // =========================================================================
      // TENANCY AGREEMENT FIELDS (TenancySectionFlow)
      // These fields are used by TenancyReviewContent for validation and display
      // =========================================================================

      // Property address - TenancySectionFlow uses separate fields
      property_address: wf?.property_address ?? wf?.property_full_address,
      property_address_line1: wf?.property_address_line1 ?? wf?.property?.address_line1,
      property_address_town: wf?.property_address_town ?? wf?.property?.city,
      property_address_postcode: wf?.property_address_postcode ?? wf?.property?.postcode,
      property_type: wf?.property_type,
      number_of_bedrooms: wf?.number_of_bedrooms,
      furnished_status: wf?.furnished_status,

      // Landlord details
      landlord_name: wf?.landlord_name ?? wf?.landlord?.name,
      landlord_full_name: wf?.landlord_full_name ?? wf?.landlord?.full_name,
      landlord_email: wf?.landlord_email ?? wf?.landlord?.email,
      landlord_phone: wf?.landlord_phone ?? wf?.landlord?.phone,
      landlord_address_line1: wf?.landlord_address_line1 ?? wf?.landlord?.address_line1,
      landlord_address_town: wf?.landlord_address_town ?? wf?.landlord?.city,
      landlord_address_postcode: wf?.landlord_address_postcode ?? wf?.landlord?.postcode,

      // Tenants - TenancySectionFlow stores as array with full_name
      tenants: wf?.tenants ?? [],
      number_of_tenants: wf?.number_of_tenants,
      tenant_names: wf?.tenant_names,
      tenant_1_name: wf?.tenant_1_name,

      // Tenancy details
      is_fixed_term: wf?.is_fixed_term ?? wf?.tenancy?.fixed_term,
      tenancy_end_date: wf?.tenancy_end_date ?? wf?.tenancy?.end_date,
      term_length: wf?.term_length,

      // Rent - TenancySectionFlow uses rent_amount and rent_period
      rent_amount: wf?.rent_amount ?? wf?.tenancy?.rent_amount,
      rent_period: wf?.rent_period ?? wf?.rent_frequency ?? wf?.tenancy?.rent_frequency,
      rent_frequency: wf?.rent_frequency ?? wf?.rent_period ?? wf?.tenancy?.rent_frequency,
      rent_due_day: wf?.rent_due_day ?? wf?.tenancy?.rent_due_day,
      payment_method: wf?.payment_method,

      // Product tier (for premium vs standard)
      product_tier: wf?.product_tier ?? wf?.__meta?.product_tier,

      // HMO
      is_hmo: wf?.is_hmo ?? wf?.property?.is_hmo,
      hmo_license_number: wf?.hmo_licence_number ?? wf?.hmo_license_number,

      // Section 13 rent increase fields
      section13: wf?.section13,
      current_rent_amount:
        wf?.section13?.tenancy?.currentRentAmount ?? wf?.current_rent_amount ?? wf?.rent_amount,
      proposed_rent_amount:
        wf?.section13?.proposal?.proposedRentAmount ?? wf?.proposed_rent_amount ?? wf?.new_rent_amount,
      proposed_start_date:
        wf?.section13?.proposal?.proposedStartDate ?? wf?.proposed_start_date ?? wf?.rent_increase_effective_date,
      notice_service_date:
        wf?.section13?.proposal?.serviceDate ?? wf?.notice_service_date,
    };

    return NextResponse.json({
      case_id,
      jurisdiction: canonicalJurisdiction, // Include jurisdiction for UI display
      case_type: caseData.case_type, // Include case_type for UI context
      product,
      recommended_route: finalRecommendedRoute,
      recommended_route_label,
      route_override, // New field for auto-routing explanation
      case_strength_score: score,
      case_strength_band,
      is_court_ready,
      readiness_summary,
      drafting_preview,
      red_flags,
      compliance_issues: compliance,
      evidence_overview,
      preview_documents: previewDocuments,
      case_summary: summary,
      ask_heaven_answer: askHeavenAnswer,
      case_health: caseHealth,
      // Decision engine output (for eviction cases)
      decision_engine: routeScopedDecisionEngineOutput || decisionEngineOutput,
      // Legal change framework metadata
      law_profile,
      // Case facts for review page - contains persisted wizard data
      case_facts: caseFacts,
    });

  } catch (error: any) {
    console.error('Analyze case error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
