/**
 * Decision Engine Module
 *
 * Analyzes case facts and recommends eviction routes, grounds, and flags compliance issues.
 * Based on jurisdiction-specific YAML rules in config/jurisdictions/uk/{jurisdiction}/rules/decision_engine.yaml
 *
 * Audit items addressed: B1 (Create decision-engine module)
 */

import type { CaseFacts } from '../case-facts/schema';

// ============================================================================
// TYPES
// ============================================================================

export interface DecisionInput {
  jurisdiction: 'england-wales' | 'scotland' | 'northern-ireland';
  product: 'notice_only' | 'complete_pack' | 'money_claim';
  case_type: 'eviction' | 'money_claim' | 'tenancy_agreement';
  facts: Partial<CaseFacts>;
}

export interface GroundRecommendation {
  code: string; // e.g. "8", "14", "Ground 1" (Scotland)
  title: string;
  type: 'mandatory' | 'discretionary';
  weight: 'high' | 'medium' | 'low';
  notice_period_days: number | null;
  reasoning: string;
  success_probability: 'very_high' | 'high' | 'medium' | 'low' | 'none';
  red_flags?: string[];
}

export interface BlockingIssue {
  route: 'section_8' | 'section_21' | 'notice_to_leave' | 'form_e' | string;
  issue: string;
  description: string;
  action_required: string;
  severity: 'blocking' | 'warning';
}

export interface DecisionOutput {
  recommended_routes: string[]; // ['section_21', 'section_8']
  recommended_grounds: GroundRecommendation[];
  notice_period_suggestions: {
    section_8?: number;
    section_21?: number;
    notice_to_leave?: number;
  };
  pre_action_requirements: {
    required: boolean;
    met: boolean | null;
    details: string[];
  };
  blocking_issues: BlockingIssue[];
  warnings: string[];
  analysis_summary: string;
}

// ============================================================================
// ENGLAND & WALES DECISION LOGIC
// ============================================================================

