/**
 * Complete Eviction Pack Generator
 *
 * Generates region-specific complete eviction packs including:
 * - All notices (Section 8/21, Notice to Leave)
 * - All court forms (o5, o5B, o119, Tribunal forms)
 * - Expert guidance documents
 * - Grounds support and evidence checklists
 * - Premium features (lifetime storage, priority support)
 *
 * Pricing: see src/lib/pricing/products.ts for the current one-time amount (England only)
 * Regional Restrictions: Wales and Scotland users should use ootice Only instead
 */

import { generateDocument } from './generator';
import { assertNoticeOnlyValid, assertCompletePackValid } from './noticeOnly';
import { generateSection8Notice, Section8Ground, Section8NoticeData } from './section8-generator';
import { generateSection21Notice, Section21NoticeData } from './section21-generator';
import { fillN5Form, fillN119Form, CaseData, fillN5BForm } from './official-forms-filler';
import type { ScotlandCaseData } from './scotland-forms-filler';
import { buildServiceContact } from '@/lib/documents/service-contact';
import {
  wizardFactsToEnglandWalesEviction,
  wizardFactsToScotlandEviction,
  buildScotlandEvictionCase,
} from './eviction-wizard-mapper';
import {
  checkN5BMandatoryFields,
  buildN5BFields,
  N5BMissingFieldError,
} from './n5b-field-builder';
import { generateWitnessStatement, extractWitnessStatementContext } from '@/lib/ai/witness-statement-generator';
import {
  buildWitnessStatementSections,
  extractWitnessStatementSectionsInput,
  buildWitnessExhibits,
  type WitnessExhibit,
} from './witness-statement-sections';
import { generateComplianceAudit, extractComplianceAuditContext } from '@/lib/ai/compliance-audit-generator';
import { computeRiskAssessment } from '@/lib/case-intel/risk-assessment';
import fs from 'fs/promises';
import path from 'path';
import type { JurisdictionKey } from '@/lib/jurisdictions/rulesLoader';
import {
  getArrearsScheduleData,
  shouldIncludeSchedulePdf,
  getLegacyArrearsWarning,
} from './arrears-schedule-mapper';
import { hasArrearsGroundsSelected } from '@/lib/arrears-engine';
import type { ArrearsItem, TenancyFacts } from '@/lib/case-facts/schema';
import { normalizeSection8Facts } from '@/lib/wizard/normalizeSection8Facts';
import { mapNoticeOnlyFacts } from '@/lib/case-facts/normalize';
import { mapWalesFaultGroundsToGroundCodes, hasWalesArrearsGroundSelected, isWalesArrearsOnlySelection } from '@/lib/wales/grounds';
import { buildWalesPartDFromWizardFacts } from '@/lib/wales/partDBuilder';
import { extractWalesParticularsFromWizardFacts } from '@/lib/wales/particulars';
import { normalizeRoute, type CanonicalRoute } from '@/lib/wizard/route-normalizer';
import { generateWalesSection173Notice } from './wales-section173-generator';
import { getEnglandGroundLegalWording } from '@/lib/england-possession/legal-wording';
import {
  validateCourtReady,
  logValidationResults,
  validateCrossDocumentConsistency,
  logConsistencyResults,
  validateComplianceTiming,
  assertComplianceTiming,
  validateJointParties,
  assertJointPartiesComplete,
  type ValidationResult,
  type CrossDocumentData,
  type JointPartyData,
} from './court-ready-validator';
import { buildComplianceTimingDataWithFallback } from './compliance-timing-facts';
import { isSection173Route, isWalesFaultBasedRoute } from '@/lib/wales/section173FormSelector';
import {
  calculateSection8ExpiryDate,
  calculateSection21ExpiryDate,
  type Section8DateParams,
  type Section21DateParams,
  type ServiceMethod,
} from './notice-date-calculator';
import { computeEvictionArrears, proRatePartialPeriods } from '@/lib/eviction/arrears/computeArrears';
import { getGround8Threshold, isGround8Eligible } from '@/lib/grounds/ground8-threshold';
import {
  buildEnglandPossessionDraftingModel,
  buildN119DefendantCircumstancesText,
  buildN119FinancialInfoText,
  buildN119ReasonForPossessionText,
  buildN119StatutoryGroundsText,
  buildN119StepsTakenText,
} from '@/lib/england-possession/pack-drafting';
import {
  ENGLAND_SECTION8_FORM_NAME,
  ENGLAND_SECTION8_NOTICE_NAME,
  ENGLAND_SECTION8_NOTICE_TITLE,
  ENGLAND_SECTION8_NOTICE_TYPE_LABEL,
} from '@/lib/england-possession/section8-terminology';
import { isDebugStampEnabled } from './debug-stamp';
import { generateEnglandN215PDF, normalizeEnglandProofOfServiceMethod } from '@/lib/documents/england-n215-generator';

// ============================================================================
// DATE FORMATTIoG HELPER - UK Legal Format
// ============================================================================

/**
 * Format a date string to UK legal format (e.g., "15 January 2026")
 * Used for service instructions and checklist PDFs
 */
function formatUKLegalDate(dateString: string | null | undefined): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '';
    const day = date.getDate();
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return '';
  }
}

type DerivedEvictionRoute = 'section8' | 'section21';

function deriveEvictionRoute(facts?: Record<string, unknown>): DerivedEvictionRoute | null {
  if (!facts) return null;
  const rawRoute = (facts as Record<string, unknown>)?.selected_notice_route ??
    (facts as Record<string, unknown>)?.eviction_route;
  const normalized = normalizeRoute(typeof rawRoute === 'string' ? rawRoute : undefined);

  if (normalized === 'section_8') return 'section8';
  if (normalized === 'section_21') return 'section21';

  return null;
}

// ============================================================================
// FIX 3: UoIFIED oOTICE EXPIRY DATE CALCULATOR (Jan 2026)
// ============================================================================
// This function provides a SIoGLE SOURCE OF TRUTH for notice expiry dates
// across all documents in the Section 21 pack. It ensures consistency between:
// - Form 6A (Section 2: "leave after" date)
// - o5B Q10(e) (notice expiry date)
// - Proof of Service (notice expiry)
// - Witness Statement (para 3.3)
//
// RULE IMPLEMEoTED (Option A): The expiry date is calculated as 2 calendar
// months from the ACTUAL service date (not deemed service). Deemed service
// affects when notice is "legally received" but the 2-month period runs from
// the date of actual service/posting.
//
// Legal basis: Housing Act 1988, Section 21(4) - minimum 2 months notice
// ============================================================================

interface UnifiedExpiryParams {
  service_date: string;
  tenancy_start_date: string;
  fixed_term?: boolean;
  fixed_term_end_date?: string;
  has_break_clause?: boolean;
  break_clause_date?: string;
  rent_frequency?: 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | 'yearly';
  service_method?: string;
}

/**
 * Get the unified notice expiry date for all documents in a Section 21 pack.
 *
 * This is the SIoGLE SOURCE OF TRUTH for expiry dates. All documents
 * (Form 6A, o5B, Proof of Service, Witness Statement) MUST use this function.
 *
 * @param params - ootice parameters
 * @returns ISO date string (YYYY-MM-DD) or undefined if cannot calculate
 */
function getUnifiedNoticeExpiryDate(params: UnifiedExpiryParams): string | undefined {
  if (!params.service_date || !params.tenancy_start_date) {
    console.warn('[getUnifiedNoticeExpiryDate] Missing required params');
    return undefined;
  }

  try {
    // Map service_method string to ServiceMethod type
    // Valid ServiceMethod values: first_class_post, second_class_post, hand_delivery, leaving_at_property, recorded_delivery
    let serviceMethod: ServiceMethod = 'hand_delivery';
    if (params.service_method) {
      const method = params.service_method.toLowerCase();
      if (method.includes('first class') || method.includes('first_class') || method.includes('post')) {
        serviceMethod = 'first_class_post';
      } else if (method.includes('second class') || method.includes('second_class')) {
        serviceMethod = 'second_class_post';
      } else if (method.includes('recorded') || method.includes('signed')) {
        serviceMethod = 'recorded_delivery';
      } else if (method.includes('leaving') || method.includes('letterbox')) {
        serviceMethod = 'leaving_at_property';
      }
      // hand_delivery, email, and other methods default to hand_delivery (same-day deemed service)
    }

    const dateParams: Section21DateParams = {
      service_date: params.service_date,
      tenancy_start_date: params.tenancy_start_date,
      fixed_term: params.fixed_term || false,
      fixed_term_end_date: params.fixed_term_end_date,
      has_break_clause: params.has_break_clause,
      break_clause_date: params.break_clause_date,
      rent_period: params.rent_frequency || 'monthly',
      service_method: serviceMethod,
    };

    const result = calculateSection21ExpiryDate(dateParams);
    console.log(`📅 [getUnifiedooticeExpiryDate] Computed expiry: ${result.earliest_valid_date}`);
    return result.earliest_valid_date;
  } catch (err) {
    console.warn('[getUnifiedNoticeExpiryDate] Calculation failed:', err);
    return undefined;
  }
}

// ============================================================================
// PRO-RATA HELPER - For Partial Rent Periods
// ============================================================================

interface CanonicalSection8NoticeData {
  serviceDate: string;
  earliestPossessionDate: string;
  noticePeriodDays: number;
  explanation?: string;
}

function resolveSection8ServiceDate(...sources: Array<Record<string, any> | null | undefined>): string {
  for (const source of sources) {
    const value =
      source?.notice_service_date ||
      source?.notice_served_date ||
      source?.section_8_notice_date ||
      source?.service_date ||
      source?.notice_date ||
      source?.notice?.service_date ||
      source?.notice?.served_date ||
      source?.['notice_service.notice_date'];

    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }

  return new Date().toISOString().split('T')[0];
}

function resolveSection8GroundParams(evictionCase: EvictionCase): Section8DateParams['grounds'] {
  return (evictionCase.grounds || []).reduce<Section8DateParams['grounds']>((result, ground) => {
    const rawCode = typeof ground === 'string' ? ground : ground.code;
    const normalizedCode = String(rawCode || '').replace(/^Ground\s+/i, '').trim();
    if (!normalizedCode) {
      return result;
    }

    result.push({
      code: normalizedCode,
      mandatory: typeof ground === 'string' ? undefined : ground.mandatory,
    });

  return result;
  }, []);
}

async function mapEvictionCaseGroundToSection8NoticeGround(ground: any, groundsData: any): Promise<Section8Ground> {
  const normalizedGroundCode = String(ground.code || '')
    .replace(/^Ground\s+/i, '')
    .trim()
    .toUpperCase();
  const typedGroundCode: Section8Ground['code'] =
    /^\d+$/.test(normalizedGroundCode) ? Number.parseInt(normalizedGroundCode, 10) : normalizedGroundCode;
  const currentGroundWording = await getEnglandGroundLegalWording(normalizedGroundCode);

  return {
    code: typedGroundCode,
    title: ground.title,
    legal_basis: getGroundDetails(groundsData, String(ground.code || ''))?.statute || '',
    particulars: ground.particulars,
    supporting_evidence: ground.evidence,
    mandatory: ground.mandatory || false,
    statutory_text: currentGroundWording?.legalWording || '',
  };
}

function resolveSection8CanonicalNoticeData(
  evictionCase: EvictionCase,
  wizardFacts: Record<string, any> = {},
  caseData?: Partial<CaseData> | null
): CanonicalSection8NoticeData {
  const serviceDate = resolveSection8ServiceDate(caseData as Record<string, any>, wizardFacts);
  const existingExpiry =
    wizardFacts.notice_expiry_date ||
    wizardFacts.earliest_possession_date ||
    wizardFacts.section8_expiry_date ||
    wizardFacts.notice?.expiry_date ||
    wizardFacts['notice_service.notice_expiry_date'] ||
    caseData?.notice_expiry_date ||
    (caseData as Record<string, any> | null | undefined)?.earliest_possession_date ||
    '';
  const groundParams = resolveSection8GroundParams(evictionCase);

  if (groundParams.length === 0) {
    return {
      serviceDate,
      earliestPossessionDate: existingExpiry,
      noticePeriodDays: 0,
    };
  }

  const calculated = calculateSection8ExpiryDate({
    service_date: serviceDate,
    grounds: groundParams,
    tenancy_start_date: evictionCase.tenancy_start_date,
    fixed_term: evictionCase.fixed_term,
    fixed_term_end_date: evictionCase.fixed_term_end_date,
  });

  return {
    serviceDate,
    earliestPossessionDate: existingExpiry || calculated.earliest_valid_date,
    noticePeriodDays: calculated.notice_period_days,
    explanation: calculated.explanation,
  };
}

type CourtFacingRenderOptions = {
  cleanOutput: boolean;
  courtMode: boolean;
};

function resolveCanonicalCourtName(...sources: Array<Record<string, any> | null | undefined>): string | undefined {
  for (const source of sources) {
    const value =
      source?.court_name ||
      source?.court?.court_name ||
      source?.courtName;

    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  return undefined;
}

function resolveCourtFacingRenderOptions(
  ...sources: Array<Record<string, any> | null | undefined>
): CourtFacingRenderOptions {
  const explicitCleanOutput = sources.some(
    (source) => source?.clean_output === true || source?.cleanOutput === true
  );
  const explicitCourtMode = sources.some(
    (source) => source?.court_mode === true || source?.courtMode === true
  );
  const envEnabled =
    process.env.COURT_MODE_RENDER === '1' || process.env.CLEAN_OUTPUT_RENDER === '1';

  const cleanOutput = explicitCleanOutput || explicitCourtMode || envEnabled;

  return {
    cleanOutput,
    courtMode: explicitCourtMode || envEnabled,
  };
}

function getNestedValue(
  source: Record<string, any> | null | undefined,
  path: string
): unknown {
  if (!source) {
    return undefined;
  }

  return path.split('.').reduce<unknown>((value, segment) => {
    if (value && typeof value === 'object' && segment in (value as Record<string, any>)) {
      return (value as Record<string, any>)[segment];
    }

    return undefined;
  }, source);
}

function resolveBooleanField(
  sources: Array<Record<string, any> | null | undefined>,
  ...paths: string[]
): boolean | null {
  for (const source of sources) {
    for (const path of paths) {
      const value = getNestedValue(source, path);
      if (typeof value === 'boolean') {
        return value;
      }
    }
  }

  return null;
}

function resolveStringField(
  sources: Array<Record<string, any> | null | undefined>,
  ...paths: string[]
): string | undefined {
  for (const source of sources) {
    for (const path of paths) {
      const value = getNestedValue(source, path);
      if (typeof value === 'string' && value.trim().length > 0) {
        return value.trim();
      }
    }
  }

  return undefined;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"');
}

function stripHtml(value: string): string {
  return decodeHtmlEntities(value)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractCourtNameReferencesFromHtml(html: string): string[] {
  const refs = new Set<string>();
  const patterns = [
    /<dt>\s*Court\s*<\/dt>\s*<dd>([\s\S]*?)<\/dd>/gi,
    /<strong>\s*Court:\s*<\/strong>\s*([\s\S]*?)<\/p>/gi,
    /<p[^>]*class=["'][^"']*court-name[^"']*["'][^>]*>\s*In the\s+([\s\S]*?)<\/p>/gi,
  ];

  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(html)) !== null) {
      const value = stripHtml(match[1] || '');
      if (value) {
        refs.add(value);
      }
    }
  }

  return Array.from(refs);
}

function assertCourtNameConsistentAcrossDocuments(params: {
  documents: EvictionPackDocument[];
  courtName?: string;
  documentTypes: string[];
}): void {
  const { documents, courtName, documentTypes } = params;

  if (!courtName) {
    return;
  }

  for (const documentType of documentTypes) {
    const document = documents.find((item) => item.document_type === documentType);
    if (!document?.html) {
      continue;
    }

    const courtReferences = extractCourtNameReferencesFromHtml(document.html);
    if (courtReferences.length === 0) {
      const courtNamePattern = new RegExp(escapeRegExp(courtName), 'i');
      if (courtNamePattern.test(document.html)) {
        continue;
      }
      throw new Error(
        `COURT_NAME_MISMATCH: Expected "${courtName}" to appear in ${documentType}, but it did not.`
      );
    }

    for (const reference of courtReferences) {
      if (reference.localeCompare(courtName, 'en-GB', { sensitivity: 'accent' }) !== 0) {
        throw new Error(
          `COURT_NAME_MISMATCH: Expected "${courtName}" in ${documentType}, but found "${reference}".`
        );
      }
    }
  }
}

function applySection8CanonicalNoticeData(
  target: Record<string, any> | null | undefined,
  canonicalNotice: CanonicalSection8NoticeData
): void {
  if (!target) {
    return;
  }

  target.notice_service_date = target.notice_service_date || canonicalNotice.serviceDate;
  target.notice_served_date = target.notice_served_date || canonicalNotice.serviceDate;
  target.section_8_notice_date = target.section_8_notice_date || canonicalNotice.serviceDate;
  target.service_date = target.service_date || canonicalNotice.serviceDate;
  target.notice_date = target.notice_date || canonicalNotice.serviceDate;

  if (canonicalNotice.earliestPossessionDate) {
    target.notice_expiry_date = canonicalNotice.earliestPossessionDate;
    target.earliest_possession_date = canonicalNotice.earliestPossessionDate;
    target.earliest_proceedings_date = canonicalNotice.earliestPossessionDate;
    target.section8_expiry_date = canonicalNotice.earliestPossessionDate;
    target.expiry_date = target.expiry_date || canonicalNotice.earliestPossessionDate;
  }

  if (canonicalNotice.noticePeriodDays > 0) {
    target.notice_period_days = canonicalNotice.noticePeriodDays;
  }

  if (canonicalNotice.explanation) {
    target.earliest_possession_date_explanation = canonicalNotice.explanation;
  }

  if (target.notice && typeof target.notice === 'object') {
    target.notice.service_date = target.notice.service_date || canonicalNotice.serviceDate;
    target.notice.served_date = target.notice.served_date || canonicalNotice.serviceDate;
    if (canonicalNotice.earliestPossessionDate) {
      target.notice.expiry_date = canonicalNotice.earliestPossessionDate;
      target.notice.notice_expiry_date = canonicalNotice.earliestPossessionDate;
      target.notice.earliest_proceedings_date = canonicalNotice.earliestPossessionDate;
    }
  }
}

function getOrdinalSuffix(value: number): string {
  if (value >= 11 && value <= 13) {
    return `${value}th`;
  }

  switch (value % 10) {
    case 1:
      return `${value}st`;
    case 2:
      return `${value}nd`;
    case 3:
      return `${value}rd`;
    default:
      return `${value}th`;
  }
}

function formatPaymentDayDisplay(
  paymentDay?: number | null,
  rentFrequency?: string | null,
  usualPaymentWeekday?: string | null
): string {
  if (!paymentDay || !Number.isFinite(paymentDay)) {
    return 'Per tenancy agreement';
  }

  const frequencyLabel =
    rentFrequency === 'monthly'
      ? 'month'
      : rentFrequency
        ? `${rentFrequency} period`
        : 'rental period';
  const base = `${getOrdinalSuffix(paymentDay)} day of each ${frequencyLabel}`;
  return usualPaymentWeekday ? `${base} (${usualPaymentWeekday})` : base;
}

function formatRentFrequencyLabel(value?: string | null): string {
  const mapping: Record<string, string> = {
    weekly: 'weekly',
    fortnightly: 'fortnightly',
    monthly: 'monthly',
    quarterly: 'quarterly',
    yearly: 'yearly',
  };

  return mapping[value || ''] || String(value || 'monthly');
}

type ComplianceSeverity = 'critical' | 'risk' | 'ok';
type EnglandSection8PackStage = 'stage1' | 'stage2';

interface ComplianceStatusItem {
  severity: ComplianceSeverity;
  title: string;
  detail: string;
  action: string;
}

interface PackNextStepItem {
  step: string;
  title: string;
  detail: string;
}

function buildComplianceStatusItem(
  severity: ComplianceSeverity,
  title: string,
  detail: string,
  action: string,
): ComplianceStatusItem {
  return { severity, title, detail, action };
}

