/**
 * Section 21 Notice Validation Rules
 *
 * Deterministic rules for validating Section 21 (Form 6A) notices in England.
 * Each rule is based on statutory requirements from the Housing Act 1988
 * (as amended) and related regulations.
 *
 * IMPORTANT: These rules make compliance decisions deterministically.
 * LLM extraction only provides raw field values - it does NOT determine compliance.
 */

import type { Rule, RuleContext, RuleResult } from './types';
import {
  getFact,
  getYesNoFact,
  getStringFact,
  hasFact,
  createRuleResult,
  getMissingFacts,
} from './runRules';
import { checkTwoMonthNoticePeriod, parseUKDate } from './dateUtils';
import { SECTION_21_FACT_KEYS } from '../facts/factKeys';

/**
 * Required facts for Section 21 validation
 */
export const SECTION21_REQUIRED_FACTS: string[] = [
  SECTION_21_FACT_KEYS.form_6a_present,
  SECTION_21_FACT_KEYS.service_date,
  SECTION_21_FACT_KEYS.expiry_date,
  SECTION_21_FACT_KEYS.signature_present,
  SECTION_21_FACT_KEYS.deposit_taken,
];

/**
 * All Section 21 validation rules
 */
export const SECTION21_RULES: Rule[] = [
  // ============================================
  // BLOCKER: Jurisdiction Check
  // ============================================
  {
    id: 'S21-JURISDICTION',
    title: 'Jurisdiction',
    severity: 'blocker',
    applies: (ctx) => true,
    evaluate: (ctx): RuleResult => {
      if (ctx.jurisdiction !== 'england') {
        return createRuleResult(
          { id: 'S21-JURISDICTION', title: 'Jurisdiction', severity: 'blocker' },
          'fail',
          'Section 21 notices are only valid in England. For Wales, use RHW forms. For Scotland, use Notice to Leave.',
          { legalBasis: 'Housing Act 1988 applies to England only' }
        );
      }
      return createRuleResult(
        { id: 'S21-JURISDICTION', title: 'Jurisdiction', severity: 'blocker' },
        'pass',
        'Jurisdiction confirmed as England.'
      );
    },
  },

  // ============================================
  // BLOCKER: Form 6A Required
  // ============================================
  {
    id: 'S21-FORM-6A',
    title: 'Form 6A Requirement',
    severity: 'blocker',
    requiredFacts: [SECTION_21_FACT_KEYS.form_6a_present],
    applies: (ctx) => ctx.jurisdiction === 'england',
    evaluate: (ctx): RuleResult => {
      const form6aPresent = getYesNoFact(ctx, SECTION_21_FACT_KEYS.form_6a_present);

      if (form6aPresent === undefined) {
        return createRuleResult(
          { id: 'S21-FORM-6A', title: 'Form 6A Requirement', severity: 'blocker' },
          'needs_info',
          'Please confirm whether this notice uses the prescribed Form 6A.',
          { missingFacts: [SECTION_21_FACT_KEYS.form_6a_present], legalBasis: 'Prescribed Form Regulations' }
        );
      }

      if (!form6aPresent) {
        return createRuleResult(
          { id: 'S21-FORM-6A', title: 'Form 6A Requirement', severity: 'blocker' },
          'fail',
          'Section 21 notices for ASTs starting on or after 1 October 2015 MUST use the prescribed Form 6A. Using any other form makes the notice invalid.',
          { legalBasis: 'Assured Shorthold Tenancy Notices and Prescribed Requirements (England) Regulations 2015' }
        );
      }

      return createRuleResult(
        { id: 'S21-FORM-6A', title: 'Form 6A Requirement', severity: 'blocker' },
        'pass',
        'Form 6A is being used.',
        { evidence: ['Form 6A text detected in document'] }
      );
    },
  },

  // ============================================
  // BLOCKER: Notice Period (2 Calendar Months)
  // ============================================
  {
    id: 'S21-NOTICE-PERIOD',
    title: 'Notice Period (2 Months)',
    severity: 'blocker',
    requiredFacts: [SECTION_21_FACT_KEYS.service_date, SECTION_21_FACT_KEYS.expiry_date],
    applies: (ctx) => ctx.jurisdiction === 'england',
    evaluate: (ctx): RuleResult => {
      const serviceDate = getStringFact(ctx, SECTION_21_FACT_KEYS.service_date);
      const expiryDate = getStringFact(ctx, SECTION_21_FACT_KEYS.expiry_date);

      const missing: string[] = [];
      if (!serviceDate) missing.push(SECTION_21_FACT_KEYS.service_date);
      if (!expiryDate) missing.push(SECTION_21_FACT_KEYS.expiry_date);

      if (missing.length > 0) {
        return createRuleResult(
          { id: 'S21-NOTICE-PERIOD', title: 'Notice Period (2 Months)', severity: 'blocker' },
          'needs_info',
          'Please provide the service date and expiry date to check the notice period.',
          { missingFacts: missing }
        );
      }

      const result = checkTwoMonthNoticePeriod(serviceDate, expiryDate);

      if (result.valid === null) {
        return createRuleResult(
          { id: 'S21-NOTICE-PERIOD', title: 'Notice Period (2 Months)', severity: 'blocker' },
          'needs_info',
          `Date validation issue: ${result.message}. Please confirm the dates.`,
          { missingFacts: [SECTION_21_FACT_KEYS.service_date, SECTION_21_FACT_KEYS.expiry_date] }
        );
      }

      if (!result.valid) {
        return createRuleResult(
          { id: 'S21-NOTICE-PERIOD', title: 'Notice Period (2 Months)', severity: 'blocker' },
          'fail',
          result.message,
          { legalBasis: 'Housing Act 1988 s.21(4B) - minimum 2 calendar months notice' }
        );
      }

      return createRuleResult(
        { id: 'S21-NOTICE-PERIOD', title: 'Notice Period (2 Months)', severity: 'blocker' },
        'pass',
        result.message,
        { evidence: [`Service: ${serviceDate}`, `Expiry: ${expiryDate}`] }
      );
    },
  },

  // ============================================
  // BLOCKER: Signature Required
  // ============================================
  {
    id: 'S21-SIGNATURE',
    title: 'Landlord Signature',
    severity: 'blocker',
    requiredFacts: [SECTION_21_FACT_KEYS.signature_present],
    applies: (ctx) => ctx.jurisdiction === 'england',
    evaluate: (ctx): RuleResult => {
      const signaturePresent = getYesNoFact(ctx, SECTION_21_FACT_KEYS.signature_present);

      if (signaturePresent === undefined) {
        return createRuleResult(
          { id: 'S21-SIGNATURE', title: 'Landlord Signature', severity: 'blocker' },
          'needs_info',
          'Please confirm whether the notice is signed by the landlord.',
          { missingFacts: [SECTION_21_FACT_KEYS.signature_present] }
        );
      }

      if (!signaturePresent) {
        return createRuleResult(
          { id: 'S21-SIGNATURE', title: 'Landlord Signature', severity: 'blocker' },
          'fail',
          'The notice must be signed by the landlord or their agent. An unsigned notice is invalid.',
          { legalBasis: 'Form 6A requirement' }
        );
      }

      return createRuleResult(
        { id: 'S21-SIGNATURE', title: 'Landlord Signature', severity: 'blocker' },
        'pass',
        'Landlord signature is present.'
      );
    },
  },

  // ============================================
  // BLOCKER: Deposit Protection (if deposit taken)
  // ============================================
  {
    id: 'S21-DEPOSIT-PROTECTED',
    title: 'Deposit Protection',
    severity: 'blocker',
    requiredFacts: [SECTION_21_FACT_KEYS.deposit_taken, SECTION_21_FACT_KEYS.deposit_protected],
    applies: (ctx) => ctx.jurisdiction === 'england',
    evaluate: (ctx): RuleResult => {
      const depositTaken = getYesNoFact(ctx, SECTION_21_FACT_KEYS.deposit_taken);

      if (depositTaken === undefined) {
        return createRuleResult(
          { id: 'S21-DEPOSIT-PROTECTED', title: 'Deposit Protection', severity: 'blocker' },
          'needs_info',
          'Please confirm whether a deposit was taken from the tenant.',
          { missingFacts: [SECTION_21_FACT_KEYS.deposit_taken] }
        );
      }

      // If no deposit taken, rule doesn't apply
      if (depositTaken === false) {
        return createRuleResult(
          { id: 'S21-DEPOSIT-PROTECTED', title: 'Deposit Protection', severity: 'blocker' },
          'pass',
          'No deposit taken, so deposit protection rules do not apply.'
        );
      }

      // Deposit was taken - check if protected
      const depositProtected = getYesNoFact(ctx, SECTION_21_FACT_KEYS.deposit_protected);

      if (depositProtected === undefined) {
        return createRuleResult(
          { id: 'S21-DEPOSIT-PROTECTED', title: 'Deposit Protection', severity: 'blocker' },
          'needs_info',
          'A deposit was taken. Please confirm whether it is currently protected in a government-approved scheme (TDS, DPS, or MyDeposits).',
          { missingFacts: [SECTION_21_FACT_KEYS.deposit_protected] }
        );
      }

      if (!depositProtected) {
        return createRuleResult(
          { id: 'S21-DEPOSIT-PROTECTED', title: 'Deposit Protection', severity: 'blocker' },
          'fail',
          'The deposit MUST be protected in a government-approved scheme before a Section 21 notice can be served. An unprotected deposit makes the notice invalid.',
          { legalBasis: 'Housing Act 2004 ss.213-215' }
        );
      }

      return createRuleResult(
        { id: 'S21-DEPOSIT-PROTECTED', title: 'Deposit Protection', severity: 'blocker' },
        'pass',
        'Deposit is protected in a government-approved scheme.',
        { evidence: ['Deposit protection confirmed'] }
      );
    },
  },

  // ============================================
  // BLOCKER: Prescribed Information (if deposit taken)
  // ============================================
  {
    id: 'S21-PRESCRIBED-INFO',
    title: 'Prescribed Information',
    severity: 'blocker',
    requiredFacts: [SECTION_21_FACT_KEYS.deposit_taken, SECTION_21_FACT_KEYS.prescribed_info_served],
    applies: (ctx) => ctx.jurisdiction === 'england',
    evaluate: (ctx): RuleResult => {
      const depositTaken = getYesNoFact(ctx, SECTION_21_FACT_KEYS.deposit_taken);

      // If no deposit, prescribed info doesn't apply
      if (depositTaken === false) {
        return createRuleResult(
          { id: 'S21-PRESCRIBED-INFO', title: 'Prescribed Information', severity: 'blocker' },
          'pass',
          'No deposit taken, so prescribed information requirements do not apply.'
        );
      }

      // If deposit status unknown, already handled by deposit rule
      if (depositTaken === undefined) {
        return createRuleResult(
          { id: 'S21-PRESCRIBED-INFO', title: 'Prescribed Information', severity: 'blocker' },
          'pass', // Will be caught by deposit rule
          'Deposit status unknown.'
        );
      }

      const prescribedInfoServed = getYesNoFact(ctx, SECTION_21_FACT_KEYS.prescribed_info_served);

      if (prescribedInfoServed === undefined) {
        return createRuleResult(
          { id: 'S21-PRESCRIBED-INFO', title: 'Prescribed Information', severity: 'blocker' },
          'needs_info',
          'A deposit was taken. Please confirm whether the prescribed information was given to the tenant within 30 days of receiving the deposit.',
          { missingFacts: [SECTION_21_FACT_KEYS.prescribed_info_served] }
        );
      }

      if (!prescribedInfoServed) {
        return createRuleResult(
          { id: 'S21-PRESCRIBED-INFO', title: 'Prescribed Information', severity: 'blocker' },
          'fail',
          'Prescribed information about the deposit protection MUST be given to the tenant within 30 days of receiving the deposit. Failure to do so makes the Section 21 notice invalid.',
          { legalBasis: 'Housing Act 2004 s.213(6)' }
        );
      }

      return createRuleResult(
        { id: 'S21-PRESCRIBED-INFO', title: 'Prescribed Information', severity: 'blocker' },
        'pass',
        'Prescribed information was served within the required timeframe.',
        { evidence: ['Prescribed information service confirmed'] }
      );
    },
  },

  // ============================================
  // BLOCKER: Gas Safety Certificate (if gas appliances)
  // ============================================
  {
    id: 'S21-GAS-SAFETY',
    title: 'Gas Safety Certificate',
    severity: 'blocker',
    requiredFacts: [SECTION_21_FACT_KEYS.gas_appliances_present, SECTION_21_FACT_KEYS.gas_safety_pre_move_in],
    applies: (ctx) => ctx.jurisdiction === 'england',
    evaluate: (ctx): RuleResult => {
      const gasAppliances = getYesNoFact(ctx, SECTION_21_FACT_KEYS.gas_appliances_present);

      // If no gas appliances, rule doesn't apply
      if (gasAppliances === false) {
        return createRuleResult(
          { id: 'S21-GAS-SAFETY', title: 'Gas Safety Certificate', severity: 'blocker' },
          'pass',
          'No gas appliances at the property, so gas safety requirements do not apply.'
        );
      }

      if (gasAppliances === undefined) {
        return createRuleResult(
          { id: 'S21-GAS-SAFETY', title: 'Gas Safety Certificate', severity: 'blocker' },
          'needs_info',
          'Please confirm whether there are any gas appliances at the property.',
          { missingFacts: [SECTION_21_FACT_KEYS.gas_appliances_present] }
        );
      }

      const gasSafetyProvided = getYesNoFact(ctx, SECTION_21_FACT_KEYS.gas_safety_pre_move_in);

      if (gasSafetyProvided === undefined) {
        return createRuleResult(
          { id: 'S21-GAS-SAFETY', title: 'Gas Safety Certificate', severity: 'blocker' },
          'needs_info',
          'There are gas appliances. Please confirm whether a valid gas safety certificate was given to the tenant before they moved in.',
          { missingFacts: [SECTION_21_FACT_KEYS.gas_safety_pre_move_in] }
        );
      }

      if (!gasSafetyProvided) {
        return createRuleResult(
          { id: 'S21-GAS-SAFETY', title: 'Gas Safety Certificate', severity: 'blocker' },
          'fail',
          'A valid gas safety certificate MUST be given to the tenant before they move in if there are gas appliances. Failure to do so makes the Section 21 notice invalid.',
          { legalBasis: 'Deregulation Act 2015 s.36 / Gas Safety (Installation and Use) Regulations 1998' }
        );
      }

      return createRuleResult(
        { id: 'S21-GAS-SAFETY', title: 'Gas Safety Certificate', severity: 'blocker' },
        'pass',
        'Gas safety certificate was provided before move-in.',
        { evidence: ['Gas safety certificate service confirmed'] }
      );
    },
  },

  // ============================================
  // BLOCKER: EPC Required
  // ============================================
  {
    id: 'S21-EPC',
    title: 'Energy Performance Certificate (EPC)',
    severity: 'blocker',
    requiredFacts: [SECTION_21_FACT_KEYS.epc_provided],
    applies: (ctx) => ctx.jurisdiction === 'england',
    evaluate: (ctx): RuleResult => {
      const epcProvided = getYesNoFact(ctx, SECTION_21_FACT_KEYS.epc_provided);

      if (epcProvided === undefined) {
        return createRuleResult(
          { id: 'S21-EPC', title: 'Energy Performance Certificate (EPC)', severity: 'blocker' },
          'needs_info',
          'Please confirm whether a valid EPC was given to the tenant.',
          { missingFacts: [SECTION_21_FACT_KEYS.epc_provided] }
        );
      }

      if (!epcProvided) {
        return createRuleResult(
          { id: 'S21-EPC', title: 'Energy Performance Certificate (EPC)', severity: 'blocker' },
          'fail',
          'A valid EPC MUST be given to the tenant. Failure to provide an EPC makes the Section 21 notice invalid.',
          { legalBasis: 'Energy Performance of Buildings (England and Wales) Regulations 2012' }
        );
      }

      return createRuleResult(
        { id: 'S21-EPC', title: 'Energy Performance Certificate (EPC)', severity: 'blocker' },
        'pass',
        'Valid EPC was provided to the tenant.',
        { evidence: ['EPC provision confirmed'] }
      );
    },
  },

  // ============================================
  // BLOCKER: How to Rent Guide
  // ============================================
  {
    id: 'S21-HOW-TO-RENT',
    title: 'How to Rent Guide',
    severity: 'blocker',
    requiredFacts: [SECTION_21_FACT_KEYS.how_to_rent_provided],
    applies: (ctx) => ctx.jurisdiction === 'england',
    evaluate: (ctx): RuleResult => {
      const howToRentProvided = getYesNoFact(ctx, SECTION_21_FACT_KEYS.how_to_rent_provided);

      if (howToRentProvided === undefined) {
        return createRuleResult(
          { id: 'S21-HOW-TO-RENT', title: 'How to Rent Guide', severity: 'blocker' },
          'needs_info',
          'Please confirm whether the "How to Rent" guide was given to the tenant.',
          { missingFacts: [SECTION_21_FACT_KEYS.how_to_rent_provided] }
        );
      }

      if (!howToRentProvided) {
        return createRuleResult(
          { id: 'S21-HOW-TO-RENT', title: 'How to Rent Guide', severity: 'blocker' },
          'fail',
          'The "How to Rent" guide MUST be given to the tenant (for tenancies starting on or after 1 October 2015). Failure to provide it makes the Section 21 notice invalid.',
          { legalBasis: 'Deregulation Act 2015 s.37' }
        );
      }

      return createRuleResult(
        { id: 'S21-HOW-TO-RENT', title: 'How to Rent Guide', severity: 'blocker' },
        'pass',
        '"How to Rent" guide was provided to the tenant.',
        { evidence: ['How to Rent provision confirmed'] }
      );
    },
  },

  // ============================================
  // BLOCKER: Property Licensing (if required)
  // ============================================
  {
    id: 'S21-LICENSING',
    title: 'Property Licensing',
    severity: 'blocker',
    requiredFacts: [SECTION_21_FACT_KEYS.licence_required, SECTION_21_FACT_KEYS.licence_held],
    applies: (ctx) => ctx.jurisdiction === 'england',
    evaluate: (ctx): RuleResult => {
      const licenceRequired = getYesNoFact(ctx, SECTION_21_FACT_KEYS.licence_required);

      // If licence not required, rule doesn't apply
      if (licenceRequired === false) {
        return createRuleResult(
          { id: 'S21-LICENSING', title: 'Property Licensing', severity: 'blocker' },
          'pass',
          'Property is not subject to selective or additional licensing requirements.'
        );
      }

      if (licenceRequired === undefined) {
        return createRuleResult(
          { id: 'S21-LICENSING', title: 'Property Licensing', severity: 'blocker' },
          'needs_info',
          'Please confirm whether the property is subject to selective or additional licensing. Check with your local council if unsure.',
          { missingFacts: [SECTION_21_FACT_KEYS.licence_required] }
        );
      }

      const licenceHeld = getYesNoFact(ctx, SECTION_21_FACT_KEYS.licence_held);

      if (licenceHeld === undefined) {
        return createRuleResult(
          { id: 'S21-LICENSING', title: 'Property Licensing', severity: 'blocker' },
          'needs_info',
          'The property requires a licence. Please confirm whether the landlord holds the required licence.',
          { missingFacts: [SECTION_21_FACT_KEYS.licence_held] }
        );
      }

      if (!licenceHeld) {
        return createRuleResult(
          { id: 'S21-LICENSING', title: 'Property Licensing', severity: 'blocker' },
          'fail',
          'The property requires a licence that the landlord does not hold. A Section 21 notice cannot be served while the property is unlicensed.',
          { legalBasis: 'Housing Act 2004 s.75 / Selective Licensing' }
        );
      }

      return createRuleResult(
        { id: 'S21-LICENSING', title: 'Property Licensing', severity: 'blocker' },
        'pass',
        'Landlord holds the required property licence.',
        { evidence: ['Licence confirmed'] }
      );
    },
  },

  // ============================================
  // WARNING: Identity Fields Missing
  // ============================================
  {
    id: 'S21-IDENTITY-FIELDS',
    title: 'Notice Identity Fields',
    severity: 'warning',
    applies: (ctx) => ctx.jurisdiction === 'england',
    evaluate: (ctx): RuleResult => {
      const address = getYesNoFact(ctx, SECTION_21_FACT_KEYS.property_address_present);
      const tenantNames = getYesNoFact(ctx, SECTION_21_FACT_KEYS.tenant_names_present);
      const landlordName = getYesNoFact(ctx, SECTION_21_FACT_KEYS.landlord_name_present);

      const issues: string[] = [];
      if (address === false) issues.push('property address');
      if (tenantNames === false) issues.push('tenant names');
      if (landlordName === false) issues.push('landlord name');

      if (issues.length > 0) {
        return createRuleResult(
          { id: 'S21-IDENTITY-FIELDS', title: 'Notice Identity Fields', severity: 'warning' },
          'fail',
          `The notice appears to be missing: ${issues.join(', ')}. Ensure these are correctly stated on the notice.`
        );
      }

      return createRuleResult(
        { id: 'S21-IDENTITY-FIELDS', title: 'Notice Identity Fields', severity: 'warning' },
        'pass',
        'Key identity fields (address, tenant names, landlord name) are present.'
      );
    },
  },

  // ============================================
  // WARNING: Retaliatory Eviction Risk
  // ============================================
  {
    id: 'S21-RETALIATORY-EVICTION',
    title: 'Retaliatory Eviction Risk',
    severity: 'warning',
    requiredFacts: [SECTION_21_FACT_KEYS.retaliatory_eviction_risk],
    applies: (ctx) => ctx.jurisdiction === 'england',
    evaluate: (ctx): RuleResult => {
      const retaliationRisk = getYesNoFact(ctx, SECTION_21_FACT_KEYS.retaliatory_eviction_risk);

      if (retaliationRisk === undefined) {
        return createRuleResult(
          { id: 'S21-RETALIATORY-EVICTION', title: 'Retaliatory Eviction Risk', severity: 'warning' },
          'pass', // Not blocking - just informational
          'Retaliatory eviction status not confirmed.'
        );
      }

      if (retaliationRisk) {
        return createRuleResult(
          { id: 'S21-RETALIATORY-EVICTION', title: 'Retaliatory Eviction Risk', severity: 'warning' },
          'fail',
          'There may be retaliatory eviction protections. If the tenant complained to the council about property conditions and an improvement notice was served, the Section 21 notice may be invalid for 6 months.',
          { legalBasis: 'Deregulation Act 2015 ss.33-34' }
        );
      }

      return createRuleResult(
        { id: 'S21-RETALIATORY-EVICTION', title: 'Retaliatory Eviction Risk', severity: 'warning' },
        'pass',
        'No retaliatory eviction risk identified.'
      );
    },
  },

  // ============================================
  // WARNING: Rent Arrears Suggest Section 8
  // ============================================
  {
    id: 'S21-ARREARS-SUGGEST-S8',
    title: 'Consider Section 8 Route',
    severity: 'warning',
    requiredFacts: [SECTION_21_FACT_KEYS.rent_arrears_exist],
    applies: (ctx) => ctx.jurisdiction === 'england',
    evaluate: (ctx): RuleResult => {
      const arrearsExist = getYesNoFact(ctx, SECTION_21_FACT_KEYS.rent_arrears_exist);

      if (arrearsExist === undefined) {
        return createRuleResult(
          { id: 'S21-ARREARS-SUGGEST-S8', title: 'Consider Section 8 Route', severity: 'warning' },
          'pass',
          'Rent arrears status not confirmed.'
        );
      }

      if (arrearsExist) {
        return createRuleResult(
          { id: 'S21-ARREARS-SUGGEST-S8', title: 'Consider Section 8 Route', severity: 'warning' },
          'fail',
          'Rent arrears exist. Consider using Section 8 (Ground 8 or Ground 10/11) instead of or alongside Section 21. Ground 8 is a mandatory ground if arrears meet the threshold.',
          { legalBasis: 'Housing Act 1988 Schedule 2' }
        );
      }

      return createRuleResult(
        { id: 'S21-ARREARS-SUGGEST-S8', title: 'Consider Section 8 Route', severity: 'warning' },
        'pass',
        'No rent arrears noted.'
      );
    },
  },

  // ============================================
  // INFO: Tenancy Status
  // ============================================
  {
    id: 'S21-TENANCY-STATUS',
    title: 'Tenancy Status',
    severity: 'info',
    requiredFacts: [SECTION_21_FACT_KEYS.tenancy_status_known],
    applies: (ctx) => ctx.jurisdiction === 'england',
    evaluate: (ctx): RuleResult => {
      const statusKnown = getYesNoFact(ctx, SECTION_21_FACT_KEYS.tenancy_status_known);

      if (!statusKnown) {
        return createRuleResult(
          { id: 'S21-TENANCY-STATUS', title: 'Tenancy Status', severity: 'info' },
          'needs_info',
          'Please confirm the current tenancy status (fixed term or periodic) to ensure correct notice timing.',
          { missingFacts: [SECTION_21_FACT_KEYS.tenancy_status_known] }
        );
      }

      return createRuleResult(
        { id: 'S21-TENANCY-STATUS', title: 'Tenancy Status', severity: 'info' },
        'pass',
        'Tenancy status confirmed.'
      );
    },
  },
];

export default SECTION21_RULES;