function analyzeEnglandWales(input: DecisionInput): DecisionOutput {
  const { facts } = input;
  const output: DecisionOutput = {
    recommended_routes: [],
    recommended_grounds: [],
    notice_period_suggestions: {},
    pre_action_requirements: { required: false, met: null, details: [] },
    blocking_issues: [],
    warnings: [],
    analysis_summary: '',
  };

  // Check Section 21 eligibility and blocking issues
  const s21Blocks: BlockingIssue[] = [];

  // Deposit protection (CRITICAL)
  if (facts.tenancy?.deposit_amount && facts.tenancy.deposit_amount > 0) {
    if (facts.tenancy.deposit_protected !== true) {
      s21Blocks.push({
        route: 'section_21',
        issue: 'deposit_not_protected',
        description: 'Deposit not protected in approved scheme',
        action_required: 'Protect deposit in DPS, MyDeposits, or TDS before serving Section 21',
        severity: 'blocking',
      });
    }
  }

  // Prescribed information (CRITICAL)
  const prescribedInfoGiven = facts.tenancy?.deposit_protection_date ||
    (input.facts as any).prescribed_info_given;
  if (facts.tenancy?.deposit_amount && facts.tenancy.deposit_amount > 0) {
    if (!prescribedInfoGiven) {
      s21Blocks.push({
        route: 'section_21',
        issue: 'prescribed_info_not_given',
        description: 'Prescribed information not given to tenant within 30 days',
        action_required: 'Provide prescribed information before Section 21 is valid',
        severity: 'blocking',
      });
    }
  }

  // Gas safety certificate (CRITICAL)
  const gasCertProvided = (input.facts as any).gas_safety_cert_provided;
  if (gasCertProvided === false) {
    s21Blocks.push({
      route: 'section_21',
      issue: 'gas_safety_not_provided',
      description: 'Gas safety certificate not provided before tenancy start',
      action_required: 'Cannot use Section 21 if gas cert not provided at start',
      severity: 'blocking',
    });
  }

  // How to Rent guide (CRITICAL for England)
  const howToRentGiven = (input.facts as any).how_to_rent_given ||
    (input.facts as any).how_to_rent_guide_provided;
  if (howToRentGiven === false) {
    s21Blocks.push({
      route: 'section_21',
      issue: 'how_to_rent_not_provided',
      description: '"How to Rent" guide not provided at start of tenancy',
      action_required: 'Cannot use Section 21 without providing How to Rent guide',
      severity: 'blocking',
    });
  }

  // EPC provided (CRITICAL)
  const epcProvided = (input.facts as any).epc_provided;
  if (epcProvided === false) {
    s21Blocks.push({
      route: 'section_21',
      issue: 'epc_not_provided',
      description: 'Energy Performance Certificate not provided to tenant',
      action_required: 'Provide EPC before Section 21 is valid',
      severity: 'blocking',
    });
  }

  // HMO licensing (CRITICAL)
  const hmoLicenseRequired = (input.facts as any).hmo_license_required;
  const hmoLicenseValid = (input.facts as any).hmo_license_valid;
  if (hmoLicenseRequired === true && hmoLicenseValid !== true) {
    s21Blocks.push({
      route: 'section_21',
      issue: 'hmo_not_licensed',
      description: 'HMO/selective licence required but not in place',
      action_required: 'Obtain HMO/selective licence before serving Section 21',
      severity: 'blocking',
    });
  }

  output.blocking_issues = s21Blocks;

  // If no blocking issues for S21, recommend it
  if (s21Blocks.length === 0) {
    output.recommended_routes.push('section_21');
    output.notice_period_suggestions.section_21 = 60; // 2 months
  }

  // Analyze Section 8 grounds
  const section8Grounds: GroundRecommendation[] = [];

  // Ground 8: Serious rent arrears
  const totalArrears = facts.issues?.rent_arrears?.total_arrears ?? 0;
  const rentAmount = facts.tenancy?.rent_amount ?? 0;
  const rentFrequency = facts.tenancy?.rent_frequency;

  if (totalArrears > 0 && rentAmount > 0) {
    let arrearsMonths = 0;
    if (rentFrequency === 'monthly') {
      arrearsMonths = totalArrears / rentAmount;
    } else if (rentFrequency === 'weekly') {
      arrearsMonths = (totalArrears / rentAmount) / 4.33;
    }

    if (arrearsMonths >= 2) {
      section8Grounds.push({
        code: '8',
        title: 'Ground 8 - Serious Rent Arrears',
        type: 'mandatory',
        weight: 'high',
        notice_period_days: 14,
        reasoning: 'At least 2 months rent unpaid - mandatory ground if threshold met at notice and hearing',
        success_probability: 'very_high',
        red_flags: ['Arrears must meet threshold at BOTH notice date and hearing date'],
      });
    } else if (arrearsMonths >= 0.5) {
      section8Grounds.push({
        code: '10',
        title: 'Ground 10 - Some Rent Arrears',
        type: 'discretionary',
        weight: 'medium',
        notice_period_days: 14,
        reasoning: 'Some rent unpaid - discretionary ground, court considers reasonableness',
        success_probability: 'medium',
      });
    }

    if (arrearsMonths >= 0.25) {
      section8Grounds.push({
        code: '11',
        title: 'Ground 11 - Persistent Late Payment',
        type: 'discretionary',
        weight: 'medium',
        notice_period_days: 14,
        reasoning: 'Pattern of late payment - can succeed even if arrears small',
        success_probability: 'medium',
      });
    }
  }

  // Ground 14: Antisocial behaviour
  if (facts.issues?.asb?.has_asb === true) {
    section8Grounds.push({
      code: '14',
      title: 'Ground 14 - Nuisance or Antisocial Behaviour',
      type: 'discretionary',
      weight: 'high',
      notice_period_days: 14,
      reasoning: 'ASB - can use immediate notice in serious cases',
      success_probability: 'high',
    });
  }

  // Ground 12: Breach of tenancy
  if (facts.issues?.other_breaches?.has_breaches === true) {
    section8Grounds.push({
      code: '12',
      title: 'Ground 12 - Breach of Tenancy Agreement',
      type: 'discretionary',
      weight: 'medium',
      notice_period_days: 14,
      reasoning: 'Material breach of tenancy terms',
      success_probability: 'medium',
    });
  }

  output.recommended_grounds = section8Grounds;
  if (section8Grounds.length > 0) {
    output.recommended_routes.push('section_8');
    output.notice_period_suggestions.section_8 = 14; // Can be immediate for serious cases
  }

  // Generate analysis summary
  if (s21Blocks.length > 0) {
    output.analysis_summary = `Section 21 is currently BLOCKED due to ${s21Blocks.length} compliance issue(s). `;
  } else {
    output.analysis_summary = `Section 21 is AVAILABLE (all compliance requirements met). `;
  }

  if (section8Grounds.length > 0) {
    const mandatoryGrounds = section8Grounds.filter(g => g.type === 'mandatory');
    if (mandatoryGrounds.length > 0) {
      output.analysis_summary += `Section 8 available with ${mandatoryGrounds.length} MANDATORY ground(s).`;
    } else {
      output.analysis_summary += `Section 8 available with discretionary grounds only.`;
    }
  }

  return output;
}

// ============================================================================
// SCOTLAND DECISION LOGIC
// ============================================================================

