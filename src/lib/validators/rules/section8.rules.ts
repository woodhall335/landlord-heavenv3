/**
 * Section 8 Notice Validation Rules
 *
 * Deterministic rules for validating Section 8 (Form 3) notices in England.
 * Each rule is based on statutory requirements from the Housing Act 1988
 * (as amended) and Schedule 2 grounds for possession.
 *
 * IMPORTANT: These rules make compliance decisions deterministically.
 * LLM extraction only provides raw field values - it does NOT determine compliance.
 */

import type { Rule, RuleContext, RuleResult } from './types';
import {
  getFact,
  getYesNoFact,
  getStringFact,
  getNumericFact,
  getArrayFact,
  hasFact,
  createRuleResult,
  getMissingFacts,
} from './runRules';
import { isGround8Satisfied, parseUKDate } from './dateUtils';
import { SECTION_8_FACT_KEYS } from '../facts/factKeys';

/**
 * Required facts for Section 8 validation
 */
export const SECTION8_REQUIRED_FACTS: string[] = [
  SECTION_8_FACT_KEYS.form_3_present,
  SECTION_8_FACT_KEYS.grounds_cited,
  SECTION_8_FACT_KEYS.service_date,
];

/**
 * Mandatory grounds under Schedule 2, Housing Act 1988
 */
const MANDATORY_GROUNDS = [1, 2, 5, 6, 7, '7A', '7B', 8];

/**
 * Discretionary grounds under Schedule 2, Housing Act 1988
 */
const DISCRETIONARY_GROUNDS = [9, 10, 11, 12, 13, 14, '14A', 15, 16, 17];

/**
 * All Section 8 validation rules
 */
