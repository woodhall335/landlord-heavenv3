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

  const data = {
    ...evictionCase,
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
    html: doc.html,
    pdf: doc.pdf,
    file_name: 'evidence_collection_checklist.pdf',
  };
}

/**
 * Generate Proof of Service Templates
 */
async function generateProofOfService(
  evictionCase: EvictionCase
): Promise<EvictionPackDocument> {
  const templatePath = 'shared/templates/proof_of_service.hbs';

  const data = {
    ...evictionCase,
    service_date: '',
    service_method: '',
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
      grounds: evictionCase.grounds.map((g) => ({
        code: parseInt(g.code.replace('Ground ', '')),
        title: g.title,
        legal_basis: getGroundDetails(groundsData, g.code)?.statute || '',
        particulars: g.particulars,
        supporting_evidence: g.evidence,
        mandatory: g.mandatory || false,
      })),
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
    pdf: Buffer.from(n5Pdf),
    file_name: 'n5_claim_for_possession.pdf',
  });

  // 4. N119 Particulars of Claim
  const n119Pdf = await fillN119Form(enrichedCaseData);
  documents.push({
    title: 'Form N119 - Particulars of Claim',
    description: 'Detailed particulars supporting your possession claim',
    category: 'court_form',
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

      const arrearsData = getArrearsScheduleData({
        arrears_items: arrearsItems,
        total_arrears: totalArrears,
        rent_amount: rentAmount,
        rent_frequency: rentFrequency,
        include_schedule: true,
      });

      if (arrearsData.include_schedule_pdf) {
        const jurisdictionKey = jurisdiction === 'wales' ? 'wales' : 'england';
        const scheduleDoc = await generateDocument({
          templatePath: `uk/${jurisdictionKey}/templates/money_claims/schedule_of_arrears.hbs`,
          data: {
            claimant_reference: wizardFacts?.claimant_reference || evictionCase.case_id,
            arrears_schedule: arrearsData.arrears_schedule,
            arrears_total: arrearsData.arrears_total,
          },
          isPreview: false,
          outputFormat: 'both',
        });

        documents.push({
          title: 'Schedule of Arrears',
          description: 'Detailed period-by-period breakdown of rent arrears',
          category: 'evidence_tool',
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
  const roadmap = await generateEvictionRoadmap(evictionCase, groundsData);
  documents.push(roadmap);

  const guidance = await generateExpertGuidance(evictionCase, groundsData);
  documents.push(guidance);

  const timeline = await generateTimelineExpectations(evictionCase, groundsData);
  documents.push(timeline);

  // 3. Generate evidence tools
  const evidenceChecklist = await generateEvidenceChecklist(evictionCase, groundsData);
  documents.push(evidenceChecklist);

  const proofOfService = await generateProofOfService(evictionCase);
  documents.push(proofOfService);

  // 3.1 Generate witness statement (AI-powered premium feature)
  try {
    const witnessStatementContext = extractWitnessStatementContext(wizardFacts);
    const witnessStatementContent = await generateWitnessStatement(wizardFacts, witnessStatementContext);

    const witnessStatementDoc = await generateDocument({
      templatePath: `uk/${jurisdiction}/templates/eviction/witness-statement.hbs`,
      data: {
        ...evictionCase,
        witness_statement: witnessStatementContent,
        landlord_address: evictionCase.landlord_address,
        court_name: jurisdiction === 'scotland' ? 'First-tier Tribunal' : 'County Court',
      },
      isPreview: false,
      outputFormat: 'both',
    });

    documents.push({
      title: 'Witness Statement',
      description: 'AI-drafted witness statement for court proceedings',
      category: 'court_form',
      html: witnessStatementDoc.html,
      pdf: witnessStatementDoc.pdf,
      file_name: 'witness_statement.pdf',
    });

    console.log('✅ Generated witness statement');
  } catch (error) {
    console.error('⚠️  Failed to generate witness statement:', error);
    // Don't fail the entire pack if witness statement generation fails
  }

  // 3.2 Generate compliance audit (AI-powered premium feature)
  try {
    const complianceAuditContext = extractComplianceAuditContext(wizardFacts);
    const complianceAuditContent = await generateComplianceAudit(wizardFacts, complianceAuditContext);

    const complianceAuditDoc = await generateDocument({
      templatePath: `uk/${jurisdiction}/templates/eviction/compliance-audit.hbs`,
      data: {
        ...evictionCase,
        compliance_audit: complianceAuditContent,
        current_date: new Date().toISOString().split('T')[0],
        notice_type: evictionCase.grounds[0]?.code || 'Not specified',
      },
      isPreview: false,
      outputFormat: 'both',
    });

    documents.push({
      title: 'Compliance Audit Report',
      description: 'AI-powered compliance check for eviction proceedings',
      category: 'guidance',
      html: complianceAuditDoc.html,
      pdf: complianceAuditDoc.pdf,
      file_name: 'compliance_audit.pdf',
    });

    console.log('✅ Generated compliance audit');
  } catch (error) {
    console.error('⚠️  Failed to generate compliance audit:', error);
    // Don't fail the entire pack if compliance audit generation fails
  }

  // 3.3 Generate risk report (premium feature)
  try {
    const riskAssessment = computeRiskAssessment(wizardFacts);

    const riskReportDoc = await generateDocument({
      templatePath: `uk/${jurisdiction}/templates/eviction/risk-report.hbs`,
      data: {
        ...evictionCase,
        risk_assessment: riskAssessment,
        current_date: new Date().toISOString().split('T')[0],
        case_type: evictionCase.case_type.replace('_', ' ').toUpperCase(),
      },
      isPreview: false,
      outputFormat: 'both',
    });

    documents.push({
      title: 'Case Risk Assessment Report',
      description: 'Comprehensive risk analysis and success probability assessment',
      category: 'guidance',
      html: riskReportDoc.html,
      pdf: riskReportDoc.pdf,
      file_name: 'risk_assessment.pdf',
    });

    console.log('✅ Generated risk assessment report');
  } catch (error) {
    console.error('⚠️  Failed to generate risk report:', error);
    // Don't fail the entire pack if risk report generation fails
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
 * Generate Notice Only Pack (£29.99)
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
  const noticeRoute = wizardFacts?.selected_notice_route ||
    wizardFacts?.eviction_route ||
    wizardFacts?.recommended_route ||
    'section_8';

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
        html: section21Doc.html,
        pdf: section21Doc.pdf,
        file_name: 'section21_form6a.pdf',
      });

      // 2. Generate Service Instructions (Section 21)
      try {
        const serviceInstructionsDoc = await generateDocument({
          templatePath: 'uk/england/templates/eviction/service_instructions_section_21.hbs',
          data: { ...evictionCase, ...wizardFacts, current_date: new Date().toISOString().split('T')[0] },
          isPreview: false,
          outputFormat: 'both',
        });
        documents.push({
          title: 'Service Instructions',
          description: 'How to legally serve your Section 21 notice',
          category: 'guidance',
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
          data: { ...evictionCase, ...wizardFacts, current_date: new Date().toISOString().split('T')[0] },
          isPreview: false,
          outputFormat: 'both',
        });
        documents.push({
          title: 'Service & Validity Checklist',
          description: 'Verify your notice meets all legal requirements',
          category: 'guidance',
          html: checklistDoc.html,
          pdf: checklistDoc.pdf,
          file_name: 'validity_checklist_s21.pdf',
        });
      } catch (err) {
        console.warn('Failed to generate validity checklist:', err);
      }

      // 4. Generate Compliance Declaration
      try {
        const complianceDoc = await generateDocument({
          templatePath: 'uk/england/templates/eviction/compliance_checklist.hbs',
          data: { ...evictionCase, ...wizardFacts, current_date: new Date().toISOString().split('T')[0] },
          isPreview: false,
          outputFormat: 'both',
        });
        documents.push({
          title: 'Pre-Service Compliance Declaration',
          description: 'Evidence of deposit, EPC, gas safety & How to Rent compliance',
          category: 'guidance',
          html: complianceDoc.html,
          pdf: complianceDoc.pdf,
          file_name: 'compliance_declaration.pdf',
        });
      } catch (err) {
        console.warn('Failed to generate compliance declaration:', err);
      }
    } else {
      // Section 8
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
          grounds: evictionCase.grounds.map((g) => ({
            code: parseInt(g.code.replace('Ground ', '')),
            title: g.title,
            legal_basis: getGroundDetails(groundsData, g.code)?.statute || '',
            particulars: g.particulars,
            supporting_evidence: g.evidence,
            mandatory: g.mandatory || false,
          })),
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
        html: section8Doc.html,
        pdf: section8Doc.pdf,
        file_name: 'section8_notice.pdf',
      });

      // 2. Generate Service Instructions (Section 8)
      try {
        const serviceInstructionsDoc = await generateDocument({
          templatePath: 'uk/england/templates/eviction/service_instructions_section_8.hbs',
          data: { ...evictionCase, ...wizardFacts, current_date: new Date().toISOString().split('T')[0] },
          isPreview: false,
          outputFormat: 'both',
        });
        documents.push({
          title: 'Service Instructions',
          description: 'How to legally serve your Section 8 notice',
          category: 'guidance',
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
          data: { ...evictionCase, ...wizardFacts, current_date: new Date().toISOString().split('T')[0] },
          isPreview: false,
          outputFormat: 'both',
        });
        documents.push({
          title: 'Service & Validity Checklist',
          description: 'Verify your notice meets all legal requirements',
          category: 'guidance',
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
          data: { ...evictionCase, ...wizardFacts, current_date: new Date().toISOString().split('T')[0] },
          isPreview: false,
          outputFormat: 'both',
        });
        documents.push({
          title: 'Pre-Service Compliance Declaration',
          description: 'Evidence of your compliance with landlord obligations',
          category: 'guidance',
          html: complianceDoc.html,
          pdf: complianceDoc.pdf,
          file_name: 'compliance_declaration.pdf',
        });
      } catch (err) {
        console.warn('Failed to generate compliance declaration:', err);
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
