/**
 * Decision Engine Module
 *
 * Analyzes case facts and recommends eviction routes, grounds, and flags compliance issues.
 * Based on jurisdiction-specific YAML rules in config/jurisdictions/uk/{jurisdiction}/rules/decision_engine.yaml
 *
 * Audit items addressed: B1 (Create decision-engine module)
 */

import type { CaseFacts } from '../case-facts/schema';
import { normalizeJurisdiction, type CanonicalJurisdiction, type LegacyJurisdiction } from '../types/jurisdiction';
import {
  resolveGasCertificateFacts,
  resolveHowToRentFacts,
  resolveEPCFacts,
  resolveLicensingFacts,
} from '../wizard/complianceFactResolvers';

// ============================================================================
// TYPES
// ============================================================================

/**
 * DeepPartial utility type for nested optional properties
 */
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type ValidationStage = 'wizard' | 'checkpoint' | 'preview' | 'generate';

export interface DecisionInput {
  jurisdiction: CanonicalJurisdiction | LegacyJurisdiction; // england-wales allowed for backward compatibility only
  product: 'notice_only' | 'complete_pack' | 'money_claim';
  case_type: 'eviction' | 'money_claim' | 'tenancy_agreement';
  facts: DeepPartial<CaseFacts>;
  stage?: ValidationStage; // Stage-aware validation (wizard=warn, checkpoint/preview/generate=block)
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
  // Alternative property names for compatibility
  ground_number?: number | string;
  ground_title?: string;
  mandatory?: boolean;
  explanation?: string;
  required_evidence?: string[];
  legal_basis?: string;
}

export interface BlockingIssue {
  route: 'section_8' | 'section_21' | 'notice_to_leave' | 'form_e' | string;
  issue: string;
  description: string;
  action_required: string;
  severity: 'blocking' | 'warning';
  legal_basis?: string;
}

export interface DecisionOutput {
  recommended_routes: string[]; // ['section_21', 'section_8'] - AI-suggested best routes
  allowed_routes: string[]; // ['section_21', 'section_8'] - Legally permitted routes (no blocking issues)
  blocked_routes: string[]; // ['section_21'] - Routes that are legally blocked
  recommended_grounds: GroundRecommendation[];
  notice_period_suggestions: Record<string, number>; // Allows any route key (section_8, section_21, notice_to_leave, wales_section_173, etc.)
  pre_action_requirements: {
    required: boolean;
    met: boolean | null;
    details: string[];
  };
  blocking_issues: BlockingIssue[]; // All blocking issues, grouped by route
  warnings: string[];
  analysis_summary: string;
  route_explanations: Record<string, string>; // Allows any route key (section_8, section_21, notice_to_leave, wales_section_173, wales_fault_based, etc.)
}

// ============================================================================
// ENGLAND & WALES DECISION LOGIC
// ============================================================================