function buildCaseSummaryComplianceItems(params: {
  evictionCase: EvictionCase;
  caseData?: Partial<CaseData> | null;
  wizardFacts?: Record<string, any>;
  noticeServedDate?: string;
  earliestProceedingsDate?: string;
}): ComplianceStatusItem[] {
  const { evictionCase, caseData, wizardFacts, noticeServedDate, earliestProceedingsDate } = params;
  const items: ComplianceStatusItem[] = [];
  const complianceSources = [
    wizardFacts as Record<string, any>,
    caseData as Record<string, any>,
    evictionCase as Record<string, any>,
  ];
  const normalizedRoute = normalizeRoute(
    wizardFacts?.selected_notice_route ||
    wizardFacts?.eviction_route ||
    wizardFacts?.recommended_route ||
    ''
  );
  const isSection21Route = evictionCase.case_type === 'no_fault' || normalizedRoute === 'section_21';
  const normalizedGroundCodes = (evictionCase.grounds || [])
    .map((ground) => String(ground.code || '').replace(/^Ground\s+/i, '').trim().toUpperCase())
    .filter(Boolean);
  const section8DepositExceptionOnly =
    normalizedGroundCodes.length > 0 &&
    normalizedGroundCodes.every((code) => code === '7A' || code === '14');
  const section8DepositBarApplies =
    normalizedGroundCodes.length === 0 ||
    normalizedGroundCodes.some((code) => code !== '7A' && code !== '14');
  const depositProtected = resolveBooleanField(complianceSources, 'deposit_protected');
  const prescribedInfoRecordedDate =
    resolveStringField(
      complianceSources,
      'prescribed_information_date',
      'prescribed_info_date',
      'compliance.prescribed_info_date',
      'section21.prescribed_info_date'
    ) || '';
  const prescribedInfoGiven =
    resolveBooleanField(
      complianceSources,
      'prescribed_info_given',
      'prescribed_info_served',
      'tenancy.prescribed_info_given',
      'compliance.prescribed_info_given',
      'compliance.prescribed_info_served'
    ) === true || Boolean(prescribedInfoRecordedDate);
  const depositScheme =
    resolveStringField(
      complianceSources,
      'deposit_scheme',
      'deposit_scheme_name',
      'tenancy.deposit_scheme_name'
    ) || '';
  const protectedDate =
    resolveStringField(complianceSources, 'deposit_protection_date', 'tenancy.deposit_protection_date') || '';
  const gasEvidenceRecorded =
    resolveBooleanField(
      complianceSources,
      'gas_cert_provided',
      'gas_certificate_provided',
      'gas_safety_provided',
      'gas_safety_certificate',
      'compliance.gas_cert_provided'
    ) === true || Boolean(caseData?.gas_safety_check_date);
  const epcRatingRecorded =
    resolveStringField(complianceSources, 'epc_rating', 'compliance.epc_rating') || '';
  const epcEvidenceRecorded =
    resolveBooleanField(
      complianceSources,
      'epc_provided',
      'epc_served',
      'compliance.epc_provided',
      'compliance.epc_served'
    ) === true || Boolean(epcRatingRecorded || evictionCase.epc_rating || caseData?.epc_provided_date);
  const howToRentRecordedDate =
    resolveStringField(complianceSources, 'how_to_rent_date', 'compliance.how_to_rent_date') || '';
  const howToRentRecorded =
    resolveBooleanField(
      complianceSources,
      'how_to_rent_given',
      'how_to_rent_provided',
      'how_to_rent_served',
      'compliance.how_to_rent_given',
      'compliance.how_to_rent_served'
    ) === true || Boolean(howToRentRecordedDate || caseData?.how_to_rent_date);

  const depositContext = `${depositScheme ? ` with ${depositScheme}` : ''}${protectedDate ? ` on ${formatUKLegalDate(protectedDate)}` : ''}`;
  if (isSection21Route) {
    if (depositProtected === true && prescribedInfoGiven === true) {
      items.push(
        buildComplianceStatusItem(
          'ok',
          'Deposit compliance recorded',
          `Deposit protection and prescribed information are recorded${depositContext}.`,
          'Keep the scheme paperwork and prescribed information record with the notice file.',
        ),
      );
    } else if (depositProtected === true) {
      items.push(
        buildComplianceStatusItem(
          'critical',
          'Prescribed information not confirmed',
          `Deposit protection is recorded${depositContext}, but prescribed information is not recorded as served. Section 21 should not be relied on until that position is corrected and rechecked.`,
          'Confirm service of the prescribed information or resolve the deposit position before relying on the notice.',
        ),
      );
    } else if (depositProtected === false) {
      items.push(
        buildComplianceStatusItem(
          'critical',
          'Deposit protection not recorded',
          'Deposit protection is not recorded. Section 21 should not be relied on until the position is resolved.',
          'Resolve the deposit position before relying on the notice.',
        ),
      );
    } else {
      items.push(
        buildComplianceStatusItem(
          'critical',
          'Deposit protection not confirmed',
          'Deposit protection status is not confirmed in the available pack data.',
          'Check the tenancy file and confirm the deposit position before relying on the notice.',
        ),
      );
    }
  } else {
    if (depositProtected === true && prescribedInfoGiven === true) {
      items.push(
        buildComplianceStatusItem(
          'ok',
          'Deposit compliance recorded',
          `Deposit protection and prescribed information are recorded${depositContext}.`,
          'Retain the scheme certificate and prescribed information record with the case file.',
        ),
      );
    } else if (section8DepositExceptionOnly && depositProtected === true) {
      items.push(
        buildComplianceStatusItem(
          'risk',
          'Prescribed information not confirmed',
          `Deposit protection is recorded${depositContext}, but prescribed information is not recorded as served. Grounds 7A and 14 are not subject to the same possession-order bar, but deposit non-compliance can still generate penalties, counterclaims, or credibility issues and should still be resolved.`,
          'Confirm or cure the prescribed information position before relying on the wider evidence file.',
        ),
      );
    } else if (section8DepositExceptionOnly && depositProtected === false) {
      items.push(
        buildComplianceStatusItem(
          'risk',
          'Deposit protection not recorded',
          'Deposit protection is not recorded. Grounds 7A and 14 are not subject to the same possession-order bar, but deposit non-compliance can still generate penalties, counterclaims, or credibility issues and should still be resolved.',
          'Resolve or document the deposit position before progressing the case.',
        ),
      );
    } else if (depositProtected === true) {
      items.push(
        buildComplianceStatusItem(
          'critical',
          'Prescribed information not confirmed',
          `Deposit protection is recorded${depositContext}, but prescribed information is not recorded as served. For most post-1 May 2026 private-rented-sector grounds, the court will not make a possession order until the deposit position has been cured, the deposit has been returned, or any deposit-compliance dispute has already been resolved.`,
          'Confirm, cure, or return the deposit before relying on the possession route.',
        ),
      );
    } else if (depositProtected === false) {
      items.push(
        buildComplianceStatusItem(
          'critical',
          'Deposit protection not recorded',
          'Deposit protection is not recorded. For most post-1 May 2026 private-rented-sector grounds, the court will not make a possession order until the deposit requirements have been complied with, the deposit has been returned, or any deposit-compliance dispute has already been resolved.',
          'Resolve the deposit issue before serving or issuing on the main possession grounds.',
        ),
      );
    } else if (section8DepositBarApplies) {
      items.push(
        buildComplianceStatusItem(
          'critical',
          'Deposit protection not confirmed',
          'Deposit protection status is not confirmed in the available pack data. For most post-1 May 2026 private-rented-sector grounds, the court will not make a possession order until the deposit position is clear.',
          'Check the tenancy file and confirm the deposit position before serving or issuing.',
        ),
      );
    } else {
      items.push(
        buildComplianceStatusItem(
          'ok',
          'Deposit position not confirmed in pack data',
          'Deposit protection status is not confirmed in the available pack data.',
          'Check the file and record the deposit position so the evidence set stays complete.',
        ),
      );
    }
  }

  if (gasEvidenceRecorded) {
    items.push(
      buildComplianceStatusItem(
        'ok',
        'Gas safety evidence recorded',
        `Gas safety evidence is recorded${caseData?.gas_safety_check_date ? ` on ${formatUKLegalDate(caseData.gas_safety_check_date)}` : ''}.`,
        'Keep the gas safety record with the notice and court file.',
      ),
    );
  } else if (isSection21Route) {
    items.push(
      buildComplianceStatusItem(
        'critical',
        'Gas safety record not confirmed',
        'No gas safety provision is recorded where the requirement may apply.',
        'Confirm the gas safety record before relying on the notice.',
      ),
    );
  } else {
    items.push(
      buildComplianceStatusItem(
        'risk',
        'Gas safety record not confirmed',
        'No gas safety provision is recorded. This does not automatically invalidate a Section 8 notice, but it can create regulatory or evidential risk.',
        'Locate the gas safety record or document why it does not apply before the file is challenged.',
      ),
    );
  }

  if (epcEvidenceRecorded) {
    items.push(
      buildComplianceStatusItem(
        'ok',
        'EPC record recorded',
        `EPC evidence is recorded${evictionCase.epc_rating ? ` (rating ${evictionCase.epc_rating})` : ''}${caseData?.epc_provided_date ? ` on ${formatUKLegalDate(caseData.epc_provided_date)}` : ''}.`,
        'Retain the EPC record with the case file.',
      ),
    );
  } else if (isSection21Route) {
    items.push(
      buildComplianceStatusItem(
        'critical',
        'EPC record not confirmed',
        'No EPC provision is recorded.',
        'Confirm the EPC position before relying on the notice.',
      ),
    );
  } else {
    items.push(
      buildComplianceStatusItem(
        'risk',
        'EPC record not confirmed',
        'No EPC provision is recorded. This is not treated here as automatic Section 8 invalidity, but it remains a legal and evidential risk that should be addressed.',
        'Locate the EPC record or explain the position in the evidence file.',
      ),
    );
  }

  if (howToRentRecorded) {
    items.push(
      buildComplianceStatusItem(
        'ok',
        'How to Rent record recorded',
        `How to Rent service is recorded${caseData?.how_to_rent_date ? ` on ${formatUKLegalDate(caseData.how_to_rent_date)}` : ''}.`,
        'Keep the service record with the tenancy file.',
      ),
    );
  } else if (isSection21Route) {
    items.push(
      buildComplianceStatusItem(
        'critical',
        'How to Rent record not confirmed',
        'No How to Rent service record is shown.',
        'Confirm the service record before relying on the notice.',
      ),
    );
  } else {
    items.push(
      buildComplianceStatusItem(
        'ok',
        'How to Rent record not confirmed',
        'No How to Rent service record is shown. That does not automatically invalidate a Section 8 notice, but it is worth checking the tenancy file and recording what was served.',
        'Check the tenancy file and record the position so the file stays complete.',
      ),
    );
  }

  if (noticeServedDate || earliestProceedingsDate) {
    items.push(
      buildComplianceStatusItem(
        'ok',
        'Notice timeline recorded',
        `Notice served${noticeServedDate ? ` on ${formatUKLegalDate(noticeServedDate)}` : ''}${earliestProceedingsDate ? ` with earliest proceedings date ${formatUKLegalDate(earliestProceedingsDate)}` : ''}.`,
        'Keep the service date, expiry date, and proceedings date aligned across the notice, N215, and any court papers.',
      ),
    );
  }

  return items;
}

function buildSection8GroundsSummary(evictionCase: EvictionCase): string {
  const items = (evictionCase.grounds || [])
    .map((ground) => {
      const rawCode = typeof ground === 'string' ? ground : ground.code;
      const code = String(rawCode || '').replace(/^Ground\s+/i, '').trim();
      if (!code) {
        return null;
      }
      const label = typeof ground === 'string' ? code : ground.mandatory ? 'mandatory' : 'discretionary';
      return `Ground ${code} (${label})`;
    })
    .filter((value): value is string => Boolean(value));

  return items.length > 0 ? items.join(', ') : 'No grounds recorded';
}

function buildPackTitle(stage: EnglandSection8PackStage): string {
  return stage === 'stage1'
    ? 'Stage 1: Section 8 Notice & Service Pack'
    : 'Stage 2: Section 8 Court & Possession Pack';
}

function buildPackStrapline(stage: EnglandSection8PackStage): string {
  return stage === 'stage1'
    ? 'Built to hold up if challenged'
    : 'Carry the case into court without breaking the file';
}

function buildPackSupportingLine(stage: EnglandSection8PackStage): string {
  return stage === 'stage1'
    ? 'This pack aligns the notice, service, and evidence so your case doesn’t fall apart on technical errors.'
    : 'This pack turns the served notice into a court-ready possession file that stays consistent under scrutiny.';
}

function buildPackRiskLine(): string {
  return 'Most possession cases fail on notice, service, or consistency errors — this pack is designed to prevent those.';
}

function buildPackStatusLabel(
  stage: EnglandSection8PackStage,
  items: ComplianceStatusItem[],
): string {
  const hasCritical = items.some((item) => item.severity === 'critical');
  if (hasCritical) {
    return stage === 'stage1' ? 'DO NOT SERVE YET' : 'DO NOT ISSUE - CASE MAY FAIL';
  }

  const hasRisk = items.some((item) => item.severity === 'risk');
  if (hasRisk) {
    return stage === 'stage1' ? 'SERVE WITH RISKS' : 'PREPARE WITH RISKS';
  }

  return stage === 'stage1' ? 'READY TO SERVE' : 'READY FOR COURT';
}

function buildPackOutcomeBullets(stage: EnglandSection8PackStage): string[] {
  if (stage === 'stage1') {
    return [
      'Generates a legally structured Section 8 notice',
      'Aligns service and evidence',
      'Reduces risk of rejection or delay',
    ];
  }

  return [
    'Prepares a possession claim file that can be issued and defended without inconsistency across notice, service, and evidence',
    'Carries the served notice, claim forms, service record, and arrears evidence in one continuous case file',
    'Reduces the risk of delay, contradiction, or avoidable challenge in court',
  ];
}

function buildPackNextStep(stage: EnglandSection8PackStage, noticeExpiryDate?: string): string {
  if (stage === 'stage1') {
    return 'Serve the notice correctly using the service instructions in this pack.';
  }

  return noticeExpiryDate
    ? `Prepare and issue the possession claim using the forms and guidance in this pack once the claim is eligible on or after ${formatUKLegalDate(noticeExpiryDate)}.`
    : 'Prepare and issue the possession claim using the forms and guidance in this pack once the notice timeline allows.';
}

function buildPackNextSteps(
  stage: EnglandSection8PackStage,
  noticeExpiryDate?: string,
): PackNextStepItem[] {
  if (stage === 'stage1') {
    return [
      {
        step: '1',
        title: 'Wait for notice expiry',
        detail: noticeExpiryDate
          ? `Wait until ${formatUKLegalDate(noticeExpiryDate)} before starting possession proceedings.`
          : 'Wait until the notice has expired before starting possession proceedings.',
      },
      {
        step: '2',
        title: 'Move into Stage 2 if the tenant stays',
        detail: 'If the tenant does not leave, move into the Stage 2 Court & Possession Pack so the claim is built from the same file.',
      },
      {
        step: '3',
        title: 'Keep the file aligned',
        detail: 'This pack continues directly into the court-stage paperwork without re-keying the core facts.',
      },
    ];
  }

  return [
    {
      step: '1',
      title: 'Issue the claim when eligible',
      detail: noticeExpiryDate
        ? `Issue the possession claim once the notice period has expired and no earlier than ${formatUKLegalDate(noticeExpiryDate)}.`
        : 'Issue the possession claim once the notice period has expired.',
    },
    {
      step: '2',
      title: 'Prepare for the hearing',
      detail: 'At the hearing, the court will consider notice validity, service, whether the grounds apply, and whether the arrears are proved. Keep the file updated to the latest practicable date.',
    },
    {
      step: '3',
      title: 'Move to possession or enforcement',
      detail: 'If possession is granted, follow the date to leave in the order. If the tenant does not leave, move straight into warrant or enforcement steps using the same continuous file.',
    },
  ];
}

function buildTopRiskTitles(items: ComplianceStatusItem[]): string[] {
  return items
    .filter((item) => item.severity !== 'ok')
    .slice(0, 3)
    .map((item) => item.title);
}

function buildPrimaryStatusItem(items: ComplianceStatusItem[]): ComplianceStatusItem | null {
  return items.find((item) => item.severity === 'critical')
    || items.find((item) => item.severity === 'risk')
    || items[0]
    || null;
}

function buildStage2CourtEvidenceSections(evictionCase: EvictionCase): Array<{
  severity: ComplianceSeverity;
  label: string;
  title: string;
  items: string[];
}> {
  const noticeLabel = getNoticeTypeLabel(evictionCase);

  return [
    {
      severity: 'critical',
      label: 'Critical',
      title: 'Core claim evidence',
      items: [
        'Signed tenancy agreement',
        'Rent account or arrears proof',
        `Served ${noticeLabel} copy`,
      ],
    },
    {
      severity: 'risk',
      label: 'Risk',
      title: 'Compliance and supporting records',
      items: [
        'Deposit compliance evidence',
        'Gas safety record',
        'EPC record',
      ],
    },
    {
      severity: 'ok',
      label: 'OK',
      title: 'Useful supporting material',
      items: [
        'Supporting correspondence',
        'Any payment-history explanations or updated ledger notes',
      ],
    },
  ];
}

function reorderEnglandSection8Stage2Documents(documents: EvictionPackDocument[]): EvictionPackDocument[] {
  const preferredOrder = [
    'case_summary',
    'court_readiness_status',
    'court_forms_guide',
    'n5_claim',
    'n119_particulars',
    'arrears_schedule',
    'section8_notice',
    'service_record_notes',
    'proof_of_service',
    'evidence_checklist',
    'hearing_checklist',
    'what_happens_next',
  ];
  const byType = new Map(documents.map((document) => [document.document_type, document]));

  return preferredOrder
    .map((documentType) => byType.get(documentType))
    .filter((document): document is EvictionPackDocument => Boolean(document));
}

function buildEnglandSection8PackSummaryData(params: {
  stage: EnglandSection8PackStage;
  evictionCase: EvictionCase;
  caseData?: Partial<CaseData> | null;
  wizardFacts?: Record<string, any>;
  section8RenderData?: Record<string, any> | null;
  groundsData: any;
  noticeServedDate?: string;
  noticeExpiryDate?: string;
  earliestProceedingsDate?: string;
  currentArrearsTotal?: number | null;
  arrearsAtNoticeDate?: number | null;
  paymentDay?: number | null;
  usualPaymentWeekday?: string | null;
}): Record<string, any> {
  const {
    stage,
    evictionCase,
    caseData,
    wizardFacts,
    section8RenderData,
    groundsData,
    noticeServedDate,
    noticeExpiryDate,
    earliestProceedingsDate,
    currentArrearsTotal,
    arrearsAtNoticeDate,
    paymentDay,
    usualPaymentWeekday,
  } = params;

  const caseSummaryDraftingData = {
    ...wizardFacts,
    ...evictionCase,
    ...(caseData || {}),
    ground_codes: (evictionCase.grounds || []).map((ground) => typeof ground === 'string' ? ground : ground.code),
    total_arrears: currentArrearsTotal,
    current_arrears: currentArrearsTotal,
    arrears_at_notice_date: arrearsAtNoticeDate,
    notice_served_date: noticeServedDate,
    section_8_notice_date: noticeServedDate,
    notice_expiry_date: noticeExpiryDate,
    rent_due_day: paymentDay,
  };

  const complianceStatusItems = buildCaseSummaryComplianceItems({
    evictionCase,
    caseData,
    wizardFacts,
    noticeServedDate,
    earliestProceedingsDate,
  });
  const stageTitle =
    stage === 'stage1'
      ? 'Case Summary — Stage 1 Notice & Service'
      : 'Case Summary — Stage 2 Court & Possession';

  return {
    ...evictionCase,
    ...(caseData || {}),
    ...(section8RenderData || {}),
    grounds_data: groundsData,
    groundsReliedUpon: (evictionCase.grounds || []).map((ground) => typeof ground === 'string' ? ground : ground.code),
    is_section_21: evictionCase.case_type === 'no_fault',
    generated_date: new Date().toISOString().split('T')[0],
    generated_at: new Date().toISOString(),
    rent_frequency_label: formatRentFrequencyLabel(evictionCase.rent_frequency),
    payment_day_display: formatPaymentDayDisplay(paymentDay, evictionCase.rent_frequency, usualPaymentWeekday),
    notice_served_date: noticeServedDate,
    notice_expiry_date: noticeExpiryDate,
    earliest_proceedings_date: earliestProceedingsDate,
    current_arrears_total: currentArrearsTotal,
    arrears_at_notice_date: arrearsAtNoticeDate,
    grounds_summary_text: buildSection8GroundsSummary(evictionCase),
    case_narrative_text: buildN119ReasonForPossessionText(caseSummaryDraftingData),
    steps_taken_text: buildN119StepsTakenText(caseSummaryDraftingData),
    defendant_circumstances_text: buildN119DefendantCircumstancesText(caseSummaryDraftingData),
    financial_info_text: buildN119FinancialInfoText(caseSummaryDraftingData),
    compliance_status_items: complianceStatusItems,
    court_name:
      section8RenderData?.court_name ||
      caseData?.court_name ||
      evictionCase.court_name,
    pack_stage: stage,
    pack_stage_label: stage === 'stage1' ? 'Stage 1' : 'Stage 2',
    pack_title: buildPackTitle(stage),
    pack_summary_title: stageTitle,
    pack_strapline: buildPackStrapline(stage),
    pack_supporting_line: buildPackSupportingLine(stage),
    risk_line: buildPackRiskLine(),
    status_label: buildPackStatusLabel(stage, complianceStatusItems),
    primary_status_item: buildPrimaryStatusItem(complianceStatusItems),
    key_risk_titles: buildTopRiskTitles(complianceStatusItems),
    what_this_pack_does: buildPackOutcomeBullets(stage),
    next_step_text: buildPackNextStep(stage, noticeExpiryDate),
    next_steps: buildPackNextSteps(stage, noticeExpiryDate),
  };
}

/**
 * Build formatted date fields for Section 8 templates.
 * Ensures service_date_formatted, earliest_possession_date_formatted,
 * tenancy_start_date_formatted, and ground_descriptions are set.
 */
function buildSection8TemplateData(
  evictionCase: EvictionCase,
  wizardFacts: any,
  caseData?: Partial<CaseData> | null
): Record<string, any> {
  const canonicalNotice = resolveSection8CanonicalNoticeData(evictionCase, wizardFacts, caseData);
  const serviceDate = canonicalNotice.serviceDate;
  const earliestPossessionDate = canonicalNotice.earliestPossessionDate;
  const courtName =
    resolveCanonicalCourtName(caseData as Record<string, any>, evictionCase as Record<string, any>, wizardFacts) ||
    'County Court';
  const renderOptions = resolveCourtFacingRenderOptions(
    wizardFacts,
    caseData as Record<string, any>,
    evictionCase as Record<string, any>
  );
  const rawServiceMethod =
    resolveStringField(
      [wizardFacts, caseData as Record<string, any>, evictionCase as Record<string, any>],
      'notice_service_method',
      'service_method',
      'notice.service_method'
    ) || '';
  const templateServiceMethod = mapServiceMethodForTemplate(rawServiceMethod) || rawServiceMethod;
  const complianceSources = [
    wizardFacts as Record<string, any>,
    caseData as Record<string, any>,
    evictionCase as Record<string, any>,
  ];
  const depositProtected = resolveBooleanField(complianceSources, 'deposit_protected');
  const prescribedInfoRecordedDate =
    resolveStringField(
      complianceSources,
      'prescribed_information_date',
      'prescribed_info_date',
      'compliance.prescribed_info_date',
      'section21.prescribed_info_date'
    ) || '';
  const prescribedInfoGiven =
    resolveBooleanField(
      complianceSources,
      'prescribed_info_given',
      'prescribed_info_served',
      'tenancy.prescribed_info_given',
      'compliance.prescribed_info_given',
      'compliance.prescribed_info_served'
    ) === true || Boolean(prescribedInfoRecordedDate);
  const gasCertProvided = resolveBooleanField(
    complianceSources,
    'gas_cert_provided',
    'gas_certificate_provided',
    'gas_safety_provided',
    'gas_safety_certificate',
    'compliance.gas_cert_provided'
  );
  const epcRatingRecorded =
    resolveStringField(complianceSources, 'epc_rating', 'compliance.epc_rating') || '';
  const epcProvided =
    resolveBooleanField(
      complianceSources,
      'epc_provided',
      'epc_served',
      'compliance.epc_provided',
      'compliance.epc_served'
    ) === true || Boolean(epcRatingRecorded);
  const howToRentRecordedDate =
    resolveStringField(complianceSources, 'how_to_rent_date', 'compliance.how_to_rent_date') || '';
  const howToRentGiven =
    resolveBooleanField(
      complianceSources,
      'how_to_rent_given',
      'how_to_rent_provided',
      'how_to_rent_served',
      'compliance.how_to_rent_given',
      'compliance.how_to_rent_served'
    ) === true || Boolean(howToRentRecordedDate);
  const hmoLicenseRequired = resolveBooleanField(
    complianceSources,
    'hmo_license_required',
    'licensing_required',
    'property.hmo_license_required',
    'compliance.hmo_license_required'
  );
  const hmoLicenseValid = resolveBooleanField(
    complianceSources,
    'hmo_license_valid',
    'property_licensed',
    'compliance.hmo_license_valid'
  );
  const depositSchemeName =
    resolveStringField(
      complianceSources,
      'deposit_scheme_name',
      'deposit_scheme',
      'tenancy.deposit_scheme_name'
    ) || '';

  // Resolve tenancy start date
  const tenancyStartDate =
    wizardFacts.tenancy_start_date ||
    evictionCase.tenancy_start_date ||
    '';
  const paymentDay = wizardFacts.rent_due_day || wizardFacts.payment_day || evictionCase.payment_day;
  const usualPaymentWeekday =
    wizardFacts.usual_payment_weekday ||
    wizardFacts.tenancy?.usual_payment_weekday ||
    (caseData as any)?.usual_payment_weekday ||
    '';

  // Build ground descriptions string (e.g., "Ground 8 – Serious rent arrears, Ground 10 – ...")
  const groundDescriptions = evictionCase.grounds
    .map((g) => `Ground ${g.code.replace('Ground ', '')} - ${g.title}`)
    .join(', ');
  const normalizedGroundCodes = evictionCase.grounds
    .map((ground) => String(ground.code || '').replace(/^Ground\s+/i, '').trim().toUpperCase())
    .filter(Boolean);
  const section8DepositExceptionOnly =
    normalizedGroundCodes.length > 0 &&
    normalizedGroundCodes.every((code) => code === '7A' || code === '14');
  const section8DepositBarApplies =
    normalizedGroundCodes.length === 0 ||
    normalizedGroundCodes.some((code) => code !== '7A' && code !== '14');

  const now = new Date().toISOString().split('T')[0];
  const draftingModel = buildEnglandPossessionDraftingModel({
    ...evictionCase,
    ...(caseData || {}),
    ...wizardFacts,
    ground_codes: evictionCase.grounds.map((ground) => String(ground.code).replace(/^Ground\s+/i, '').trim()),
    selected_grounds: evictionCase.grounds.map(
      (ground) => `Ground ${String(ground.code).replace(/^Ground\s+/i, '').trim()}`,
    ),
    notice_service_date: serviceDate,
    notice_served_date: serviceDate,
    notice_expiry_date: earliestPossessionDate,
    earliest_proceedings_date: earliestPossessionDate,
    court_name: courtName,
  });

  return {
    ...evictionCase,
    ...wizardFacts,
    // Raw dates
    service_date: serviceDate,
    notice_service_date: serviceDate,
    notice_date: serviceDate,
    intended_service_date: serviceDate,
    earliest_possession_date: earliestPossessionDate,
    notice_expiry_date: earliestPossessionDate,
    earliest_proceedings_date: earliestPossessionDate,
    section8_expiry_date: earliestPossessionDate,
    expiry_date: earliestPossessionDate,
    tenancy_start_date: tenancyStartDate,
    payment_day: paymentDay,
    usual_payment_weekday: usualPaymentWeekday,
    notice_period_days: canonicalNotice.noticePeriodDays || wizardFacts.notice_period_days || 0,
    earliest_possession_date_explanation:
      canonicalNotice.explanation || wizardFacts.earliest_possession_date_explanation,
    // Formatted dates for templates
    service_date_formatted: formatUKLegalDate(serviceDate),
    notice_date_formatted: formatUKLegalDate(serviceDate),
    earliest_possession_date_formatted: formatUKLegalDate(earliestPossessionDate),
    notice_expiry_date_formatted: formatUKLegalDate(earliestPossessionDate),
    earliest_proceedings_date_formatted: formatUKLegalDate(earliestPossessionDate),
    tenancy_start_date_formatted: formatUKLegalDate(tenancyStartDate),
    generated_date: formatUKLegalDate(now),
    current_date: now,
    form_name: ENGLAND_SECTION8_FORM_NAME,
    notice_name: ENGLAND_SECTION8_NOTICE_NAME,
    notice_type_label: ENGLAND_SECTION8_NOTICE_TYPE_LABEL,
    notice_title: ENGLAND_SECTION8_NOTICE_TITLE,
    court_name: courtName,
    clean_output: renderOptions.cleanOutput,
    court_mode: renderOptions.courtMode,
    selected_notice_route: wizardFacts.selected_notice_route || wizardFacts.eviction_route || 'section_8',
    notice_service_method: rawServiceMethod,
    service_method: templateServiceMethod,
    deposit_protected: depositProtected,
    deposit_scheme_name: depositSchemeName,
    prescribed_info_given: prescribedInfoGiven,
    prescribed_info_served: prescribedInfoGiven,
    gas_cert_provided: gasCertProvided,
    epc_provided: epcProvided,
    how_to_rent_given: howToRentGiven,
    how_to_rent_served: howToRentGiven,
    hmo_license_required: hmoLicenseRequired,
    hmo_license_valid: hmoLicenseValid,
    section8_deposit_exception_only: section8DepositExceptionOnly,
    section8_deposit_bar_applies: section8DepositBarApplies,
    // Ground descriptions for checklist
    ground_descriptions: groundDescriptions,
    grounds: evictionCase.grounds,
    // Convenience flags
    has_mandatory_ground: evictionCase.grounds.some((g) => g.mandatory),
    is_fixed_term: evictionCase.fixed_term === true,
    // oested objects for template compatibility (compliance_checklist.hbs expects these)
    tenancy: {
      start_date: tenancyStartDate,
    },
    notice: {
      ...(wizardFacts.notice || {}),
      service_date: serviceDate,
      served_date: serviceDate,
      expiry_date: earliestPossessionDate,
      notice_expiry_date: earliestPossessionDate,
      earliest_proceedings_date: earliestPossessionDate,
    },
    drafting_model: draftingModel,
    metadata: {
      generated_at: now,
    },
  };
}