export const SECTION8_RULES: Rule[] = [
  // ============================================
  // BLOCKER: Jurisdiction Check
  // ============================================
  {
    id: 'S8-JURISDICTION',
    title: 'Jurisdiction',
    severity: 'blocker',
    applies: (ctx) => true,
    evaluate: (ctx): RuleResult => {
      if (ctx.jurisdiction !== 'england') {
        return createRuleResult(
          { id: 'S8-JURISDICTION', title: 'Jurisdiction', severity: 'blocker' },
          'fail',
          'Section 8 notices are only valid in England. For Wales, use RHW forms. For Scotland, use Notice to Leave.',
          { legalBasis: 'Housing Act 1988 applies to England only' }
        );
      }
      return createRuleResult(
        { id: 'S8-JURISDICTION', title: 'Jurisdiction', severity: 'blocker' },
        'pass',
        'Jurisdiction confirmed as England.'
      );
    },
  },

  // ============================================
  // BLOCKER: Form 3 Required
  // ============================================
  {
    id: 'S8-FORM-3',
    title: 'Form 3 Requirement',
    severity: 'blocker',
    requiredFacts: [SECTION_8_FACT_KEYS.form_3_present],
    applies: (ctx) => ctx.jurisdiction === 'england',
    evaluate: (ctx): RuleResult => {
      const form3Present = getYesNoFact(ctx, SECTION_8_FACT_KEYS.form_3_present);

      if (form3Present === undefined) {
        return createRuleResult(
          { id: 'S8-FORM-3', title: 'Form 3 Requirement', severity: 'blocker' },
          'needs_info',
          'Please confirm whether this notice uses the prescribed Form 3 (Notice seeking possession of a property let on an assured tenancy or an assured agricultural occupancy).',
          { missingFacts: [SECTION_8_FACT_KEYS.form_3_present], legalBasis: 'Prescribed Form Regulations' }
        );
      }

      if (!form3Present) {
        return createRuleResult(
          { id: 'S8-FORM-3', title: 'Form 3 Requirement', severity: 'blocker' },
          'fail',
          'Section 8 notices MUST use the prescribed Form 3. Using any other form makes the notice invalid.',
          { legalBasis: 'Assured Tenancies and Agricultural Occupancies (Forms) Regulations 1997' }
        );
      }

      return createRuleResult(
        { id: 'S8-FORM-3', title: 'Form 3 Requirement', severity: 'blocker' },
        'pass',
        'Form 3 is being used.',
        { evidence: ['Form 3 / Section 8 notice detected'] }
      );
    },
  },

  // ============================================
  // BLOCKER: At Least One Ground Cited
  // ============================================
  {
    id: 'S8-GROUNDS-CITED',
    title: 'Grounds for Possession',
    severity: 'blocker',
    requiredFacts: [SECTION_8_FACT_KEYS.grounds_cited],
    applies: (ctx) => ctx.jurisdiction === 'england',
    evaluate: (ctx): RuleResult => {
      const groundsCited = getArrayFact<number | string>(ctx, SECTION_8_FACT_KEYS.grounds_cited);

      if (!groundsCited || groundsCited.length === 0) {
        return createRuleResult(
          { id: 'S8-GROUNDS-CITED', title: 'Grounds for Possession', severity: 'blocker' },
          'needs_info',
          'Please confirm which grounds for possession are cited on the Section 8 notice.',
          { missingFacts: [SECTION_8_FACT_KEYS.grounds_cited], legalBasis: 'Housing Act 1988 s.8' }
        );
      }

      // Categorize grounds
      const mandatory = groundsCited.filter((g) =>
        MANDATORY_GROUNDS.map(String).includes(String(g))
      );
      const discretionary = groundsCited.filter((g) =>
        DISCRETIONARY_GROUNDS.map(String).includes(String(g))
      );

      let message = `Notice cites ${groundsCited.length} ground(s): ${groundsCited.join(', ')}.`;
      if (mandatory.length > 0) {
        message += ` Mandatory grounds: ${mandatory.join(', ')}.`;
      }
      if (discretionary.length > 0) {
        message += ` Discretionary grounds: ${discretionary.join(', ')}.`;
      }

      return createRuleResult(
        { id: 'S8-GROUNDS-CITED', title: 'Grounds for Possession', severity: 'blocker' },
        'pass',
        message,
        {
          evidence: groundsCited.map((g) => `Ground ${g}`),
          legalBasis: 'Housing Act 1988 Schedule 2',
        }
      );
    },
  },

  // ============================================
  // BLOCKER: Ground 8 Arrears Threshold (if Ground 8 cited)
  // ============================================
  {
    id: 'S8-GROUND-8-THRESHOLD',
    title: 'Ground 8 Arrears Threshold',
    severity: 'blocker',
    requiredFacts: [
      SECTION_8_FACT_KEYS.grounds_cited,
      SECTION_8_FACT_KEYS.rent_amount,
      SECTION_8_FACT_KEYS.rent_frequency,
      SECTION_8_FACT_KEYS.arrears_amount,
    ],
    applies: (ctx) => {
      const grounds = getArrayFact<number | string>(ctx, SECTION_8_FACT_KEYS.grounds_cited);
      // Only applies if Ground 8 is cited
      return ctx.jurisdiction === 'england' && !!grounds?.some((g) => String(g) === '8');
    },
    evaluate: (ctx): RuleResult => {
      const rentAmount = getNumericFact(ctx, SECTION_8_FACT_KEYS.rent_amount);
      const rentFrequency = getStringFact(ctx, SECTION_8_FACT_KEYS.rent_frequency);
      const arrearsAmount = getNumericFact(ctx, SECTION_8_FACT_KEYS.arrears_amount);

      // Check for missing facts
      const missing: string[] = [];
      if (rentAmount === undefined) missing.push(SECTION_8_FACT_KEYS.rent_amount);
      if (!rentFrequency) missing.push(SECTION_8_FACT_KEYS.rent_frequency);
      if (arrearsAmount === undefined) missing.push(SECTION_8_FACT_KEYS.arrears_amount);

      if (missing.length > 0) {
        return createRuleResult(
          { id: 'S8-GROUND-8-THRESHOLD', title: 'Ground 8 Arrears Threshold', severity: 'blocker' },
          'needs_info',
          'Ground 8 is cited. Please provide rent amount, frequency, and current arrears to check if the threshold is met.',
          { missingFacts: missing }
        );
      }

      // Calculate Ground 8 threshold
      const result = isGround8Satisfied(arrearsAmount!, rentAmount!, rentFrequency!);

      if (!result) {
        return createRuleResult(
          { id: 'S8-GROUND-8-THRESHOLD', title: 'Ground 8 Arrears Threshold', severity: 'blocker' },
          'needs_info',
          'Unable to calculate Ground 8 threshold. Please check rent frequency.',
          { missingFacts: [SECTION_8_FACT_KEYS.rent_frequency] }
        );
      }

      if (!result.satisfied) {
        return createRuleResult(
          { id: 'S8-GROUND-8-THRESHOLD', title: 'Ground 8 Arrears Threshold', severity: 'blocker' },
          'fail',
          `Ground 8 threshold NOT met. Arrears: £${arrearsAmount!.toFixed(2)}. Required: ${result.description} (£${result.threshold.toFixed(2)}). Ground 8 is a mandatory ground, but the court cannot grant possession unless the threshold is met at BOTH service AND hearing.`,
          {
            legalBasis: 'Housing Act 1988 Schedule 2 Ground 8',
            evidence: [
              `Rent: £${rentAmount!.toFixed(2)} ${rentFrequency}`,
              `Arrears: £${arrearsAmount!.toFixed(2)}`,
              `Threshold: £${result.threshold.toFixed(2)}`,
            ],
          }
        );
      }

      return createRuleResult(
        { id: 'S8-GROUND-8-THRESHOLD', title: 'Ground 8 Arrears Threshold', severity: 'blocker' },
        'pass',
        `Ground 8 threshold IS met. Arrears: £${arrearsAmount!.toFixed(2)}. Required: ${result.description} (£${result.threshold.toFixed(2)}). Remember: this threshold must ALSO be met at the court hearing.`,
        {
          legalBasis: 'Housing Act 1988 Schedule 2 Ground 8',
          evidence: [
            `Rent: £${rentAmount!.toFixed(2)} ${rentFrequency}`,
            `Arrears: £${arrearsAmount!.toFixed(2)}`,
            `Threshold: £${result.threshold.toFixed(2)}`,
          ],
        }
      );
    },
  },

  // ============================================
  // WARNING: Service Date Missing
  // ============================================
  {
    id: 'S8-SERVICE-DATE',
    title: 'Notice Service Date',
    severity: 'warning',
    requiredFacts: [SECTION_8_FACT_KEYS.service_date],
    applies: (ctx) => ctx.jurisdiction === 'england',
    evaluate: (ctx): RuleResult => {
      const serviceDate = getStringFact(ctx, SECTION_8_FACT_KEYS.service_date);

      if (!serviceDate) {
        return createRuleResult(
          { id: 'S8-SERVICE-DATE', title: 'Notice Service Date', severity: 'warning' },
          'needs_info',
          'Please provide the date the notice was served on the tenant.',
          { missingFacts: [SECTION_8_FACT_KEYS.service_date] }
        );
      }

      const parsed = parseUKDate(serviceDate);
      if (!parsed) {
        return createRuleResult(
          { id: 'S8-SERVICE-DATE', title: 'Notice Service Date', severity: 'warning' },
          'needs_info',
          `Service date "${serviceDate}" could not be parsed. Please confirm in DD/MM/YYYY format.`,
          { missingFacts: [SECTION_8_FACT_KEYS.service_date] }
        );
      }

      return createRuleResult(
        { id: 'S8-SERVICE-DATE', title: 'Notice Service Date', severity: 'warning' },
        'pass',
        `Notice service date confirmed: ${serviceDate}`,
        { evidence: [`Served: ${serviceDate}`] }
      );
    },
  },

  // ============================================
  // WARNING: Notice Period (varies by ground)
  // Note: Not implementing per-ground notice periods in this PR
  // ============================================
  {
    id: 'S8-NOTICE-PERIOD',
    title: 'Notice Period',
    severity: 'warning',
    requiredFacts: [SECTION_8_FACT_KEYS.notice_period_days],
    applies: (ctx) => ctx.jurisdiction === 'england',
    evaluate: (ctx): RuleResult => {
      const noticePeriod = getNumericFact(ctx, SECTION_8_FACT_KEYS.notice_period_days);

      if (noticePeriod === undefined) {
        return createRuleResult(
          { id: 'S8-NOTICE-PERIOD', title: 'Notice Period', severity: 'warning' },
          'pass', // Don't block - just note it's missing
          'Notice period could not be confirmed. Different grounds require different minimum notice periods (2 weeks for some, 2 months for others).',
          { legalBasis: 'Housing Act 1988 s.8(4A)-(4B)' }
        );
      }

      return createRuleResult(
        { id: 'S8-NOTICE-PERIOD', title: 'Notice Period', severity: 'warning' },
        'pass',
        `Notice period: ${noticePeriod} days. Ensure this meets the minimum for the grounds cited.`,
        {
          evidence: [`Notice period: ${noticePeriod} days`],
          legalBasis: 'Housing Act 1988 s.8(4A)-(4B)',
        }
      );
    },
  },

  // ============================================
  // WARNING: Benefit Delays
  // ============================================
  {
    id: 'S8-BENEFIT-DELAYS',
    title: 'Housing Benefit Delays',
    severity: 'warning',
    requiredFacts: [SECTION_8_FACT_KEYS.benefit_delays],
    applies: (ctx) => ctx.jurisdiction === 'england',
    evaluate: (ctx): RuleResult => {
      const benefitDelays = getYesNoFact(ctx, SECTION_8_FACT_KEYS.benefit_delays);

      if (benefitDelays === undefined) {
        return createRuleResult(
          { id: 'S8-BENEFIT-DELAYS', title: 'Housing Benefit Delays', severity: 'warning' },
          'pass',
          'Housing benefit delay status not confirmed.'
        );
      }

      if (benefitDelays) {
        return createRuleResult(
          { id: 'S8-BENEFIT-DELAYS', title: 'Housing Benefit Delays', severity: 'warning' },
          'fail',
          'Housing benefit delays are contributing to arrears. Courts often consider this when deciding discretionary grounds and may be more sympathetic to the tenant. Consider whether to proceed or wait for benefits to be resolved.',
          { legalBasis: 'Court discretion under Housing Act 1988' }
        );
      }

      return createRuleResult(
        { id: 'S8-BENEFIT-DELAYS', title: 'Housing Benefit Delays', severity: 'warning' },
        'pass',
        'No housing benefit delays noted.'
      );
    },
  },

  // ============================================
  // WARNING: Disrepair Counterclaims
  // ============================================
  {
    id: 'S8-DISREPAIR',
    title: 'Disrepair Counterclaims',
    severity: 'warning',
    requiredFacts: [SECTION_8_FACT_KEYS.disrepair_counterclaims],
    applies: (ctx) => ctx.jurisdiction === 'england',
    evaluate: (ctx): RuleResult => {
      const disrepair = getYesNoFact(ctx, SECTION_8_FACT_KEYS.disrepair_counterclaims);

      if (disrepair === undefined) {
        return createRuleResult(
          { id: 'S8-DISREPAIR', title: 'Disrepair Counterclaims', severity: 'warning' },
          'pass',
          'Disrepair counterclaim risk not confirmed.'
        );
      }

      if (disrepair) {
        return createRuleResult(
          { id: 'S8-DISREPAIR', title: 'Disrepair Counterclaims', severity: 'warning' },
          'fail',
          'Potential disrepair counterclaim identified. The tenant may use disrepair issues to reduce or offset any arrears claim. Consider addressing disrepair before or alongside possession proceedings.',
          { legalBasis: 'Landlord and Tenant Act 1985 s.11 / common law' }
        );
      }

      return createRuleResult(
        { id: 'S8-DISREPAIR', title: 'Disrepair Counterclaims', severity: 'warning' },
        'pass',
        'No disrepair counterclaim risk identified.'
      );
    },
  },

  // ============================================
  // WARNING: Payments Since Notice
  // ============================================
  {
    id: 'S8-PAYMENTS-SINCE',
    title: 'Payments Since Notice',
    severity: 'warning',
    requiredFacts: [SECTION_8_FACT_KEYS.payment_since_notice],
    applies: (ctx) => {
      const grounds = getArrayFact<number | string>(ctx, SECTION_8_FACT_KEYS.grounds_cited);
      // Particularly relevant for Ground 8
      return ctx.jurisdiction === 'england' && !!grounds?.some((g) => String(g) === '8');
    },
    evaluate: (ctx): RuleResult => {
      const paymentSince = getYesNoFact(ctx, SECTION_8_FACT_KEYS.payment_since_notice);

      if (paymentSince === undefined) {
        return createRuleResult(
          { id: 'S8-PAYMENTS-SINCE', title: 'Payments Since Notice', severity: 'warning' },
          'pass',
          'Payment status since notice service not confirmed.'
        );
      }

      if (paymentSince) {
        return createRuleResult(
          { id: 'S8-PAYMENTS-SINCE', title: 'Payments Since Notice', severity: 'warning' },
          'fail',
          'Payment(s) received since notice was served. For Ground 8, arrears must meet the threshold at BOTH service AND hearing. If payments have reduced arrears below threshold, Ground 8 will fail at hearing. Consider updating arrears figures or relying on discretionary grounds.',
          { legalBasis: 'Housing Act 1988 Schedule 2 Ground 8' }
        );
      }

      return createRuleResult(
        { id: 'S8-PAYMENTS-SINCE', title: 'Payments Since Notice', severity: 'warning' },
        'pass',
        'No payments received since notice was served.'
      );
    },
  },

  // ============================================
  // INFO: Ground Type Analysis
  // ============================================
  {
    id: 'S8-GROUND-TYPE',
    title: 'Ground Type Analysis',
    severity: 'info',
    applies: (ctx) => ctx.jurisdiction === 'england',
    evaluate: (ctx): RuleResult => {
      const grounds = getArrayFact<number | string>(ctx, SECTION_8_FACT_KEYS.grounds_cited);

      if (!grounds || grounds.length === 0) {
        return createRuleResult(
          { id: 'S8-GROUND-TYPE', title: 'Ground Type Analysis', severity: 'info' },
          'pass',
          'No grounds to analyze.'
        );
      }

      const mandatory = grounds.filter((g) =>
        MANDATORY_GROUNDS.map(String).includes(String(g))
      );
      const discretionary = grounds.filter((g) =>
        DISCRETIONARY_GROUNDS.map(String).includes(String(g))
      );

      let message = '';
      if (mandatory.length > 0 && discretionary.length === 0) {
        message = `All grounds are MANDATORY (${mandatory.join(', ')}). If you prove the ground, the court MUST grant possession.`;
      } else if (discretionary.length > 0 && mandatory.length === 0) {
        message = `All grounds are DISCRETIONARY (${discretionary.join(', ')}). The court MAY grant possession if reasonable.`;
      } else if (mandatory.length > 0 && discretionary.length > 0) {
        message = `Mix of MANDATORY (${mandatory.join(', ')}) and DISCRETIONARY (${discretionary.join(', ')}) grounds. Mandatory grounds give strongest position.`;
      }

      return createRuleResult(
        { id: 'S8-GROUND-TYPE', title: 'Ground Type Analysis', severity: 'info' },
        'pass',
        message,
        { legalBasis: 'Housing Act 1988 Schedule 2' }
      );
    },
  },

  // ============================================
  // INFO: Identity Fields
  // ============================================
  {
    id: 'S8-IDENTITY-FIELDS',
    title: 'Notice Identity Fields',
    severity: 'info',
    applies: (ctx) => ctx.jurisdiction === 'england',
    evaluate: (ctx): RuleResult => {
      const address = getYesNoFact(ctx, SECTION_8_FACT_KEYS.property_address_present);
      const tenantNames = getYesNoFact(ctx, SECTION_8_FACT_KEYS.tenant_names_present);

      const issues: string[] = [];
      if (address === false) issues.push('property address');
      if (tenantNames === false) issues.push('tenant names');

      if (issues.length > 0) {
        return createRuleResult(
          { id: 'S8-IDENTITY-FIELDS', title: 'Notice Identity Fields', severity: 'info' },
          'fail',
          `The notice appears to be missing: ${issues.join(', ')}. Ensure these are correctly stated on the notice.`
        );
      }

      return createRuleResult(
        { id: 'S8-IDENTITY-FIELDS', title: 'Notice Identity Fields', severity: 'info' },
        'pass',
        'Key identity fields (address, tenant names) appear to be present.'
      );
    },
  },
];

export default SECTION8_RULES;