function analyzeEnglandWales(input: DecisionInput): DecisionOutput {
  const { facts, stage = 'generate' } = input; // Default to strictest validation
  const output: DecisionOutput = {
    recommended_routes: [],
    allowed_routes: [],
    blocked_routes: [],
    recommended_grounds: [],
    notice_period_suggestions: {},
    pre_action_requirements: { required: false, met: null, details: [] },
    blocking_issues: [],
    warnings: [],
    analysis_summary: '',
    route_explanations: {},
  };

  // Check Section 21 eligibility and blocking issues
  const s21Blocks: BlockingIssue[] = [];
  const isWizardStage = stage === 'wizard';

  // Deposit protection (CRITICAL)
  if (facts.tenancy?.deposit_amount && facts.tenancy.deposit_amount > 0) {
    if (facts.tenancy.deposit_protected !== true) {
      const issue: BlockingIssue = {
        route: 'section_21',
        issue: 'deposit_not_protected',
        description: 'Deposit not protected in approved scheme',
        action_required: 'Protect deposit in DPS, MyDeposits, or TDS before serving Section 21',
        severity: isWizardStage ? 'warning' : 'blocking',
      };
      if (isWizardStage) {
        output.warnings.push(issue.description);
      } else {
        s21Blocks.push(issue);
      }
    }

    // Deposit cap check (Tenant Fees Act 2019 - applies to tenancies from 1 June 2019)
    // Maximum: 5 weeks' rent (or 6 weeks if annual rent > £50,000)
    // Part D: Coerce values to numbers to avoid "toFixed is not a function" crashes
    const rawRentAmount = facts.tenancy?.rent_amount ?? (input.facts as any).rent_amount;
    const rentFrequency = facts.tenancy?.rent_frequency ?? (input.facts as any).rent_frequency ?? 'monthly';
    const rawDepositAmount = facts.tenancy?.deposit_amount ?? (input.facts as any).deposit_amount;

    // Coerce to numbers (wizard may store as strings from form input)
    const rentAmount = typeof rawRentAmount === 'string' ? parseFloat(rawRentAmount) : Number(rawRentAmount);
    const depositAmount = typeof rawDepositAmount === 'string' ? parseFloat(rawDepositAmount) : Number(rawDepositAmount);

    // Only proceed if both are valid finite numbers
    if (Number.isFinite(rentAmount) && Number.isFinite(depositAmount) && rentAmount > 0 && depositAmount > 0) {
      // Calculate annual rent
      let annualRent = rentAmount;
      if (rentFrequency === 'weekly') {
        annualRent = rentAmount * 52;
      } else if (rentFrequency === 'fortnightly') {
        annualRent = rentAmount * 26;
      } else if (rentFrequency === 'monthly') {
        annualRent = rentAmount * 12;
      } else if (rentFrequency === 'quarterly') {
        annualRent = rentAmount * 4;
      }

      // Calculate weekly rent and max deposit
      const weeklyRent = annualRent / 52;
      const maxWeeks = annualRent > 50000 ? 6 : 5;
      const maxDeposit = weeklyRent * maxWeeks;

      // Check if landlord has confirmed they've reduced the deposit to legal cap
      const depositCapConfirmed = (input.facts as any).deposit_reduced_to_legal_cap_confirmed === true;

      if (depositAmount > maxDeposit && !depositCapConfirmed) {
        const issue: BlockingIssue = {
          route: 'section_21', // Section 21 specific - deposit issues can block S21 notices
          issue: 'deposit_exceeds_cap',
          description: `Deposit £${depositAmount.toFixed(2)} exceeds legal maximum of £${maxDeposit.toFixed(2)} (${maxWeeks} weeks' rent)`,
          action_required: `Refund excess deposit (£${(depositAmount - maxDeposit).toFixed(2)}) to tenant before proceeding`,
          severity: isWizardStage ? 'warning' : 'blocking',
          legal_basis: 'Tenant Fees Act 2019 s3 - deposit capped at 5 weeks rent (6 weeks if annual rent > £50,000)',
        };
        if (isWizardStage) {
          output.warnings.push(issue.description);
        } else {
          s21Blocks.push(issue);
        }
      }
    }
  }

  // Prescribed information (CRITICAL)
  // Check canonical location first (facts.tenancy.prescribed_info_given), then legacy/root fallbacks
  const prescribedInfoGiven =
    facts.tenancy?.prescribed_info_given ??
    (input.facts as any).prescribed_info_given ??
    (input.facts as any).prescribed_info_provided ??
    (input.facts as any).prescribed_info_served;
  if (facts.tenancy?.deposit_amount && facts.tenancy.deposit_amount > 0) {
    // Only block if explicitly false (not given), not if undefined (not yet answered)
    if (prescribedInfoGiven === false) {
      const issue: BlockingIssue = {
        route: 'section_21',
        issue: 'prescribed_info_not_given',
        description: 'Prescribed information not given to tenant within 30 days',
        action_required: 'Provide prescribed information before Section 21 is valid',
        severity: isWizardStage ? 'warning' : 'blocking',
      };
      if (isWizardStage) {
        output.warnings.push(issue.description);
      } else {
        s21Blocks.push(issue);
      }
    } else if (prescribedInfoGiven === undefined || prescribedInfoGiven === null) {
      // Undefined means not answered yet - warn but don't block in early stages
      if (!isWizardStage) {
        output.warnings.push('Prescribed information status not confirmed');
      }
    }
  }

  // Gas safety certificate (CRITICAL)
  // Use resolver to handle key aliases: gas_certificate_provided, gas_safety_cert_provided, etc.
  const gasCertFacts = resolveGasCertificateFacts(input.facts as Record<string, any>);
  // Only check if gas appliances exist AND certificate not provided
  // If has_gas_appliances is null/undefined, we fall back to checking certificate status alone
  const shouldCheckGasCert = gasCertFacts.hasGasAppliances === true || gasCertFacts.hasGasAppliances === null;
  if (shouldCheckGasCert && gasCertFacts.certificateProvided === false) {
    const issue: BlockingIssue = {
      route: 'section_21',
      issue: 'gas_safety_not_provided',
      description: 'Gas safety certificate not provided before tenancy start',
      action_required: 'Cannot use Section 21 if gas cert not provided at start',
      severity: isWizardStage ? 'warning' : 'blocking',
    };
    if (isWizardStage) {
      output.warnings.push(issue.description);
    } else {
      s21Blocks.push(issue);
    }
  }

  // How to Rent guide (CRITICAL for England)
  // Use resolver to handle key aliases: how_to_rent_provided, how_to_rent_given, h2r_provided, etc.
  const howToRentFacts = resolveHowToRentFacts(input.facts as Record<string, any>);
  if (howToRentFacts.provided === false) {
    const issue: BlockingIssue = {
      route: 'section_21',
      issue: 'how_to_rent_not_provided',
      description: '"How to Rent" guide not provided at start of tenancy',
      action_required: 'Cannot use Section 21 without providing How to Rent guide',
      severity: isWizardStage ? 'warning' : 'blocking',
    };
    if (isWizardStage) {
      output.warnings.push(issue.description);
    } else {
      s21Blocks.push(issue);
    }
  }

  // EPC provided (CRITICAL)
  // Use resolver to handle key aliases: epc_provided, epc_certificate_provided, etc.
  const epcFacts = resolveEPCFacts(input.facts as Record<string, any>);
  if (epcFacts.provided === false) {
    const issue: BlockingIssue = {
      route: 'section_21',
      issue: 'epc_not_provided',
      description: 'Energy Performance Certificate not provided to tenant',
      action_required: 'Provide EPC before Section 21 is valid',
      severity: isWizardStage ? 'warning' : 'blocking',
    };
    if (isWizardStage) {
      output.warnings.push(issue.description);
    } else {
      s21Blocks.push(issue);
    }
  }

  // HMO licensing (CRITICAL)
  // Use resolver to handle key aliases: property_licensing_status, hmo_license_required, etc.
  const licensingFacts = resolveLicensingFacts(input.facts as Record<string, any>);
  // Block if property is unlicensed OR if HMO is required but not valid
  if (licensingFacts.status === 'unlicensed' ||
      (licensingFacts.hmoRequired === true && licensingFacts.hmoValid !== true)) {
    const issue: BlockingIssue = {
      route: 'section_21',
      issue: 'hmo_not_licensed',
      description: licensingFacts.status === 'unlicensed'
        ? 'Property requires licensing but is not licensed'
        : 'HMO/selective licence required but not in place',
      action_required: 'Obtain required licence before serving Section 21',
      severity: isWizardStage ? 'warning' : 'blocking',
    };
    if (isWizardStage) {
      output.warnings.push(issue.description);
    } else {
      s21Blocks.push(issue);
    }
  }

  // Retaliatory eviction check (CRITICAL for England)
  // Deregulation Act 2015 s.33 - Section 21 invalid if served within 6 months of local authority notice
  // Also blocked if tenant has made repair complaints in last 6 months
  const recentRepairComplaints = (input.facts as any).recent_repair_complaints ??
    (facts as any).compliance?.recent_repair_complaints ??
    (input.facts as any).repair_complaints ??
    (input.facts as any).outstanding_repairs ?? false;
  if (recentRepairComplaints === true) {
    const issue: BlockingIssue = {
      route: 'section_21',
      issue: 'retaliatory_eviction',
      description: 'Section 21 may be invalid due to recent repair complaints from tenant',
      action_required: 'Cannot use Section 21 within 6 months of tenant repair complaint. Consider Section 8 instead.',
      severity: isWizardStage ? 'warning' : 'blocking',
      legal_basis: 'Deregulation Act 2015 s.33 - retaliatory eviction protection',
    };
    if (isWizardStage) {
      output.warnings.push(issue.description);
    } else {
      s21Blocks.push(issue);
    }
  }

  output.blocking_issues = s21Blocks;

  // Determine if Section 21 is allowed (no blocking issues)
  if (s21Blocks.length === 0) {
    output.allowed_routes.push('section_21');
    output.recommended_routes.push('section_21'); // Also recommend it as primary route
    output.notice_period_suggestions.section_21 = 60; // 2 calendar months
    output.route_explanations.section_21 = 'Section 21 (no-fault eviction) is available. All compliance requirements are met. This is usually the quickest route.';
  } else {
    output.blocked_routes.push('section_21');
    const blockReasons = s21Blocks.map(b => b.issue).join(', ');
    output.route_explanations.section_21 = `Section 21 is NOT available because: ${blockReasons}. You must use Section 8 instead.`;
  }

  // Analyze Section 8 grounds
  const section8Grounds: GroundRecommendation[] = [];

  // Ground 8: Serious rent arrears
  // Part D: Coerce values to numbers safely to avoid arithmetic on strings
  const rawTotalArrears = facts.issues?.rent_arrears?.total_arrears;
  const rawRentAmountForArrears = facts.tenancy?.rent_amount;
  const totalArrears = typeof rawTotalArrears === 'string' ? parseFloat(rawTotalArrears) : Number(rawTotalArrears) || 0;
  const rentAmountForArrears = typeof rawRentAmountForArrears === 'string' ? parseFloat(rawRentAmountForArrears) : Number(rawRentAmountForArrears) || 0;
  const rentFrequency = facts.tenancy?.rent_frequency;

  if (Number.isFinite(totalArrears) && Number.isFinite(rentAmountForArrears) && totalArrears > 0 && rentAmountForArrears > 0) {
    let arrearsMonths = 0;
    if (rentFrequency === 'monthly') {
      arrearsMonths = totalArrears / rentAmountForArrears;
    } else if (rentFrequency === 'weekly') {
      arrearsMonths = (totalArrears / rentAmountForArrears) / 4.33;
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

  // Section 8 is always allowed (you can always evict with valid grounds)
  output.allowed_routes.push('section_8');

  if (section8Grounds.length > 0) {
    // Only recommend Section 8 if we have grounds to suggest
    if (!output.recommended_routes.includes('section_21')) {
      // If S21 is blocked, S8 becomes the recommended route
      output.recommended_routes.push('section_8');
    }
    output.notice_period_suggestions.section_8 = 14; // Minimum for mandatory grounds
    output.route_explanations.section_8 = `Section 8 (grounds-based eviction) is available. We've identified ${section8Grounds.length} potential ground(s).`;
  } else {
    output.route_explanations.section_8 = 'Section 8 is available but we haven\'t identified specific grounds yet. You can select grounds manually.';
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
// WALES DECISION LOGIC
// ============================================================================

function analyzeWales(input: DecisionInput): DecisionOutput {
  const { facts, stage = 'generate' } = input; // Default to strictest validation
  const output: DecisionOutput = {
    recommended_routes: [],
    allowed_routes: [],
    blocked_routes: [],
    recommended_grounds: [],
    notice_period_suggestions: {},
    pre_action_requirements: { required: false, met: null, details: [] },
    blocking_issues: [],
    warnings: [],
    analysis_summary: '',
    route_explanations: {},
  };

  // Get contract category from facts
  const contractCategory = (facts as any).wales_contract_category ||
                          (facts as any).contract_category ||
                          null;

  // Check Section 173 eligibility (Wales no-fault notice)
  const s173Blocks: BlockingIssue[] = [];
  const isWizardStage = stage === 'wizard';

  // Section 173 is ONLY available for standard occupation contracts
  if (contractCategory === 'supported_standard' || contractCategory === 'secure') {
    const issue: BlockingIssue = {
      route: 'wales_section_173',
      issue: 'contract_type_incompatible',
      description: 'Section 173 is only available for standard occupation contracts',
      action_required: 'Use fault-based notice routes (Section 157, 159, 161, or 162) instead',
      severity: isWizardStage ? 'warning' : 'blocking',
    };
    if (isWizardStage) {
      output.warnings.push(issue.description);
    } else {
      s173Blocks.push(issue);
    }
  }

  // Rent Smart Wales registration (CRITICAL for Section 173)
  const rentSmartRegistered = (facts as any).rent_smart_wales_registered;
  if (rentSmartRegistered === false) {
    const issue: BlockingIssue = {
      route: 'wales_section_173',
      issue: 'rent_smart_not_registered',
      description: 'Not registered with Rent Smart Wales',
      action_required: 'Register with Rent Smart Wales before serving Section 173 notice',
      severity: isWizardStage ? 'warning' : 'blocking',
    };
    if (isWizardStage) {
      output.warnings.push(issue.description);
    } else {
      s173Blocks.push(issue);
    }
  }

  // Deposit protection (CRITICAL if deposit taken)
  const depositTaken = (facts as any).deposit_taken;
  const depositProtected = (facts as any).deposit_protected;
  if (depositTaken === true && depositProtected !== true) {
    const issue: BlockingIssue = {
      route: 'wales_section_173',
      issue: 'deposit_not_protected',
      description: 'Deposit not protected in approved scheme',
      action_required: 'Protect deposit in approved Wales scheme before serving Section 173',
      severity: isWizardStage ? 'warning' : 'blocking',
    };
    if (isWizardStage) {
      output.warnings.push(issue.description);
    } else {
      s173Blocks.push(issue);
    }
  }

  output.blocking_issues = s173Blocks;

  // Determine if Section 173 is allowed
  if (contractCategory === 'standard') {
    if (s173Blocks.length === 0) {
      output.allowed_routes.push('wales_section_173');
      output.recommended_routes.push('wales_section_173'); // Primary route for standard contracts
      output.notice_period_suggestions['wales_section_173'] = 180; // 6 months
      output.route_explanations['wales_section_173'] =
        'Section 173 (no-fault notice) is available for standard occupation contracts. ' +
        'This requires 6 months notice and all compliance requirements must be met.';
    } else {
      output.blocked_routes.push('wales_section_173');
      const blockReasons = s173Blocks.map(b => b.issue).join(', ');
      output.route_explanations['wales_section_173'] =
        `Section 173 is currently BLOCKED: ${blockReasons}. You must use fault-based notices instead.`;
    }
  } else {
    // For supported_standard and secure contracts, Section 173 is not available
    output.blocked_routes.push('wales_section_173');
    output.route_explanations['wales_section_173'] =
      'Section 173 is NOT available for supported standard or secure contracts. ' +
      'You must use fault-based notice routes (Section 157, 159, 161, or 162).';
  }

  // Fault-based routes are ALWAYS available in Wales (all contract types)
  output.allowed_routes.push('wales_fault_based');

  // Only recommend fault-based if Section 173 is blocked or unavailable
  if (!output.allowed_routes.includes('wales_section_173')) {
    output.recommended_routes.push('wales_fault_based');
  }

  output.route_explanations['wales_fault_based'] =
    'Fault-based notices (Section 157, 159, 161, 162) are available for all contract types. ' +
    'These require specific grounds such as rent arrears or breach of contract.';

  // Analyze fault-based grounds
  const faultGrounds: GroundRecommendation[] = [];

  // Section 157: Serious rent arrears (2+ months)
  // Part D: Coerce values to numbers safely to avoid arithmetic on strings
  const rawWalesTotalArrears = facts.issues?.rent_arrears?.total_arrears;
  const rawWalesRentAmount = facts.tenancy?.rent_amount;
  const walesTotalArrears = typeof rawWalesTotalArrears === 'string' ? parseFloat(rawWalesTotalArrears) : Number(rawWalesTotalArrears) || 0;
  const walesRentAmount = typeof rawWalesRentAmount === 'string' ? parseFloat(rawWalesRentAmount) : Number(rawWalesRentAmount) || 0;

  if (Number.isFinite(walesTotalArrears) && Number.isFinite(walesRentAmount) && walesTotalArrears > 0 && walesRentAmount > 0) {
    const arrearsMonths = walesTotalArrears / walesRentAmount;

    if (arrearsMonths >= 2) {
      faultGrounds.push({
        code: '157',
        title: 'Section 157 - Serious Rent Arrears',
        type: 'mandatory',
        weight: 'high',
        notice_period_days: 14,
        reasoning: 'At least 2 months rent unpaid - can proceed with 14 days notice',
        success_probability: 'very_high',
      });
    } else if (arrearsMonths > 0) {
      faultGrounds.push({
        code: '159',
        title: 'Section 159 - Some Rent Arrears',
        type: 'discretionary',
        weight: 'medium',
        notice_period_days: 28,
        reasoning: 'Some rent unpaid - requires 1 month notice',
        success_probability: 'medium',
      });
    }
  }

  // Section 161: Antisocial behaviour
  if (facts.issues?.asb?.has_asb === true) {
    faultGrounds.push({
      code: '161',
      title: 'Section 161 - Antisocial Behaviour',
      type: 'discretionary',
      weight: 'high',
      notice_period_days: 14,
      reasoning: 'ASB - can use 14 day notice in serious cases',
      success_probability: 'high',
    });
  }

  // Section 162: Breach of contract
  if (facts.issues?.other_breaches?.has_breaches === true) {
    faultGrounds.push({
      code: '162',
      title: 'Section 162 - Breach of Contract',
      type: 'discretionary',
      weight: 'medium',
      notice_period_days: 28,
      reasoning: 'Material breach of occupation contract terms',
      success_probability: 'medium',
    });
  }

  output.recommended_grounds = faultGrounds;

  // Generate analysis summary
  if (contractCategory === 'standard') {
    if (s173Blocks.length > 0) {
      output.analysis_summary = `Wales: Section 173 is currently BLOCKED due to ${s173Blocks.length} compliance issue(s). `;
    } else {
      output.analysis_summary = `Wales: Section 173 is AVAILABLE (all compliance requirements met). `;
    }
  } else {
    output.analysis_summary = `Wales: Section 173 NOT available for ${contractCategory || 'this'} contract type. `;
  }

  if (faultGrounds.length > 0) {
    output.analysis_summary += `Fault-based notices available with ${faultGrounds.length} potential ground(s).`;
  } else {
    output.analysis_summary += `Fault-based notices available (no specific grounds identified yet).`;
  }

  return output;
}

// ============================================================================
// SCOTLAND DECISION LOGIC
// ============================================================================

function analyzeScotland(input: DecisionInput): DecisionOutput {
  const { facts, stage = 'generate' } = input; // Default to strictest validation
  const output: DecisionOutput = {
    recommended_routes: ['notice_to_leave'], // Scotland only has Notice to Leave
    allowed_routes: [], // Will be populated based on pre-action requirements
    blocked_routes: [],
    recommended_grounds: [],
    notice_period_suggestions: {},
    pre_action_requirements: { required: false, met: null, details: [] },
    blocking_issues: [],
    warnings: [],
    analysis_summary: '',
    route_explanations: {},
  };

  const grounds: GroundRecommendation[] = [];
  const isWizardStage = stage === 'wizard';

  // Ground 1: Rent arrears (REQUIRES PRE-ACTION)
  // Part D: Coerce values to numbers safely to avoid arithmetic on strings
  const rawScotlandTotalArrears = facts.issues?.rent_arrears?.total_arrears;
  const rawScotlandRentAmount = facts.tenancy?.rent_amount;
  const scotlandTotalArrears = typeof rawScotlandTotalArrears === 'string' ? parseFloat(rawScotlandTotalArrears) : Number(rawScotlandTotalArrears) || 0;
  const scotlandRentAmount = typeof rawScotlandRentAmount === 'string' ? parseFloat(rawScotlandRentAmount) : Number(rawScotlandRentAmount) || 0;
  const preActionConfirmed = facts.issues?.rent_arrears?.pre_action_confirmed;

  if (Number.isFinite(scotlandTotalArrears) && Number.isFinite(scotlandRentAmount) && scotlandTotalArrears > 0 && scotlandRentAmount > 0) {
    const arrearsMonths = scotlandTotalArrears / scotlandRentAmount;

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
        const issue: BlockingIssue = {
          route: 'notice_to_leave',
          issue: 'pre_action_not_met',
          description: 'Pre-action requirements not completed for rent arrears eviction',
          action_required: 'Contact tenant about arrears, signpost support, attempt resolution before serving Notice',
          severity: isWizardStage ? 'warning' : 'blocking',
        };
        if (isWizardStage) {
          output.warnings.push(issue.description);
        } else {
          output.blocking_issues.push(issue);
        }
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

  // Determine if Notice to Leave is allowed
  if (output.blocking_issues.length === 0) {
    output.allowed_routes.push('notice_to_leave');
    output.route_explanations.notice_to_leave = 'Notice to Leave is available. This is the only eviction route in Scotland.';
  } else {
    output.blocked_routes.push('notice_to_leave');
    output.route_explanations.notice_to_leave = 'Notice to Leave is currently blocked due to unmet pre-action requirements for rent arrears.';
  }

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

  // Normalize jurisdiction to handle both canonical and legacy values
  const jurisdiction = normalizeJurisdiction(input.jurisdiction);

  if (!jurisdiction) {
    throw new Error(`Unsupported jurisdiction: ${input.jurisdiction}`);
  }

  switch (jurisdiction) {
    case 'england':
      return analyzeEnglandWales(input);
    case 'wales':
      return analyzeWales(input);
    case 'scotland':
      return analyzeScotland(input);
    case 'northern-ireland':
      // NI evictions not yet supported (see docs/NI_EVICTION_STATUS.md)
      return {
        recommended_routes: [],
        allowed_routes: [],
        blocked_routes: ['all'],
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
        route_explanations: {},
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