function harmonizeEnglandSection8CanonicalContext(params: {
  wizardFacts: Record<string, any>;
  evictionCase: EvictionCase;
  caseData?: Partial<CaseData> | null;
}): Record<string, any> {
  const { wizardFacts, evictionCase, caseData } = params;
  const canonicalSection8Notice = resolveSection8CanonicalNoticeData(evictionCase, wizardFacts, caseData);
  const canonicalCourtName =
    resolveCanonicalCourtName(caseData as Record<string, any>, evictionCase as Record<string, any>, wizardFacts) ||
    'County Court';
  const renderOptions = resolveCourtFacingRenderOptions(
    wizardFacts,
    caseData as Record<string, any>,
    evictionCase as Record<string, any>
  );

  applySection8CanonicalNoticeData(wizardFacts, canonicalSection8Notice);
  applySection8CanonicalNoticeData(caseData as Record<string, any>, canonicalSection8Notice);
  applySection8CanonicalNoticeData(evictionCase as Record<string, any>, canonicalSection8Notice);

  wizardFacts.court_name = canonicalCourtName;
  wizardFacts.clean_output = renderOptions.cleanOutput;
  wizardFacts.court_mode = renderOptions.courtMode;

  if (caseData) {
    caseData.court_name = canonicalCourtName;
    (caseData as Record<string, any>).clean_output = renderOptions.cleanOutput;
    (caseData as Record<string, any>).court_mode = renderOptions.courtMode;
  }

  evictionCase.court_name = canonicalCourtName;
  (evictionCase as Record<string, any>).clean_output = renderOptions.cleanOutput;
  (evictionCase as Record<string, any>).court_mode = renderOptions.courtMode;

  return buildSection8TemplateData(evictionCase, wizardFacts, caseData);
}

