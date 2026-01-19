/**
 * Complete Eviction Pack Generator
 *
 * Generates region-specific complete eviction packs including:
 * - All notices (Section 8/21, Notice to Leave)
 * - All court forms (N5, N5B, N119, Tribunal forms)
 * - Expert guidance documents
 * - Grounds support and evidence checklists
 * - Premium features (lifetime storage, priority support)
 *
 * Pricing: £149.99 one-time payment
 * Regions: England & Wales, Scotland
 */

import { generateDocument } from './generator';
import { assertNoticeOnlyValid, assertCompletePackValid } from './noticeOnly';
import { generateSection8Notice, Section8NoticeData } from './section8-generator';
import { generateSection21Notice, Section21NoticeData } from './section21-generator';
import { fillN5Form, fillN119Form, CaseData, fillN5BForm } from './official-forms-filler';
import type { ScotlandCaseData } from './scotland-forms-filler';
import { buildServiceContact } from '@/lib/documents/service-contact';
import {
  wizardFactsToEnglandWalesEviction,
  wizardFactsToScotlandEviction,
  buildScotlandEvictionCase,
} from './eviction-wizard-mapper';
import { generateWitnessStatement, extractWitnessStatementContext } from '@/lib/ai/witness-statement-generator';
import {
  buildWitnessStatementSections,
  extractWitnessStatementSectionsInput,
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
import { SECTION8_GROUND_DEFINITIONS } from '@/lib/grounds/section8-ground-definitions';
import { mapNoticeOnlyFacts } from '@/lib/case-facts/normalize';
import { mapWalesFaultGroundsToGroundCodes, hasWalesArrearsGroundSelected } from '@/lib/wales/grounds';
import { buildWalesPartDFromWizardFacts } from '@/lib/wales/partDBuilder';
import { normalizeRoute, type CanonicalRoute } from '@/lib/wizard/route-normalizer';
import { generateWalesSection173Notice } from './wales-section173-generator';
import { isSection173Route, isWalesFaultBasedRoute } from '@/lib/wales/section173FormSelector';

// ============================================================================
// DATE FORMATTING HELPER - UK Legal Format
// ============================================================================

/**
 * Format a date string to UK legal format (e.g., "15 January 2026")
 * Used for service instructions and checklist PDFs
 */
function formatUKLegalDate(dateString: string | null | undefined): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
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

/**
 * Build formatted date fields for Section 8 templates.
 * Ensures service_date_formatted, earliest_possession_date_formatted,
 * tenancy_start_date_formatted, and ground_descriptions are set.
 */
function buildSection8TemplateData(
  evictionCase: EvictionCase,
  wizardFacts: any
): Record<string, any> {
  // Resolve service date from multiple possible sources (first non-empty wins)
  const serviceDate =
    wizardFacts.notice_service_date ||
    wizardFacts.notice_served_date ||
    wizardFacts.section_8_notice_date ||
    wizardFacts.service_date ||
    wizardFacts.notice_date ||
    wizardFacts['notice_service.notice_date'] ||
    new Date().toISOString().split('T')[0];

  // Resolve earliest possession / expiry date
  const earliestPossessionDate =
    wizardFacts.notice_expiry_date ||
    wizardFacts.earliest_possession_date ||
    wizardFacts.section8_expiry_date ||
    wizardFacts['notice_service.notice_expiry_date'] ||
    '';

  // Resolve tenancy start date
  const tenancyStartDate =
    wizardFacts.tenancy_start_date ||
    evictionCase.tenancy_start_date ||
    '';

  // Build ground descriptions string (e.g., "Ground 8 – Serious rent arrears, Ground 10 – ...")
  const groundDescriptions = evictionCase.grounds
    .map((g) => `Ground ${g.code.replace('Ground ', '')} – ${g.title}`)
    .join(', ');

  const now = new Date().toISOString().split('T')[0];

  return {
    ...evictionCase,
    ...wizardFacts,
    // Raw dates
    service_date: serviceDate,
    notice_service_date: serviceDate,
    notice_date: serviceDate,
    intended_service_date: serviceDate,
    earliest_possession_date: earliestPossessionDate,
    tenancy_start_date: tenancyStartDate,
    // Formatted dates for templates
    service_date_formatted: formatUKLegalDate(serviceDate),
    notice_date_formatted: formatUKLegalDate(serviceDate),
    earliest_possession_date_formatted: formatUKLegalDate(earliestPossessionDate),
    tenancy_start_date_formatted: formatUKLegalDate(tenancyStartDate),
    generated_date: formatUKLegalDate(now),
    current_date: now,
    // Ground descriptions for checklist
    ground_descriptions: groundDescriptions,
    grounds: evictionCase.grounds,
    // Convenience flags
    has_mandatory_ground: evictionCase.grounds.some((g) => g.mandatory),
    is_fixed_term: evictionCase.fixed_term === true,
    // Nested objects for template compatibility (compliance_checklist.hbs expects these)
    tenancy: {
      start_date: tenancyStartDate,
    },
    metadata: {
      generated_at: now,
    },
  };
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
 * Narrow deposit scheme to England-only schemes for Section 21 notices.
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

function extractGroundCodes(section8Grounds: any[]): number[] {
  if (!Array.isArray(section8Grounds)) return [];

  return section8Grounds
    .map((g) => {
      if (typeof g === 'number') return g;
      if (typeof g !== 'string') return null;
      const match = g.match(/Ground\s+(\d+)/i) || g.match(/ground[_\s](\d+)/i);
      return match ? parseInt(match[1], 10) : null;
    })
    .filter((code): code is number => code !== null && !Number.isNaN(code));
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
// GROUND DEFINITIONS LOADER
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
// DOCUMENT GENERATORS
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
    // Northern Ireland / fallback
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
  const templatePath = 'shared/templates/evidence_collection_checklist.hbs';

  // Determine case type label based on grounds
  const hasSection8Grounds = evictionCase.grounds.length > 0;
  const caseTypeLabel = hasSection8Grounds
    ? `Section 8 (${evictionCase.grounds.map(g => g.code).join(', ')})`
    : evictionCase.case_type === 'no_fault' ? 'Section 21' : 'Possession Claim';

  const data = {
    ...evictionCase,
    // Map tenant_full_name to tenant_name for template compatibility
    tenant_name: evictionCase.tenant_full_name,
    // Map case type for display
    case_type: caseTypeLabel,
    // Add current date
    current_date: formatUKLegalDate(new Date().toISOString().split('T')[0]),
    grounds_data: groundsData,
    required_evidence: evictionCase.grounds.map((g) => {
      const groundDetails = getGroundDetails(groundsData, g.code);
      return {
        ground: g.code,
        title: g.title,
        evidence_items: groundDetails?.required_evidence || [],
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
    title: 'Evidence Collection Checklist',
    description: 'Detailed checklist of all evidence you need to gather',
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

  // Scotland Notice to Leave (check first before general no_fault)
  if (evictionCase.jurisdiction === 'scotland') {
    return 'Notice to Leave';
  }

  // Wales routes (check before general no_fault)
  if (evictionCase.jurisdiction === 'wales') {
    if (hasSection8Grounds) {
      return 'Possession Notice (Fault-based)';
    }
    return 'Section 173 Notice (No-fault)';
  }

  // England routes
  if (hasSection8Grounds) {
    return 'Section 8 Notice (Form 3)';
  }

  // Section 21 (no-fault eviction) for England
  if (evictionCase.case_type === 'no_fault') {
    return 'Section 21 Notice (Form 6A)';
  }

  return 'Possession Notice';
}

/**
 * Map service method code to checkbox-friendly value
 */
function mapServiceMethodForTemplate(method: string | undefined): string {
  if (!method) return '';

  const methodMap: Record<string, string> = {
    'first_class_post': 'post',
    'post': 'post',
    'recorded_delivery': 'recorded_delivery',
    'signed_for': 'recorded_delivery',
    'hand_delivered': 'hand',
    'hand': 'hand',
    'left_at_property': 'hand',
    'letterbox': 'hand',
    'email': 'email',
  };

  return methodMap[method.toLowerCase()] || '';
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
  }
): Promise<EvictionPackDocument> {
  const templatePath = 'shared/templates/proof_of_service.hbs';

  // Get notice type based on case
  const noticeType = getNoticeTypeLabel(evictionCase);

  // Format dates if provided
  const serviceDateFormatted = serviceDetails?.service_date
    ? formatUKLegalDate(serviceDetails.service_date)
    : '';
  const expiryDateFormatted = serviceDetails?.expiry_date
    ? formatUKLegalDate(serviceDetails.expiry_date)
    : '';

  const data = {
    ...evictionCase,
    // Map notice type based on route
    notice_type: noticeType,
    // Map service details
    service_date_formatted: serviceDateFormatted,
    earliest_possession_date_formatted: expiryDateFormatted,
    // Map service method for checkbox matching
    service_method: mapServiceMethodForTemplate(serviceDetails?.service_method),
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
  const baseDaysNotice = 14; // generic baseline – templates can explain nuances
  const baseDaysCourt = 90;
  const baseDaysEnforcement = 60;

  const today = new Date();

  const hasMandatoryGround = evictionCase.grounds?.some((g) => g.mandatory);
  const jurisdiction = evictionCase.jurisdiction;

  // Simple tweaks – you can refine per-ground in templates:
  let noticeDays = baseDaysNotice;
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
// REGION-SPECIFIC GENERATORS
// ============================================================================

/**
 * Generate England & Wales Eviction Pack
 */
async function generateEnglandOrWalesEvictionPack(
  evictionCase: EvictionCase,
  caseData: CaseData,
  groundsData: any
): Promise<EvictionPackDocument[]> {
  const documents: EvictionPackDocument[] = [];
  const jurisdiction = evictionCase.jurisdiction; // 'england' or 'wales'

  // 1. Section 8 Notice (if fault-based grounds)
  if (evictionCase.grounds.length > 0) {
    // NOTE: Do NOT hardcode notice period - it varies by ground (14 days for Ground 8,
    // 60 days for Grounds 10/11). Let section8-generator auto-calculate based on grounds.
    // service_date defaults to today if not provided.
    const serviceDate = caseData.notice_served_date || caseData.section_8_notice_date;

    const section8Data: Section8NoticeData = {
      landlord_full_name: evictionCase.landlord_full_name,
      landlord_address: evictionCase.landlord_address,
      tenant_full_name: evictionCase.tenant_full_name,
      property_address: evictionCase.property_address,
      tenancy_start_date: evictionCase.tenancy_start_date,
      rent_amount: evictionCase.rent_amount,
      rent_frequency: evictionCase.rent_frequency,
      payment_date: evictionCase.payment_day,
      grounds: evictionCase.grounds.map((g) => {
        const groundCode = parseInt(g.code.replace('Ground ', ''));
        const groundDef = SECTION8_GROUND_DEFINITIONS[groundCode];
        return {
          code: groundCode,
          title: g.title,
          legal_basis: getGroundDetails(groundsData, g.code)?.statute || '',
          particulars: g.particulars,
          supporting_evidence: g.evidence,
          mandatory: g.mandatory || false,
          statutory_text: groundDef?.full_text || '',
        };
      }),
      // Pass service date if user provided it; section8-generator will calculate
      // earliest_possession_date and notice_period_days based on grounds
      service_date: serviceDate || undefined,
      // Let section8-generator auto-calculate these based on grounds:
      notice_period_days: 0, // Will be computed by generator
      earliest_possession_date: '', // Will be computed by generator
      any_mandatory_ground: evictionCase.grounds.some((g) => g.mandatory),
      any_discretionary_ground: evictionCase.grounds.some((g) => !g.mandatory),
    };

    const section8Doc = await generateSection8Notice(section8Data, false);

    documents.push({
      title: 'Section 8 Notice - Notice Seeking Possession',
      description: 'Official notice to tenant citing grounds for possession',
      category: 'notice',
      document_type: 'section8_notice',
      html: section8Doc.html,
      pdf: section8Doc.pdf,
      file_name: 'section8_notice.pdf',
    });
  }

  // 2. Section 21 Notice (if no-fault) - ENGLAND ONLY
  if (evictionCase.case_type === 'no_fault') {
    // Section 21 is ONLY valid in England
    if (jurisdiction !== 'england') {
      throw new Error(
        `Section 21 (no-fault eviction) is not available in ${jurisdiction}. ` +
        `${jurisdiction === 'wales' ? 'Wales uses Section 173 notices under the Renting Homes (Wales) Act 2016.' : ''}`
      );
    }

    // Build Section21NoticeData from evictionCase to use the canonical notice generator
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
    };

    // Use canonical Section 21 notice generator (single source of truth)
    const section21Doc = await generateSection21Notice(section21Data, false);

    documents.push({
      title: 'Section 21 Notice - Form 6A',
      description: 'Official no-fault eviction notice (2 months) - England only',
      category: 'notice',
      document_type: 'section21_notice',
      html: section21Doc.html,
      pdf: section21Doc.pdf,
      file_name: 'section21_form6a.pdf',
    });

    // Accelerated possession claim (N5B)
    // CRITICAL: Pass jurisdiction to select correct Wales/England form
    const n5bPdf = await fillN5BForm({
      ...caseData,
      jurisdiction, // Ensures Wales uses N5B_WALES_0323.pdf, England uses n5b-eng.pdf
      landlord_full_name: caseData.landlord_full_name || evictionCase.landlord_full_name,
      landlord_address: caseData.landlord_address || evictionCase.landlord_address,
      landlord_postcode: caseData.landlord_postcode || evictionCase.landlord_address_postcode,
      tenant_full_name: caseData.tenant_full_name || evictionCase.tenant_full_name,
      property_address: caseData.property_address || evictionCase.property_address,
      property_postcode: caseData.property_postcode || evictionCase.property_address_postcode,
      tenancy_start_date: caseData.tenancy_start_date || evictionCase.tenancy_start_date,
      rent_amount: caseData.rent_amount ?? evictionCase.rent_amount,
      rent_frequency: caseData.rent_frequency || evictionCase.rent_frequency,
      deposit_protection_date: caseData.deposit_protection_date,
      deposit_reference: caseData.deposit_reference,
      deposit_scheme: caseData.deposit_scheme,
      section_21_notice_date:
        caseData.section_21_notice_date || caseData.notice_served_date || new Date().toISOString().split('T')[0],
      notice_expiry_date: caseData.notice_expiry_date,
      signature_date: caseData.signature_date || new Date().toISOString().split('T')[0],
      signatory_name: caseData.signatory_name || evictionCase.landlord_full_name,
      court_name: caseData.court_name || 'County Court',
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

  // 3. N5 Claim Form
  // CRITICAL: Pass jurisdiction to select correct Wales/England forms
  const service = buildServiceContact({ ...evictionCase, ...caseData });

  const enrichedCaseData: CaseData = {
    ...caseData,
    jurisdiction, // Ensures Wales uses N5_WALES/N119_WALES forms, England uses n5-eng/n119-eng
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

  // 4. N119 Particulars of Claim
  const n119Pdf = await fillN119Form(enrichedCaseData);
  documents.push({
    title: 'Form N119 - Particulars of Claim',
    description: 'Detailed particulars supporting your possession claim',
    category: 'court_form',
    document_type: 'n119_particulars',
    pdf: Buffer.from(n119Pdf),
    file_name: 'n119_particulars_of_claim.pdf',
  });

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

  // 1. Notice to Leave (generated via Handlebars template because official PDF is not fillable)
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
// MAIN GENERATOR
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
 * Price: £149.99 one-time
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
    console.warn(`[MIGRATION] Converted legacy jurisdiction "england-wales" to "${jurisdiction}"`);
  }

  if (!jurisdiction || !['england', 'wales', 'scotland', 'northern-ireland'].includes(jurisdiction)) {
    throw new Error(`Invalid jurisdiction: ${jurisdiction}. Must be one of: england, wales, scotland, northern-ireland`);
  }

  console.log(`\n📦 Generating Complete Eviction Pack for ${jurisdiction}...`);
  console.log('='.repeat(80));

  // ==========================================================================
  // WALES GROUND_CODES DERIVATION (same as generateNoticeOnlyPack)
  // The UI collects wales_fault_grounds (e.g., ['rent_arrears_serious']),
  // but validation/templates expect ground_codes (e.g., ['section_157']).
  // Preview endpoints derive this at request time, but paid generation reads
  // raw collected_facts from DB. We must derive ground_codes here to match.
  // ==========================================================================
  if (jurisdiction === 'wales') {
    const walesFaultGrounds = wizardFacts?.wales_fault_grounds;
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
  }

  // Load jurisdiction-specific grounds
  const groundsData = await loadEvictionGrounds(jurisdiction as Jurisdiction);

  // ============================================================================
  // PRE-FLIGHT VALIDATION
  // Ensure all required fields are present before generating court forms.
  // This mirrors the notice-only validation and adds complete pack specific checks.
  // ============================================================================

  const selectedGroundCodes = extractGroundCodes(
    wizardFacts?.section8_grounds || wizardFacts?.grounds || []
  );

  // Determine case type for validation
  const evictionRoute = wizardFacts?.eviction_route || wizardFacts?.notice_type || wizardFacts?.selected_notice_route;
  const isNoFault = evictionRoute?.toLowerCase?.().includes('section 21') ||
                     evictionRoute?.toLowerCase?.().includes('section_21') ||
                     evictionRoute === 'no_fault';
  const caseType = isNoFault ? 'no_fault' : 'rent_arrears';

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
      throw new Error(reason.startsWith('EVICTION_PACK_VALIDATION_FAILED')
        ? reason
        : `EVICTION_PACK_VALIDATION_FAILED: ${reason}`);
    }
  }

  // Initialize documents array
  const documents: EvictionPackDocument[] = [];

  // 1. Generate region-specific notices and court forms
  let regionDocs: EvictionPackDocument[] = [];

  let evictionCase: EvictionCase;

  if (jurisdiction === 'england' || jurisdiction === 'wales') {
    const { evictionCase: ewCase, caseData } = wizardFactsToEnglandWalesEviction(caseId, wizardFacts);
    evictionCase = { ...ewCase, jurisdiction: jurisdiction as Jurisdiction };
    regionDocs = await generateEnglandOrWalesEvictionPack(evictionCase, caseData, groundsData);
  } else if (jurisdiction === 'scotland') {
    const { scotlandCaseData } = wizardFactsToScotlandEviction(caseId, wizardFacts);
    evictionCase = buildScotlandEvictionCase(caseId, scotlandCaseData);
    regionDocs = await generateScotlandEvictionPack(evictionCase, scotlandCaseData);
  } else {
    throw new Error(`Eviction packs not yet supported for ${jurisdiction}`);
  }

  documents.push(...regionDocs);

  // 1.1 Generate Schedule of Arrears if arrears grounds selected
  if (hasArrearsGroundsSelected(selectedGroundCodes)) {
    try {
      // Get arrears data from wizard facts using canonical engine
      const arrearsItems: ArrearsItem[] = wizardFacts?.arrears_items ||
                                           wizardFacts?.issues?.rent_arrears?.arrears_items || [];
      const totalArrears = wizardFacts?.total_arrears ||
                            wizardFacts?.arrears_total ||
                            wizardFacts?.issues?.rent_arrears?.total_arrears || 0;
      const rentAmount = wizardFacts?.rent_amount ||
                          wizardFacts?.tenancy?.rent_amount || 0;
      const rentFrequency = (wizardFacts?.rent_frequency ||
                              wizardFacts?.tenancy?.rent_frequency || 'monthly') as TenancyFacts['rent_frequency'];

      const rentDueDay = wizardFacts?.rent_due_day ||
                          wizardFacts?.tenancy?.rent_due_day || null;

      const arrearsData = getArrearsScheduleData({
        arrears_items: arrearsItems,
        total_arrears: totalArrears,
        rent_amount: rentAmount,
        rent_frequency: rentFrequency,
        rent_due_day: rentDueDay,
        include_schedule: true,
      });

      if (arrearsData.include_schedule_pdf) {
        const jurisdictionKey = jurisdiction === 'wales' ? 'wales' : 'england';
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
            // Add generation date
            generated_date: new Date().toISOString().split('T')[0],
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
  // Note: Eviction Roadmap, Expert Guidance, and Timeline removed as of Jan 2026 pack restructure
  // Keeping court filing guide and evidence tools only

  // 3. Generate evidence tools
  const evidenceChecklist = await generateEvidenceChecklist(evictionCase, groundsData);
  documents.push(evidenceChecklist);

  // Extract service details from wizard facts for proof of service
  const serviceDetails = {
    service_date: wizardFacts?.notice_served_date ||
                  wizardFacts?.notice?.service_date ||
                  wizardFacts?.service_date,
    expiry_date: wizardFacts?.notice_expiry_date ||
                 wizardFacts?.notice?.expiry_date ||
                 wizardFacts?.expiry_date,
    service_method: wizardFacts?.notice_service_method ||
                    wizardFacts?.notice?.service_method ||
                    wizardFacts?.service_method,
  };
  const proofOfService = await generateProofOfService(evictionCase, serviceDetails);
  documents.push(proofOfService);

  // 3.1 Generate witness statement
  // For Section 8 cases, use deterministic buildWitnessStatementSections for court-ready content.
  // This ensures all sections are populated with factual, court-appropriate text derived from case facts.
  // For other cases, fall back to AI-powered generation.
  try {
    // Determine if this is a Section 8 case (has fault-based grounds)
    const isSection8Case = evictionCase.grounds && evictionCase.grounds.length > 0;

    let witnessStatementContent;

    if (isSection8Case && jurisdiction === 'england') {
      // Use deterministic builder for England Section 8 cases
      // This generates court-ready content from case facts without AI
      const sectionsInput = extractWitnessStatementSectionsInput(wizardFacts);
      witnessStatementContent = buildWitnessStatementSections(sectionsInput);
      console.log('📝 Using deterministic witness statement builder for Section 8 case');
    } else {
      // Fall back to AI-powered generation for other cases
      const witnessStatementContext = extractWitnessStatementContext(wizardFacts);
      witnessStatementContent = await generateWitnessStatement(wizardFacts, witnessStatementContext);
    }

    const witnessStatementDoc = await generateDocument({
      templatePath: `uk/${jurisdiction}/templates/eviction/witness-statement.hbs`,
      data: {
        ...evictionCase,
        witness_statement: witnessStatementContent,
        // Map to template-expected field names
        landlord_name: evictionCase.landlord_full_name,
        tenant_name: evictionCase.tenant_full_name,
        landlord_address: evictionCase.landlord_address,
        court_name: jurisdiction === 'scotland' ? 'First-tier Tribunal' : 'County Court',
        // Add generation date
        generated_date: formatUKLegalDate(new Date().toISOString().split('T')[0]),
      },
      isPreview: false,
      outputFormat: 'both',
    });

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

  // Court bundle index
  try {
    const bundleIndexDoc = await generateDocument({
      templatePath: `uk/${jurisdiction}/templates/eviction/court_bundle_index.hbs`,
      data: {
        ...evictionCase,
        landlord_full_name: evictionCase.landlord_full_name,
        tenant_full_name: evictionCase.tenant_full_name,
        property_address: evictionCase.property_address,
        generated_date: new Date().toISOString().split('T')[0],
        court_name: evictionCase.court_name || 'County Court',
      },
      isPreview: false,
      outputFormat: 'both',
    });

    documents.push({
      title: 'Court Bundle Index',
      description: 'Index of all documents for court filing',
      category: 'evidence_tool',
      document_type: 'court_bundle_index',
      html: bundleIndexDoc.html,
      pdf: bundleIndexDoc.pdf,
      file_name: 'court_bundle_index.pdf',
    });

    console.log('✅ Generated court bundle index');
  } catch (error) {
    console.error('⚠️  Failed to generate court bundle index:', error);
  }

  // Hearing checklist
  try {
    const hearingChecklistDoc = await generateDocument({
      templatePath: `uk/${jurisdiction}/templates/eviction/hearing_checklist.hbs`,
      data: {
        ...evictionCase,
        landlord_full_name: evictionCase.landlord_full_name,
        tenant_full_name: evictionCase.tenant_full_name,
        property_address: evictionCase.property_address,
        generated_date: new Date().toISOString().split('T')[0],
        court_name: evictionCase.court_name,
      },
      isPreview: false,
      outputFormat: 'both',
    });

    documents.push({
      title: 'Hearing Checklist',
      description: 'Preparation checklist for the possession hearing',
      category: 'guidance',
      document_type: 'hearing_checklist',
      html: hearingChecklistDoc.html,
      pdf: hearingChecklistDoc.pdf,
      file_name: 'hearing_checklist.pdf',
    });

    console.log('✅ Generated hearing checklist');
  } catch (error) {
    console.error('⚠️  Failed to generate hearing checklist:', error);
  }

  // Engagement letter template (for arrears cases)
  if (hasArrearsGroundsSelected(selectedGroundCodes)) {
    try {
      const arrearsLetterDoc = await generateDocument({
        templatePath: `uk/${jurisdiction}/templates/eviction/arrears_letter_template.hbs`,
        data: {
          ...evictionCase,
          landlord_full_name: evictionCase.landlord_full_name,
          landlord_address: evictionCase.landlord_address,
          tenant_full_name: evictionCase.tenant_full_name,
          property_address: evictionCase.property_address,
          arrears_total: evictionCase.current_arrears || 0,
          generated_date: new Date().toISOString().split('T')[0],
        },
        isPreview: false,
        outputFormat: 'both',
      });

      documents.push({
        title: 'Arrears Engagement Letter (Template)',
        description: 'Template letter for pre-action engagement with tenant',
        category: 'bonus',
        document_type: 'arrears_letter_template',
        html: arrearsLetterDoc.html,
        pdf: arrearsLetterDoc.pdf,
        file_name: 'arrears_engagement_letter_template.pdf',
      });

      console.log('✅ Generated arrears engagement letter template');
    } catch (error) {
      console.error('⚠️  Failed to generate arrears letter template:', error);
    }
  }

  // 4. Generate case summary document
  const caseSummaryDoc = await generateDocument({
    templatePath: 'shared/templates/eviction_case_summary.hbs',
    data: {
      ...evictionCase,
      grounds_data: groundsData,
      generated_at: new Date().toISOString(),
    },
    isPreview: false,
    outputFormat: 'both',
  });

  documents.push({
    title: 'Eviction Case Summary',
    description: 'Complete summary of your eviction case and selected grounds',
    category: 'guidance',
    document_type: 'case_summary',
    html: caseSummaryDoc.html,
    pdf: caseSummaryDoc.pdf,
    file_name: 'eviction_case_summary.pdf',
  });

  console.log(`✅ Generated ${documents.length} documents for complete eviction pack`);

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
 * Generate Notice Only Pack (£39.99)
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
    console.warn(`[MIGRATION] Converted legacy jurisdiction "england-wales" to "${jurisdiction}" for notice pack`);
  }

  if (!jurisdiction || !['england', 'wales', 'scotland', 'northern-ireland'].includes(jurisdiction)) {
    throw new Error(`Invalid jurisdiction: ${jurisdiction}. Must be one of: england, wales, scotland, northern-ireland`);
  }

  console.log(`\n📄 Generating Notice Only Pack for ${jurisdiction}...`);

  // ==========================================================================
  // WALES GROUND_CODES DERIVATION
  // The UI collects wales_fault_grounds (e.g., ['rent_arrears_serious']),
  // but validation/templates expect ground_codes (e.g., ['section_157']).
  // Preview endpoints derive this at request time, but paid generation reads
  // raw collected_facts from DB. We must derive ground_codes here to match.
  // Uses WALES_FAULT_GROUNDS definitions as the single source of truth.
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

      console.log('[generateNoticeOnlyPack] Derived ground_codes from wales_fault_grounds:', {
        wales_fault_grounds: walesFaultGrounds,
        derived_ground_codes: derivedGroundCodes,
        route: noticeRouteForDerivation,
      });

      // Mutate wizardFacts to add derived ground_codes
      // This ensures validation and template rendering see the correct data
      wizardFacts.ground_codes = derivedGroundCodes;
    }
  }

  // Normalize Section 8 facts BEFORE validation
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
    throw new Error(reason.startsWith('NOTICE_ONLY_VALIDATION_FAILED') ? reason : `NOTICE_ONLY_VALIDATION_FAILED: ${reason}`);
  }

  const groundsData = await loadEvictionGrounds(jurisdiction as Jurisdiction);
  const documents: EvictionPackDocument[] = [];

  // Determine notice route for template selection
  const rawNoticeRoute = wizardFacts?.selected_notice_route ||
    wizardFacts?.eviction_route ||
    wizardFacts?.recommended_route ||
    'section_8';

  // Normalize route to canonical form (section_8, section_21, section_173, fault_based, notice_to_leave)
  const normalizedRoute = normalizeRoute(rawNoticeRoute);
  const noticeRoute = normalizedRoute || rawNoticeRoute;

  // ==========================================================================
  // DEBUG LOG: Document type selection
  // This log helps trace which document_type is chosen for the notice document
  // ==========================================================================
  console.log('[generateNoticeOnlyPack] Document type selection:', {
    jurisdiction,
    raw_notice_route: rawNoticeRoute,
    normalized_route: normalizedRoute,
    selected_notice_route: noticeRoute,
  });

  // Check for Wales-specific routes
  const isWalesRoute = normalizedRoute === 'section_173' || normalizedRoute === 'fault_based';

  if (jurisdiction === 'england' || jurisdiction === 'wales') {
    const { evictionCase } = wizardFactsToEnglandWalesEviction(caseId, wizardFacts);
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

      // Build Section21NoticeData from evictionCase to use the canonical notice generator
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
      };

      // 1. Generate Section 21 Notice
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
      // SECTION 21 TEMPLATE DATA - USE mapNoticeOnlyFacts FOR PARITY WITH PREVIEW
      // CRITICAL FIX (Jan 2026): The preview route uses mapNoticeOnlyFacts() which
      // resolves dates/compliance from nested wizardFacts paths (section21.*, notice_service.*).
      // The fulfillment path MUST use the same normalization to avoid blank dates/false compliance.
      // =============================================================================
      const section21TemplateData = mapNoticeOnlyFacts(wizardFacts);

      // Debug logging (dev only) to verify correct data flow
      if (process.env.NODE_ENV === 'development' || process.env.NOTICE_ONLY_DEBUG === '1') {
        console.log('[generateNoticeOnlyPack] === SECTION 21 TEMPLATE DATA DEBUG ===');
        console.log('  - tenancy_start_date:', section21TemplateData.tenancy_start_date);
        console.log('  - service_date:', section21TemplateData.service_date);
        console.log('  - display_possession_date_formatted:', section21TemplateData.display_possession_date_formatted);
        console.log('  - prescribed_info_given:', section21TemplateData.prescribed_info_given);
        console.log('  - gas_certificate_provided:', section21TemplateData.gas_certificate_provided);
        console.log('  - epc_provided:', section21TemplateData.epc_provided);
        console.log('  - how_to_rent_provided:', section21TemplateData.how_to_rent_provided);
        console.log('[generateNoticeOnlyPack] === END DEBUG ===');
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
    } else if (jurisdiction === 'wales' && isWalesRoute) {
      // ==========================================================================
      // WALES NOTICE-ONLY: Section 173 (no-fault) or fault_based (breach)
      // These use Renting Homes (Wales) Act 2016 forms, NOT Section 8
      // Section 8 is England-only (Housing Act 1988)
      // ==========================================================================
      console.log('[generateNoticeOnlyPack] Generating Wales notice documents:', {
        route: normalizedRoute,
        document_type: normalizedRoute === 'section_173' ? 'section173_notice' : 'fault_based_notice',
      });

      // Use mapNoticeOnlyFacts() to build template data (same as preview route)
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
        // WALES SECTION 173 (No-fault / 6-month notice)
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
            '[generateNoticeOnlyPack] SECTION_173_ROUTE_GUARD: Ignoring fault-based data for section_173 notice:',
            section173Guards
          );
        }

        try {
          // HARD-LOCKED: Section 173 is locked to 6 months minimum notice period.
          // DO NOT pass expiry_date/notice_expiry_date here - let the generator
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
            // DO NOT pass expiry_date here - generator will auto-calculate 6 months
            // The notice_expiry_date from mapNoticeOnlyFacts is a 14-day fallback for
            // England notices and is NOT valid for Wales Section 173.
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
          console.error('[generateNoticeOnlyPack] Failed to generate Wales Section 173 notice:', err);
          throw err;
        }
      } else if (normalizedRoute === 'fault_based') {
        // ========================================================================
        // WALES FAULT-BASED (Breach notice / RHW23)
        // Sections 157, 159, 161, 162 under Renting Homes (Wales) Act 2016
        //
        // CRITICAL: Uses buildWalesPartDFromWizardFacts() to generate Part D text
        // from the Wales ground definitions (SINGLE SOURCE OF TRUTH).
        // This ensures Part D NEVER contains England-specific references.
        // ========================================================================
        // COURT-GRADE GUARDRAILS: Ensure fault-based route has required data
        // ========================================================================
        const faultBasedGuards = {
          // Must have at least one fault ground selected
          hasWalesFaultGrounds: Array.isArray(wizardFacts.wales_fault_grounds) &&
                                 wizardFacts.wales_fault_grounds.length > 0,
          // Must have breach description or Part D particulars
          hasParticulars: Boolean(wizardFacts.breach_description || wizardFacts.wales_part_d_particulars),
        };

        // Log route guard check
        console.log('[generateNoticeOnlyPack] FAULT_BASED_ROUTE_GUARD:', faultBasedGuards);

        // Warning if missing required fault-based data
        if (!faultBasedGuards.hasWalesFaultGrounds) {
          console.warn(
            '[generateNoticeOnlyPack] WARNING: fault_based route but no wales_fault_grounds selected. ' +
            'Document may be incomplete.'
          );
        }

        try {
          // Build Part D text using the canonical Wales Part D builder
          // This uses Wales ground definitions as the single source of truth
          const partDResult = buildWalesPartDFromWizardFacts(wizardFacts);

          if (partDResult.warnings.length > 0) {
            console.warn('[generateNoticeOnlyPack] Wales Part D builder warnings:', partDResult.warnings);
          }

          if (!partDResult.success) {
            console.error('[generateNoticeOnlyPack] Wales Part D builder failed:', partDResult.warnings);
            // Fall back to empty text if Part D builder fails
          }

          console.log('[generateNoticeOnlyPack] Wales Part D generated successfully:', {
            groundsIncluded: partDResult.groundsIncluded.map(g => `${g.label} (section ${g.section})`),
            textLength: partDResult.text.length,
          });

          const faultBasedData = {
            ...walesTemplateData,
            // Use the Part D builder output as breach_particulars
            // (The RHW23 template renders this in Part D)
            breach_particulars: partDResult.text,
            // Also provide as rhw23_part_d_text for templates that use this field
            rhw23_part_d_text: partDResult.text,
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
            title: 'Notice Before Making a Possession Claim (RHW23)',
            description: 'Fault-based notice under Renting Homes (Wales) Act 2016',
            category: 'notice',
            document_type: 'fault_based_notice',
            html: faultDoc.html,
            pdf: faultDoc.pdf,
            file_name: 'fault_based_notice.pdf',
          });
        } catch (err) {
          console.error('[generateNoticeOnlyPack] Failed to generate Wales fault-based notice:', err);
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
        console.warn('[generateNoticeOnlyPack] Failed to generate Wales service instructions:', err);
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
        console.warn('[generateNoticeOnlyPack] Failed to generate Wales validity checklist:', err);
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
        console.warn('[generateNoticeOnlyPack] Failed to generate Wales compliance checklist:', err);
      }

      // 5. Generate Rent Schedule for Wales fault-based rent arrears (Section 157/159)
      // Uses SINGLE SOURCE OF TRUTH from grounds definitions to detect arrears grounds
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
              const arrearsScheduleDoc = await generateDocument({
                templatePath: 'uk/wales/templates/money_claims/schedule_of_arrears.hbs',
                data: {
                  ...walesTemplateData,
                  arrears_schedule: arrearsData.arrears_schedule,
                  arrears_total: arrearsData.arrears_total,
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
            console.warn('[generateNoticeOnlyPack] Failed to generate Wales rent schedule:', err);
          }
        }
      }
    } else {
      // ==========================================================================
      // ENGLAND SECTION 8 (Fault-based eviction)
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
      const section8TemplateData = buildSection8TemplateData(evictionCase, wizardFacts);

      const section8Doc = await generateSection8Notice(
        {
          landlord_full_name: evictionCase.landlord_full_name,
          landlord_address: evictionCase.landlord_address,
          tenant_full_name: evictionCase.tenant_full_name,
          property_address: evictionCase.property_address,
          tenancy_start_date: evictionCase.tenancy_start_date,
          rent_amount: evictionCase.rent_amount,
          rent_frequency: evictionCase.rent_frequency,
          payment_date: evictionCase.payment_day,
          grounds: evictionCase.grounds.map((g) => {
            const groundCode = parseInt(g.code.replace('Ground ', ''));
            const groundDef = SECTION8_GROUND_DEFINITIONS[groundCode];
            return {
              code: groundCode,
              title: g.title,
              legal_basis: getGroundDetails(groundsData, g.code)?.statute || '',
              particulars: g.particulars,
              supporting_evidence: g.evidence,
              mandatory: g.mandatory || false,
              statutory_text: groundDef?.full_text || '',
            };
          }),
          // Pass service_date from resolved template data to ensure consistent date across all documents
          service_date: section8TemplateData.service_date,
          notice_period_days: 14,
          earliest_possession_date: '',
          any_mandatory_ground: evictionCase.grounds.some((g) => g.mandatory),
          any_discretionary_ground: evictionCase.grounds.some((g) => !g.mandatory),
        },
        false
      );
      documents.push({
        title: 'Section 8 Notice',
        description: 'Notice seeking possession',
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
          data: section8TemplateData,
          isPreview: false,
          outputFormat: 'both',
        });
        documents.push({
          title: 'Service Instructions',
          description: 'How to legally serve your Section 8 notice',
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
          description: 'Verify your notice meets all legal requirements',
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
          data: section8TemplateData,
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

      // 5. Generate Rent Schedule / Arrears Statement if arrears grounds selected
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
            const arrearsScheduleDoc = await generateDocument({
              templatePath: 'uk/england/templates/money_claims/schedule_of_arrears.hbs',
              data: {
                ...section8TemplateData,
                arrears_schedule: arrearsData.arrears_schedule,
                arrears_total: arrearsData.arrears_total,
                claimant_reference: caseId,
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
    }
  } else if (jurisdiction === 'scotland') {
    const { scotlandCaseData } = wizardFactsToScotlandEviction(caseId, wizardFacts);
    const evictionCase = buildScotlandEvictionCase(caseId, scotlandCaseData);

    // 1. Generate Notice to Leave
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

  console.log(`✅ Generated ${documents.length} documents for Notice Only pack`);

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
      includes_evidence_tools: false,
      premium_features: ['Notice + Service Instructions + Checklists'],
    },
  };
}