function analyzeScotland(input: DecisionInput): DecisionOutput {
  const { facts } = input;
  const output: DecisionOutput = {
    recommended_routes: ['notice_to_leave'], // Scotland only has Notice to Leave
    recommended_grounds: [],
    notice_period_suggestions: {},
    pre_action_requirements: { required: false, met: null, details: [] },
    blocking_issues: [],
    warnings: [],
    analysis_summary: '',
  };

  const grounds: GroundRecommendation[] = [];

  // Ground 1: Rent arrears (REQUIRES PRE-ACTION)
  const totalArrears = facts.issues?.rent_arrears?.total_arrears ?? 0;
  const rentAmount = facts.tenancy?.rent_amount ?? 0;
  const preActionConfirmed = facts.issues?.rent_arrears?.pre_action_confirmed;

  if (totalArrears > 0 && rentAmount > 0) {
    const arrearsMonths = totalArrears / (rentAmount || 1);

    if (arrearsMonths >= 3) {
      if (preActionConfirmed === true) {
        grounds.push({
          code: 'Ground 1',
          title: 'Ground 1 - Rent Arrears',
          type: 'discretionary',
          weight: 'high',
          notice_period_days: 28,
          reasoning: '3+ months arrears with pre-action requirements met',
          success_probability: 'high',
        });
        output.pre_action_requirements = {
          required: true,
          met: true,
          details: ['Pre-action requirements confirmed for rent arrears'],
        };
      } else {
        output.blocking_issues.push({
          route: 'notice_to_leave',
          issue: 'pre_action_not_met',
          description: 'Pre-action requirements not completed for rent arrears eviction',
          action_required: 'Contact tenant about arrears, signpost support, attempt resolution before serving Notice',
          severity: 'blocking',
        });
        output.pre_action_requirements = {
          required: true,
          met: false,
          details: [
            'MUST contact tenant about arrears',
            'MUST signpost to debt advice',
            'MUST attempt reasonable resolution',
          ],
        };
      }
    }
  }

  // Ground 3: Antisocial behaviour
  if (facts.issues?.asb?.has_asb === true) {
    grounds.push({
      code: 'Ground 3',
      title: 'Ground 3 - Antisocial Behaviour',
      type: 'discretionary',
      weight: 'high',
      notice_period_days: 28,
      reasoning: 'ASB - 28 day notice for serious cases',
      success_probability: 'high',
    });
  }

  // Ground 2: Breach of tenancy
  if (facts.issues?.other_breaches?.has_breaches === true) {
    grounds.push({
      code: 'Ground 2',
      title: 'Ground 2 - Breach of Tenancy',
      type: 'discretionary',
      weight: 'medium',
      notice_period_days: 28,
      reasoning: 'Material breach of tenancy terms',
      success_probability: 'medium',
    });
  }

  output.recommended_grounds = grounds;
  output.notice_period_suggestions.notice_to_leave = grounds.length > 0 ?
    Math.max(...grounds.map(g => g.notice_period_days || 84)) : 84;

  output.analysis_summary = `Scotland: ALL grounds are discretionary. First-tier Tribunal has full discretion. `;
  if (output.pre_action_requirements.required) {
    output.analysis_summary += output.pre_action_requirements.met
      ? 'Pre-action requirements MET for rent arrears. '
      : 'Pre-action requirements NOT MET - must complete before Notice to Leave. ';
  }
  output.analysis_summary += `${grounds.length} ground(s) available.`;

  return output;
}

// ============================================================================
// MAIN DECISION ENGINE FUNCTION
// ============================================================================

/**
 * Run the decision engine on a set of case facts.
 * Returns recommended routes, grounds, and compliance issues.
 */
export function runDecisionEngine(input: DecisionInput): DecisionOutput {
  if (!input || !input.jurisdiction) {
    throw new Error('Decision engine requires jurisdiction');
  }

  switch (input.jurisdiction) {
    case 'england-wales':
      return analyzeEnglandWales(input);
    case 'scotland':
      return analyzeScotland(input);
    case 'northern-ireland':
      // NI evictions not yet supported (see docs/NI_EVICTION_STATUS.md)
      return {
        recommended_routes: [],
        recommended_grounds: [],
        notice_period_suggestions: {},
        pre_action_requirements: { required: false, met: null, details: [] },
        blocking_issues: [
          {
            route: 'all',
            issue: 'ni_not_supported',
            description: 'Northern Ireland eviction workflows are not yet supported',
            action_required: 'See docs/NI_EVICTION_STATUS.md for roadmap',
            severity: 'blocking',
          },
        ],
        warnings: [],
        analysis_summary: 'Northern Ireland evictions not yet implemented (Q2 2026 roadmap).',
      };
    default:
      throw new Error(`Unsupported jurisdiction: ${input.jurisdiction}`);
  }
}

/**
 * Check EPC rating for Section 21 eligibility (England & Wales only).
 * Post-April 2020 tenancies require EPC C or above for Section 21.
 */
export function checkEPCForSection21(
  tenancyStartDate: string | null,
  epcRating: string | null
): { warning: string | null; blocked: boolean } {
  if (!tenancyStartDate || !epcRating) {
    return { warning: null, blocked: false };
  }

  const startDate = new Date(tenancyStartDate);
  const cutoffDate = new Date('2020-04-01');

  if (startDate >= cutoffDate) {
    const rating = epcRating.trim().toUpperCase();
    if (!['A', 'B', 'C'].includes(rating[0])) {
      return {
        warning: `EPC rating ${epcRating} may restrict Section 21. Tenancies granted after April 2020 generally require EPC C or above.`,
        blocked: false, // Warning for now, not hard block (enforcement varies)
      };
    }
  }

  return { warning: null, blocked: false };
}