function assertArrearsTotalsConsistent(params: {
  canonicalTotal: number;
  documents: EvictionPackDocument[];
  enforce: boolean;
  ground8Eligible?: boolean;
  ground8Selected?: boolean;
}): void {
  const { canonicalTotal, documents, enforce, ground8Eligible, ground8Selected } = params;

  if (!enforce || canonicalTotal <= 0) {
    return;
  }

  const plainTotal = `£${canonicalTotal.toFixed(2)}`;
  const witnessTotal = `£${canonicalTotal.toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const checks = [
    { docType: 'arrears_schedule', expected: plainTotal },
    { docType: 'section8_notice', expected: plainTotal },
    { docType: 'witness_statement', expected: witnessTotal },
    { docType: 'arrears_engagement_letter', expected: plainTotal },
  ];

  const normalizeCurrencyMarkup = (html: string): string =>
    html
      .replace(/&#(?:163|xA3);/gi, '£')
      .replace(/&pound;/gi, '£')
      .replace(/\u00C2\u00A3/g, '£');

  for (const check of checks) {
    const doc = documents.find((item) => item.document_type === check.docType);
    if (!doc?.html) {
      continue;
    }
    if (!normalizeCurrencyMarkup(doc.html).includes(check.expected)) {
      throw new Error(
        `ARREARS_TOTAL_MISMATCH: ${check.docType} does not include canonical total ${check.expected}`
      );
    }
  }

  if (typeof ground8Eligible === 'boolean' && ground8Selected) {
    const section8Doc = documents.find((item) => item.document_type === 'section8_notice');
    if (section8Doc?.html) {
      const hasGround8 = /Ground 8\b/i.test(section8Doc.html);
      if (ground8Eligible && !hasGround8) {
        throw new Error('GROUoD_8_MISSIoG: Ground 8 threshold met but not present in Section 8 notice');
      }
      if (!ground8Eligible && hasGround8) {
        throw new Error('GROUoD_8_PRESEoT: Ground 8 threshold not met but appears in Section 8 notice');
      }
    }
  }
}

// ============================================================================
// TYPES
// ============================================================================

import type { CanonicalJurisdiction } from '@/lib/types/jurisdiction';

export type Jurisdiction = CanonicalJurisdiction;

export interface EvictionCase {
  // Jurisdiction
  jurisdiction: Jurisdiction;

  // Case details
  case_id?: string;
  case_type: 'rent_arrears' | 'antisocial' | 'breach' | 'no_fault' | 'landlord_needs' | 'other';
  case_summary: string;

  // Landlord
  landlord_full_name: string;
  landlord_2_name?: string;
  landlord_address: string;
  landlord_address_line1?: string;
  landlord_address_town?: string;
  landlord_address_postcode?: string;
  landlord_email?: string;
  landlord_phone?: string;

  // Representation (England & Wales)
  solicitor_firm?: string;
  solicitor_address?: string;
  solicitor_phone?: string;
  solicitor_email?: string;
  dx_number?: string;

  // Explicit address-for-service override (if collected separately)
  service_address_line1?: string;
  service_address_line2?: string;
  service_address_town?: string;
  service_address_county?: string;
  service_postcode?: string;
  service_phone?: string;
  service_email?: string;

  // Tenant
  tenant_full_name: string;
  tenant_2_name?: string;
  property_address: string;
  property_address_line1?: string;
  property_address_town?: string;
  property_address_postcode?: string;

  // Tenancy
  tenancy_start_date: string;
  tenancy_type: 'fixed_term' | 'periodic' | 'assured_shorthold' | 'private_residential' | 'ast';
  fixed_term?: boolean;
  fixed_term_end_date?: string;
  rent_amount: number;
  rent_frequency: 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | 'yearly';
  payment_day: number;
  usual_payment_weekday?: string;
  notice_served_date?: string;
  notice_expiry_date?: string;
  earliest_possession_date?: string;

  // Grounds for eviction
  grounds: GroundClaim[];

  // Arrears (if applicable)
  current_arrears?: number;
  arrears_at_notice_date?: number;
  arrears_breakdown?: Array<{
    period: string;
    amount_due: number;
    amount_paid: number;
    balance: number;
  }>;

  // Incident log (for antisocial/nuisance)
  incidents?: Array<{
    date: string;
    time?: string;
    description: string;
    witnesses?: string[];
    police_involved?: boolean;
    crime_number?: string;
  }>;

  // Breach details (if applicable)
  breach_type?: string;
  breach_description?: string;
  breach_start_date?: string;
  warnings_given?: Array<{
    date: string;
    method: string;
    description: string;
  }>;

  // Compliance
  deposit_protected?: boolean;
  deposit_amount?: number;
  deposit_scheme?: string;
  deposit_scheme_name?: 'DPS' | 'MyDeposits' | 'TDS' | 'SafeDeposits Scotland';
  deposit_protection_date?: string;
  deposit_reference?: string;
  gas_safety_certificate?: boolean;
  epc_rating?: string;
  eicr_certificate?: boolean;
  hmo_licensed?: boolean;
  landlord_registered?: boolean; // Scotland
  landlord_registration_number?: string; // Scotland

  // Court details
  court_name?: string;
  court_address?: string;

  // Additional data
  [key: string]: any;
}

/**
 * England deposit protection schemes for Section 21 notices.
 */
type EnglandDepositScheme = 'DPS' | 'MyDeposits' | 'TDS';

/**
 * oarrow deposit scheme to England-only schemes for Section 21 notices.
 * Returns undefined if the scheme is not valid for England.
 */
function toEnglandDepositScheme(
  scheme: 'DPS' | 'MyDeposits' | 'TDS' | 'SafeDeposits Scotland' | undefined
): EnglandDepositScheme | undefined {
  if (scheme === 'DPS' || scheme === 'MyDeposits' || scheme === 'TDS') {
    return scheme;
  }
  // SafeDeposits Scotland is not valid for England Section 21 notices
  return undefined;
}

function extractGroundCodes(section8Grounds: any[]): Array<number | string> {
  if (!Array.isArray(section8Grounds)) return [];

  return section8Grounds
    .map((g) => {
      if (typeof g === 'number') return g;
      if (typeof g !== 'string') return null;
      const match = g.match(/Ground\s+(\d+[A-Z]*)/i) || g.match(/ground[_\s](\d+[A-Z]*)/i);
      if (!match) return null;
      const normalized = match[1].toUpperCase();
      return /^\d+$/.test(normalized) ? parseInt(normalized, 10) : normalized;
    })
    .filter((code): code is number | string => code !== null && !(typeof code === 'number' && Number.isNaN(code)));
}

export interface GroundClaim {
  code: string; // 'Ground 1', 'Ground 8', etc.
  title: string;
  legal_basis?: string; // 'Housing Act 1988, Schedule 2, Ground X'
  particulars: string;
  evidence?: string;
  mandatory?: boolean;
}

export interface EvictionPackDocument {
  title: string;
  description: string;
  category: 'notice' | 'court_form' | 'guidance' | 'evidence_tool' | 'bonus';
  /** Canonical document type key matching pack-contents (e.g., 'section8_notice', 'n5_claim') */
  document_type: string;
  html?: string;
  pdf?: Buffer;
  file_name: string;
}

export interface CompleteEvictionPack {
  case_id: string;
  jurisdiction: Jurisdiction;
  pack_type: 'complete_eviction_pack';
  generated_at: string;
  documents: EvictionPackDocument[];
  metadata: {
    total_documents: number;
    includes_court_forms: boolean;
    includes_expert_guidance: boolean;
    includes_evidence_tools: boolean;
    premium_features: string[];
  };
}

// ============================================================================
// GROUoD DEFIoITIOoS LOADER
// ============================================================================

/**
 * Load eviction grounds for jurisdiction (using canonical jurisdiction values)
 */
export async function loadEvictionGrounds(jurisdiction: Jurisdiction): Promise<any> {
  // Map to appropriate grounds file
  // England and Wales share Housing Act grounds, but Wales has additional Renting Homes Act grounds
  let groundsFile = '';

  if (jurisdiction === 'england') {
    groundsFile = 'england/eviction_grounds.json';
  } else if (jurisdiction === 'wales') {
    groundsFile = 'wales/eviction_grounds.json';
  } else if (jurisdiction === 'scotland') {
    groundsFile = 'scotland/eviction_grounds.json';
  } else if (jurisdiction === 'northern-ireland') {
    groundsFile = 'northern-ireland/eviction_grounds.json';
  }

  const groundsPath = path.join(
    process.cwd(),
    'config',
    'jurisdictions',
    'uk',
    groundsFile
  );

  try {
    const groundsData = await fs.readFile(groundsPath, 'utf-8');
    return JSON.parse(groundsData);
  } catch (error) {
    console.error(`Failed to load eviction grounds for ${jurisdiction}:`, error);
    throw new Error(`Eviction grounds not found for ${jurisdiction}`);
  }
}

/**
 * Get ground details by code
 */
export function getGroundDetails(grounds: any, groundCode: string): any {
  const groundKey = `ground_${groundCode.replace('Ground ', '').toLowerCase()}`;
  return grounds.grounds[groundKey];
}

// ============================================================================
// DOCUMEoT GEoERATORS
// ============================================================================

/**
 * Generate Step-by-Step Eviction Roadmap
 */
async function generateEvictionRoadmap(
  evictionCase: EvictionCase,
  groundsData: any
): Promise<EvictionPackDocument> {
  const jurisdiction = evictionCase.jurisdiction;

  let templatePath = '';
  if (jurisdiction === 'england') {
    templatePath = 'uk/england/templates/eviction/eviction_roadmap.hbs';
  } else if (jurisdiction === 'wales') {
    templatePath = 'uk/wales/templates/eviction/eviction_roadmap.hbs';
  } else if (jurisdiction === 'scotland') {
    templatePath = 'uk/scotland/templates/eviction/eviction_roadmap.hbs';
  } else {
    // oorthern Ireland / fallback
    templatePath = 'shared/templates/eviction_roadmap.hbs';
  }

  const data = {
    ...evictionCase,
    grounds_data: groundsData,
    current_date: new Date().toISOString().split('T')[0],
  };

  const doc = await generateDocument({
    templatePath,
    data,
    isPreview: false,
    outputFormat: 'both',
  });

  return {
    title: 'Step-by-Step Eviction Roadmap',
    description: 'Complete timeline and checklist for your eviction case',
    category: 'guidance',
    document_type: 'eviction_roadmap',
    html: doc.html,
    pdf: doc.pdf,
    file_name: `eviction_roadmap_${jurisdiction}.pdf`,
  };
}

/**
 * Generate Evidence Collection Checklist
 */
async function generateEvidenceChecklist(
  evictionCase: EvictionCase,
  groundsData: any
): Promise<EvictionPackDocument> {
  // ==========================================================================
  // ROUTE-AWARE EVIDEoCE CHECKLIST (P0 FIX - Jan 2026)
  // ==========================================================================
  // Section 21 (no_fault) requires COMPLIAoCE evidence (EPC, Gas, Deposit, etc.)
  // Section 8 (rent_arrears) requires ARREARS evidence (schedules, bank statements)
  // Using wrong checklist can mislead landlords and cause case failure.
  // ==========================================================================
  const isSection21 = evictionCase.case_type === 'no_fault';
  const jurisdiction = evictionCase.jurisdiction || 'england';

  // Select route-appropriate template
  const templatePath = isSection21
    ? `uk/${jurisdiction}/templates/eviction/evidence_collection_checklist_section21.hbs`
    : 'shared/templates/evidence_collection_checklist.hbs';

  // Determine case type label based on grounds
  const hasSection8Grounds = evictionCase.grounds.length > 0;
  const caseTypeLabel = hasSection8Grounds
    ? `Section 8 (${evictionCase.grounds.map(g => g.code).join(', ')})`
    : evictionCase.case_type === 'no_fault' ? 'Section 21' : 'Possession Claim';
  const useEnglandDraftingModel = jurisdiction === 'england' && !isSection21;
  const englandDraftingModel = useEnglandDraftingModel
    ? buildEnglandPossessionDraftingModel(evictionCase as unknown as Record<string, any>)
    : null;

  const data = {
    ...evictionCase,
    // Map tenant_full_name to tenant_name for template compatibility
    tenant_name: evictionCase.tenant_full_name,
    // Map case type for display
    case_type: caseTypeLabel,
    // Add current date
    current_date: formatUKLegalDate(new Date().toISOString().split('T')[0]),
    generated_date: new Date().toISOString().split('T')[0],
    grounds_data: groundsData,
    is_england_post_2026: useEnglandDraftingModel,
    drafting_model: englandDraftingModel,
    required_evidence: evictionCase.grounds.map((g) => {
      const groundDetails = getGroundDetails(groundsData, g.code);
      return {
        ground: g.code,
        title: g.title,
        evidence_items:
          useEnglandDraftingModel && englandDraftingModel
            ? []
            : groundDetails?.required_evidence || [],
      };
    }),
  };

  const doc = await generateDocument({
    templatePath,
    data,
    isPreview: false,
    outputFormat: 'both',
  });

  return {
    title: isSection21 ? 'Evidence Checklist (Section 21 Compliance)' : 'Evidence Collection Checklist',
    description: isSection21
      ? 'Checklist of compliance documents required for Section 21'
      : 'Detailed checklist of all evidence you need to gather',
    category: 'evidence_tool',
    document_type: 'evidence_checklist',
    html: doc.html,
    pdf: doc.pdf,
    file_name: 'evidence_collection_checklist.pdf',
  };
}

/**
 * Get notice type label based on eviction case type and grounds
 */
function getNoticeTypeLabel(evictionCase: EvictionCase): string {
  // Check if this is a Section 8 case (has grounds for possession)
  const hasSection8Grounds = evictionCase.grounds && evictionCase.grounds.length > 0;

  // Scotland ootice to Leave (check first before general no_fault)
  if (evictionCase.jurisdiction === 'scotland') {
    return 'ootice to Leave';
  }

  // Wales routes (check before general no_fault)
  if (evictionCase.jurisdiction === 'wales') {
    if (hasSection8Grounds) {
      return 'Possession ootice (Fault-based)';
    }
    return 'Section 173 ootice (oo-fault)';
  }

  // England routes
  if (hasSection8Grounds) {
    return ENGLAND_SECTION8_NOTICE_NAME;
  }

  // Section 21 (no-fault eviction) for England
  if (evictionCase.case_type === 'no_fault') {
    return 'Section 21 ootice (Form 6A)';
  }

  return 'Possession ootice';
}

/**
 * Map service method code to checkbox-friendly value
 */
function mapServiceMethodForTemplate(method: string | undefined): string {
  if (!method) return '';

  // FIX 6: Expanded mapping to handle all common service method labels
  const methodMap: Record<string, string> = {
    // Post variations
    'first_class_post': 'post',
    'first class post': 'post',
    'firstclasspost': 'post',
    'post': 'post',
    'postal': 'post',
    'royal mail': 'post',
    // Recorded delivery variations
    'recorded_delivery': 'recorded_delivery',
    'recorded delivery': 'recorded_delivery',
    'recordeddelivery': 'recorded_delivery',
    'signed_for': 'recorded_delivery',
    'signed for': 'recorded_delivery',
    'signedfor': 'recorded_delivery',
    'special delivery': 'recorded_delivery',
    // Hand delivery variations
    'hand_delivered': 'hand',
    'hand delivered': 'hand',
    'handdelivered': 'hand',
    'hand': 'hand',
    'in person': 'hand',
    'personal': 'hand',
    'left_at_property': 'hand',
    'left at property': 'hand',
    'letterbox': 'hand',
    'letter box': 'hand',
    'through letterbox': 'hand',
    // Email
    'email': 'email',
    'e-mail': 'email',
  };

  // oormalize to lowercase and remove extra spaces
  const normalized = method.toLowerCase().trim().replace(/\s+/g, ' ');
  return methodMap[normalized] || '';
}

/**
 * Generate Proof of Service Templates
 */
async function generateProofOfService(
  evictionCase: EvictionCase,
  serviceDetails?: {
    service_date?: string;
    expiry_date?: string;
    service_method?: string;
  },
  templateData: Record<string, any> = {}
): Promise<EvictionPackDocument> {
  const jurisdiction = evictionCase.jurisdiction;

  if (jurisdiction === 'england') {
    const pdf = await generateEnglandN215PDF({
      court_name: String(templateData.court_name || evictionCase.court_name || '').trim(),
      claim_number: String(templateData.claim_number || '').trim(),
      claimant_name: String(templateData.landlord_full_name || evictionCase.landlord_full_name || '').trim(),
      defendant_name: String(templateData.tenant_full_name || evictionCase.tenant_full_name || '').trim(),
      signatory_name: String(
        templateData.signatory_name ||
        templateData.landlord_full_name ||
        evictionCase.landlord_full_name ||
        ''
      ).trim(),
      signatory_capacity: templateData.solicitor_firm ? 'claimant_legal_representative' : 'claimant',
      signatory_firm: String(templateData.solicitor_firm || '').trim(),
      signatory_position: String(templateData.signatory_position || '').trim(),
      recipient_name: String(templateData.tenant_full_name || evictionCase.tenant_full_name || '').trim(),
      recipient_capacity:
        ((templateData.notice_service_recipient_capacity as
          | 'claimant'
          | 'defendant'
          | 'solicitor'
          | 'litigation_friend'
          | undefined) || 'defendant'),
      service_location:
        ((templateData.notice_service_location as
          | 'usual_residence'
          | 'last_known_residence'
          | 'place_of_business'
          | 'principal_place_of_business'
          | 'last_known_place_of_business'
          | 'last_known_principal_place_of_business'
          | 'principal_office_of_partnership'
          | 'principal_office_of_corporation'
          | 'principal_office_of_company'
          | 'place_of_business_of_partnership_company_corporation'
          | 'within_jurisdiction_connection'
          | 'other'
          | undefined) || 'usual_residence'),
      service_location_other: String(templateData.notice_service_location_other || '').trim(),
      service_address: String(
        templateData.service_address ||
        templateData.property_address ||
        evictionCase.property_address ||
        ''
      ).trim(),
      service_address_line1: String(
        templateData.service_address_line1 ||
        templateData.property_address_line1 ||
        ''
      ).trim(),
      service_address_line2: String(
        templateData.service_address_line2 ||
        templateData.property_address_line2 ||
        ''
      ).trim(),
      service_address_town: String(
        templateData.service_address_town ||
        templateData.property_address_town ||
        templateData.property_city ||
        ''
      ).trim(),
      service_address_county: String(
        templateData.service_address_county ||
        templateData.property_address_county ||
        ''
      ).trim(),
      service_address_postcode: String(
        templateData.service_address_postcode ||
        templateData.property_address_postcode ||
        templateData.property_postcode ||
        templateData.service_postcode ||
        ''
      ).trim(),
      service_date:
        templateData.notice_service_date ||
        templateData.notice_served_date ||
        templateData.service_date ||
        templateData.notice_date ||
        serviceDetails?.service_date,
      signature_date:
        templateData.signature_date ||
        templateData.notice_service_date ||
        templateData.notice_served_date ||
        templateData.service_date ||
        serviceDetails?.service_date,
      service_time: templateData.service_time || templateData.notice_service_time,
      service_method: normalizeEnglandProofOfServiceMethod(
        templateData.service_method ||
          templateData.notice_service_method ||
          serviceDetails?.service_method,
      ),
      dx_number: String(templateData.dx_number || '').trim(),
      fax_number: String(templateData.fax_number || '').trim(),
      recipient_email: String(templateData.notice_service_recipient_email || templateData.tenant_email || '').trim(),
      other_electronic_identification: String(templateData.other_electronic_identification || '').trim(),
      document_served: templateData.notice_name || getNoticeTypeLabel(evictionCase),
    });

    return {
      title: 'Certificate of Service (Form N215)',
      description: 'Official editable N215 certificate of service for the notice in this pack',
      category: 'evidence_tool',
      document_type: 'proof_of_service',
      html: undefined,
      pdf: Buffer.from(pdf),
      file_name: 'form_n215_certificate_of_service.pdf',
    };
  }

  const templatePath = 'shared/templates/proof_of_service.hbs';

  // Get notice type based on case
  const noticeType = templateData.notice_name || getNoticeTypeLabel(evictionCase);

  // Format dates if provided
  const serviceDate = templateData.notice_service_date || templateData.service_date || serviceDetails?.service_date;
  const expiryDate =
    templateData.notice_expiry_date ||
    templateData.earliest_possession_date ||
    templateData.earliest_proceedings_date ||
    serviceDetails?.expiry_date;
  const earliestProceedingsDate =
    templateData.earliest_proceedings_date ||
    templateData.notice_expiry_date ||
    templateData.earliest_possession_date ||
    serviceDetails?.expiry_date;
  const serviceDateFormatted = serviceDate ? formatUKLegalDate(serviceDate) : '';
  const expiryDateFormatted = expiryDate
    ? formatUKLegalDate(expiryDate)
    : '';
  const earliestProceedingsDateFormatted = earliestProceedingsDate
    ? formatUKLegalDate(earliestProceedingsDate)
    : '';

  const data = {
    ...evictionCase,
    ...templateData,
    // Map notice type based on route
    notice_type: noticeType,
    // Map service details
    service_date_formatted: serviceDateFormatted,
    earliest_possession_date_formatted: expiryDateFormatted,
    notice_expiry_date_formatted: expiryDateFormatted,
    earliest_proceedings_date_formatted: earliestProceedingsDateFormatted,
    notice_expiry_date: expiryDate,
    earliest_proceedings_date: earliestProceedingsDate,
    // Map service method for checkbox matching
    service_method: mapServiceMethodForTemplate(
      templateData.service_method || templateData.notice_service_method || serviceDetails?.service_method
    ),
    // Add current date for reference
    current_date: formatUKLegalDate(new Date().toISOString().split('T')[0]),
    current_date_short: new Date().toISOString().split('T')[0].replace(/-/g, ''),
    served_by: '',
  };

  const doc = await generateDocument({
    templatePath,
    data,
    isPreview: false,
    outputFormat: 'both',
  });

  return {
    title: 'Proof of Service Certificate',
    description: 'Template for proving you served the notice correctly',
    category: 'evidence_tool',
    document_type: 'proof_of_service',
    html: doc.html,
    pdf: doc.pdf,
    file_name: 'proof_of_service_template.pdf',
  };
}

/**
 * Generate Expert Guidance Document
 */
async function generateExpertGuidance(
  evictionCase: EvictionCase,
  groundsData: any
): Promise<EvictionPackDocument> {
  const jurisdiction = evictionCase.jurisdiction;
  // Use canonical jurisdiction for template path
  const templatePath = `uk/${jurisdiction}/templates/eviction/expert_guidance.hbs`;

  const data = {
    ...evictionCase,
    grounds_data: groundsData,
    common_mistakes: [],
    best_practices: [],
  };

  const doc = await generateDocument({
    templatePath,
    data,
    isPreview: false,
    outputFormat: 'both',
  });

  return {
    title: 'Expert Eviction Guidance',
    description:
      'Professional tips, common mistakes to avoid, and success strategies',
    category: 'guidance',
    document_type: 'expert_guidance',
    html: doc.html,
    pdf: doc.pdf,
    file_name: 'expert_eviction_guidance.pdf',
  };
}

/**
 * Generate Timeline Expectations Document
 */
async function generateTimelineExpectations(
  evictionCase: EvictionCase,
  groundsData: any
): Promise<EvictionPackDocument> {
  const templatePath = 'shared/templates/eviction_timeline.hbs';

  const data = {
    ...evictionCase,
    grounds_data: groundsData,
    estimated_timeline: calculateEstimatedTimeline(evictionCase),
  };

  const doc = await generateDocument({
    templatePath,
    data,
    isPreview: false,
    outputFormat: 'both',
  });

  return {
    title: 'Eviction Timeline & Expectations',
    description: 'Realistic timeline for each stage of your eviction case',
    category: 'guidance',
    document_type: 'eviction_timeline',
    html: doc.html,
    pdf: doc.pdf,
    file_name: 'eviction_timeline_expectations.pdf',
  };
}

/**
 * Calculate leaving date based on notice period
 */
function calculateLeavingDate(noticePeriodDays: number): string {
  const today = new Date();
  const leavingDate = new Date(
    today.getTime() + noticePeriodDays * 24 * 60 * 60 * 1000
  );
  return leavingDate.toISOString().split('T')[0];
}


/**
 * Calculate estimated timeline based on jurisdiction and grounds
 */
function calculateEstimatedTimeline(evictionCase: EvictionCase): {
  notice_stage: { start: string; end: string };
  court_stage?: { start: string; end: string };
  enforcement_stage?: { start: string; end: string };
} {
  const baseDaysootice = 14; // generic baseline – templates can explain nuances
  const baseDaysCourt = 90;
  const baseDaysEnforcement = 60;

  const today = new Date();

  const hasMandatoryGround = evictionCase.grounds?.some((g) => g.mandatory);
  const jurisdiction = evictionCase.jurisdiction;

  // Simple tweaks – you can refine per-ground in templates:
  let noticeDays = baseDaysootice;
  let courtDays = baseDaysCourt;
  let enforcementDays = baseDaysEnforcement;

  if (jurisdiction === 'england' || jurisdiction === 'wales') {
    // Section 8 mandatory arrears / strong grounds often resolve a bit faster
    if (hasMandatoryGround) {
      courtDays -= 14;
    }
  } else if (jurisdiction === 'scotland') {
    // Tribunal tends to be slower in practice
    courtDays += 30;
  }

  const noticeStart = today;
  const noticeEnd = new Date(
    noticeStart.getTime() + noticeDays * 24 * 60 * 60 * 1000
  );

  const courtStart = new Date(noticeEnd.getTime());
  const courtEnd = new Date(
    courtStart.getTime() + courtDays * 24 * 60 * 60 * 1000
  );

  const enforcementStart = new Date(courtEnd.getTime());
  const enforcementEnd = new Date(
    enforcementStart.getTime() + enforcementDays * 24 * 60 * 60 * 1000
  );

  const fmt = (d: Date) => d.toISOString().split('T')[0];

  return {
    notice_stage: {
      start: fmt(noticeStart),
      end: fmt(noticeEnd),
    },
    court_stage: {
      start: fmt(courtStart),
      end: fmt(courtEnd),
    },
    enforcement_stage: {
      start: fmt(enforcementStart),
      end: fmt(enforcementEnd),
    },
  };
}

// ============================================================================
// REGIOo-SPECIFIC GEoERATORS
// ============================================================================

/**
 * Generate England & Wales Eviction Pack
 */
async function generateEnglandOrWalesEvictionPack(
  evictionCase: EvictionCase,
  caseData: CaseData,
  groundsData: any,
  wizardFacts?: any
): Promise<EvictionPackDocument[]> {
  const documents: EvictionPackDocument[] = [];
  const jurisdiction = evictionCase.jurisdiction; // 'england' or 'wales'
  const derivedRoute = deriveEvictionRoute(wizardFacts);
  const isSection21Route = derivedRoute === 'section21';
  const isSection8Route = derivedRoute === 'section8';
  const section8WizardFacts = wizardFacts || {};
  const section8TemplateData =
    jurisdiction === 'england' && isSection8Route && evictionCase.grounds.length > 0
      ? harmonizeEnglandSection8CanonicalContext({
          wizardFacts: section8WizardFacts,
          caseData,
          evictionCase,
        })
      : null;

  // 1. Section 8 ootice (if fault-based grounds)
  if (evictionCase.grounds.length > 0) {
    const currentSection8TemplateData =
      section8TemplateData ||
      harmonizeEnglandSection8CanonicalContext({
        wizardFacts: section8WizardFacts,
        caseData,
        evictionCase,
      });
    const section8Data: Section8NoticeData = {
      landlord_full_name: evictionCase.landlord_full_name,
      landlord_address: evictionCase.landlord_address,
      landlord_phone: evictionCase.landlord_phone,
      landlord_2_name: evictionCase.landlord_2_name,
      tenant_full_name: evictionCase.tenant_full_name,
      tenant_2_name: evictionCase.tenant_2_name,
      property_address: evictionCase.property_address,
      tenancy_start_date: evictionCase.tenancy_start_date,
      rent_amount: evictionCase.rent_amount,
      rent_frequency: evictionCase.rent_frequency,
      payment_date: evictionCase.payment_day,
      grounds: await Promise.all(
        evictionCase.grounds.map((ground) => mapEvictionCaseGroundToSection8NoticeGround(ground, groundsData))
      ),
      service_date: currentSection8TemplateData.service_date || undefined,
      notice_period_days: currentSection8TemplateData.notice_period_days || 0,
      earliest_possession_date: currentSection8TemplateData.earliest_possession_date || '',
      earliest_proceedings_date: currentSection8TemplateData.earliest_proceedings_date || '',
      any_mandatory_ground: evictionCase.grounds.some((g) => g.mandatory),
      any_discretionary_ground: evictionCase.grounds.some((g) => !g.mandatory),
      form_name: currentSection8TemplateData.form_name,
      notice_name: currentSection8TemplateData.notice_name,
      notice_title: currentSection8TemplateData.notice_title,
      clean_output: currentSection8TemplateData.clean_output,
      court_mode: currentSection8TemplateData.court_mode,
    };

    const section8Doc = await generateSection8Notice(section8Data, false);

    documents.push({
      title: ENGLAND_SECTION8_NOTICE_TITLE,
      description: 'Official notice to tenant citing grounds for possession',
      category: 'notice',
      document_type: 'section8_notice',
      html: section8Doc.html,
      pdf: section8Doc.pdf,
      file_name: 'section8_notice.pdf',
    });

    if (jurisdiction === 'england' && isSection8Route) {
      const serviceInstructionsDoc = await generateDocument({
        templatePath: 'uk/england/templates/eviction/service_instructions_section_8.hbs',
        data: {
          ...currentSection8TemplateData,
          pack_stage: 'stage2',
          pack_title: buildPackTitle('stage2'),
          pack_strapline: buildPackStrapline('stage2'),
          pack_supporting_line: buildPackSupportingLine('stage2'),
          risk_line: buildPackRiskLine(),
        },
        isPreview: false,
        outputFormat: 'both',
      });

      documents.push({
        title: 'Service Instructions',
        description: `Service playbook for the ${ENGLAND_SECTION8_NOTICE_NAME} and court file`,
        category: 'guidance',
        document_type: 'service_instructions',
        html: serviceInstructionsDoc.html,
        pdf: serviceInstructionsDoc.pdf,
        file_name: 'service_instructions_s8.pdf',
      });
    }
  }

  // 2. Section 21 ootice (if no-fault) - EoGLAoD OoLY
  if (isSection21Route) {
    // Section 21 is OoLY valid in England
    if (jurisdiction !== 'england') {
      throw new Error(
        `Section 21 (no-fault eviction) is not available in ${jurisdiction}. ` +
        `${jurisdiction === 'wales' ? 'Wales uses Section 173 notices under the Renting Homes (Wales) Act 2016.' : ''}`
      );
    }

    // =========================================================================
    // P0 FIX: JOIoT PARTY VALIDATIOo (Jan 2026)
    // Block generation if joint landlords/tenants indicated but names missing.
    // A Section 21 notice with missing party names is IoVALID.
    // =========================================================================
    // Count provided party names for validation
    const landlordCount = [evictionCase.landlord_full_name, evictionCase.landlord_2_name]
      .filter(Boolean).length;
    const tenantCount = [
      evictionCase.tenant_full_name,
      evictionCase.tenant_2_name,
      wizardFacts?.tenant3_name,
      wizardFacts?.tenant4_name,
    ].filter(Boolean).length;

    const jointPartyData: JointPartyData = {
      has_joint_landlords: wizardFacts?.has_joint_landlords,
      num_landlords: wizardFacts?.num_landlords || (wizardFacts?.has_joint_landlords ? Math.max(landlordCount, 2) : 1),
      landlord_full_name: evictionCase.landlord_full_name,
      landlord_2_name: evictionCase.landlord_2_name,
      has_joint_tenants: wizardFacts?.has_joint_tenants,
      num_tenants: wizardFacts?.num_tenants || (wizardFacts?.has_joint_tenants ? Math.max(tenantCount, 2) : 1),
      tenant_full_name: evictionCase.tenant_full_name,
      tenant_2_name: evictionCase.tenant_2_name,
      tenant_3_name: wizardFacts?.tenant3_name,
      tenant_4_name: wizardFacts?.tenant4_name,
    };

    const jointPartyResult = validateJointParties(jointPartyData);
    if (!jointPartyResult.isValid) {
      const errors = jointPartyResult.issues
        .filter(i => i.severity === 'error')
        .map(i => `${i.field}: ${i.message}`)
        .join('; ');
      throw new Error(
        `Cannot generate Section 21 pack: ${errors}. ` +
        `ALL landlords and tenants named on the tenancy MUST be named on the notice.`
      );
    }

    // =========================================================================
    // P0 FIX: COMPLIAoCE TIMIoG VALIDATIOo (Jan 2026)
    // Validate that compliance documents were provided at legally required times.
    // HARD BLOCK: oo bypass allowed - compliance timing is a statutory requirement.
    //
    // CAoOoICAL BUILDER (Jan 2026 consistency fix):
    // Uses buildComplianceTimingDataWithFallback() to ensure all endpoints use
    // the same field alias resolution. This prevents inconsistent behavior
    // between wizard generate, fulfill, and regenerate flows.
    // The evictionCase provides fallback values for key fields like tenancy_start_date.
    // =========================================================================
    const timingData = buildComplianceTimingDataWithFallback(
      wizardFacts as Record<string, unknown> | null,
      evictionCase
    );

    const timingResult = validateComplianceTiming(timingData);
    if (!timingResult.isValid) {
      // =========================================================================
      // P0 FIoAL GATE: BLOCK GEoERATIOo Oo COMPLIAoCE TIMIoG VIOLATIOoS
      // =========================================================================
      // LEGAL RATIOoALE: Courts WILL dismiss Section 21 claims where compliance
      // documents were not provided at the legally required times:
      // - EPC: Must be provided before tenancy start (Energy Performance of
      //   Buildings Regulations 2012)
      // - Gas Safety: Must be provided before occupation (Gas Safety Regulations 1998)
      // - How to Rent: Must be provided before tenancy (Deregulation Act 2015,
      //   for tenancies starting on/after 1 October 2015)
      // - Prescribed Info: Must be within 30 days (Housing Act 2004, s.213)
      //
      // oO BYPASS: Compliance timing is a statutory requirement. Users must fix
      // their compliance data in the wizard before pack generation can proceed.
      // =========================================================================
      console.error('🚨 COMPLIANCE TIMING VIOLATIONS DETECTED (Section 21 may be INVALID):');
      for (const issue of timingResult.issues) {
        const severity = issue.severity === 'error' ? '🚨 BLOCK:' : '⚠️ WARN:';
        console.error(`  ${severity} [${issue.field}] ${issue.message}`);
        if (issue.expected) console.error(`     Expected: ${issue.expected}`);
        if (issue.actual) console.error(`     Actual: ${issue.actual}`);
      }

      // Build structured error for user-friendly display
      const blockingIssues = timingResult.issues.filter(i => i.severity === 'error');
      const error = new Error('COMPLIAoCE_TIMIoG_BLOCK');
      (error as any).code = 'COMPLIAoCE_TIMIoG_BLOCK';
      (error as any).issues = blockingIssues;
      (error as any).tenancy_start_date = evictionCase.tenancy_start_date;
      (error as any).statusCode = 422;
      throw error;
    }

    // =========================================================================
    // FIX 2 & 3 (Jan 2026): COMPUTE UoIFIED EXPIRY DATE FIRST
    // =========================================================================
    // Calculate the notice expiry date OoCE using the unified function.
    // This ensures Form 6A, o5B Q10(e), Proof of Service, and Witness Statement
    // all show the SAME expiry date.
    // =========================================================================
    const section21ServiceDate =
      caseData.section_21_notice_date ||
      caseData.notice_served_date ||
      wizardFacts?.notice_served_date ||
      wizardFacts?.notice_service_date ||
      wizardFacts?.notice_date ||
      new Date().toISOString().split('T')[0];

    const section21ServiceMethod =
      caseData.notice_service_method ||
      wizardFacts?.notice_service_method ||
      wizardFacts?.service_method ||
      'First class post'; // Default to postal service

    // Compute unified expiry date for cross-document consistency
    const unifiedExpiryDate = getUnifiedNoticeExpiryDate({
      service_date: section21ServiceDate,
      tenancy_start_date: evictionCase.tenancy_start_date,
      fixed_term: evictionCase.fixed_term,
      fixed_term_end_date: evictionCase.fixed_term_end_date,
      has_break_clause: wizardFacts?.has_break_clause,
      break_clause_date: wizardFacts?.break_clause_date,
      rent_frequency: evictionCase.rent_frequency,
      service_method: section21ServiceMethod,
    });

    console.log(`📅 Section 21 pack unified expiry date: ${unifiedExpiryDate}`);

    // Store in caseData for all downstream document generators
    if (unifiedExpiryDate) {
      caseData.notice_expiry_date = unifiedExpiryDate;
    }

    // Build Section21ooticeData from evictionCase to use the canonical notice generator
    // CRITICAL: Include compliance confirmations from wizardFacts - these are required for validation
    const section21Data: Section21NoticeData = {
      landlord_full_name: evictionCase.landlord_full_name,
      landlord_2_name: evictionCase.landlord_2_name,
      landlord_address: evictionCase.landlord_address,
      landlord_email: evictionCase.landlord_email,
      landlord_phone: evictionCase.landlord_phone,
      tenant_full_name: evictionCase.tenant_full_name,
      tenant_2_name: evictionCase.tenant_2_name,
      property_address: evictionCase.property_address,
      tenancy_start_date: evictionCase.tenancy_start_date,
      fixed_term: evictionCase.fixed_term,
      fixed_term_end_date: evictionCase.fixed_term_end_date,
      rent_amount: evictionCase.rent_amount,
      rent_frequency: evictionCase.rent_frequency,
      expiry_date: unifiedExpiryDate || '', // Use pre-computed unified expiry date
      service_date: section21ServiceDate,
      service_method: section21ServiceMethod.toLowerCase().includes('post') ? 'first_class_post' : 'hand_delivery',
      deposit_protected: evictionCase.deposit_protected,
      deposit_amount: evictionCase.deposit_amount,
      deposit_scheme: toEnglandDepositScheme(evictionCase.deposit_scheme_name),
      deposit_reference: evictionCase.deposit_reference,
      gas_certificate_provided: evictionCase.gas_safety_certificate,
      epc_rating: evictionCase.epc_rating,
      // Compliance confirmations from wizard - check multiple possible field names
      prescribed_info_given: wizardFacts?.prescribed_info_given ??
        wizardFacts?.prescribed_info_served ??
        wizardFacts?.tenancy?.prescribed_info_given ??
        wizardFacts?.section21?.prescribed_info_given,
      how_to_rent_provided: wizardFacts?.how_to_rent_provided ??
        wizardFacts?.how_to_rent_served ??
        wizardFacts?.section21?.how_to_rent_provided,
      epc_provided: wizardFacts?.epc_provided ??
        wizardFacts?.epc_served ??
        wizardFacts?.section21?.epc_provided ??
        (evictionCase.epc_rating ? true : undefined), // If EPC rating exists, EPC was provided
    };

    // Use canonical Section 21 notice generator (single source of truth)
    const section21Doc = await generateSection21Notice(section21Data, false);

    // =========================================================================
    // COURT-READY VALIDATIOo (Jan 2026 Audit)
    // Scan the generated Form 6A for any placeholder text or template leakage.
    // This is the LAST LIoE OF DEFEoSE before court submission.
    // =========================================================================
    const { validateSection21CourtReady, logValidationResults: logS21Validation } = await import('./court-ready-validator');
    const s21Validation = validateSection21CourtReady(section21Doc.html || '', 'section21_form6a');
    if (!s21Validation.isValid) {
      console.error('🚨 Section 21 Form 6A FAILED court-ready validation:');
      logS21Validation([s21Validation]);
      // In production, this should block the pack generation
      // For now, log the error but continue to allow existing flows
      // TODO: Consider throwing here after sufficient testing
    } else {
      console.log('✅ Section 21 Form 6A passed court-ready validation');
    }

    documents.push({
      title: 'Section 21 Notice - Form 6A',
      description: 'Official no-fault eviction notice (2 months) - England only',
      category: 'notice',
      document_type: 'section21_notice',
      html: section21Doc.html,
      pdf: section21Doc.pdf,
      file_name: 'section21_form6a.pdf',
    });

    // Accelerated possession claim (o5B)
    // CRITICAL: Pass jurisdiction to select correct Wales/England form
    // FIX 2 (Jan 2026): Ensure notice_expiry_date is ALWAYS populated for Q10(e)

    // =========================================================================
    // o5B MAoDATORY FIELD VALIDATIOo
    // =========================================================================
    // Courts WILL reject o5B claims with missing Q9a-Q9g, Q10a, Q19, Q20 answers.
    // Validate before generation to provide clear error messages to users.
    // =========================================================================
    const n5bFields = buildN5BFields(wizardFacts || {});
    const n5bValidation = checkN5BMandatoryFields(n5bFields);
    if (!n5bValidation.isValid) {
      throw new N5BMissingFieldError(
        n5bValidation.missingFields,
        Object.fromEntries(
          n5bValidation.missingFields.map((f, i) => [f, n5bValidation.missingLabels[i]])
        )
      );
    }

    const n5bPdf = await fillN5BForm({
      ...caseData,
      jurisdiction, // Ensures Wales uses o5B_WALES_0323.pdf, England uses n5b-eng.pdf
      landlord_full_name: caseData.landlord_full_name || evictionCase.landlord_full_name,
      landlord_2_name: caseData.landlord_2_name || evictionCase.landlord_2_name, // FIX 1: Support second claimant
      landlord_address: caseData.landlord_address || evictionCase.landlord_address,
      landlord_postcode: caseData.landlord_postcode || evictionCase.landlord_address_postcode,
      tenant_full_name: caseData.tenant_full_name || evictionCase.tenant_full_name,
      tenant_2_name: caseData.tenant_2_name || evictionCase.tenant_2_name, // FIX 1: Support second defendant
      property_address: caseData.property_address || evictionCase.property_address,
      property_postcode: caseData.property_postcode || evictionCase.property_address_postcode,
      tenancy_start_date: caseData.tenancy_start_date || evictionCase.tenancy_start_date,
      rent_amount: caseData.rent_amount ?? evictionCase.rent_amount,
      rent_frequency: caseData.rent_frequency || evictionCase.rent_frequency,
      deposit_protection_date: caseData.deposit_protection_date,
      deposit_reference: caseData.deposit_reference,
      deposit_scheme: caseData.deposit_scheme,
      // FIX 2 & 3: Use unified service date and expiry date
      section_21_notice_date: section21ServiceDate,
      notice_service_method: section21ServiceMethod,
      notice_expiry_date: unifiedExpiryDate || caseData.notice_expiry_date, // FIX 2: Ensure Q10(e) is ALWAYS populated
      signature_date: caseData.signature_date || new Date().toISOString().split('T')[0],
      signatory_name: caseData.signatory_name || evictionCase.landlord_full_name,
      court_name: caseData.court_name || 'County Court',
      // FIX 4: Deterministic attachment checkbox flags
      tenancy_agreement_uploaded: true, // Section 21 pack always includes tenancy details
      notice_copy_available: true, // Pack always includes Form 6A
      service_proof_available: true, // Pack always includes Proof of Service template
      deposit_certificate_available: evictionCase.deposit_protected === true,
      // FIX (Jan 2026): Use caseData values (which are properly mapped through n5b-field-builder)
      // rather than direct wizardFacts checks which use wrong field names.
      // caseData already has epc_provided, gas_safety_provided, how_to_rent_provided mapped
      // from wizard aliases (epc_served, gas_safety_cert_served, how_to_rent_served).
      // Only override if caseData doesn't have the value (fallback).
      epc_provided: caseData.epc_provided ?? (
        wizardFacts?.epc_provided === true || wizardFacts?.epc_served === true
      ),
      gas_safety_provided: caseData.gas_safety_provided ?? (
        (wizardFacts?.gas_safety_provided === true || wizardFacts?.gas_safety_cert_served === true || wizardFacts?.gas_cert_served === true) &&
        wizardFacts?.has_gas_at_property !== false && wizardFacts?.has_gas_appliances !== false
      ),
      has_gas_at_property: caseData.has_gas_at_property ?? wizardFacts?.has_gas_at_property ?? wizardFacts?.has_gas_appliances,
      how_to_rent_provided: caseData.how_to_rent_provided ?? (
        wizardFacts?.how_to_rent_provided === true || wizardFacts?.how_to_rent_served === true
      ),
    });

    documents.push({
      title: 'N5B Accelerated Possession Claim',
      description: 'Accelerated possession claim for Section 21 cases',
      category: 'court_form',
      document_type: 'n5b_claim',
      pdf: Buffer.from(n5bPdf),
      file_name: 'n5b_accelerated_possession.pdf',
    });
  }

  // =========================================================================
  // SECTIOo 21 ROUTE LOCK: o5 and o119 are OoLY for Section 8 (fault-based)
  // Section 21 uses accelerated possession (o5B) - no o5/o119 needed
  // This enforces the route-to-document mapping from pack-contents.ts
  // =========================================================================
  if (isSection8Route) {
    // 3. o5 Claim Form (Section 8 only)
    // CRITICAL: Pass jurisdiction to select correct Wales/England forms
    const service = buildServiceContact({ ...evictionCase, ...caseData });

    const enrichedCaseData: CaseData = {
      ...caseData,
      jurisdiction, // Ensures Wales uses o5_WALES/o119_WALES forms, England uses n5-eng/n119-eng
      landlord_full_name: caseData.landlord_full_name || evictionCase.landlord_full_name,
      landlord_address: caseData.landlord_address || evictionCase.landlord_address,
      landlord_postcode: caseData.landlord_postcode || evictionCase.landlord_address_postcode,
      landlord_phone: caseData.landlord_phone || evictionCase.landlord_phone,
      landlord_email: caseData.landlord_email || evictionCase.landlord_email,
      tenant_full_name: caseData.tenant_full_name || evictionCase.tenant_full_name,
      property_address: caseData.property_address || evictionCase.property_address,
      property_postcode: caseData.property_postcode || evictionCase.property_address_postcode,
      tenancy_start_date: caseData.tenancy_start_date || evictionCase.tenancy_start_date,
      rent_amount: caseData.rent_amount ?? evictionCase.rent_amount,
      rent_frequency: caseData.rent_frequency || evictionCase.rent_frequency,
      signatory_name: caseData.signatory_name || evictionCase.landlord_full_name,
      signature_date: caseData.signature_date || new Date().toISOString().split('T')[0],
      court_name: caseData.court_name || evictionCase.court_name || 'County Court',
      notice_served_date:
        caseData.notice_served_date ||
        caseData.section_8_notice_date ||
        caseData.section_21_notice_date ||
        evictionCase['notice_date'],
      service_address_line1: service.service_address_line1,
      service_address_line2: service.service_address_line2,
      service_address_town: service.service_address_town,
      service_address_county: service.service_address_county,
      service_postcode: service.service_postcode,
      service_phone: service.service_phone,
      service_email: service.service_email,
    };

    const n5Pdf = await fillN5Form(enrichedCaseData);
    documents.push({
      title: 'Form N5 - Claim for Possession',
      description: 'Official court claim form for possession proceedings',
      category: 'court_form',
      document_type: 'n5_claim',
      pdf: Buffer.from(n5Pdf),
      file_name: 'n5_claim_for_possession.pdf',
    });

    // 4. o119 Particulars of Claim (Section 8 only)
    const n119Pdf = await fillN119Form(enrichedCaseData);
    documents.push({
      title: 'Form N119 - Particulars of Claim',
      description: 'Detailed particulars supporting your possession claim',
      category: 'court_form',
      document_type: 'n119_particulars',
      pdf: Buffer.from(n119Pdf),
      file_name: 'n119_particulars_of_claim.pdf',
    });
  }

  return documents;
}

/**
 * Generate Scotland Eviction Pack
 */
async function generateScotlandEvictionPack(
  evictionCase: EvictionCase,
  scotlandData: ScotlandCaseData
): Promise<EvictionPackDocument[]> {
  const documents: EvictionPackDocument[] = [];

  const { fillScotlandOfficialForm } = await import('./scotland-forms-filler');

  // 1. ootice to Leave (generated via Handlebars template because official PDF is not fillable)
  const noticeToLeaveDoc = await generateDocument({
    templatePath: 'uk/scotland/templates/eviction/notice_to_leave.hbs',
    data: scotlandData,
    outputFormat: 'both',
  });

  if (!noticeToLeaveDoc.pdf) {
    throw new Error('Failed to generate Notice to Leave PDF for Scotland');
  }

  documents.push({
    title: 'Notice to Leave',
    description: 'Official notice under Private Housing (Tenancies) (Scotland) Act 2016',
    category: 'notice',
    document_type: 'notice_to_leave',
    html: noticeToLeaveDoc.html,
    pdf: noticeToLeaveDoc.pdf,
    file_name: 'notice_to_leave.pdf',
  });

  // 2. Tribunal Application Form E (Official Form)
  const formEPdf = await fillScotlandOfficialForm('form_e', scotlandData);

  documents.push({
    title: 'Form E - Tribunal Application for Eviction Order',
    description: 'Application to First-tier Tribunal for Scotland (Housing and Property Chamber)',
    category: 'court_form',
    document_type: 'form_e_tribunal',
    pdf: Buffer.from(formEPdf),
    file_name: 'tribunal_form_e_application.pdf',
  });

  return documents;
}

// ============================================================================
// MAIo GEoERATOR
// ============================================================================

/**
 * Generate Complete Eviction Pack
 *
 * Includes everything a landlord needs from notice to possession order:
 * - All region-specific notices
 * - All court/tribunal forms
 * - Expert guidance
 * - Evidence collection tools
 * - Timeline expectations
 * - Proof of service templates
 *
 * Price: see src/lib/pricing/products.ts for the current one-time amount (England only)
 */
export async function generateCompleteEvictionPack(
  wizardFacts: any
): Promise<CompleteEvictionPack> {
  const caseId = wizardFacts?.__meta?.case_id || wizardFacts?.case_id || `EVICT-${Date.now()}`;

  // Get jurisdiction - must be canonical
  let jurisdiction = wizardFacts?.__meta?.jurisdiction || wizardFacts?.jurisdiction;

  // Migrate legacy values
  if (jurisdiction === 'england-wales') {
    const propertyLocation = wizardFacts?.property_location;
    jurisdiction = propertyLocation === 'wales' ? 'wales' : 'england';
    console.warn(`[MIGRATIOo] Converted legacy jurisdiction "england-wales" to "${jurisdiction}"`);
  }

  if (!jurisdiction || !['england', 'wales', 'scotland', 'northern-ireland'].includes(jurisdiction)) {
    throw new Error(`Invalid jurisdiction: ${jurisdiction}. Must be one of: england, wales, scotland, northern-ireland`);
  }

  console.log(`\n📦 Generating Complete Eviction Pack for ${jurisdiction}...`);
  console.log('='.repeat(80));

  // ==========================================================================
  // WALES GROUoD_CODES DERIVATIOo (same as generateooticeOnlyPack)
  // The UI collects wales_fault_grounds (e.g., ['rent_arrears_serious']),
  // but validation/templates expect ground_codes (e.g., ['section_157']).
  // Preview endpoints derive this at request time, but paid generation reads
  // raw collected_facts from DB. We must derive ground_codes here to match.
  // ==========================================================================
  if (jurisdiction === 'wales') {
    const walesFaultGrounds = wizardFacts?.wales_fault_grounds;
    const noticeRouteForDerivation = wizardFacts?.selected_notice_route ||
                                      wizardFacts?.eviction_route ||
                                      wizardFacts?.recommended_route || '';
    const normalizedWalesRoute = normalizeRoute(noticeRouteForDerivation);
    const hasWalesFaultGrounds = Array.isArray(walesFaultGrounds) && walesFaultGrounds.length > 0;
    const missingGroundCodes = !wizardFacts?.ground_codes ||
                                (Array.isArray(wizardFacts.ground_codes) && wizardFacts.ground_codes.length === 0);

    if (hasWalesFaultGrounds && missingGroundCodes) {
      const derivedGroundCodes = mapWalesFaultGroundsToGroundCodes(walesFaultGrounds);

      console.log('[generateCompleteEvictionPack] Derived ground_codes from wales_fault_grounds:', {
        wales_fault_grounds: walesFaultGrounds,
        derived_ground_codes: derivedGroundCodes,
      });

      wizardFacts.ground_codes = derivedGroundCodes;
    }

    if (normalizedWalesRoute === 'fault_based') {
      const extractedParticulars = extractWalesParticularsFromWizardFacts(wizardFacts);
      const hasOnlyArrearsGrounds = isWalesArrearsOnlySelection(walesFaultGrounds);
      const requiresParticulars = hasWalesFaultGrounds && !hasOnlyArrearsGrounds;

      if (requiresParticulars && !extractedParticulars.text) {
        const error = new Error(
          '[generateCompleteEvictionPack] Wales fault-based notice requires particulars for non-arrears grounds.'
        );
        console.error('[generateCompleteEvictionPack] Missing required Wales particulars:', {
          wales_fault_grounds: walesFaultGrounds,
          requiresParticulars,
        });
        throw error;
      }
    }
  }

  // Load jurisdiction-specific grounds
  const groundsData = await loadEvictionGrounds(jurisdiction as Jurisdiction);

  // ============================================================================
  // PRE-FLIGHT VALIDATIOo
  // Ensure all required fields are present before generating court forms.
  // This mirrors the notice-only validation and adds complete pack specific checks.
  // ============================================================================

  const selectedGroundCodes = extractGroundCodes(
    wizardFacts?.section8_grounds || wizardFacts?.grounds || []
  );

  // Determine case type for validation
  const evictionRoute = wizardFacts?.eviction_route || wizardFacts?.notice_type || wizardFacts?.selected_notice_route;
  const isooFault = evictionRoute?.toLowerCase?.().includes('section 21') ||
                     evictionRoute?.toLowerCase?.().includes('section_21') ||
                     evictionRoute === 'no_fault';
  const caseType = isooFault ? 'no_fault' : 'rent_arrears';

  // Only validate for England/Wales - Scotland has different requirements
  if (jurisdiction === 'england' || jurisdiction === 'wales') {
    try {
      assertCompletePackValid({
        jurisdiction: jurisdiction as 'england' | 'wales',
        facts: wizardFacts || {},
        selectedGroundCodes,
        caseType,
      });
    } catch (err) {
      const reason = (err as Error).message;
      throw new Error(reason.startsWith('EVICTIOo_PACK_VALIDATIOo_FAILED')
        ? reason
        : `EVICTIOo_PACK_VALIDATIOo_FAILED: ${reason}`);
    }
  }

  const arrearsItemsInput: ArrearsItem[] = wizardFacts?.arrears_items ||
    wizardFacts?.issues?.rent_arrears?.arrears_items || [];
  const totalArrearsInput = wizardFacts?.total_arrears ||
    wizardFacts?.arrears_total ||
    wizardFacts?.issues?.rent_arrears?.total_arrears ||
    wizardFacts?.rent_arrears_amount ||
    wizardFacts?.arrears_amount ||
    0;
  const rentAmountInput = wizardFacts?.rent_amount ||
    wizardFacts?.tenancy?.rent_amount ||
    0;
  const rentFrequencyInput = (wizardFacts?.rent_frequency ||
    wizardFacts?.tenancy?.rent_frequency ||
    'monthly') as TenancyFacts['rent_frequency'];
  const rentDueDayInput = wizardFacts?.rent_due_day ||
    wizardFacts?.tenancy?.rent_due_day ||
    null;
  const noticeDateInput = wizardFacts?.notice_served_date ||
    wizardFacts?.notice?.service_date ||
    wizardFacts?.notice?.served_date ||
    wizardFacts?.notice_date ||
    null;

  const hasArrearsInputs = arrearsItemsInput.length > 0 || totalArrearsInput > 0;
  const canonicalArrears = hasArrearsInputs ? computeEvictionArrears({
    arrears_items: arrearsItemsInput,
    total_arrears: totalArrearsInput,
    rent_amount: rentAmountInput,
    rent_frequency: rentFrequencyInput,
    rent_due_day: rentDueDayInput,
    schedule_end_date: noticeDateInput || new Date().toISOString().split('T')[0],
  }) : null;

  if (canonicalArrears) {
    wizardFacts.arrears_items = canonicalArrears.items;
    wizardFacts.total_arrears = canonicalArrears.total;
    wizardFacts.arrears_total = canonicalArrears.total;
    wizardFacts.rent_arrears_amount = canonicalArrears.total;
    if (wizardFacts.issues?.rent_arrears) {
      wizardFacts.issues.rent_arrears.arrears_items = canonicalArrears.items;
      wizardFacts.issues.rent_arrears.total_arrears = canonicalArrears.total;
    }
  }

  // Initialize documents array
  const documents: EvictionPackDocument[] = [];

  // 1. Generate region-specific notices and court forms
  let regionDocs: EvictionPackDocument[] = [];

  let evictionCase: EvictionCase;
  // P0 FIX: Declare caseData at higher scope for cross-document validation and templates
  let caseData: import('./official-forms-filler').CaseData | null = null;
  let section8CanonicalRenderData: Record<string, any> | null = null;

  if (jurisdiction === 'england' || jurisdiction === 'wales') {
    const { evictionCase: ewCase, caseData: ewCaseData } = wizardFactsToEnglandWalesEviction(caseId, wizardFacts);
    evictionCase = { ...ewCase, jurisdiction: jurisdiction as Jurisdiction };
    caseData = ewCaseData; // Store for use throughout the function

    if (jurisdiction === 'england' && deriveEvictionRoute(wizardFacts) === 'section8' && evictionCase.grounds.length > 0) {
      section8CanonicalRenderData = harmonizeEnglandSection8CanonicalContext({
        wizardFacts,
        caseData,
        evictionCase,
      });
    }

    regionDocs = await generateEnglandOrWalesEvictionPack(evictionCase, ewCaseData, groundsData, wizardFacts);
  } else if (jurisdiction === 'scotland') {
    const { scotlandCaseData } = wizardFactsToScotlandEviction(caseId, wizardFacts);
    evictionCase = buildScotlandEvictionCase(caseId, scotlandCaseData);
    regionDocs = await generateScotlandEvictionPack(evictionCase, scotlandCaseData);
  } else {
    throw new Error(`Eviction packs not yet supported for ${jurisdiction}`);
  }

  documents.push(...regionDocs);

  const groundsReliedUpon = (evictionCase.grounds || [])
    .map((ground) => (typeof ground === 'string' ? ground : ground.code))
    .filter(Boolean);
  const isEnglandSection8Case =
    jurisdiction === 'england' &&
    deriveEvictionRoute(wizardFacts) === 'section8' &&
    evictionCase.grounds.length > 0;
  section8CanonicalRenderData =
    section8CanonicalRenderData ||
    (isEnglandSection8Case
      ? buildSection8TemplateData(evictionCase, wizardFacts || {}, caseData || undefined)
      : null);

  // 1.1 Generate Schedule of Arrears if arrears grounds selected
  if (hasArrearsGroundsSelected(selectedGroundCodes)) {
    try {
      const rentAmount = rentAmountInput;
      const rentFrequency = rentFrequencyInput;
      const rentDueDay = rentDueDayInput;

      const arrearsData = canonicalArrears?.scheduleData || getArrearsScheduleData({
        arrears_items: arrearsItemsInput,
        total_arrears: totalArrearsInput,
        rent_amount: rentAmount,
        rent_frequency: rentFrequency,
        rent_due_day: rentDueDay,
        include_schedule: true,
      });

      if (arrearsData.include_schedule_pdf) {
        const jurisdictionKey = jurisdiction === 'wales' ? 'wales' : 'england';
        const today = new Date().toISOString().split('T')[0];

        const ground8Threshold = getGround8Threshold(rentAmount, rentFrequency);
        const ground8ThresholdAmount = ground8Threshold.amount;
        const arrearsAtScheduleDate = arrearsData.arrears_total;
        const arrearsAtNoticeDate = canonicalArrears?.arrearsAtNoticeDate ?? arrearsAtScheduleDate;
        const meetsThresholdAtNotice = arrearsAtNoticeDate >= ground8ThresholdAmount;
        const meetsThresholdAtSchedule = arrearsAtScheduleDate >= ground8ThresholdAmount;

        // Get notice date from wizard facts
        const noticeDate = wizardFacts?.notice_served_date ||
                          wizardFacts?.notice?.service_date ||
                          wizardFacts?.notice?.served_date ||
                          null;

        const rentFrequencyLabel = rentFrequency ? formatRentFrequencyLabel(rentFrequency) : null;
        const usualPaymentWeekday =
          wizardFacts?.usual_payment_weekday ||
          wizardFacts?.tenancy?.usual_payment_weekday ||
          (caseData as any)?.usual_payment_weekday ||
          undefined;

        const scheduleDoc = await generateDocument({
          templatePath: `uk/${jurisdictionKey}/templates/money_claims/schedule_of_arrears.hbs`,
          data: {
            // Header fields for schedule of arrears
            property_address: evictionCase.property_address,
            tenant_full_name: evictionCase.tenant_full_name,
            tenant_2_name: evictionCase.tenant_2_name,
            landlord_full_name: evictionCase.landlord_full_name,
            landlord_2_name: evictionCase.landlord_2_name,
            // Reference and arrears data
            claimant_reference: wizardFacts?.claimant_reference || evictionCase.case_id,
            arrears_schedule: arrearsData.arrears_schedule,
            arrears_total: arrearsData.arrears_total,
            // Schedule and notice dates
            schedule_date: today,
            notice_date: noticeDate,
            generation_date: today,
            // Tenancy information (required by template for summary box)
            rent_amount: rentAmount,
            tenancy_start_date: evictionCase.tenancy_start_date,
            payment_day: rentDueDay,
            usual_payment_weekday: usualPaymentWeekday,
            // Arrears at key dates
            arrears_at_notice_date: arrearsAtNoticeDate,
            arrears_at_schedule_date: arrearsAtScheduleDate,
            // Ground 8 threshold data
            ground8_threshold: ground8ThresholdAmount,
            ground8_threshold_description: `${ground8Threshold.description} rent`,
            meets_threshold_at_notice: meetsThresholdAtNotice,
            meets_threshold_at_schedule: meetsThresholdAtSchedule,
            rent_frequency: rentFrequencyLabel,
            // Add generation date (legacy alias)
            generated_date: today,
            pack_context_label: 'Stage 2: Section 8 Court & Possession Pack',
            arrears_position_heading: 'Arrears Position at Claim Date',
            arrears_position_note:
              'This schedule matches the figures relied on in the Section 8 notice and claim form (N119). Keep it updated to the latest practicable date before issuing.',
            periods_missed: canonicalArrears?.arrearsPeriods ?? arrearsData.arrears_schedule.length,
            schedule_role_note:
              'This schedule supports the pleaded arrears grounds, the witness evidence, and the court claim materials.',
          },
          isPreview: false,
          outputFormat: 'both',
        });

        documents.push({
          title: 'Schedule of Arrears',
          description: 'Detailed period-by-period breakdown of rent arrears',
          category: 'evidence_tool',
          document_type: 'arrears_schedule',
          html: scheduleDoc.html,
          pdf: scheduleDoc.pdf,
          file_name: 'schedule_of_arrears.pdf',
        });

        console.log('✅ Generated schedule of arrears');
      } else if (!arrearsData.is_authoritative && arrearsData.legacy_warning) {
        // Log warning for legacy data
        console.warn(`⚠️  Schedule of arrears not generated: ${arrearsData.legacy_warning}`);
      }
    } catch (error) {
      console.error('⚠️  Failed to generate schedule of arrears:', error);
      // Don't fail the entire pack if schedule generation fails
    }
  }

  // 2. Generate expert guidance documents
  // oote: Eviction Roadmap, Expert Guidance, and Timeline removed as of Jan 2026 pack restructure
  // Keeping court filing guide and evidence tools only

  // 3. Generate evidence tools
  const evidenceChecklist = await generateEvidenceChecklist(evictionCase, groundsData);
  documents.push(evidenceChecklist);

  // Extract service details from wizard facts for proof of service
  // FIX 3 (Jan 2026): Ensure expiry_date is always populated for cross-document consistency
  const posServiceDate = section8CanonicalRenderData?.notice_service_date ||
                         wizardFacts?.notice_served_date ||
                         wizardFacts?.notice?.service_date ||
                         wizardFacts?.service_date;
  const posServiceMethod = section8CanonicalRenderData?.notice_service_method ||
                           wizardFacts?.notice_service_method ||
                           wizardFacts?.notice?.service_method ||
                           wizardFacts?.service_method;

  // Calculate expiry date if not provided (same as Form 6A)
  let posExpiryDate = section8CanonicalRenderData?.notice_expiry_date ||
                      wizardFacts?.notice_expiry_date ||
                      wizardFacts?.notice?.expiry_date ||
                      wizardFacts?.expiry_date ||
                      wizardFacts?.earliest_possession_date;

  // Fallback: Calculate from service date for Section 21
  if (!posExpiryDate && posServiceDate && evictionCase.tenancy_start_date) {
    try {
      const params: Section21DateParams = {
        service_date: posServiceDate,
        tenancy_start_date: evictionCase.tenancy_start_date,
        fixed_term: evictionCase.fixed_term || false,
        fixed_term_end_date: evictionCase.fixed_term_end_date,
        rent_period: (evictionCase.rent_frequency || 'monthly') as 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | 'yearly',
        service_method: (posServiceMethod?.toLowerCase().includes('post') ? 'first_class_post' : 'hand_delivery') as ServiceMethod,
      };
      const result = calculateSection21ExpiryDate(params);
      posExpiryDate = result.earliest_valid_date;
      console.log(`📅 Calculated notice_expiry_date for Proof of Service: ${posExpiryDate}`);
    } catch (err) {
      console.warn('⚠️  Could not calculate notice_expiry_date for Proof of Service:', err);
    }
  }

  const serviceDetails = {
    service_date: posServiceDate,
    expiry_date: posExpiryDate,
    service_method: posServiceMethod,
  };
  const proofOfService = await generateProofOfService(
    evictionCase,
    serviceDetails,
    section8CanonicalRenderData || {}
  );
  documents.push(proofOfService);

  // 3.1 Generate witness statement
  // ==========================================================================
  // ROUTE-AWARE WIToESS STATEMEoT (P0 FIX - Jan 2026)
  // ==========================================================================
  // Section 8: Focus on arrears, grounds, and pre-action protocol compliance
  // Section 21: Focus on statutory compliance (deposit, gas, EPC, How to Rent)
  // ==========================================================================
  let witnessExhibits: WitnessExhibit[] = [];
  try {
    // Determine if this is a Section 8 case (has fault-based grounds)
    const isSection8Case = evictionCase.grounds && evictionCase.grounds.length > 0;
    const isSection21Case = evictionCase.case_type === 'no_fault';

    let witnessStatementContent;
    let witnessStatementTemplatePath: string;

    if (isSection21Case && jurisdiction === 'england') {
      // Use Section 21 specific witness statement template
      // This focuses on statutory compliance confirmation
      witnessStatementTemplatePath = `uk/${jurisdiction}/templates/eviction/witness_statement_section21.hbs`;
      witnessStatementContent = null; // Section 21 template is self-contained
      console.log('📝 Using Section 21 witness statement template');
    } else if (isSection8Case && jurisdiction === 'england') {
      // Use deterministic builder for England Section 8 cases
      // This generates court-ready content from case facts without AI
      // Pass evictionCase which has properly mapped data (plus wizardFacts for any extra fields)
      const sectionsInput = extractWitnessStatementSectionsInput({
        ...wizardFacts,
        ...evictionCase,
        ...(section8CanonicalRenderData || {}),
        groundsReliedUpon,
        ...(canonicalArrears
          ? {
            arrears: {
              items: canonicalArrears.items,
              total_arrears: canonicalArrears.total,
              arrears_months: canonicalArrears.arrearsInMonths,
            },
            arrears_at_notice_date: canonicalArrears.arrearsAtNoticeDate,
            arrearsAtNoticeDate: canonicalArrears.arrearsAtNoticeDate,
          }
          : {}),
        // Ensure arrears at notice date is passed explicitly
        arrears_at_notice_date: canonicalArrears?.arrearsAtNoticeDate ?? evictionCase.arrears_at_notice_date,
      });
      witnessExhibits = buildWitnessExhibits(sectionsInput);
      witnessStatementContent = buildWitnessStatementSections(sectionsInput);
      witnessStatementTemplatePath = `uk/${jurisdiction}/templates/eviction/witness-statement.hbs`;
      console.log('📝 Using deterministic witness statement builder for Section 8 case');
    } else {
      // Fall back to AI-powered generation for other cases
      const witnessStatementContext = extractWitnessStatementContext(wizardFacts);
      witnessStatementContent = await generateWitnessStatement(wizardFacts, witnessStatementContext);
      witnessStatementTemplatePath = `uk/${jurisdiction}/templates/eviction/witness-statement.hbs`;
    }

    const witnessStatementDoc = await generateDocument({
      templatePath: witnessStatementTemplatePath,
      data: {
        ...evictionCase,
        ...(caseData || {}), // Include caseData for compliance dates and o5B fields (if available)
        ...(section8CanonicalRenderData || {}),
        groundsReliedUpon,
        witness_statement: witnessStatementContent,
        // Map to template-expected field names
        landlord_name: evictionCase.landlord_full_name,
        landlord_full_name: evictionCase.landlord_full_name,
        landlord_2_name: evictionCase.landlord_2_name,
        tenant_name: evictionCase.tenant_full_name,
        tenant_full_name: evictionCase.tenant_full_name,
        tenant_2_name: evictionCase.tenant_2_name,
        landlord_address: evictionCase.landlord_address,
        court_name:
          section8CanonicalRenderData?.court_name ||
          caseData?.court_name ||
          evictionCase.court_name ||
          (jurisdiction === 'scotland' ? 'First-tier Tribunal' : 'County Court'),
        // Compliance data for Section 21 witness statement (use optional chaining for null safety)
        deposit_amount: evictionCase.deposit_amount,
        deposit_scheme: caseData?.deposit_scheme,
        deposit_protection_date: caseData?.deposit_protection_date,
        epc_provided_date: caseData?.epc_provided_date,
        gas_safety_check_date: caseData?.gas_safety_check_date,
        how_to_rent_date: caseData?.how_to_rent_date,
        how_to_rent_method: caseData?.how_to_rent_method,
        notice_served_date:
          section8CanonicalRenderData?.notice_service_date ||
          caseData?.notice_served_date ||
          caseData?.section_8_notice_date ||
          caseData?.section_21_notice_date,
        notice_service_method:
          section8CanonicalRenderData?.notice_service_method ||
          caseData?.notice_service_method,
        notice_expiry_date: (() => {
          const existing = section8CanonicalRenderData?.notice_expiry_date ||
            caseData?.notice_expiry_date ||
            evictionCase.notice_expiry_date ||
            wizardFacts?.notice_expiry_date ||
            wizardFacts?.earliest_possession_date;
          if (existing || isSection8Case) return existing;

          const serviceDate = caseData?.section_21_notice_date ||
            caseData?.notice_served_date ||
            wizardFacts?.notice_served_date ||
            wizardFacts?.notice_service_date;
          const tenancyStart = caseData?.tenancy_start_date ||
            evictionCase.tenancy_start_date ||
            wizardFacts?.tenancy_start_date;

          if (serviceDate && tenancyStart) {
            try {
              const params: Section21DateParams = {
                service_date: serviceDate,
                tenancy_start_date: tenancyStart,
                fixed_term: caseData?.fixed_term || false,
                fixed_term_end_date: caseData?.fixed_term_end_date,
                rent_period: (caseData?.rent_frequency || 'monthly') as 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | 'yearly',
                service_method: (caseData?.notice_service_method?.toLowerCase().includes('post') ? 'first_class_post' : 'hand_delivery') as ServiceMethod,
              };
              const result = calculateSection21ExpiryDate(params);
              console.log(`📅 Calculated notice_expiry_date for witness statement: ${result.earliest_valid_date}`);
              return result.earliest_valid_date;
            } catch (err) {
              console.warn('⚠️  Could not calculate notice_expiry_date:', err);
              return undefined;
            }
          }
          return undefined;
        })(),
        earliest_proceedings_date:
          section8CanonicalRenderData?.earliest_proceedings_date ||
          caseData?.earliest_proceedings_date ||
          caseData?.notice_expiry_date ||
          evictionCase.notice_expiry_date ||
          wizardFacts?.notice_expiry_date,
        fixed_term: caseData?.fixed_term,
        fixed_term_end_date: caseData?.fixed_term_end_date,
        // FIX 4: Add statement date (claim generation date) for auto-dating witness statement
        statement_date: formatUKLegalDate(new Date().toISOString().split('T')[0]),
        // Add generation date
        generated_date: formatUKLegalDate(new Date().toISOString().split('T')[0]),
      },
      isPreview: false,
      outputFormat: 'both',
    });

    // Validate court-readiness (no placeholders or template text)
    const wsValidation = validateCourtReady(witnessStatementDoc.html || '', 'witness_statement');
    if (!wsValidation.isValid) {
      console.warn('⚠️  Witness statement has validation issues:');
      logValidationResults([wsValidation]);
    }

    documents.push({
      title: 'Witness Statement',
      description: 'Court-ready witness statement for possession proceedings',
      category: 'court_form',
      document_type: 'witness_statement',
      html: witnessStatementDoc.html,
      pdf: witnessStatementDoc.pdf,
      file_name: 'witness_statement.pdf',
    });

    console.log('✅ Generated witness statement');
  } catch (error) {
    console.error('⚠️  Failed to generate witness statement:', error);
    // Don't fail the entire pack if witness statement generation fails
  }

  // 3.2 Compliance audit and risk assessment removed as of Jan 2026 pack restructure
  // These documents are no longer included in the Complete Pack

  // 3.3 Generate value-add documents for court pack
  // - Court bundle index
  // - Hearing checklist
  // - Engagement letter template (for arrears cases)

  // ==========================================================================
  // ROUTE-AWARE TEMPLATE SELECTIOo (P0 FIX - Jan 2026)
  // ==========================================================================
  // Section 21 (no_fault) and Section 8 (rent_arrears) require different
  // templates. Section 21 focuses on compliance; Section 8 on arrears evidence.
  // ==========================================================================
  const isSection21 = evictionCase.case_type === 'no_fault';
  const templateSuffix = isSection21 ? '_section21' : '';

  // Court bundle index - ROUTE-AWARE
  try {
    const bundleIndexTemplatePath = isSection21
      ? `uk/${jurisdiction}/templates/eviction/court_bundle_index_section21.hbs`
      : `uk/${jurisdiction}/templates/eviction/court_bundle_index.hbs`;

    const bundleIndexDoc = await generateDocument({
      templatePath: bundleIndexTemplatePath,
      data: {
        ...evictionCase,
        ...(caseData || {}), // Include caseData for deposit_scheme, notice_expiry_date, etc.
        ...(section8CanonicalRenderData || {}),
        landlord_full_name: evictionCase.landlord_full_name,
        landlord_2_name: evictionCase.landlord_2_name,
        tenant_full_name: evictionCase.tenant_full_name,
        tenant_2_name: evictionCase.tenant_2_name,
        property_address: evictionCase.property_address,
        deposit_amount: evictionCase.deposit_amount,
        deposit_scheme: caseData?.deposit_scheme,
        notice_expiry_date:
          section8CanonicalRenderData?.notice_expiry_date ||
          caseData?.notice_expiry_date,
        earliest_proceedings_date:
          section8CanonicalRenderData?.earliest_proceedings_date ||
          caseData?.earliest_proceedings_date ||
          caseData?.notice_expiry_date,
        notice_service_date:
          section8CanonicalRenderData?.notice_service_date ||
          caseData?.notice_served_date ||
          caseData?.section_8_notice_date,
        court_fee: caseData?.court_fee,
        bundle_exhibit_schedule_of_arrears: witnessExhibits.find((exhibit) => exhibit.key === 'schedule_of_arrears')?.label,
        bundle_exhibit_section8_notice: witnessExhibits.find((exhibit) => exhibit.key === 'section8_notice')?.label,
        bundle_exhibit_proof_of_service: witnessExhibits.find((exhibit) => exhibit.key === 'proof_of_service')?.label,
        bundle_verified_exhibits: witnessExhibits
          .filter((exhibit) => exhibit.key.startsWith('verified_supporting_document_'))
          .map((exhibit, index) => ({
            ...exhibit,
            tab: `F${index + 1}`,
          })),
        generated_date: new Date().toISOString().split('T')[0],
        court_name:
          section8CanonicalRenderData?.court_name ||
          caseData?.court_name ||
          evictionCase.court_name ||
          'County Court',
      },
      isPreview: false,
      outputFormat: 'both',
    });

    documents.push({
      title: isSection21 ? 'Court Bundle Index (Section 21)' : 'Court Bundle Index',
      description: isSection21
        ? 'Index of documents for Section 21 accelerated possession'
        : 'Index of all documents for court filing',
      category: 'evidence_tool',
      document_type: 'court_bundle_index',
      html: bundleIndexDoc.html,
      pdf: bundleIndexDoc.pdf,
      file_name: 'court_bundle_index.pdf',
    });

    console.log(`✅ Generated court bundle index (${isSection21 ? 'Section 21' : 'Section 8'})`);
  } catch (error) {
    console.error('⚠️  Failed to generate court bundle index:', error);
  }

  // Hearing checklist - ROUTE-AWARE
  try {
    const hearingChecklistTemplatePath = isSection21
      ? `uk/${jurisdiction}/templates/eviction/hearing_checklist_section21.hbs`
      : `uk/${jurisdiction}/templates/eviction/hearing_checklist.hbs`;

    const hearingChecklistDoc = await generateDocument({
      templatePath: hearingChecklistTemplatePath,
      data: {
        ...evictionCase,
        ...(caseData || {}),
        ...(section8CanonicalRenderData || {}),
        groundsReliedUpon,
        landlord_full_name: evictionCase.landlord_full_name,
        tenant_full_name: evictionCase.tenant_full_name,
        tenant_2_name: evictionCase.tenant_2_name,
        property_address: evictionCase.property_address,
        ground8_threshold_amount: getGround8Threshold(rentAmountInput, rentFrequencyInput).amount,
        ground8_threshold_label: `${getGround8Threshold(rentAmountInput, rentFrequencyInput).description} rent`,
        generated_date: new Date().toISOString().split('T')[0],
        court_name:
          section8CanonicalRenderData?.court_name ||
          caseData?.court_name ||
          evictionCase.court_name,
      },
      isPreview: false,
      outputFormat: 'both',
    });

    documents.push({
      title: isSection21 ? 'Hearing Checklist (Section 21)' : 'Hearing Preparation Guide',
      description: isSection21
        ? 'Preparation checklist for Section 21 accelerated possession'
        : 'Court-facing hearing guide covering validity, service, grounds, arrears, and the documents to bring.',
      category: 'guidance',
      document_type: 'hearing_checklist',
      html: hearingChecklistDoc.html,
      pdf: hearingChecklistDoc.pdf,
      file_name: 'hearing_checklist.pdf',
    });

    console.log(`✅ Generated hearing checklist (${isSection21 ? 'Section 21' : 'Section 8'})`);
  } catch (error) {
    console.error('⚠️  Failed to generate hearing checklist:', error);
  }

  // Engagement letter (for arrears cases) - generated as FIoAL FORM for court packs
  if (hasArrearsGroundsSelected(selectedGroundCodes)) {
    try {
      // Generate as final form (fully populated, no placeholders) for complete pack
      const today = new Date();

      // ========================================================================
      // ARREARS DATA SOURCE FIX (2026-01-19)
      // Use the SAME authoritative source as the Schedule of Arrears generator.
      // This ensures a single source of truth for arrears across all documents.
      // ========================================================================

      // Get arrears data using the SAME method as Schedule of Arrears above
      const letterArrearsItems: ArrearsItem[] = wizardFacts?.arrears_items ||
        wizardFacts?.issues?.rent_arrears?.arrears_items || [];
      const letterTotalArrearsFromFacts = wizardFacts?.total_arrears ||
        wizardFacts?.arrears_total ||
        wizardFacts?.issues?.rent_arrears?.total_arrears || null;
      const letterRentAmount = wizardFacts?.rent_amount ||
        wizardFacts?.tenancy?.rent_amount || 0;
      const letterRentFrequency = wizardFacts?.rent_frequency ||
        wizardFacts?.tenancy?.rent_frequency || 'monthly';
      const letterRentDueDay = wizardFacts?.rent_due_day ||
        wizardFacts?.tenancy?.rent_due_day || null;

      const letterArrearsData = canonicalArrears?.scheduleData || getArrearsScheduleData({
        arrears_items: letterArrearsItems,
        total_arrears: letterTotalArrearsFromFacts,
        rent_amount: letterRentAmount,
        rent_frequency: letterRentFrequency,
        rent_due_day: letterRentDueDay,
        include_schedule: false,
      });

      // Use the authoritative total from the arrears engine
      const letterTotalArrears = canonicalArrears?.total ?? letterArrearsData.arrears_total;

      // DEBUG: Log all arrears paths for tracing (only in dev)
      if (process.env.NODE_ENV !== 'production' || process.env.DEBUG_ARREARS === '1') {
        const { logArrearsDebug } = await import('./debug-stamp');
        const arrearsDebugLog = logArrearsDebug({
          caseId: caseId,
          wizardFacts,
          evictionCase,
          arrearsScheduleData: {
            total: letterTotalArrears,
            itemCount: letterArrearsItems.length,
            isAuthoritative: letterArrearsData.is_authoritative,
          },
          finalValue: letterTotalArrears,
          sourceUsed: letterArrearsData.is_authoritative
            ? 'arrears_schedule_mapper (authoritative)'
            : 'arrears_schedule_mapper (legacy)',
        });

        // Write debug JSOo to tests/output for inspection
        try {
          const fs = await import('fs/promises');
          const path = await import('path');
          const outputDir = path.join(process.cwd(), 'tests', 'output');
          await fs.mkdir(outputDir, { recursive: true });
          await fs.writeFile(
            path.join(outputDir, 'arrears-letter-debug.json'),
            JSON.stringify(arrearsDebugLog, null, 2)
          );
          console.log('✅ Wrote arrears debug log to tests/output/arrears-letter-debug.json');
        } catch (writeErr) {
          console.warn('⚠️  Could not write arrears debug log:', writeErr);
        }
      }

      // For court packs, arrears figure must be present and non-zero for arrears grounds
      if (letterTotalArrears === undefined || letterTotalArrears === null || letterTotalArrears === 0) {
        console.warn('⚠️  Arrears engagement letter: no valid arrears amount found. Letter will show £0.00 which may be incorrect.');
        console.warn('    Checked paths: arrears_items, total_arrears, arrears_total, issues.rent_arrears.total_arrears');
      }

      const arrearsLetterDoc = await generateDocument({
        templatePath: `uk/${jurisdiction}/templates/eviction/arrears_letter_template.hbs`,
        data: {
          ...evictionCase,
          landlord_full_name: evictionCase.landlord_full_name,
          landlord_address: evictionCase.landlord_address,
          landlord_phone: evictionCase.landlord_phone,
          landlord_email: evictionCase.landlord_email,
          tenant_full_name: evictionCase.tenant_full_name,
          property_address: evictionCase.property_address,
          arrears_total: letterTotalArrears,
          // Final form mode - fully populate all fields
          is_final_form: true,
          letter_date: today.toISOString(),
          calculation_date: today.toISOString(),
        },
        isPreview: false,
        outputFormat: 'both',
        // Add debug stamp for PDF tracing only when explicitly enabled
        debugStamp: isDebugStampEnabled()
          ? {
              generatorName: 'eviction-pack-generator.ts',
              caseId: caseId,
              additionalTemplates: [],
            }
          : undefined,
      });

      // Validate court-readiness (no placeholders or template text)
      const letterValidation = validateCourtReady(arrearsLetterDoc.html || '', 'arrears_engagement_letter');
      if (!letterValidation.isValid) {
        console.warn('⚠️  Arrears engagement letter has validation issues:');
        logValidationResults([letterValidation]);
      }

      documents.push({
        title: 'Arrears Engagement Letter',
        description: 'Pre-action engagement letter for rent arrears',
        category: 'bonus',
        document_type: 'arrears_engagement_letter',
        html: arrearsLetterDoc.html,
        pdf: arrearsLetterDoc.pdf,
        file_name: 'arrears_engagement_letter.pdf',
      });

      console.log('✅ Generated arrears engagement letter (final form)');
    } catch (error) {
      console.error('⚠️  Failed to generate arrears engagement letter:', error);
    }
  }

  // 4. Generate case summary document
  const noticeServedDate =
    section8CanonicalRenderData?.notice_service_date ||
    caseData?.notice_served_date ||
    caseData?.section_8_notice_date ||
    wizardFacts?.notice_served_date ||
    wizardFacts?.notice_service_date;
  const earliestProceedingsDate =
    section8CanonicalRenderData?.earliest_proceedings_date ||
    caseData?.earliest_proceedings_date ||
    caseData?.notice_expiry_date ||
    wizardFacts?.notice_expiry_date ||
    wizardFacts?.earliest_possession_date ||
    wizardFacts?.section8_expiry_date;
  const noticeExpiryDate =
    section8CanonicalRenderData?.notice_expiry_date ||
    caseData?.notice_expiry_date ||
    wizardFacts?.notice_expiry_date ||
    wizardFacts?.earliest_possession_date ||
    earliestProceedingsDate;
  const currentArrearsTotal = canonicalArrears?.total ?? evictionCase.current_arrears ?? totalArrearsInput;
  const arrearsAtNoticeDate = canonicalArrears?.arrearsAtNoticeDate ?? evictionCase.arrears_at_notice_date ?? currentArrearsTotal;
  const paymentDay = wizardFacts?.rent_due_day || wizardFacts?.payment_day || evictionCase.payment_day;
  const usualPaymentWeekday =
    wizardFacts?.usual_payment_weekday ||
    wizardFacts?.tenancy?.usual_payment_weekday ||
    (caseData as any)?.usual_payment_weekday ||
    undefined;
  const stage2SummaryData = buildEnglandSection8PackSummaryData({
    stage: 'stage2',
    evictionCase,
    caseData,
    wizardFacts,
    section8RenderData: section8CanonicalRenderData || undefined,
    groundsData,
    noticeServedDate,
    noticeExpiryDate,
    earliestProceedingsDate,
    currentArrearsTotal,
    arrearsAtNoticeDate,
    paymentDay,
    usualPaymentWeekday,
  });

  if (isEnglandSection8Case) {
    const courtReadinessDoc = await generateDocument({
      templatePath: 'uk/england/templates/eviction/compliance_checklist.hbs',
      data: {
        ...stage2SummaryData,
        checklist_title: 'Court Readiness Status',
        decision_engine_title: 'Court readiness decision engine',
        status_reasoning_title: 'Court status',
        next_move_title: 'Issue decision',
        legend_critical_text: 'Resolve this before issuing proceedings or relying on the file in court.',
        legend_risk_text: 'This may not stop issue automatically, but it can weaken the file or create delay if left unmanaged.',
        legend_ok_text: 'The current pack data records this point, but you still need to retain the underlying evidence for court.',
      },
      isPreview: false,
      outputFormat: 'both',
    });
    documents.push({
      title: 'Court Readiness Status',
      description: 'Decision-engine status page showing whether the possession file is ready for issue or still carries risk.',
      category: 'guidance',
      document_type: 'court_readiness_status',
      html: courtReadinessDoc.html,
      pdf: courtReadinessDoc.pdf,
      file_name: 'court_readiness_status.pdf',
    });

    const courtFormsGuideDoc = await generateDocument({
      templatePath: 'uk/england/templates/eviction/court_forms_guide.hbs',
      data: stage2SummaryData,
      isPreview: false,
      outputFormat: 'both',
    });
    documents.push({
      title: 'Court Forms',
      description: 'Alignment note for the claim forms so the court papers stay consistent with the served notice and service record.',
      category: 'guidance',
      document_type: 'court_forms_guide',
      html: courtFormsGuideDoc.html,
      pdf: courtFormsGuideDoc.pdf,
      file_name: 'court_forms_guide.pdf',
    });

    const serviceRecordNotesDoc = await generateDocument({
      templatePath: 'uk/england/templates/eviction/service_record_notes.hbs',
      data: stage2SummaryData,
      isPreview: false,
      outputFormat: 'both',
    });
    documents.push({
      title: 'Service Continuity Notes',
      description: 'Continuity note tying the served notice, Form N215, and the court claim into one file.',
      category: 'guidance',
      document_type: 'service_record_notes',
      html: serviceRecordNotesDoc.html,
      pdf: serviceRecordNotesDoc.pdf,
      file_name: 'service_record_notes.pdf',
    });

    const evidenceChecklistDoc = await generateDocument({
      templatePath: 'uk/england/templates/eviction/evidence_checklist_court_stage.hbs',
      data: {
        ...stage2SummaryData,
        evidence_required_sections: buildStage2CourtEvidenceSections(evictionCase),
      },
      isPreview: false,
      outputFormat: 'both',
    });
    const existingEvidenceChecklistIndex = documents.findIndex(
      (document) => document.document_type === 'evidence_checklist',
    );
    const stage2EvidenceChecklist: EvictionPackDocument = {
      title: 'Evidence Required for Hearing',
      description: 'Court-facing checklist of the documents and proof needed for the possession hearing.',
      category: 'guidance',
      document_type: 'evidence_checklist',
      html: evidenceChecklistDoc.html,
      pdf: evidenceChecklistDoc.pdf,
      file_name: 'evidence_required_for_hearing.pdf',
    };
    if (existingEvidenceChecklistIndex >= 0) {
      documents.splice(existingEvidenceChecklistIndex, 1, stage2EvidenceChecklist);
    } else {
      documents.push(stage2EvidenceChecklist);
    }
  }

  const caseSummaryDoc = await generateDocument({
    templatePath: 'shared/templates/eviction_case_summary.hbs',
    data: stage2SummaryData,
    isPreview: false,
    outputFormat: 'both',
  });

  documents.unshift({
    title: 'Case Summary — Stage 2 Court & Possession',
    description: 'Complete summary of your eviction case and selected grounds',
    category: 'guidance',
    document_type: 'case_summary',
    html: caseSummaryDoc.html,
    pdf: caseSummaryDoc.pdf,
    file_name: 'eviction_case_summary.pdf',
  });

  const whatHappensNextDoc = await generateDocument({
    templatePath: 'uk/england/templates/eviction/what_happens_next_section_8.hbs',
    data: stage2SummaryData,
    isPreview: false,
    outputFormat: 'both',
  });

  documents.push({
    title: 'What Happens Next',
    description: 'Clear next steps after notice and through the court stage',
    category: 'guidance',
    document_type: 'what_happens_next',
    html: whatHappensNextDoc.html,
    pdf: whatHappensNextDoc.pdf,
    file_name: 'what_happens_next.pdf',
  });

  if (isEnglandSection8Case) {
    const orderedStage2Documents = reorderEnglandSection8Stage2Documents(documents);
    documents.splice(0, documents.length, ...orderedStage2Documents);
  }

  const enforceArrearsConsistency =
    process.env.NODE_ENV !== 'production' ||
    process.env.ENFORCE_ARREARS_CONSISTENCY === 'true';

  if (canonicalArrears && hasArrearsGroundsSelected(selectedGroundCodes)) {
    const ground8Selected = selectedGroundCodes.includes(8);
    const ground8Eligible = isGround8Eligible({
      arrearsTotal: canonicalArrears.total,
      rentAmount: rentAmountInput,
      rentFrequency: rentFrequencyInput,
    });

    assertArrearsTotalsConsistent({
      canonicalTotal: canonicalArrears.total,
      documents,
      enforce: enforceArrearsConsistency,
      ground8Eligible,
      ground8Selected,
    });
  }

  if (isEnglandSection8Case) {
    assertCourtNameConsistentAcrossDocuments({
      documents,
      courtName: section8CanonicalRenderData?.court_name,
      documentTypes: ['hearing_checklist', 'case_summary'],
    });
  }

  console.log(`✅ Generated ${documents.length} documents for complete eviction pack`);

  // ==========================================================================
  // CROSS-DOCUMEoT COoSISTEoCY VALIDATIOo (P0 FIX - Jan 2026)
  // ==========================================================================
  // For Section 21 cases, validate that Form 6A, o5B, and Proof of Service
  // all have matching data. Courts REJECT claims with inconsistent documents.
  // ==========================================================================
  if (evictionCase.case_type === 'no_fault' && caseData) {
    const tenantoames: string[] = [evictionCase.tenant_full_name];
    if (evictionCase.tenant_2_name) tenantoames.push(evictionCase.tenant_2_name);

    const landlordoames: string[] = [evictionCase.landlord_full_name];
    if (evictionCase.landlord_2_name) landlordoames.push(evictionCase.landlord_2_name);

    const crossDocData: CrossDocumentData = {
      // Form 6A data (notice)
      form6a_expiry_date: caseData?.notice_expiry_date,
      form6a_tenant_names: tenantoames,
      form6a_landlord_names: landlordoames,
      form6a_property_address: evictionCase.property_address,

      // o5B data (court form)
      n5b_expiry_date: caseData?.notice_expiry_date,
      n5b_service_method: caseData?.notice_service_method,
      n5b_service_date: caseData?.notice_served_date || caseData?.section_21_notice_date,
      n5b_tenant_names: tenantoames,
      n5b_landlord_names: landlordoames,
      n5b_property_address: evictionCase.property_address,

      // Proof of Service data
      proof_service_method: caseData?.notice_service_method,
      proof_service_date: caseData?.notice_served_date || caseData?.section_21_notice_date,
      proof_recipient_names: tenantoames,
    };

    const consistencyResult = validateCrossDocumentConsistency(crossDocData);

    if (!consistencyResult.isConsistent) {
      console.error('❌ CRITICAL: Cross-document consistency validation FAILED');
      logConsistencyResults(consistencyResult);
      // Log specific issues for debugging
      for (const issue of consistencyResult.issues.filter(i => i.severity === 'error')) {
        console.error(`   → ${issue.field}: ${issue.message}`);
      }
    } else {
      console.log('✅ Cross-document consistency validation passed');
    }
  }

  return {
    case_id: evictionCase.case_id || `EVICT-${Date.now()}`,
    jurisdiction: evictionCase.jurisdiction,
    pack_type: 'complete_eviction_pack',
    generated_at: new Date().toISOString(),
    documents,
    metadata: {
      total_documents: documents.length,
      includes_court_forms: documents.some((d) => d.category === 'court_form'),
      includes_expert_guidance: documents.some((d) => d.category === 'guidance'),
      includes_evidence_tools: documents.some((d) => d.category === 'evidence_tool'),
      premium_features: [
        'Lifetime Cloud Storage',
        'Priority Support',
        'Unlimited Regenerations',
        'Guided Case Analysis',
        'All Grounds Support',
        'Evidence Collection Tools',
        'Step-by-Step Roadmap',
        'Timeline Expectations',
        'Expert Guidance',
        'Proof of Service Templates',
      ],
    },
  };
}

/**
 * Generate Notice Only Pack (see src/lib/pricing/products.ts for the current amount)
 *
 * Includes:
 * - Eviction notice (Section 8/21, Notice to Leave)
 * - Service Instructions
 * - Service & Validity Checklist
 * - Pre-Service Compliance Declaration
 */
export async function generateNoticeOnlyPack(
  wizardFacts: any
): Promise<CompleteEvictionPack> {
  const caseId = wizardFacts?.__meta?.case_id || wizardFacts?.case_id || `EVICT-NOTICE-${Date.now()}`;

  // Get jurisdiction - must be canonical
  let jurisdiction = wizardFacts?.__meta?.jurisdiction || wizardFacts?.jurisdiction;

  // Migrate legacy values
  if (jurisdiction === 'england-wales') {
    const propertyLocation = wizardFacts?.property_location;
    jurisdiction = propertyLocation === 'wales' ? 'wales' : 'england';
    console.warn(`[MIGRATIOo] Converted legacy jurisdiction "england-wales" to "${jurisdiction}" for notice pack`);
  }

  if (!jurisdiction || !['england', 'wales', 'scotland', 'northern-ireland'].includes(jurisdiction)) {
    throw new Error(`Invalid jurisdiction: ${jurisdiction}. Must be one of: england, wales, scotland, northern-ireland`);
  }

  console.log(`\n📄 Generating ootice Only Pack for ${jurisdiction}...`);

  // ==========================================================================
  // WALES GROUoD_CODES DERIVATIOo
  // The UI collects wales_fault_grounds (e.g., ['rent_arrears_serious']),
  // but validation/templates expect ground_codes (e.g., ['section_157']).
  // Preview endpoints derive this at request time, but paid generation reads
  // raw collected_facts from DB. We must derive ground_codes here to match.
  // Uses WALES_FAULT_GROUoDS definitions as the single source of truth.
  // ==========================================================================
  if (jurisdiction === 'wales') {
    const walesFaultGrounds = wizardFacts?.wales_fault_grounds;
    const noticeRouteForDerivation = wizardFacts?.selected_notice_route ||
                                      wizardFacts?.eviction_route ||
                                      wizardFacts?.recommended_route || '';

    // Check if this is a fault-based route with wales_fault_grounds but no ground_codes
    const isFaultBasedRoute = noticeRouteForDerivation === 'wales_fault_based' ||
                               noticeRouteForDerivation === 'fault_based' ||
                               noticeRouteForDerivation === 'section_8'; // Legacy mapping

    const hasWalesFaultGrounds = Array.isArray(walesFaultGrounds) && walesFaultGrounds.length > 0;
    const missingGroundCodes = !wizardFacts?.ground_codes ||
                                (Array.isArray(wizardFacts.ground_codes) && wizardFacts.ground_codes.length === 0);

    if (hasWalesFaultGrounds && missingGroundCodes) {
      const derivedGroundCodes = mapWalesFaultGroundsToGroundCodes(walesFaultGrounds);

      console.log('[generateooticeOnlyPack] Derived ground_codes from wales_fault_grounds:', {
        wales_fault_grounds: walesFaultGrounds,
        derived_ground_codes: derivedGroundCodes,
        route: noticeRouteForDerivation,
      });

      // Mutate wizardFacts to add derived ground_codes
      // This ensures validation and template rendering see the correct data
      wizardFacts.ground_codes = derivedGroundCodes;
    }
  }

  // oormalize Section 8 facts BEFORE validation
  // This backfills missing canonical fields from legacy/alternative locations:
  // - arrears_total from issues.rent_arrears.total_arrears
  // - ground_particulars.ground_8.summary from section8_details
  normalizeSection8Facts(wizardFacts || {});

  const selectedGroundCodes = extractGroundCodes(
    wizardFacts?.section8_grounds || wizardFacts?.grounds || []
  );

  try {
    assertNoticeOnlyValid({
      jurisdiction: jurisdiction as JurisdictionKey,
      facts: wizardFacts || {},
      selectedGroundCodes,
    });
  } catch (err) {
    const reason = (err as Error).message;
    throw new Error(
      reason.startsWith('NOTICE_ONLY_VALIDATION_FAILED')
        ? reason
        : `NOTICE_ONLY_VALIDATION_FAILED: ${reason}`
    );
  }

  const groundsData = await loadEvictionGrounds(jurisdiction as Jurisdiction);
  const documents: EvictionPackDocument[] = [];

  // Determine notice route for template selection
  const rawooticeRoute = wizardFacts?.selected_notice_route ||
    wizardFacts?.eviction_route ||
    wizardFacts?.recommended_route ||
    'section_8';

  // oormalize route to canonical form (section_8, section_21, section_173, fault_based, notice_to_leave)
  const normalizedRoute = normalizeRoute(rawooticeRoute);
  const noticeRoute = normalizedRoute || rawooticeRoute;

  // ==========================================================================
  // DEBUG LOG: Document type selection
  // This log helps trace which document_type is chosen for the notice document
  // ==========================================================================
  console.log('[generateooticeOnlyPack] Document type selection:', {
    jurisdiction,
    raw_notice_route: rawooticeRoute,
    normalized_route: normalizedRoute,
    selected_notice_route: noticeRoute,
  });

  // Check for Wales-specific routes
  const isWalesRoute = normalizedRoute === 'section_173' || normalizedRoute === 'fault_based';

  if (jurisdiction === 'england' || jurisdiction === 'wales') {
    const { evictionCase, caseData } = wizardFactsToEnglandWalesEviction(caseId, wizardFacts);
    evictionCase.jurisdiction = jurisdiction as Jurisdiction;

    // Section 8 or Section 21
    const isSection21 = evictionCase.case_type === 'no_fault' ||
      noticeRoute === 'section_21' ||
      noticeRoute === 'accelerated_possession' ||
      noticeRoute === 'accelerated_section21';

    if (isSection21) {
      // Section 21 is England-only
      if (jurisdiction !== 'england') {
        throw new Error(
          `Section 21 (no-fault eviction) is not available in ${jurisdiction}. ` +
          `${jurisdiction === 'wales' ? 'Wales uses Section 173 notices under the Renting Homes (Wales) Act 2016.' : ''}`
        );
      }

      // Build Section21ooticeData from evictionCase to use the canonical notice generator
      // CRITICAL: Include compliance confirmations from wizardFacts - these are required for validation
      const section21Data: Section21NoticeData = {
        landlord_full_name: evictionCase.landlord_full_name,
        landlord_2_name: evictionCase.landlord_2_name,
        landlord_address: evictionCase.landlord_address,
        landlord_email: evictionCase.landlord_email,
        landlord_phone: evictionCase.landlord_phone,
        tenant_full_name: evictionCase.tenant_full_name,
        tenant_2_name: evictionCase.tenant_2_name,
        property_address: evictionCase.property_address,
        tenancy_start_date: evictionCase.tenancy_start_date,
        fixed_term: evictionCase.fixed_term,
        fixed_term_end_date: evictionCase.fixed_term_end_date,
        rent_amount: evictionCase.rent_amount,
        rent_frequency: evictionCase.rent_frequency,
        expiry_date: '', // Will be auto-calculated by generateSection21Notice
        deposit_protected: evictionCase.deposit_protected,
        deposit_amount: evictionCase.deposit_amount,
        deposit_scheme: toEnglandDepositScheme(evictionCase.deposit_scheme_name),
        deposit_reference: evictionCase.deposit_reference,
        gas_certificate_provided: evictionCase.gas_safety_certificate,
        epc_rating: evictionCase.epc_rating,
        // Compliance confirmations from wizard - check multiple possible field names
        prescribed_info_given: wizardFacts?.prescribed_info_given ??
          wizardFacts?.prescribed_info_served ??
          wizardFacts?.tenancy?.prescribed_info_given ??
          wizardFacts?.section21?.prescribed_info_given,
        how_to_rent_provided: wizardFacts?.how_to_rent_provided ??
          wizardFacts?.how_to_rent_served ??
          wizardFacts?.section21?.how_to_rent_provided,
        epc_provided: wizardFacts?.epc_provided ??
          wizardFacts?.epc_served ??
          wizardFacts?.section21?.epc_provided ??
          (evictionCase.epc_rating ? true : undefined), // If EPC rating exists, EPC was provided
      };

      // 1. Generate Section 21 ootice
      const section21Doc = await generateSection21Notice(section21Data, false);
      documents.push({
        title: 'Section 21 Notice - Form 6A',
        description: 'No-fault eviction notice (England only)',
        category: 'notice',
        document_type: 'section21_notice',
        html: section21Doc.html,
        pdf: section21Doc.pdf,
        file_name: 'section21_form6a.pdf',
      });

      // =============================================================================
      // SECTIOo 21 TEMPLATE DATA - USE mapooticeOnlyFacts FOR PARITY WITH PREVIEW
      // CRITICAL FIX (Jan 2026): The preview route uses mapooticeOnlyFacts() which
      // resolves dates/compliance from nested wizardFacts paths (section21.*, notice_service.*).
      // The fulfillment path MUST use the same normalization to avoid blank dates/false compliance.
      // =============================================================================
      const section21TemplateData = mapNoticeOnlyFacts(wizardFacts);

      // Debug logging (dev only) to verify correct data flow
      if (process.env.NODE_ENV === 'development' || process.env.NOTICE_ONLY_DEBUG === '1') {
        console.log('[generateooticeOnlyPack] === SECTIOo 21 TEMPLATE DATA DEBUG ===');
        console.log('  - tenancy_start_date:', section21TemplateData.tenancy_start_date);
        console.log('  - service_date:', section21TemplateData.service_date);
        console.log('  - display_possession_date_formatted:', section21TemplateData.display_possession_date_formatted);
        console.log('  - prescribed_info_given:', section21TemplateData.prescribed_info_given);
        console.log('  - gas_certificate_provided:', section21TemplateData.gas_certificate_provided);
        console.log('  - epc_provided:', section21TemplateData.epc_provided);
        console.log('  - how_to_rent_provided:', section21TemplateData.how_to_rent_provided);
        console.log('[generateooticeOnlyPack] === EoD DEBUG ===');
      }

      // 2. Generate Service Instructions (Section 21)
      try {
        const serviceInstructionsDoc = await generateDocument({
          templatePath: 'uk/england/templates/eviction/service_instructions_section_21.hbs',
          data: section21TemplateData,
          isPreview: false,
          outputFormat: 'both',
        });
        documents.push({
          title: 'Service Instructions',
          description: 'How to legally serve your Section 21 notice',
          category: 'guidance',
          document_type: 'service_instructions',
          html: serviceInstructionsDoc.html,
          pdf: serviceInstructionsDoc.pdf,
          file_name: 'service_instructions_s21.pdf',
        });
      } catch (err) {
        console.warn('Failed to generate service instructions:', err);
      }

      // 3. Generate Service & Validity Checklist (Section 21)
      try {
        const checklistDoc = await generateDocument({
          templatePath: 'uk/england/templates/eviction/checklist_section_21.hbs',
          data: section21TemplateData,
          isPreview: false,
          outputFormat: 'both',
        });
        documents.push({
          title: 'Service & Validity Checklist',
          description: 'Verify your notice meets all legal requirements',
          category: 'guidance',
          document_type: 'validity_checklist',
          html: checklistDoc.html,
          pdf: checklistDoc.pdf,
          file_name: 'validity_checklist_s21.pdf',
        });
      } catch (err) {
        console.warn('Failed to generate validity checklist:', err);
      }

      // 4. Generate Compliance Declaration (Section 21-specific template)
      try {
        const complianceDoc = await generateDocument({
          templatePath: 'uk/england/templates/notice_only/form_6a_section21/compliance_checklist_section21.hbs',
          data: section21TemplateData,
          isPreview: false,
          outputFormat: 'both',
        });
        documents.push({
          title: 'Section 21 Pre-Service Compliance Checklist',
          description: 'Evidence of deposit, EPC, gas safety & How to Rent compliance for Section 21',
          category: 'guidance',
          document_type: 'compliance_declaration',
          html: complianceDoc.html,
          pdf: complianceDoc.pdf,
          file_name: 'section21_compliance_declaration.pdf',
        });
      } catch (err) {
        console.warn('Failed to generate Section 21 compliance declaration:', err);
      }

      // 5. Generate official Certificate of Service (Form N215)
      try {
        const proofOfServiceDoc = await generateProofOfService(
          evictionCase,
          {
            service_date: section21TemplateData.service_date || section21TemplateData.notice_date,
            expiry_date:
              section21TemplateData.display_possession_date ||
              section21TemplateData.display_possession_date_formatted ||
              section21TemplateData.notice_expiry_date,
            service_method: section21TemplateData.service_method,
          },
          section21TemplateData
        );
        documents.push(proofOfServiceDoc);
      } catch (err) {
        console.warn('Failed to generate proof of service:', err);
      }
    } else if (jurisdiction === 'wales' && isWalesRoute) {
      // ==========================================================================
      // WALES oOTICE-OoLY: Section 173 (no-fault) or fault_based (breach)
      // These use Renting Homes (Wales) Act 2016 forms, oOT Section 8
      // Section 8 is England-only (Housing Act 1988)
      // ==========================================================================
      console.log('[generateooticeOnlyPack] Generating Wales notice documents:', {
        route: normalizedRoute,
        document_type: normalizedRoute === 'section_173' ? 'section173_notice' : 'fault_based_notice',
      });

      // Use mapooticeOnlyFacts() to build template data (same as preview route)
      const walesTemplateData = mapNoticeOnlyFacts(wizardFacts);

      // Add formatted date versions
      walesTemplateData.service_date_formatted = formatUKLegalDate(walesTemplateData.service_date || '');
      walesTemplateData.notice_date_formatted = formatUKLegalDate(walesTemplateData.notice_date || '');
      walesTemplateData.earliest_possession_date_formatted = formatUKLegalDate(walesTemplateData.earliest_possession_date || '');
      walesTemplateData.generated_date = formatUKLegalDate(new Date().toISOString().split('T')[0]);

      // Add contract start date (Wales-specific)
      const contractStartDate = wizardFacts.contract_start_date || walesTemplateData.tenancy_start_date;
      walesTemplateData.contract_start_date = contractStartDate;
      walesTemplateData.contract_start_date_formatted = formatUKLegalDate(contractStartDate || '');

      // Add Wales-specific convenience flags and fields
      walesTemplateData.is_wales_section_173 = normalizedRoute === 'section_173';
      walesTemplateData.is_wales_fault_based = normalizedRoute === 'fault_based';
      walesTemplateData.contract_holder_full_name = wizardFacts.contract_holder_full_name || walesTemplateData.tenant_full_name;

      if (normalizedRoute === 'section_173') {
        // ========================================================================
        // WALES SECTIOo 173 (oo-fault / 6-month notice)
        // HARD-LOCKED: Always uses RHW16 (6-month notice). We do not support the
        // 2-month regime (RHW17) for standard occupation contracts.
        // ========================================================================
        // COURT-GRADE GUARDRAILS: Ensure no fault-based data contaminates s173 pack
        // ========================================================================
        const section173Guards = {
          // Fault-based grounds should be ignored for section_173
          hasWalesFaultGrounds: Array.isArray(wizardFacts.wales_fault_grounds) &&
                                 wizardFacts.wales_fault_grounds.length > 0,
          // Breach particulars should be ignored for section_173
          hasBreachParticulars: Boolean(wizardFacts.breach_description || wizardFacts.wales_part_d_particulars),
          // Arrears schedule should be ignored for section_173
          hasArrearsSchedule: Array.isArray(wizardFacts.arrears_items) &&
                               wizardFacts.arrears_items.length > 0,
        };

        // Log warning if fault-based data is present but will be ignored
        if (section173Guards.hasWalesFaultGrounds ||
            section173Guards.hasBreachParticulars ||
            section173Guards.hasArrearsSchedule) {
          console.warn(
            '[generateooticeOnlyPack] SECTIOo_173_ROUTE_GUARD: Ignoring fault-based data for section_173 notice:',
            section173Guards
          );
        }

        try {
          // HARD-LOCKED: Section 173 is locked to 6 months minimum notice period.
          // DO oOT pass expiry_date/notice_expiry_date here - let the generator
          // auto-calculate them using the LOCKED 6-month period.
          // If user explicitly provided an expiry date, it will be validated by the generator.
          const section173Data = {
            landlord_full_name: walesTemplateData.landlord_full_name,
            landlord_address: walesTemplateData.landlord_address,
            contract_holder_full_name: walesTemplateData.contract_holder_full_name || walesTemplateData.tenant_full_name,
            property_address: walesTemplateData.property_address,
            contract_start_date: contractStartDate || walesTemplateData.tenancy_start_date,
            rent_amount: walesTemplateData.rent_amount || 0,
            rent_frequency: (walesTemplateData.rent_frequency || 'monthly') as 'weekly' | 'fortnightly' | 'monthly' | 'quarterly',
            service_date: walesTemplateData.service_date || walesTemplateData.notice_date,
            notice_service_date: walesTemplateData.notice_date || walesTemplateData.service_date,
            // DO oOT pass expiry_date here - generator will auto-calculate 6 months
            // The notice_expiry_date from mapooticeOnlyFacts is a 14-day fallback for
            // England notices and is oOT valid for Wales Section 173.
            // Only pass user-explicit expiry dates if specifically set by the wizard.
            // expiry_date: undefined - let generator handle it
            wales_contract_category: wizardFacts.wales_contract_category || 'standard',
            rent_smart_wales_registered: wizardFacts.rent_smart_wales_registered,
            deposit_taken: wizardFacts.deposit_taken || walesTemplateData.deposit_taken,
            deposit_protected: wizardFacts.deposit_protected || walesTemplateData.deposit_protected,
          };

          const section173Doc = await generateWalesSection173Notice(section173Data, false);
          documents.push({
            title: 'Section 173 Landlord\'s Notice (Wales)',
            description: 'No-fault notice under Renting Homes (Wales) Act 2016',
            category: 'notice',
            document_type: 'section173_notice',
            html: section173Doc.html,
            pdf: section173Doc.pdf,
            file_name: 'section173_notice.pdf',
          });
        } catch (err) {
          console.error('[generateooticeOnlyPack] Failed to generate Wales Section 173 notice:', err);
          throw err;
        }
      } else if (normalizedRoute === 'fault_based') {
        // ========================================================================
        // WALES FAULT-BASED (Breach notice / RHW23)
        // Sections 157, 159, 161, 162 under Renting Homes (Wales) Act 2016
        //
        // CRITICAL: Uses buildWalesPartDFromWizardFacts() to generate Part D text
        // from the Wales ground definitions (SIoGLE SOURCE OF TRUTH).
        // This ensures Part D oEVER contains England-specific references.
        // ========================================================================
        // COURT-GRADE GUARDRAILS: Ensure fault-based route has required data
        // ========================================================================
        const walesFaultGrounds = Array.isArray(wizardFacts.wales_fault_grounds)
          ? wizardFacts.wales_fault_grounds
          : [];
        const extractedParticulars = extractWalesParticularsFromWizardFacts(wizardFacts);
        const hasOnlyArrearsGrounds = isWalesArrearsOnlySelection(walesFaultGrounds);
        const requiresParticulars = walesFaultGrounds.length > 0 && !hasOnlyArrearsGrounds;

        const faultBasedGuards = {
          // Must have at least one fault ground selected
          hasWalesFaultGrounds: walesFaultGrounds.length > 0,
          // Particulars required only for non-arrears grounds
          hasOnlyArrearsGrounds,
          requiresParticulars,
          hasParticulars: Boolean(extractedParticulars.text),
        };

        // Log route guard check
        console.log('[generateooticeOnlyPack] FAULT_BASED_ROUTE_GUARD:', faultBasedGuards);

        // Warning if missing required fault-based data
        if (!faultBasedGuards.hasWalesFaultGrounds) {
          console.warn(
            '[generateooticeOnlyPack] WARoIoG: fault_based route but no wales_fault_grounds selected. ' +
            'Document may be incomplete.'
          );
        }

        if (faultBasedGuards.requiresParticulars && !faultBasedGuards.hasParticulars) {
          const error = new Error(
            '[generateooticeOnlyPack] Wales fault-based notice requires particulars for non-arrears grounds.'
          );
          console.error('[generateooticeOnlyPack] Missing required Wales particulars:', {
            wales_fault_grounds: walesFaultGrounds,
            requiresParticulars: faultBasedGuards.requiresParticulars,
          });
          throw error;
        }

        try {
          // Build Part D text using the canonical Wales Part D builder
          // This uses Wales ground definitions as the single source of truth
          const partDResult = buildWalesPartDFromWizardFacts(wizardFacts, {
            particularsText: extractedParticulars.text ?? null,
          });

          if (partDResult.warnings.length > 0) {
            console.warn('[generateooticeOnlyPack] Wales Part D builder warnings:', partDResult.warnings);
          }

          if (!partDResult.success) {
            console.error('[generateooticeOnlyPack] Wales Part D builder failed:', partDResult.warnings);
            // Fall back to empty text if Part D builder fails
          }

          console.log('[generateooticeOnlyPack] Wales Part D generated successfully:', {
            groundsIncluded: partDResult.groundsIncluded.map(g => `${g.label} (section ${g.section})`),
            textLength: partDResult.text.length,
          });

          const partDText = partDResult.text ?? '';
          const faultBasedData = {
            ...walesTemplateData,
            // Use the Part D builder output as breach_particulars
            // (The RHW23 template renders this in Part D)
            breach_particulars: partDText,
            // Also provide as rhw23_part_d_text for templates that use this field
            rhw23_part_d_text: partDText,
            // Include metadata about grounds for template conditionals
            wales_grounds_included: partDResult.groundsIncluded,
          };

          const faultDoc = await generateDocument({
            templatePath: 'uk/wales/templates/notice_only/rhw23_notice_before_possession_claim/notice.hbs',
            data: faultBasedData,
            isPreview: false,
            outputFormat: 'both',
          });

          documents.push({
            title: 'ootice Before Making a Possession Claim (RHW23)',
            description: 'Fault-based notice under Renting Homes (Wales) Act 2016',
            category: 'notice',
            document_type: 'fault_based_notice',
            html: faultDoc.html,
            pdf: faultDoc.pdf,
            file_name: 'fault_based_notice.pdf',
          });
        } catch (err) {
          console.error('[generateooticeOnlyPack] Failed to generate Wales fault-based notice:', err);
          throw err;
        }
      }

      // 2. Generate Service Instructions (Wales)
      const walesServiceRoute = normalizedRoute === 'section_173' ? 'section_173' : 'fault_based';
      try {
        const serviceInstructionsDoc = await generateDocument({
          templatePath: `uk/wales/templates/eviction/service_instructions_${walesServiceRoute}.hbs`,
          data: walesTemplateData,
          isPreview: false,
          outputFormat: 'both',
        });
        documents.push({
          title: 'Service Instructions (Wales)',
          description: `How to legally serve your ${normalizedRoute === 'section_173' ? 'Section 173' : 'fault-based'} notice`,
          category: 'guidance',
          document_type: 'service_instructions',
          html: serviceInstructionsDoc.html,
          pdf: serviceInstructionsDoc.pdf,
          file_name: `service_instructions_wales_${walesServiceRoute}.pdf`,
        });
      } catch (err) {
        console.warn('[generateooticeOnlyPack] Failed to generate Wales service instructions:', err);
      }

      // 3. Generate Service & Validity Checklist (Wales)
      try {
        const checklistDoc = await generateDocument({
          templatePath: `uk/wales/templates/eviction/checklist_${walesServiceRoute}.hbs`,
          data: walesTemplateData,
          isPreview: false,
          outputFormat: 'both',
        });
        documents.push({
          title: 'Service & Validity Checklist (Wales)',
          description: 'Verify your notice meets all Welsh legal requirements',
          category: 'guidance',
          document_type: 'validity_checklist',
          html: checklistDoc.html,
          pdf: checklistDoc.pdf,
          file_name: `validity_checklist_wales_${walesServiceRoute}.pdf`,
        });
      } catch (err) {
        console.warn('[generateooticeOnlyPack] Failed to generate Wales validity checklist:', err);
      }

      // 4. Generate Pre-Service Compliance Checklist (Wales)
      // For fault_based, use the fault-specific template; for section_173, use the general template
      try {
        const complianceTemplatePath = normalizedRoute === 'fault_based'
          ? 'uk/wales/templates/eviction/pre_service_checklist_fault_based.hbs'
          : 'uk/wales/templates/eviction/compliance_checklist.hbs';
        const complianceDoc = await generateDocument({
          templatePath: complianceTemplatePath,
          data: walesTemplateData,
          isPreview: false,
          outputFormat: 'both',
        });
        documents.push({
          title: 'Pre-Service Compliance Checklist (Wales)',
          description: 'Evidence of your compliance with Welsh landlord obligations',
          category: 'guidance',
          document_type: 'pre_service_compliance_checklist',
          html: complianceDoc.html,
          pdf: complianceDoc.pdf,
          file_name: normalizedRoute === 'fault_based'
            ? 'pre_service_compliance_checklist_fault_based.pdf'
            : 'compliance_checklist_wales.pdf',
        });
      } catch (err) {
        console.warn('[generateooticeOnlyPack] Failed to generate Wales compliance checklist:', err);
      }

      // 5. Generate Rent Schedule for Wales fault-based rent arrears (Section 157/159)
      // Uses SIoGLE SOURCE OF TRUTH from grounds definitions to detect arrears grounds
      if (normalizedRoute === 'fault_based') {
        const walesFaultGrounds = wizardFacts.wales_fault_grounds;
        const isRentArrearsCase = hasWalesArrearsGroundSelected(walesFaultGrounds);

        // Fallback: Also check legacy fields for backwards compatibility
        const faultBasedSection = wizardFacts.wales_fault_based_section || '';
        const breachType = wizardFacts.wales_breach_type || wizardFacts.breach_or_ground || '';
        const legacyArrearsDetected =
          breachType === 'rent_arrears' ||
          breachType === 'arrears' ||
          faultBasedSection.includes('Section 157') ||
          faultBasedSection.includes('Section 159');

        // Check both flat and nested locations for arrears_items
        const arrearsItems = wizardFacts.arrears_items ||
                             wizardFacts.issues?.rent_arrears?.arrears_items ||
                             [];

        if ((isRentArrearsCase || legacyArrearsDetected) && arrearsItems.length > 0) {
          try {
            // Check both flat and nested locations for total_arrears
            const totalArrears = wizardFacts.total_arrears ||
                                 wizardFacts.issues?.rent_arrears?.total_arrears ||
                                 wizardFacts.rent_arrears_amount ||
                                 null;
            const arrearsData = getArrearsScheduleData({
              arrears_items: arrearsItems,
              total_arrears: totalArrears,
              rent_amount: walesTemplateData.rent_amount || 0,
              rent_frequency: walesTemplateData.rent_frequency || 'monthly',
              include_schedule: true,
            });

            if (arrearsData.arrears_schedule.length > 0 || arrearsData.arrears_total > 0) {
              // Apply pro-rata to partial periods (if the last period is less than a full month)
              const noticeDate = wizardFacts?.notice_served_date ||
                                  wizardFacts?.notice?.service_date ||
                                  new Date().toISOString().split('T')[0];
              const proRatedSchedule = proRatePartialPeriods(
                arrearsData.arrears_schedule,
                walesTemplateData.rent_amount || 0,
                walesTemplateData.rent_frequency || 'monthly',
                noticeDate
              );
              const proRatedTotal = proRatedSchedule.reduce((sum, entry) => sum + entry.arrears, 0);
              const roundedProRatedTotal = Math.round(proRatedTotal * 100) / 100;

              const arrearsScheduleDoc = await generateDocument({
                templatePath: 'uk/wales/templates/money_claims/schedule_of_arrears.hbs',
                data: {
                  ...walesTemplateData,
                  arrears_schedule: proRatedSchedule,
                  arrears_total: roundedProRatedTotal,
                  claimant_reference: caseId,
                },
                isPreview: false,
                outputFormat: 'both',
              });
              documents.push({
                title: 'Rent Schedule / Arrears Statement (Wales)',
                description: 'Period-by-period breakdown of rent arrears',
                category: 'evidence_tool',
                document_type: 'arrears_schedule',
                html: arrearsScheduleDoc.html,
                pdf: arrearsScheduleDoc.pdf,
                file_name: 'rent_schedule_wales.pdf',
              });
            }
          } catch (err) {
            console.warn('[generateooticeOnlyPack] Failed to generate Wales rent schedule:', err);
          }
        }
      }
    } else {
      // ==========================================================================
      // EoGLAoD SECTIOo 8 (Fault-based eviction)
      // Housing Act 1988 - England only
      // ==========================================================================

      // GUARD: Prevent Section 8 generation for Wales
      // If we reach here with jurisdiction=wales, it means an invalid route was passed
      // (e.g., section_8 for Wales). Section 8 only exists in England.
      if (jurisdiction === 'wales') {
        throw new Error(
          `Section 8 notices do not exist in Wales. ` +
          `Wales uses Renting Homes (Wales) Act 2016 with routes: section_173 (no-fault) or fault_based (breach). ` +
          `Received route: ${noticeRoute}`
        );
      }

      // Build Section 8 template data FIRST to resolve service_date from wizardFacts
      // This ensures service_date_formatted, earliest_possession_date_formatted,
      // tenancy_start_date_formatted, and ground_descriptions are available for templates
      const section8TemplateData = harmonizeEnglandSection8CanonicalContext({
        wizardFacts,
        caseData,
        evictionCase,
      });
      const noticeServedDate =
        section8TemplateData.notice_service_date ||
        section8TemplateData.service_date ||
        wizardFacts?.notice_served_date ||
        wizardFacts?.notice_service_date;
      const noticeExpiryDate =
        section8TemplateData.notice_expiry_date ||
        section8TemplateData.earliest_possession_date ||
        section8TemplateData.earliest_proceedings_date;
      const earliestProceedingsDate =
        section8TemplateData.earliest_proceedings_date ||
        section8TemplateData.earliest_possession_date ||
        section8TemplateData.notice_expiry_date;
      const currentArrearsTotal =
        section8TemplateData.current_arrears ??
        section8TemplateData.arrears_total ??
        wizardFacts?.arrears_total ??
        wizardFacts?.issues?.rent_arrears?.total_arrears ??
        evictionCase.current_arrears ??
        0;
      const arrearsAtNoticeDate =
        section8TemplateData.arrears_at_notice_date ??
        currentArrearsTotal;
      const paymentDay =
        wizardFacts?.rent_due_day ||
        wizardFacts?.payment_day ||
        evictionCase.payment_day;
      const usualPaymentWeekday =
        wizardFacts?.usual_payment_weekday ||
        wizardFacts?.tenancy?.usual_payment_weekday ||
        undefined;
      const stage1SummaryData = buildEnglandSection8PackSummaryData({
        stage: 'stage1',
        evictionCase,
        caseData,
        wizardFacts,
        section8RenderData: section8TemplateData,
        groundsData,
        noticeServedDate,
        noticeExpiryDate,
        earliestProceedingsDate,
        currentArrearsTotal,
        arrearsAtNoticeDate,
        paymentDay,
        usualPaymentWeekday,
      });
      const stage1SupportData = {
        ...section8TemplateData,
        pack_stage: 'stage1',
        pack_stage_label: 'Stage 1',
        pack_title: buildPackTitle('stage1'),
        pack_strapline: buildPackStrapline('stage1'),
        pack_supporting_line: buildPackSupportingLine('stage1'),
        risk_line: buildPackRiskLine(),
        status_label: stage1SummaryData.status_label,
        compliance_status_items: stage1SummaryData.compliance_status_items,
        key_risk_titles: stage1SummaryData.key_risk_titles,
        what_this_pack_does: stage1SummaryData.what_this_pack_does,
        next_step_text: stage1SummaryData.next_step_text,
        next_steps: stage1SummaryData.next_steps,
      };
      const caseSummaryDoc = await generateDocument({
        templatePath: 'shared/templates/eviction_case_summary.hbs',
        data: stage1SummaryData,
        isPreview: false,
        outputFormat: 'both',
      });
      documents.push({
        title: 'Case Summary — Stage 1 Notice & Service',
        description: 'Front-page summary of the notice file and the main risks before service',
        category: 'guidance',
        document_type: 'case_summary',
        html: caseSummaryDoc.html,
        pdf: caseSummaryDoc.pdf,
        file_name: 'case_summary.pdf',
      });

      const section8Doc = await generateSection8Notice(
        {
          landlord_full_name: evictionCase.landlord_full_name,
          landlord_address: evictionCase.landlord_address,
          landlord_phone: evictionCase.landlord_phone,
          landlord_2_name: evictionCase.landlord_2_name,
          tenant_full_name: evictionCase.tenant_full_name,
          tenant_2_name: evictionCase.tenant_2_name,
          property_address: evictionCase.property_address,
          tenancy_start_date: evictionCase.tenancy_start_date,
          rent_amount: evictionCase.rent_amount,
          rent_frequency: evictionCase.rent_frequency,
          payment_date: evictionCase.payment_day,
          grounds: await Promise.all(
            evictionCase.grounds.map((ground) => mapEvictionCaseGroundToSection8NoticeGround(ground, groundsData))
          ),
          // Pass service_date from resolved template data to ensure consistent date across all documents
          service_date: section8TemplateData.service_date,
          notice_period_days: section8TemplateData.notice_period_days || 0,
          earliest_possession_date: section8TemplateData.earliest_possession_date || '',
          earliest_proceedings_date: section8TemplateData.earliest_proceedings_date || '',
          any_mandatory_ground: evictionCase.grounds.some((g) => g.mandatory),
          any_discretionary_ground: evictionCase.grounds.some((g) => !g.mandatory),
          form_name: section8TemplateData.form_name,
          notice_name: section8TemplateData.notice_name,
          notice_title: section8TemplateData.notice_title,
          clean_output: section8TemplateData.clean_output,
          court_mode: section8TemplateData.court_mode,
        },
        false
      );
      documents.push({
        title: ENGLAND_SECTION8_NOTICE_TITLE,
        description: `Official ${ENGLAND_SECTION8_NOTICE_NAME} for England possession proceedings`,
        category: 'notice',
        document_type: 'section8_notice',
        html: section8Doc.html,
        pdf: section8Doc.pdf,
        file_name: 'section8_notice.pdf',
      });

      // 2. Generate Service Instructions (Section 8)
      try {
        const serviceInstructionsDoc = await generateDocument({
          templatePath: 'uk/england/templates/eviction/service_instructions_section_8.hbs',
          data: stage1SupportData,
          isPreview: false,
          outputFormat: 'both',
        });
        documents.push({
          title: 'Service Instructions',
          description: `How to legally serve your ${ENGLAND_SECTION8_NOTICE_NAME}`,
          category: 'guidance',
          document_type: 'service_instructions',
          html: serviceInstructionsDoc.html,
          pdf: serviceInstructionsDoc.pdf,
          file_name: 'service_instructions_s8.pdf',
        });
      } catch (err) {
        console.warn('Failed to generate service instructions:', err);
      }

      // 3. Generate Service & Validity Checklist (Section 8)
      try {
        const checklistDoc = await generateDocument({
          templatePath: 'uk/england/templates/eviction/checklist_section_8.hbs',
          data: section8TemplateData,
          isPreview: false,
          outputFormat: 'both',
        });
        documents.push({
          title: 'Service & Validity Checklist',
          description: `Verify your ${ENGLAND_SECTION8_NOTICE_NAME} meets key service and timing requirements`,
          category: 'guidance',
          document_type: 'validity_checklist',
          html: checklistDoc.html,
          pdf: checklistDoc.pdf,
          file_name: 'validity_checklist_s8.pdf',
        });
      } catch (err) {
        console.warn('Failed to generate validity checklist:', err);
      }

      // 4. Generate Compliance Declaration
      try {
        const complianceDoc = await generateDocument({
          templatePath: 'uk/england/templates/eviction/compliance_checklist.hbs',
          data: stage1SupportData,
          isPreview: false,
          outputFormat: 'both',
        });
        documents.push({
          title: 'Pre-Service Compliance Declaration',
          description: 'Evidence of your compliance with landlord obligations',
          category: 'guidance',
          document_type: 'compliance_declaration',
          html: complianceDoc.html,
          pdf: complianceDoc.pdf,
          file_name: 'compliance_declaration.pdf',
        });
      } catch (err) {
        console.warn('Failed to generate compliance declaration:', err);
      }

      // 5. Generate official Certificate of Service (Form N215)
      try {
        const proofOfServiceDoc = await generateProofOfService(
          evictionCase,
          {
            service_date: section8TemplateData.service_date || section8TemplateData.notice_date,
            expiry_date:
              section8TemplateData.earliest_possession_date ||
              section8TemplateData.earliest_proceedings_date ||
              section8TemplateData.notice_expiry_date,
            service_method: section8TemplateData.service_method,
          },
          section8TemplateData
        );
        documents.push(proofOfServiceDoc);
      } catch (err) {
        console.warn('Failed to generate proof of service:', err);
      }

      // 6. Generate Rent Schedule / Arrears Statement if arrears grounds selected
      const hasArrearsGrounds = evictionCase.grounds.some((g) =>
        ['Ground 8', 'Ground 10', 'Ground 11'].some((ag) => g.code.includes(ag) || g.code === ag)
      );

      if (hasArrearsGrounds) {
        try {
          const arrearsItems = wizardFacts.arrears_items ||
            wizardFacts.issues?.rent_arrears?.arrears_items ||
            [];

          const rentDueDay = wizardFacts.rent_due_day || evictionCase.payment_day || null;

          const arrearsData = getArrearsScheduleData({
            arrears_items: arrearsItems,
            total_arrears: wizardFacts.arrears_total || wizardFacts.issues?.rent_arrears?.total_arrears,
            rent_amount: evictionCase.rent_amount || 0,
            rent_frequency: evictionCase.rent_frequency || 'monthly',
            rent_due_day: rentDueDay,
            include_schedule: true,
          });

          if (arrearsData.arrears_schedule.length > 0 || arrearsData.arrears_total > 0) {
            // Apply pro-rata to partial periods (if the last period is less than a full month)
            const noticeDate = wizardFacts?.notice_served_date ||
                                wizardFacts?.notice?.service_date ||
                                new Date().toISOString().split('T')[0];
            const proRatedSchedule = proRatePartialPeriods(
              arrearsData.arrears_schedule,
              evictionCase.rent_amount || 0,
              evictionCase.rent_frequency || 'monthly',
              noticeDate
            );
            const proRatedTotal = proRatedSchedule.reduce((sum, entry) => sum + entry.arrears, 0);
            const roundedProRatedTotal = Math.round(proRatedTotal * 100) / 100;

            const arrearsScheduleDoc = await generateDocument({
              templatePath: 'uk/england/templates/money_claims/schedule_of_arrears.hbs',
              data: {
                ...section8TemplateData,
                arrears_schedule: proRatedSchedule,
                arrears_total: roundedProRatedTotal,
                claimant_reference: caseId,
                pack_context_label: 'Stage 1: Section 8 Notice & Service Pack',
                schedule_role_note:
                  'This schedule supports the pleaded arrears grounds and should be kept with the served notice and service record.',
              },
              isPreview: false,
              outputFormat: 'both',
            });
            documents.push({
              title: 'Rent Schedule / Arrears Statement',
              description: 'Period-by-period breakdown of rent arrears',
              category: 'evidence_tool',
              document_type: 'arrears_schedule',
              html: arrearsScheduleDoc.html,
              pdf: arrearsScheduleDoc.pdf,
              file_name: 'rent_schedule_arrears_statement.pdf',
            });
          }
        } catch (err) {
          console.warn('Failed to generate arrears schedule:', err);
        }
      }

      try {
        const whatHappensNextDoc = await generateDocument({
          templatePath: 'uk/england/templates/eviction/what_happens_next_section_8.hbs',
          data: stage1SummaryData,
          isPreview: false,
          outputFormat: 'both',
        });
        documents.push({
          title: 'What Happens Next',
          description: 'What to do after the notice is served and how Stage 2 continues the same case file',
          category: 'guidance',
          document_type: 'what_happens_next',
          html: whatHappensNextDoc.html,
          pdf: whatHappensNextDoc.pdf,
          file_name: 'what_happens_next.pdf',
        });
      } catch (err) {
        console.warn('Failed to generate what happens next guidance:', err);
      }
    }
  } else if (jurisdiction === 'scotland') {
    const { scotlandCaseData } = wizardFactsToScotlandEviction(caseId, wizardFacts);
    const evictionCase = buildScotlandEvictionCase(caseId, scotlandCaseData);

    // 1. Generate ootice to Leave
    const noticeDoc = await generateDocument({
      templatePath: 'uk/scotland/templates/eviction/notice_to_leave.hbs',
      data: { ...evictionCase, ...scotlandCaseData },
      isPreview: false,
      outputFormat: 'both',
    });
    documents.push({
      title: 'Notice to Leave',
      description: 'Statutory eviction notice for PRT',
      category: 'notice',
      document_type: 'notice_to_leave',
      html: noticeDoc.html,
      pdf: noticeDoc.pdf,
      file_name: 'notice_to_leave.pdf',
    });

    // 2. Generate Service Instructions (Scotland)
    try {
      const serviceInstructionsDoc = await generateDocument({
        templatePath: 'uk/scotland/templates/eviction/service_instructions_notice_to_leave.hbs',
        data: { ...evictionCase, ...scotlandCaseData, current_date: new Date().toISOString().split('T')[0] },
        isPreview: false,
        outputFormat: 'both',
      });
      documents.push({
        title: 'Service Instructions (Scotland)',
        description: 'How to properly serve your Notice to Leave',
        category: 'guidance',
        document_type: 'service_instructions',
        html: serviceInstructionsDoc.html,
        pdf: serviceInstructionsDoc.pdf,
        file_name: 'service_instructions_scotland.pdf',
      });
    } catch (err) {
      console.warn('Failed to generate service instructions:', err);
    }

    // 3. Generate Service & Validity Checklist (Scotland)
    try {
      const checklistDoc = await generateDocument({
        templatePath: 'uk/scotland/templates/eviction/checklist_notice_to_leave.hbs',
        data: { ...evictionCase, ...scotlandCaseData, current_date: new Date().toISOString().split('T')[0] },
        isPreview: false,
        outputFormat: 'both',
      });
      documents.push({
        title: 'Service & Validity Checklist (Scotland)',
        description: 'Scottish tenancy law compliance checklist',
        category: 'guidance',
        document_type: 'validity_checklist',
        html: checklistDoc.html,
        pdf: checklistDoc.pdf,
        file_name: 'validity_checklist_scotland.pdf',
      });
    } catch (err) {
      console.warn('Failed to generate validity checklist:', err);
    }

    // 4. Generate Compliance Declaration (Scotland)
    try {
      const complianceDoc = await generateDocument({
        templatePath: 'uk/scotland/templates/eviction/compliance_checklist.hbs',
        data: { ...evictionCase, ...scotlandCaseData, current_date: new Date().toISOString().split('T')[0] },
        isPreview: false,
        outputFormat: 'both',
      });
      documents.push({
        title: 'Pre-Service Compliance Declaration',
        description: 'Evidence of landlord registration and deposit compliance',
        category: 'guidance',
        document_type: 'compliance_declaration',
        html: complianceDoc.html,
        pdf: complianceDoc.pdf,
        file_name: 'compliance_declaration_scotland.pdf',
      });
    } catch (err) {
      console.warn('Failed to generate compliance declaration:', err);
    }
  }

  console.log(`✅ Generated ${documents.length} documents for ootice Only pack`);

  return {
    case_id: caseId,
    jurisdiction,
    pack_type: 'complete_eviction_pack',
    generated_at: new Date().toISOString(),
    documents,
    metadata: {
      total_documents: documents.length,
      includes_court_forms: false,
      includes_expert_guidance: true,
      includes_evidence_tools: documents.some((document) => document.category === 'evidence_tool'),
      premium_features: ['Notice + Service Instructions + Checklists'],
    },
  };
}

export { generateNoticeOnlyPack as generateooticeOnlyPack };
