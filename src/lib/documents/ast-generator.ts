/**
 * AST (Assured Shorthold Tenancy) Generator
 *
 * Generates jurisdiction-specific tenancy agreements:
 * - England: Assured Shorthold Tenancy (Housing Act 1988, Deregulation Act 2015)
 * - Wales: Standard Occupation Contract (Renting Homes (Wales) Act 2016)
 * - Scotland: Private Residential Tenancy (Private Housing (Tenancies) (Scotland) Act 2016)
 * - Northern Ireland: Private Tenancy Agreement (Private Tenancies Act (NI) 2022)
 *
 * PRODUCT TIERS:
 * - Standard: Residential tenancy agreement pack with supporting compliance documents
 * - Premium: HMO-specific tenancy agreement with multi-occupancy clauses
 *
 * IMPORTANT: Each jurisdiction uses different terminology and legal frameworks.
 * This generator ensures the correct template and document_type is used.
 *
 * LEGAL NOTES BY JURISDICTION:
 * - England: Uses "Landlord", "Tenant", "Premises". AST wording only (not generic).
 * - Wales: Uses "Landlord", "Contract-holder", "Dwelling". Written Statement required.
 * - Scotland: Open-ended tenancy (no fixed end date). Rent Pressure Zone compatibility.
 * - NI: County Court NI jurisdiction. Electrical safety mandatory from 1 April 2025.
 */

import { compileAndMergeTemplates, GeneratedDocument, htmlToPdf } from './generator';
import { runtimeTenancyVariantsSelfCheck, assertTenancyVariantsInvariant, createFileSystemTemplateGetter } from '../products/tenancy-variant-validator';
import { detectInventoryData } from '../tenancy/product-tier';
import {
  ENGLAND_ASSURED_PERIODIC_AGREEMENT_TITLE,
  ENGLAND_PREMIUM_ASSURED_PERIODIC_TIER_LABEL,
  ENGLAND_STANDARD_ASSURED_PERIODIC_TIER_LABEL,
} from '../tenancy/england-agreement-constants';
import type { EnglandTenancyPurpose } from '../tenancy/england-reform';
import { isEnglandPostReformTenancy } from '../tenancy/england-reform';
import { shouldIncludeEnglandInformationSheet } from '../tenancy/england-reform';
import { readFile } from 'fs/promises';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import { createHash } from 'node:crypto';
import type {
  NorthernIrelandDepositLifecycle,
  NorthernIrelandRatesLiability,
} from '../tenancy/northern-ireland-rules';

// ============================================================================
// PRODUCT TIER (2-VARIANTS ONLY RULE)
// ============================================================================

/**
 * TENANCY PRODUCT TIERS - EXACTLY 2 VARIANTS
 *
 * Standard: Base tenancy agreement ONLY, NO HMO clauses
 * Premium: HMO-specific tenancy agreement with multi-occupancy clauses
 *
 * This is enforced at compile time via TypeScript and runtime via assertions.
 */
export type TenancyTier = 'standard' | 'premium';

/**
 * Runtime validation for product tier
 * Throws if an invalid tier is provided
 */
export function validateTenancyTier(tier: string): asserts tier is TenancyTier {
  if (tier !== 'standard' && tier !== 'premium') {
    throw new Error(
      `Invalid tenancy tier: "${tier}". ` +
      `Only 2 tiers are allowed: "standard" (no HMO) or "premium" (HMO). ` +
      `This is a hard constraint - no other variants are permitted.`
    );
  }
}

/**
 * Assert that HMO flags are correctly set for the tier
 * - Standard: is_hmo MUST be false
 * - Premium: is_hmo MUST be true
 */
export function assertTierHMOConsistency(tier: TenancyTier, isHMO: boolean): void {
  if (tier === 'standard' && isHMO) {
    throw new Error(
      `HMO flag mismatch: Standard tier cannot have is_hmo=true. ` +
      `Standard = NO HMO clauses. Use "premium" tier for HMO properties.`
    );
  }
  if (tier === 'premium' && !isHMO) {
    throw new Error(
      `HMO flag mismatch: Premium tier must have is_hmo=true. ` +
      `Premium = HMO-specific agreement. Set is_hmo=true or use "standard" tier.`
    );
  }
}

// ============================================================================
// JURISDICTION CONFIGURATION
// ============================================================================

export type TenancyJurisdiction = 'england' | 'wales' | 'scotland' | 'northern-ireland';

/**
 * Jurisdiction-specific configuration for tenancy agreements
 */
interface JurisdictionConfig {
  jurisdiction: TenancyJurisdiction;
  agreementTitle: string;
  agreementDescription: string;
  agreementDocumentType: string; // Must match pack-contents keys
  modelClausesTitle: string;
  modelClausesDescription: string;
  legalFramework: string;
  jurisdictionLabel: string;
  templatePaths: {
    standard: string;
    standardFixed?: string;
    premium: string;
    premiumHmo?: string; // HMO-specific premium template with HBS-style formatting (Scotland)
    standardHmo?: string; // HMO-specific standard template (Scotland)
    modelClauses: string;
    termsSchedule: string;
    inventory: string; // Wizard-completed inventory for premium tier
    inventoryBlank: string; // Blank inventory template for standard tier
    inventoryStandalone: string; // Standalone inventory PDF template
    complianceChecklist: string; // Jurisdiction-specific pre-tenancy checklist
    complianceChecklistStandalone: string; // Standalone checklist PDF template
    depositProtectionCertificate?: string; // England standalone deposit certificate
    tenancyDepositInformation?: string; // England standalone prescribed information pack
    keySchedule: string;
    maintenanceGuide: string;
    checkoutProcedure: string;
    rentBook?: string;
    tenancyInformationNotice?: string;
    easyReadNotes?: string; // Scotland-specific Easy Read Notes (optional for other jurisdictions)
  };
  /** Document type key for inventory schedule (must match pack-contents) */
  inventoryDocumentType: string;
  /** Document type key for compliance checklist (must match pack-contents) */
  checklistDocumentType: string;
  /** Document type key for Easy Read Notes (Scotland only, must match pack-contents) */
  easyReadNotesDocumentType?: string;
  rentersRightsInformationSheet2026Path?: string;
  scotlandStatutorySupportingNotesPath?: string;
  northernIrelandTenancyInformationNoticePath?: string;
  northernIrelandTenancyInformationNoticeGuidancePath?: string;
}

/**
 * Configuration for each UK jurisdiction
 */
const JURISDICTION_CONFIGS: Record<TenancyJurisdiction, JurisdictionConfig> = {
  // ENGLAND: Uses the assured periodic framework for new private lets.
  // Terminology: "Landlord", "Tenant", "Property"
  // Premium tier includes broader shared-household wording aligned with Housing Act 2004 where relevant.
  england: {
    jurisdiction: 'england',
    agreementTitle: ENGLAND_ASSURED_PERIODIC_AGREEMENT_TITLE,
    agreementDescription: 'Solicitor-grade assured periodic tenancy agreement with embedded schedules. Updated for the Renters\' Rights Act 2025 England regime.',
    agreementDocumentType: 'ast_agreement',
    modelClausesTitle: 'Government Model Clauses',
    modelClausesDescription: 'Recommended clauses from official government guidance',
    legalFramework: 'Housing Act 1988',
    jurisdictionLabel: 'England',
    inventoryDocumentType: 'inventory_schedule',
    checklistDocumentType: 'pre_tenancy_checklist_england',
    templatePaths: {
      standard: 'uk/england/templates/standard_ast_formatted.hbs',
      premium: 'uk/england/templates/premium_ast_formatted.hbs', // HMO-specific premium template
      modelClauses: 'uk/england/templates/government_model_clauses.hbs',
      termsSchedule: 'shared/templates/terms_and_conditions.hbs',
      inventory: 'shared/templates/inventory_template.hbs', // Wizard-completed for premium
      inventoryBlank: '_shared/schedules/schedule_inventory_blank.hbs', // Blank for standard
      inventoryStandalone: '_shared/standalone/inventory_standalone.hbs', // Standalone inventory PDF
      complianceChecklist: '_shared/compliance/pre_tenancy_checklist_england.hbs',
      complianceChecklistStandalone: '_shared/standalone/checklist_standalone.hbs', // Standalone checklist PDF
      depositProtectionCertificate: 'uk/england/templates/deposit_protection_certificate.hbs',
      tenancyDepositInformation: 'uk/england/templates/tenancy_deposit_information.hbs',
      keySchedule: 'uk/england/templates/premium/key_schedule.hbs',
      maintenanceGuide: 'uk/england/templates/premium/property_maintenance_guide.hbs',
      checkoutProcedure: 'uk/england/templates/premium/checkout_procedure.hbs',
    },
    rentersRightsInformationSheet2026Path: 'mqs/tenancy_agreement/The_Renters__Rights_Act_Information_Sheet_2026.pdf',
  },
  // WALES: Uses Occupation Contract terminology. Renting Homes (Wales) Act 2016.
  // Terminology: "Landlord", "Contract-holder" (NOT Tenant), "Dwelling"
  // NO AST references allowed. Written Statement requirements apply.
  // Premium tier includes HMO clauses aligned with Housing Act 2004
  wales: {
    jurisdiction: 'wales',
    agreementTitle: 'Standard Occupation Contract',
    agreementDescription: 'Wales occupation contract draft with embedded schedules, pending model-parity certification.',
    agreementDocumentType: 'soc_agreement',
    modelClausesTitle: 'Model Clauses (Wales)',
    modelClausesDescription: 'Prescribed statutory terms under Renting Homes (Wales) Act 2016',
    legalFramework: 'Renting Homes (Wales) Act 2016',
    jurisdictionLabel: 'Wales',
    inventoryDocumentType: 'inventory_schedule',
    checklistDocumentType: 'pre_tenancy_checklist_wales',
    templatePaths: {
      standard: 'uk/wales/templates/standard_occupation_contract.hbs',
      standardFixed: 'uk/wales/templates/fixed_term_standard_occupation_contract.hbs',
      premium: 'uk/wales/templates/occupation_contract_hmo.hbs', // HMO-specific template
      modelClauses: 'uk/wales/templates/model_clauses.hbs',
      termsSchedule: 'shared/templates/terms_and_conditions.hbs',
      inventory: 'shared/templates/inventory_template.hbs', // Wizard-completed for premium
      inventoryBlank: '_shared/schedules/schedule_inventory_blank.hbs', // Blank for standard
      inventoryStandalone: '_shared/standalone/inventory_standalone.hbs', // Standalone inventory PDF
      complianceChecklist: '_shared/compliance/pre_tenancy_checklist_wales.hbs',
      complianceChecklistStandalone: '_shared/standalone/checklist_standalone.hbs', // Standalone checklist PDF
      keySchedule: 'uk/wales/templates/premium/key_schedule.hbs',
      maintenanceGuide: 'uk/wales/templates/premium/property_maintenance_guide.hbs',
      checkoutProcedure: 'uk/wales/templates/premium/checkout_procedure.hbs',
    },
  },
  // SCOTLAND: Private Residential Tenancy (open-ended, no fixed end date).
  // Private Housing (Tenancies) (Scotland) Act 2016.
  // Key differences: Open-ended tenancy, Rent Pressure Zone compatibility required.
  // First-tier Tribunal for Scotland (not County Court).
  scotland: {
    jurisdiction: 'scotland',
    agreementTitle: 'Private Residential Tenancy Agreement',
    agreementDescription: 'Scotland PRT agreement draft with embedded schedules, pending model-parity certification.',
    agreementDocumentType: 'prt_agreement',
    modelClausesTitle: 'Model Clauses (Scotland)',
    modelClausesDescription: 'Scottish Government prescribed terms for PRTs',
    legalFramework: 'Private Housing (Tenancies) (Scotland) Act 2016',
    jurisdictionLabel: 'Scotland',
    inventoryDocumentType: 'inventory_schedule',
    checklistDocumentType: 'pre_tenancy_checklist_scotland',
    easyReadNotesDocumentType: 'easy_read_notes_scotland',
    scotlandStatutorySupportingNotesPath:
      'mqs/tenancy_agreement/scotland_prt_statutory_terms_supporting_notes_april_2024.pdf',
    templatePaths: {
      standard: 'uk/scotland/templates/prt_agreement.hbs',
      premium: 'uk/scotland/templates/prt_agreement_premium.hbs', // Non-HMO premium
      premiumHmo: 'uk/scotland/templates/prt_agreement_hmo_premium.hbs', // HMO premium with HBS-style formatting
      standardHmo: 'uk/scotland/templates/prt_agreement_hmo.hbs', // Standard HMO
      modelClauses: 'uk/scotland/templates/model_clauses.hbs',
      termsSchedule: 'shared/templates/terms_and_conditions.hbs',
      inventory: 'uk/scotland/templates/inventory_template.hbs', // Wizard-completed for premium
      inventoryBlank: '_shared/schedules/schedule_inventory_blank.hbs', // Blank for standard
      inventoryStandalone: '_shared/standalone/inventory_standalone.hbs', // Standalone inventory PDF
      complianceChecklist: '_shared/compliance/pre_tenancy_checklist_scotland.hbs',
      complianceChecklistStandalone: '_shared/standalone/checklist_standalone.hbs', // Standalone checklist PDF
      keySchedule: 'uk/scotland/templates/premium/key_schedule.hbs',
      maintenanceGuide: 'uk/scotland/templates/premium/property_maintenance_guide.hbs',
      checkoutProcedure: 'uk/scotland/templates/premium/checkout_procedure.hbs',
      easyReadNotes: 'uk/scotland/templates/easy_read_notes.hbs', // Scotland Easy Read Notes
    },
  },
  // NORTHERN IRELAND: Updated to 2022 Act. Key requirements:
  // - Electrical safety mandatory from 1 April 2025
  // - Rent increase restrictions: 12-month gap, 3-month notice
  // - County Court Northern Ireland jurisdiction
  'northern-ireland': {
    jurisdiction: 'northern-ireland',
    agreementTitle: 'Private Tenancy Agreement',
    agreementDescription: 'Solicitor-grade tenancy agreement with embedded schedules. Compliant with Private Tenancies Act (Northern Ireland) 2022',
    agreementDocumentType: 'private_tenancy_agreement',
    modelClausesTitle: 'Model Clauses (Northern Ireland)',
    modelClausesDescription: 'Prescribed statutory terms under NI legislation',
    legalFramework: 'Private Tenancies Act (Northern Ireland) 2022',
    jurisdictionLabel: 'Northern Ireland',
    inventoryDocumentType: 'inventory_schedule',
    checklistDocumentType: 'pre_tenancy_checklist_northern_ireland',
    northernIrelandTenancyInformationNoticePath:
      'mqs/tenancy_agreement/northern_ireland_tenancy_information_notice_2023.pdf',
    northernIrelandTenancyInformationNoticeGuidancePath:
      'mqs/tenancy_agreement/northern_ireland_tenancy_information_notice_guidance_2023.pdf',
    templatePaths: {
      standard: 'uk/northern-ireland/templates/private_tenancy_agreement.hbs',
      premium: 'uk/northern-ireland/templates/private_tenancy_premium.hbs',
      modelClauses: 'uk/northern-ireland/templates/model_clauses.hbs',
      termsSchedule: 'shared/templates/terms_and_conditions.hbs',
      inventory: 'uk/northern-ireland/templates/inventory_template.hbs', // Wizard-completed for premium
      inventoryBlank: '_shared/schedules/schedule_inventory_blank.hbs', // Blank for standard
      inventoryStandalone: '_shared/standalone/inventory_standalone.hbs', // Standalone inventory PDF
      complianceChecklist: '_shared/compliance/pre_tenancy_checklist_northern_ireland.hbs',
      complianceChecklistStandalone: '_shared/standalone/checklist_standalone.hbs', // Standalone checklist PDF
      keySchedule: 'uk/northern-ireland/templates/premium/key_schedule.hbs',
      maintenanceGuide: 'uk/northern-ireland/templates/premium/property_maintenance_guide.hbs',
      checkoutProcedure: 'uk/northern-ireland/templates/premium/checkout_procedure.hbs',
      rentBook: 'uk/northern-ireland/templates/rent_book.hbs',
      tenancyInformationNotice:
        'uk/northern-ireland/templates/tenancy_information_notice.hbs',
    },
  },
};

/**
 * Detect jurisdiction from ASTData
 * Checks multiple possible sources and normalizes to canonical jurisdiction
 *
 * IMPORTANT: This function throws if jurisdiction cannot be determined.
 * We NEVER default to England - that causes Wales cases to get wrong documents.
 */
function detectJurisdiction(data: ASTData): TenancyJurisdiction {
  // Check explicit jurisdiction field (canonical)
  const explicitJurisdiction = (data as any).jurisdiction;
  if (explicitJurisdiction) {
    const normalized = explicitJurisdiction.toLowerCase().replace(/\s+/g, '-');
    if (normalized === 'scotland') return 'scotland';
    if (normalized === 'northern-ireland' || normalized === 'ni') return 'northern-ireland';
    if (normalized === 'wales') return 'wales';
    if (normalized === 'england') return 'england';
  }

  // Check legacy jurisdiction flags
  if ((data as any).jurisdiction_scotland) return 'scotland';
  if ((data as any).jurisdiction_northern_ireland || (data as any).jurisdiction_ni) return 'northern-ireland';
  if (data.jurisdiction_wales) return 'wales';
  if (data.jurisdiction_england) return 'england';

  // NO FALLBACK - THROW ERROR
  // This is critical: we must never silently default to England.
  // If we reach here, there's a bug in the calling code that failed to provide jurisdiction.
  const errorMessage =
    '[AST Generator] CRITICAL: No jurisdiction specified in ASTData. ' +
    'Jurisdiction must be provided explicitly. ' +
    'Check that mapWizardToASTData is passing jurisdiction from wizard facts. ' +
    'DO NOT default to England - this causes Wales/Scotland/NI cases to get wrong documents.';

  console.error(errorMessage);
  console.error('[AST Generator] ASTData keys:', Object.keys(data).join(', '));

  throw new Error(errorMessage);
}

/**
 * Get jurisdiction configuration
 */
export function getJurisdictionConfig(jurisdiction: TenancyJurisdiction): JurisdictionConfig {
  return JURISDICTION_CONFIGS[jurisdiction];
}

function buildEnglandTenancyReformWarning(
  jurisdiction: TenancyJurisdiction,
  tenancyStartDate?: string,
  purpose?: EnglandTenancyPurpose
): string | undefined {
  if (
    !isEnglandPostReformTenancy({
      jurisdiction,
      tenancyStartDate,
      purpose,
    })
  ) {
    return undefined;
  }

  return (
    'This England agreement is positioned as a Renters\' Rights compliant Assured Periodic Tenancy Agreement.'
  );
}

function isEnglandPostReformRegime(
  jurisdiction: TenancyJurisdiction,
  tenancyStartDate?: string,
  purpose?: EnglandTenancyPurpose
): boolean {
  return isEnglandPostReformTenancy({
    jurisdiction,
    tenancyStartDate,
    purpose,
  });
}

function getRenderedAgreementTitle(
  config: JurisdictionConfig,
  jurisdiction: TenancyJurisdiction,
  tenancyStartDate?: string,
  purpose?: EnglandTenancyPurpose
): string {
  if (isEnglandPostReformRegime(jurisdiction, tenancyStartDate, purpose)) {
    return ENGLAND_ASSURED_PERIODIC_AGREEMENT_TITLE;
  }

  return config.agreementTitle;
}

type EnglandDepositSchemeName = 'DPS' | 'MyDeposits' | 'TDS';

interface EnglandDepositSchemeDetails {
  schemeName: EnglandDepositSchemeName;
  schemeWebsite: string;
}

function getEnglandDepositSchemeDetails(
  schemeName?: string
): EnglandDepositSchemeDetails {
  const normalized = (schemeName || '').toLowerCase();

  if (normalized.includes('mydeposits')) {
    return {
      schemeName: 'MyDeposits',
      schemeWebsite: 'https://www.mydeposits.co.uk/',
    };
  }

  if (normalized.includes('tds')) {
    return {
      schemeName: 'TDS',
      schemeWebsite: 'https://www.tenancydepositscheme.com/',
    };
  }

  return {
    schemeName: 'DPS',
    schemeWebsite: 'https://www.depositprotection.com/',
  };
}

function buildEnglandDepositSupportData(
  data: ASTData,
  enrichedData: Record<string, any>,
  caseId: string
): Record<string, any> {
  const schemeDetails = getEnglandDepositSchemeDetails(data.deposit_scheme_name || data.deposit_scheme);
  const schemeMode = `${data.deposit_scheme || ''} ${data.deposit_scheme_name || ''}`.toLowerCase();
  const custodial = schemeMode.includes('custodial');
  const insured = !custodial;
  const depositReference = data.deposit_reference_number || 'See scheme confirmation';
  const protectionDate =
    data.deposit_protection_date ||
    data.prescribed_information_date ||
    data.deposit_paid_date ||
    data.tenancy_start_date;

  return {
    ...enrichedData,
    case_id: caseId,
    timestamp: Date.now(),
    agent_manages: Boolean(data.agent_name || data.agent_address || data.agent_email || data.agent_phone),
    tenants: (data.tenants || []).map((tenant) => ({
      ...tenant,
      name: tenant.full_name,
      address: (tenant as any).address || data.property_address,
    })),
    deposit_received_date: data.deposit_paid_date || data.tenancy_start_date || data.agreement_date,
    scheme_name: schemeDetails.schemeName,
    protection_date: protectionDate,
    deposit_reference: depositReference,
    protection_type: custodial ? 'Custodial' : 'Insured',
    custodial,
    insured,
    deposit_holding_method: custodial
      ? 'Custodial scheme - the deposit is held by the scheme'
      : 'Insured scheme - the deposit is held by the landlord or agent and backed by the scheme',
    scheme_address: 'See the deposit scheme website or membership confirmation for the current registered address.',
    scheme_phone: 'See scheme website',
    scheme_email: 'See scheme website',
    scheme_website: schemeDetails.schemeWebsite,
    scheme_registration: depositReference,
    scheme_adr_name: `${schemeDetails.schemeName} ADR Service`,
    scheme_adr_phone: 'See scheme website',
    scheme_adr_email: 'See scheme website',
    scheme_adr_website: schemeDetails.schemeWebsite,
    scheme_dispute_phone: 'See scheme website',
    scheme_dispute_email: 'See scheme website',
    scheme_dispute_website: schemeDetails.schemeWebsite,
    dispute_deadline: 'the deadline set by your deposit scheme',
  };
}

async function appendEnglandDepositSupportDocuments(
  documents: ASTPackDocument[],
  config: JurisdictionConfig,
  data: ASTData,
  enrichedData: Record<string, any>,
  caseId: string,
  documentId: string
): Promise<void> {
  if (
    config.jurisdiction !== 'england' ||
    !config.templatePaths.depositProtectionCertificate ||
    !config.templatePaths.tenancyDepositInformation
  ) {
    return;
  }

  const { generateDocument } = await import('./generator');
  const depositData = buildEnglandDepositSupportData(data, enrichedData, caseId || documentId);

  try {
    const depositCertificateDoc = await generateDocument({
      templatePath: config.templatePaths.depositProtectionCertificate,
      data: depositData,
      isPreview: false,
      outputFormat: 'both',
    });
    documents.push({
      title: 'Deposit Protection Certificate',
      description: 'Standalone certificate confirming the tenancy deposit protection scheme details.',
      category: 'guidance',
      document_type: 'deposit_protection_certificate',
      html: depositCertificateDoc.html,
      pdf: depositCertificateDoc.pdf,
      file_name: 'deposit_protection_certificate.pdf',
    });
  } catch (err) {
    console.error('Failed to generate deposit protection certificate:', err);
    console.warn('[AST Generator] Deposit protection certificate generation failed but continuing without it');
  }

  try {
    const prescribedInformationDoc = await generateDocument({
      templatePath: config.templatePaths.tenancyDepositInformation,
      data: depositData,
      isPreview: false,
      outputFormat: 'both',
    });
    documents.push({
      title: 'Prescribed Information Pack',
      description: 'Standalone tenancy deposit prescribed information pack for England compliance.',
      category: 'guidance',
      document_type: 'tenancy_deposit_information',
      html: prescribedInformationDoc.html,
      pdf: prescribedInformationDoc.pdf,
      file_name: 'prescribed_information_pack.pdf',
    });
  } catch (err) {
    console.error('Failed to generate prescribed information pack:', err);
    console.warn('[AST Generator] Prescribed information pack generation failed but continuing without it');
  }
}

function buildEnglandInformationSheetPlaceholderHtml(): string {
  return [
    '<!doctype html>',
    '<html lang="en">',
    '<head><meta charset="utf-8"><title>Renters\' Rights Act Information Sheet 2026</title></head>',
    '<body style="font-family: Arial, sans-serif; padding: 32px; color: #111827;">',
    '<h1>Renters\' Rights Act Information Sheet 2026</h1>',
    '<p>This bundle includes the exact government PDF stored locally in the repository.</p>',
    '<p>Give this PDF to every named tenant for an existing written England tenancy transition case.</p>',
    '</body>',
    '</html>',
  ].join('');
}

async function appendEnglandInformationSheetDocument(
  documents: ASTPackDocument[],
  config: JurisdictionConfig,
  data: ASTData
): Promise<void> {
  if (
    !shouldIncludeEnglandInformationSheet({
      jurisdiction: config.jurisdiction,
      purpose: data.england_tenancy_purpose,
    }) ||
    !config.rentersRightsInformationSheet2026Path
  ) {
    return;
  }

  const pdfPath = path.join(process.cwd(), 'config', config.rentersRightsInformationSheet2026Path);
  const pdf = await readFile(pdfPath);

  documents.push({
    title: 'Renters\' Rights Act Information Sheet 2026',
    description: 'Exact government PDF for existing written assured or assured shorthold tenancies transitioning into the new England regime.',
    category: 'guidance',
    document_type: 'renters_rights_information_sheet_2026',
    html: buildEnglandInformationSheetPlaceholderHtml(),
    pdf,
    file_name: 'renters_rights_information_sheet_2026.pdf',
  });
}

async function appendScotlandStatutorySupportingNotes(
  documents: ASTPackDocument[],
  config: JurisdictionConfig
): Promise<void> {
  if (
    config.jurisdiction !== 'scotland' ||
    !config.scotlandStatutorySupportingNotesPath ||
    !config.easyReadNotesDocumentType
  ) {
    return;
  }

  const pdfPath = path.join(
    process.cwd(),
    'config',
    config.scotlandStatutorySupportingNotesPath
  );
  const pdf = await readFile(pdfPath);

  documents.push({
    title: 'Private Residential Tenancy Statutory Terms Supporting Notes',
    description:
      'Exact Scottish Government April 2024 supporting notes required when the landlord uses a landlord-drafted PRT agreement.',
    category: 'guidance',
    document_type: config.easyReadNotesDocumentType,
    html: [
      '<!DOCTYPE html>',
      '<html lang="en-GB">',
      '<body style="font-family: Arial, sans-serif; padding: 32px; color: #111827;">',
      '<h1>Private Residential Tenancy Statutory Terms Supporting Notes</h1>',
      '<p>This bundle includes the exact Scottish Government April 2024 PDF stored locally in the repository.</p>',
      '<p>Give this PDF to the tenant with the landlord-drafted PRT agreement.</p>',
      '</body>',
      '</html>',
    ].join(''),
    pdf,
    file_name: 'scotland_prt_statutory_terms_supporting_notes_april_2024.pdf',
  });
}

async function appendNorthernIrelandPrescribedDocuments(
  documents: ASTPackDocument[],
  config: JurisdictionConfig,
  enrichedData: Record<string, any>,
  caseId: string
): Promise<void> {
  if (
    config.jurisdiction !== 'northern-ireland' ||
    !config.northernIrelandTenancyInformationNoticePath ||
    !config.northernIrelandTenancyInformationNoticeGuidancePath
  ) {
    return;
  }

  if (!config.templatePaths.rentBook || !config.templatePaths.tenancyInformationNotice) {
    throw new Error(
      '[AST Generator] Northern Ireland rent-book and Tenancy Information Notice templates must be configured'
    );
  }

  const { generateDocument } = await import('./generator');
  const rentBook = await generateDocument({
    templatePath: config.templatePaths.rentBook,
    data: {
      ...enrichedData,
      case_id: caseId,
      timestamp: Date.now(),
    },
    isPreview: false,
    outputFormat: 'both',
  });
  documents.push({
    title: 'Northern Ireland Rent Book',
    description:
      'Rent book containing the particulars prescribed by the Rent Book Regulations (Northern Ireland) 2007 and payment-record pages.',
    category: 'schedule',
    document_type: 'rent_book_northern_ireland',
    html: rentBook.html,
    pdf: rentBook.pdf,
    file_name: 'northern_ireland_rent_book.pdf',
  });

  const tenancyInformationNotice = await generateDocument({
    templatePath: config.templatePaths.tenancyInformationNotice,
    data: {
      ...enrichedData,
      case_id: caseId,
      timestamp: Date.now(),
    },
    isPreview: false,
    outputFormat: 'both',
  });
  documents.push({
    title: 'Landlord’s Notice Relating to the Granting of a Private Tenancy',
    description:
      'Populated Northern Ireland Tenancy Information Notice reproducing the current prescribed fields, notes and separate landlord/tenant notice scales.',
    category: 'notice',
    document_type: 'tenancy_information_notice_northern_ireland',
    html: tenancyInformationNotice.html,
    pdf: tenancyInformationNotice.pdf,
    file_name: 'northern_ireland_tenancy_information_notice.pdf',
  });

  const guidancePath = path.join(
    process.cwd(),
    'config',
    config.northernIrelandTenancyInformationNoticeGuidancePath
  );
  const guidancePdf = await readFile(guidancePath);
  documents.push({
    title: 'Tenancy Information Notice Completion Guidance',
    description:
      'Official Department for Communities guidance for completing the prescribed Tenancy Information Notice.',
    category: 'guidance',
    document_type: 'tenancy_information_notice_guidance_northern_ireland',
    html: [
      '<!DOCTYPE html>',
      '<html lang="en-GB">',
      '<body style="font-family: Arial, sans-serif; padding: 32px; color: #111827;">',
      '<h1>Tenancy Information Notice Completion Guidance</h1>',
      '<p>Official Department for Communities guidance for completing the prescribed Tenancy Information Notice.</p>',
      '</body>',
      '</html>',
    ].join(''),
    pdf: guidancePdf,
    file_name: 'northern_ireland_tenancy_information_notice_guidance.pdf',
  });
}

function appendNorthernIrelandPackageManifest(
  documents: ASTPackDocument[],
  config: JurisdictionConfig,
  data: ASTData,
  caseId: string
): void {
  if (config.jurisdiction !== 'northern-ireland') return;

  const includedDocuments = documents.map((document) => ({
    title: document.title,
    document_type: document.document_type,
    file_name: document.file_name,
    sha256: document.pdf
      ? createHash('sha256').update(document.pdf).digest('hex')
      : null,
  }));
  const manifest = {
    manifest_version: 'tenancy-package-manifest.v1',
    case_id: caseId,
    document_id: data.document_id,
    jurisdiction: config.jurisdiction,
    source_version: '2026-07-27',
    inventory: {
      status: data.inventory_delivery_method,
      due_date: data.inventory_due_date || null,
      included: data.inventory_delivery_method === 'attached',
      agreement_contains_appended_inventory:
        data.inventory_delivery_method === 'attached',
    },
    deposit: {
      lifecycle: data.deposit_lifecycle,
      prescribed_information_supplied:
        data.deposit_prescribed_information_supplied === true,
    },
    documents: includedDocuments,
  };
  const json = `${JSON.stringify(manifest, null, 2)}\n`;

  documents.push({
    title: 'Northern Ireland Tenancy Package Manifest',
    description:
      'Machine-readable list of the generated pack contents, attachment states and SHA-256 document hashes.',
    category: 'guidance',
    document_type: 'tenancy_package_manifest_northern_ireland',
    html: `<pre>${json}</pre>`,
    pdf: Buffer.from(json, 'utf8'),
    file_name: 'northern_ireland_tenancy_package_manifest.json',
    contentType: 'application/json',
  });
}

async function appendInventoryScheduleToAgreementWhenClaimed(
  documents: ASTPackDocument[],
  data: ASTData
): Promise<void> {
  if (data.inventory_delivery_method !== 'attached') return;

  const agreement = documents.find((document) => document.category === 'agreement');
  const inventory = documents.find(
    (document) => document.document_type === 'inventory_schedule'
  );
  if (!agreement?.pdf || !inventory?.pdf) {
    throw new Error(
      '[AST Generator] Inventory is marked attached, but the agreement or Schedule 1 inventory PDF is missing'
    );
  }

  const destination = await PDFDocument.load(agreement.pdf);
  const source = await PDFDocument.load(inventory.pdf);
  const pages = await destination.copyPages(source, source.getPageIndices());
  for (const page of pages) destination.addPage(page);
  agreement.pdf = Buffer.from(await destination.save());
  agreement.description = `${agreement.description} Schedule 1 inventory appended to this agreement.`;
}

const PREMIUM_SUPPORT_DOCUMENTS = [
  {
    title: 'Key Receipt & Handover Schedule',
    description: 'Record the keys, access devices, and handover arrangements for the tenancy.',
    documentType: 'key_schedule',
    templatePathKey: 'keySchedule' as const,
    fileName: 'key_schedule.pdf',
  },
  {
    title: 'Property Maintenance Guide',
    description: 'Practical maintenance, reporting, and care guidance to support the tenancy setup.',
    documentType: 'property_maintenance_guide',
    templatePathKey: 'maintenanceGuide' as const,
    fileName: 'property_maintenance_guide.pdf',
  },
  {
    title: 'Checkout Procedure',
    description: 'End-of-tenancy checkout steps, records, and handback guidance for the tenancy file.',
    documentType: 'checkout_procedure',
    templatePathKey: 'checkoutProcedure' as const,
    fileName: 'checkout_procedure.pdf',
  },
] as const;

async function appendPremiumSupportDocuments(
  documents: ASTPackDocument[],
  config: JurisdictionConfig,
  enrichedData: Record<string, any>,
  caseId: string,
  documentId: string
): Promise<void> {
  const { generateDocument } = await import('./generator');

  for (const supportDocument of PREMIUM_SUPPORT_DOCUMENTS) {
    try {
      const generatedDoc = await generateDocument({
        templatePath: config.templatePaths[supportDocument.templatePathKey],
        data: {
          ...enrichedData,
          case_id: caseId || documentId,
          timestamp: Date.now(),
        },
        isPreview: false,
        outputFormat: 'both',
      });

      documents.push({
        title: supportDocument.title,
        description: supportDocument.description,
        category: 'guidance',
        document_type: supportDocument.documentType,
        html: generatedDoc.html,
        pdf: generatedDoc.pdf,
        file_name: supportDocument.fileName,
      });
    } catch (err) {
      console.error(`Failed to generate ${supportDocument.documentType}:`, err);
      console.warn(`[AST Generator] ${supportDocument.documentType} generation failed but continuing without it`);
    }
  }
}

// ============================================================================
// TYPES
// ============================================================================

export interface TenantInfo {
  full_name: string;
  dob: string;
  email: string;
  phone: string;
  /** Current/correspondence address, required by the Scottish Government model PRT. */
  address?: string;
}

export interface ASTData {
  // Product metadata
  product_tier?: string;

  // AST Suitability Check (Premium)
  tenant_is_individual?: boolean;
  main_home?: boolean;
  landlord_lives_at_property?: boolean;
  holiday_or_licence?: boolean;

  // Agreement
  agreement_date: string;
  current_date?: string;
  current_year?: number;
  generation_timestamp?: string;
  document_id?: string;

  // Landlord
  landlord_full_name: string;
  landlord_address: string;
  landlord_address_line1?: string;
  landlord_address_town?: string;
  landlord_address_postcode?: string;
  landlord_email: string;
  landlord_phone: string;
  landlord_2_full_name?: string;
  landlord_2_address?: string;
  landlord_2_email?: string;
  landlord_2_phone?: string;
  landlord_registration_number?: string;
  landlord_registration_authority?: string;
  landlord_2_registration_number?: string;
  rent_smart_wales_number?: string;
  rent_smart_wales_registered?: boolean;
  rent_smart_wales_registration_number?: string;
  rent_smart_wales_registration_expiry?: string;
  rent_smart_wales_licensed?: boolean;
  rent_smart_wales_licence_number?: string;
  rent_smart_wales_licence_expiry?: string;
  managing_agent_rsw_licensed?: boolean;
  managing_agent_rsw_licence_number?: string;

  // Agent (optional)
  agent_name?: string;
  agent_address?: string;
  agent_email?: string;
  agent_phone?: string;
  agent_signs?: boolean;
  agent_registration_number?: string;
  agent_services?: string;
  agent_contact_matters?: string;

  // Tenants
  tenants: TenantInfo[];
  number_of_tenants?: number;

  // Property
  property_address: string;
  property_address_line1?: string;
  property_address_town?: string;
  property_address_postcode?: string;
  property_type?: string;
  number_of_bedrooms?: string;
  property_description?: string;
  included_areas?: string;
  shared_areas?: string;
  excluded_areas?: string;
  parking?: boolean;
  parking_available?: boolean;
  parking_details?: string;
  furnished_status?: 'furnished' | 'unfurnished' | 'part-furnished';
  has_shared_facilities?: boolean;
  number_of_sharers?: number;
  hmo_licence_status?: string;
  hmo_licence_number?: string;
  hmo_licence_expiry?: string;
  permitted_residents?: string;
  maximum_occupancy?: number;

  // Term
  tenancy_start_date: string;
  england_tenancy_purpose?: EnglandTenancyPurpose;
  is_fixed_term: boolean;
  tenancy_end_date?: string; // Required if fixed term
  term_length?: string; // e.g., "12 months"
  rent_period?:
    | 'week'
    | 'fortnight'
    | 'four_weeks'
    | 'month'
    | 'quarter'
    | 'six_months'
    | 'year';
  occupation_exclusion_applies?: boolean;
  occupation_exclusion_start_date?: string;
  occupation_exclusion_end_date?: string;

  // Rent
  rent_amount: number;
  rent_due_day: string; // e.g., "1st", "15th"
  payment_method: string; // e.g., "Standing Order", "Bank Transfer"
  payment_details: string; // Bank details
  bank_account_name?: string;
  bank_sort_code?: string;
  bank_account_number?: string;
  first_payment?: number | string; // Can be number or placeholder string
  first_payment_date?: string;
  first_payment_period_from?: string;
  first_payment_period_to?: string;
  rent_payment_timing?: 'advance' | 'arrears';
  rent_includes?: string; // What's included in rent
  rent_excludes?: string; // What tenant pays separately
  rent_increase_method?: string;
  ni_capital_value?: string;
  ni_rates_payable?: string;
  ni_rates_included_in_rent?: string;
  ni_other_required_payments?: string;
  ni_rates_liability?: NorthernIrelandRatesLiability;
  ni_rates_explanation?: string;
  ni_rates_landlord_included?: boolean;
  ni_rates_tenant_responsible?: boolean;
  ni_rates_apportioned?: boolean;

  // Deposit
  deposit_amount: number;
  deposit_scheme?: string;
  deposit_scheme_name: 'DPS' | 'MyDeposits' | 'TDS';
  deposit_paid_date?: string;
  deposit_protection_date?: string;
  deposit_already_protected?: boolean;
  deposit_reference_number?: string;
  prescribed_information_served?: boolean;
  deposit_payer?: string;
  deposit_scheme_address?: string;
  deposit_scheme_contact_details?: string;
  deposit_scheme_type?: 'custodial' | 'insurance' | 'pending';
  deposit_deduction_circumstances?: string;
  deposit_repayment_dispute_information?: string;
  deposit_lifecycle?: NorthernIrelandDepositLifecycle;
  deposit_is_none?: boolean;
  deposit_is_expected?: boolean;
  deposit_is_received_awaiting_protection?: boolean;
  deposit_is_protected?: boolean;
  deposit_prescribed_information_supplied?: boolean;

  // Bills & Utilities
  council_tax_responsibility?: string;
  utilities_responsibility?: string;
  internet_responsibility?: string;

  // Inventory
  inventory_attached?: boolean;
  inventory_provided?: boolean;
  inventory_delivery_method?: 'attached' | 'later';
  inventory_due_date?: string;
  inventory?: { rooms?: unknown[] };
  inventory_rooms?: unknown[];
  inspection_rooms?: unknown[];
  professional_cleaning_required?: boolean;
  decoration_condition?: string;
  inventory_schedule_notes?: string;

  // Property features & rules
  has_garden?: boolean;
  garden_maintenance?: string;
  pets_allowed?: boolean;
  approved_pets?: string;
  smoking_allowed?: boolean;

  // Premium: Guarantor (optional)
  guarantor_name?: string;
  guarantor_address?: string;
  guarantor_email?: string;
  guarantor_phone?: string;
  guarantor_dob?: string;
  guarantor_relationship?: string;
  guarantor_required?: boolean;

  // Premium: Enhanced Pet Agreement
  pet_type?: string;
  pet_breed?: string;
  pet_age?: string;
  pet_name?: string;
  pet_weight?: string;
  pet_deposit_amount?: number;
  pet_insurance_required?: boolean;
  flea_treatment_frequency?: string;

  // Premium: Right to Rent Compliance
  right_to_rent_check_date?: string;
  right_to_rent_documents_checked?: string[];

  // Premium: How to Rent Guide
  how_to_rent_version?: string;
  how_to_rent_provision_date?: string;

  // Legal Compliance & Safety
  gas_safety_certificate?: boolean;
  gas_safety_certificate_date?: string;
  gas_safety_certificate_expiry?: string;
  epc_rating?: string;
  epc_certificate_date?: string;
  electrical_safety_certificate?: boolean;
  eicr_certificate_date?: string;
  eicr_next_inspection_date?: string;
  smoke_alarms_fitted?: boolean;
  carbon_monoxide_alarms?: boolean;
  smoke_alarm_locations?: string;
  heat_alarm_locations?: string;
  fixed_combustion_appliances?: string;
  carbon_monoxide_alarm_locations?: string;
  carbon_monoxide_alarm_exclusions?: string;
  alarms_tested?: boolean;
  alarms_tested_date?: string;
  how_to_rent_guide_provided?: boolean;
  how_to_rent_guide_date?: string;

  // Deposit Compliance Dates
  prescribed_information_date?: string;

  // Maintenance & Repairs
  landlord_maintenance_responsibilities?: string;
  repairs_reporting_method?: string;
  emergency_contact?: string;

  // Tenancy Terms & Conditions
  break_clause?: boolean;
  break_clause_terms?: string;
  break_clause_months?: string;
  break_clause_notice_period?: string;
  subletting_allowed?: string;
  rent_increase_clause?: boolean;
  rent_increase_frequency?: string;
  joint_and_several_liability?: boolean;
  tenant_notice_period?: string; // e.g., "1 month"
  additional_terms?: string;

  // Insurance & Liability
  landlord_insurance?: boolean;
  tenant_insurance_required?: string;

  // Access & Viewings
  landlord_access_notice?: string;
  inspection_frequency?: string;
  end_of_tenancy_viewings?: boolean;

  // Additional Terms
  white_goods_included?: string[];
  communal_areas?: string; // Description of communal areas (for HMOs)
  is_hmo?: boolean; // Is this property a licensed HMO?
  hmo_contact_number?: string;
  hmo_renewal_application_submitted?: boolean;
  communal_cleaning?: string; // Cleaning arrangements for shared areas
  recycling_bins?: boolean;
  communication_method?: 'hard_copy' | 'email';
  tenant_utility_accounts?: string;
  in_rent_pressure_zone?: boolean;
  scotland_rent_control_area_status?: 'designated' | 'not_designated' | 'unknown';
  // Jurisdiction
  jurisdiction?: string;  // Canonical jurisdiction: 'england' | 'wales' | 'scotland' | 'northern-ireland'
  jurisdiction_england?: boolean;
  jurisdiction_wales?: boolean;

  // Additional schedules
  additional_schedules?: string;

  // Meter Readings (both Standard and Premium)
  meter_reading_gas?: string;
  meter_reading_electric?: string;
  meter_reading_water?: string;
  utility_transfer_responsibility?: string;

  // Premium Enhanced Features - Late Payment Interest
  late_payment_interest_applicable?: boolean;
  late_payment_interest_rate?: number;
  grace_period_days?: number;
  late_payment_admin_fee?: number;

  // Premium Enhanced Features - Key Schedule
  number_of_front_door_keys?: number;
  number_of_back_door_keys?: number;
  number_of_window_keys?: number;
  number_of_mailbox_keys?: number;
  access_cards_fobs?: number;
  key_replacement_cost?: number;
  other_keys_notes?: string;

  // Premium Enhanced Features - Contractor Access
  contractor_access_notice_period?: string;
  emergency_access_allowed?: boolean;
  contractor_access_hours?: string;
  tenant_presence_required?: boolean;

  // Premium Enhanced Features - Emergency Procedures
  emergency_landlord_phone?: string;
  emergency_plumber_phone?: string;
  emergency_electrician_phone?: string;
  emergency_gas_engineer_phone?: string;
  emergency_locksmith_phone?: string;
  water_shutoff_location?: string;
  electricity_fuse_box_location?: string;
  gas_shutoff_location?: string;

  // Premium Enhanced Features - Maintenance Schedule
  boiler_service_frequency?: string;
  boiler_service_responsibility?: string;
  gutter_cleaning_frequency?: string;
  gutter_cleaning_responsibility?: string;
  window_cleaning_frequency?: string;
  appliance_maintenance_notes?: string;

  // Premium Enhanced Features - Garden Maintenance
  lawn_mowing_frequency?: string;
  lawn_mowing_responsibility?: string;
  hedge_trimming_responsibility?: string;
  weed_control_responsibility?: string;
  outdoor_furniture_notes?: string;

  // Premium Enhanced Features - Move-In Procedures
  pre_tenancy_meeting_required?: boolean;
  move_in_inspection_required?: boolean;
  photographic_inventory_provided?: boolean;
  tenant_handbook_provided?: boolean;
  utility_accounts_transfer_deadline?: string;
  council_tax_registration_deadline?: string;

  // Premium Enhanced Features - Move-Out Procedures
  checkout_inspection_required?: boolean;
  professional_cleaning_standard?: boolean;
  carpet_cleaning_required?: boolean;
  oven_cleaning_required?: boolean;
  garden_condition_required?: string;
  key_return_deadline?: string;
  forwarding_address_required?: boolean;
  deposit_return_timeline?: string;

  // Premium Enhanced Features - Cleaning Standards
  regular_cleaning_expectations?: string;
  deep_cleaning_areas?: string[];
  cleaning_checklist_provided?: boolean;
  cleaning_cost_estimates?: number;

  // QA metadata
  qa_score?: number;
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Result of AST suitability validation
 */
export interface ASTSuitabilityResult {
  valid: boolean;
  reasons: string[];
}

/**
 * Validate AST suitability based on tenancy characteristics.
 * Returns whether the arrangement is suitable for an AST and reasons if not.
 *
 * For an AST to be valid:
 * - Tenant must be an individual (not a company)
 * - Must be the tenant's main home
 * - Landlord must not live at the property (would be a lodger/licence)
 * - Must not be a holiday let or licence arrangement
 */
export function validateASTSuitability(data: ASTData): ASTSuitabilityResult {
  const reasons: string[] = [];

  // Check if tenant is an individual
  if (data.tenant_is_individual === false) {
    reasons.push('Tenant must be an individual (not a company) for this tenancy agreement route');
  }

  // Check if it's the tenant's main home
  if (data.main_home === false) {
    reasons.push('The property must be the tenant\'s main home for this tenancy agreement route');
  }

  // Check if landlord lives at property (lodger/licence scenario)
  if (data.landlord_lives_at_property === true) {
    reasons.push('If the landlord lives at the property, this is likely a lodger or licence arrangement, not this tenancy agreement route');
  }

  // Check if it's a holiday let or licence
  if (data.holiday_or_licence === true) {
    reasons.push('Holiday lets and licence arrangements are not covered by this tenancy agreement route');
  }

  return {
    valid: reasons.length === 0,
    reasons,
  };
}

/**
 * Validate AST data before generation
 */
export function validateASTData(data: ASTData): string[] {
  const errors: string[] = [];
  const jurisdiction = detectJurisdiction(data);

  // Required fields
  if (!data.landlord_full_name) errors.push('landlord_full_name is required');
  if (!data.landlord_address) errors.push('landlord_address is required');
  if (!data.landlord_email) errors.push('landlord_email is required');
  if (!data.landlord_phone) errors.push('landlord_phone is required');

  if (!data.tenants || data.tenants.length === 0) {
  errors.push('At least one tenant is required');
} else {
  data.tenants.forEach((tenant, i) => {
    if (!tenant.full_name) {
      errors.push(`tenant[${i}].full_name is required`);
    }

    // DOB is optional for now – we still *use* it if present, but don't block generation
    // if (!tenant.dob) {
    //   errors.push(`tenant[${i}].dob is required`);
    // }

    if (!tenant.email) {
      errors.push(`tenant[${i}].email is required`);
    }
    if (!tenant.phone) {
      errors.push(`tenant[${i}].phone is required`);
    }
  });
}


  if (!data.property_address) errors.push('property_address is required');
  if (!data.tenancy_start_date) errors.push('tenancy_start_date is required');

  if (data.is_fixed_term && detectJurisdiction(data) !== 'england') {
    if (!data.tenancy_end_date) errors.push('tenancy_end_date required for fixed term');
    if (!data.term_length) errors.push('term_length required for fixed term');
  }

  if (!data.rent_amount || data.rent_amount <= 0) {
    errors.push('rent_amount must be greater than 0');
  }

  if (data.deposit_amount === null || data.deposit_amount === undefined || data.deposit_amount < 0) {
    errors.push('deposit_amount is required');
  }

  if (
    jurisdiction !== 'england' &&
    !['attached', 'later'].includes(data.inventory_delivery_method || '')
  ) {
    errors.push('inventory_delivery_method must be attached or later');
  }
  if (
    data.inventory_delivery_method === 'attached' &&
    data.inventory_attached === false
  ) {
    errors.push('inventory attachment facts are contradictory');
  }
  if (
    data.inventory_delivery_method === 'attached' &&
    !detectInventoryData(data as unknown as Record<string, unknown>)
  ) {
    errors.push(
      'inventory_delivery_method cannot be attached without a completed structured inventory'
    );
  }
  if (
    data.inventory_delivery_method === 'later' &&
    data.inventory_attached === true
  ) {
    errors.push('inventory cannot be marked attached when delivery mode is later');
  }

  if (jurisdiction === 'scotland' && data.deposit_amount > 0) {
    if (!data.deposit_payer) errors.push('deposit_payer is required for Scotland');
    if (!data.deposit_scheme_address) {
      errors.push('deposit_scheme_address is required for Scotland');
    }
    if (!data.deposit_scheme_contact_details) {
      errors.push('deposit_scheme_contact_details is required for Scotland');
    }
    if (data.deposit_already_protected) {
      if (!data.deposit_paid_date) errors.push('deposit_paid_date is required when protected');
      if (!data.deposit_protection_date) {
        errors.push('deposit_protection_date is required when protected');
      }
      if (!data.deposit_reference_number) {
        errors.push('deposit_reference_number is required when protected');
      }
    } else if (data.deposit_protection_date || data.deposit_reference_number) {
      errors.push('pending Scotland deposit must not assert a protection date or reference');
    }
  }

  if (jurisdiction === 'wales') {
    if (!data.rent_smart_wales_registered) {
      errors.push('Rent Smart Wales landlord registration must be recorded');
    }
    if (!data.rent_smart_wales_registration_number) {
      errors.push('Rent Smart Wales registration number is required');
    }
    if (data.rent_smart_wales_licensed && !data.rent_smart_wales_licence_number) {
      errors.push('Rent Smart Wales landlord licence number is required when licensed');
    }
    if (
      data.managing_agent_rsw_licensed &&
      !data.managing_agent_rsw_licence_number
    ) {
      errors.push('Rent Smart Wales managing-agent licence number is required when licensed');
    }
  }

  if (jurisdiction === 'northern-ireland') {
    if (!data.ni_capital_value) errors.push('ni_capital_value is required for the rent book');
    if (!data.ni_rates_payable) errors.push('ni_rates_payable is required for the rent book');
    if (!data.ni_rates_liability) {
      errors.push('ni_rates_liability is required for Northern Ireland');
    }
    if (data.ni_rates_apportioned && !data.ni_rates_explanation) {
      errors.push('ni_rates_explanation is required when rates are apportioned');
    }
    if (!data.ni_other_required_payments) {
      errors.push('ni_other_required_payments is required for the rent book');
    }
    if (!data.deposit_lifecycle) {
      errors.push('deposit_lifecycle is required for Northern Ireland');
    }
    if (!data.inventory_delivery_method) {
      errors.push('inventory_delivery_method is required for Northern Ireland');
    }
    if (data.inventory_delivery_method === 'later' && !data.inventory_due_date) {
      errors.push('inventory_due_date is required when the inventory is supplied later');
    }
    if (!data.smoke_alarm_locations) errors.push('smoke_alarm_locations is required');
    if (!data.heat_alarm_locations) errors.push('heat_alarm_locations is required');
    if (!data.fixed_combustion_appliances) {
      errors.push('fixed_combustion_appliances is required');
    }
    if (!data.carbon_monoxide_alarm_locations) {
      errors.push('carbon_monoxide_alarm_locations is required');
    }
    if (!data.carbon_monoxide_alarm_exclusions) {
      errors.push('carbon_monoxide_alarm_exclusions is required');
    }
    if (!data.alarms_tested || !data.alarms_tested_date) {
      errors.push('all required alarms must be recorded as tested with an actual date');
    }
  }

  if (data.is_fixed_term && data.tenancy_end_date && data.tenancy_start_date) {
    const start = Date.parse(data.tenancy_start_date);
    const end = Date.parse(data.tenancy_end_date);
    if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
      errors.push('tenancy_end_date must be on or after tenancy_start_date');
    }
  }

  // Jurisdiction-specific deposit limits.
  if (data.deposit_amount > 0 && data.rent_amount > 0) {
    const monthlyRent =
      data.rent_period === 'week'
        ? (data.rent_amount * 52) / 12
        : data.rent_period === 'fortnight'
          ? (data.rent_amount * 26) / 12
          : data.rent_period === 'four_weeks'
            ? (data.rent_amount * 13) / 12
        : data.rent_period === 'quarter'
          ? data.rent_amount / 3
          : data.rent_period === 'six_months'
            ? data.rent_amount / 6
          : data.rent_period === 'year'
            ? data.rent_amount / 12
            : data.rent_amount;
    const annualRent = monthlyRent * 12;
    const weeklyRent = monthlyRent / 4.33; // Average weeks per month

    if (jurisdiction === 'england') {
      const maxWeeks = annualRent > 50000 ? 6 : 5;
      const maxDeposit = weeklyRent * maxWeeks;

      if (data.deposit_amount > maxDeposit + 0.01) {
        errors.push(
          `deposit_amount exceeds the ${maxWeeks}-week statutory cap (£${maxDeposit.toFixed(2)}) for ${jurisdiction}`
        );
      }
    } else if (jurisdiction === 'northern-ireland' && data.deposit_amount > monthlyRent + 0.01) {
      errors.push(
        `deposit_amount exceeds the Northern Ireland one-month statutory cap (£${monthlyRent.toFixed(2)})`
      );
    } else if (jurisdiction === 'scotland' && data.deposit_amount > monthlyRent * 2 + 0.01) {
      errors.push(
        `deposit_amount exceeds the Scotland two-month statutory cap (£${(monthlyRent * 2).toFixed(2)})`
      );
    }
  }

  return errors;
}

// ============================================================================
// GENERATORS
// ============================================================================

/**
 * Generate a standard tenancy agreement with inventory (blank) and compliance checklist
 * Jurisdiction-aware: uses correct templates for each UK jurisdiction
 *
 * INTEGRATION LAYER: Standard tier includes:
 * - Main tenancy agreement
 * - Blank inventory template (ready for manual completion)
 * - Jurisdiction-specific pre-tenancy compliance checklist
 */
export async function generateStandardAST(
  data: ASTData,
  isPreview = false
): Promise<GeneratedDocument> {
  const errors = validateASTData(data);
  if (errors.length > 0) {
    throw new Error(`AST validation failed:\n${errors.join('\n')}`);
  }

  // Detect jurisdiction and get configuration
  const jurisdiction = detectJurisdiction(data);
  const config = getJurisdictionConfig(jurisdiction);

  if (!data.rent_period) {
    data.rent_period = 'month';
  }

  const englandPostReformRegime = isEnglandPostReformRegime(
    jurisdiction,
    data.tenancy_start_date,
    data.england_tenancy_purpose
  );

  if (!data.tenant_notice_period) {
    data.tenant_notice_period = englandPostReformRegime ? '2 months' : '1 month';
  }

  if (englandPostReformRegime) {
    data.is_fixed_term = false;
    data.tenancy_end_date = undefined;
    data.term_length = undefined;
    data.break_clause = false;
    data.break_clause_months = undefined;
    data.break_clause_notice_period = undefined;
  }

  if (jurisdiction === 'scotland') {
    data.is_fixed_term = false;
    data.tenancy_end_date = undefined;
    data.term_length = undefined;
    data.break_clause = false;
    data.break_clause_months = undefined;
    data.break_clause_notice_period = undefined;
  }

  const generationTimestamp = new Date().toISOString();
  const documentId = `${jurisdiction.toUpperCase()}-STD-${Date.now()}`;
  const renderedAgreementTitle = getRenderedAgreementTitle(
    config,
    jurisdiction,
    data.tenancy_start_date,
    data.england_tenancy_purpose
  );

  // Add metadata flags
  const enrichedData = {
    ...data,
    premium: false,
    is_hmo: false,
    multiple_tenants: (data.number_of_tenants ?? data.tenants?.length ?? 0) > 1,
    product_tier:
      data.product_tier ||
      (jurisdiction === 'england'
        ? ENGLAND_STANDARD_ASSURED_PERIODIC_TIER_LABEL
        : `Standard ${renderedAgreementTitle}`),
    generation_timestamp: data.generation_timestamp || generationTimestamp,
    document_id: data.document_id || documentId,
    jurisdiction_name: config.jurisdictionLabel,
    jurisdiction: jurisdiction,
    legal_framework: config.legalFramework,
    england_post_reform_regime: englandPostReformRegime,
    england_reform_warning: buildEnglandTenancyReformWarning(
      jurisdiction,
      data.tenancy_start_date,
      data.england_tenancy_purpose
    ),
    // Flag for inventory: standard tier always uses blank inventory
    inventory_wizard_completed: false,
    current_date: new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  };

  const agreementTemplate =
    jurisdiction === 'wales' && data.is_fixed_term && config.templatePaths.standardFixed
      ? config.templatePaths.standardFixed
      : config.templatePaths.standard;
  const templatePaths = [
    agreementTemplate,
    config.templatePaths.inventoryBlank,
    config.templatePaths.complianceChecklist,
  ];
  const mergedHtml = await compileAndMergeTemplates(templatePaths, enrichedData);
  const pdf = await htmlToPdf(mergedHtml);

  return {
    html: mergedHtml,
    pdf,
    metadata: {
      templateUsed: `${jurisdiction}_standard_tenancy`,
      generatedAt: new Date().toISOString(),
      documentId,
      isPreview,
      jurisdiction,
      inventoryIncluded: true,
      inventoryType: 'blank',
      complianceChecklistIncluded: true,
    },
  };
}

/**
 * Generate a premium HMO tenancy agreement with wizard-completed inventory and compliance checklist
 * Jurisdiction-aware: uses correct templates for each UK jurisdiction
 *
 * INTEGRATION LAYER: Premium tier includes:
 * - HMO-specific tenancy agreement
 * - Wizard-completed inventory (if data provided) OR blank inventory (fallback)
 * - Jurisdiction-specific pre-tenancy compliance checklist
 *
 * HMO clauses cover: multiple occupants, joint liability, shared facilities,
 * fire safety, licensing acknowledgement, house rules, occupancy limits.
 *
 * Jurisdiction handling:
 * - England/Wales: HMO clauses aligned with Housing Act 2004
 * - Scotland: Adapted to PRT framework
 * - NI: Only includes HMO clauses where legally permitted
 */
export async function generatePremiumAST(
  data: ASTData,
  isPreview = false
): Promise<GeneratedDocument> {
  const errors = validateASTData(data);
  if (errors.length > 0) {
    throw new Error(`AST validation failed:\n${errors.join('\n')}`);
  }

  // Detect jurisdiction and get configuration
  const jurisdiction = detectJurisdiction(data);
  const config = getJurisdictionConfig(jurisdiction);

  if (!data.rent_period) {
    data.rent_period = 'month';
  }

  const englandPostReformRegime = isEnglandPostReformRegime(
    jurisdiction,
    data.tenancy_start_date,
    data.england_tenancy_purpose
  );

  if (!data.tenant_notice_period) {
    data.tenant_notice_period = englandPostReformRegime ? '2 months' : '1 month';
  }

  if (englandPostReformRegime) {
    data.is_fixed_term = false;
    data.tenancy_end_date = undefined;
    data.term_length = undefined;
    data.break_clause = false;
    data.break_clause_months = undefined;
    data.break_clause_notice_period = undefined;
  }
  if (jurisdiction === 'scotland') {
    data.is_fixed_term = false;
    data.tenancy_end_date = undefined;
    data.term_length = undefined;
    data.break_clause = false;
    data.break_clause_months = undefined;
    data.break_clause_notice_period = undefined;
  }

  const generationTimestamp = new Date().toISOString();
  const documentId = `${jurisdiction.toUpperCase()}-HMO-${Date.now()}`;
  const renderedAgreementTitle = getRenderedAgreementTitle(
    config,
    jurisdiction,
    data.tenancy_start_date,
    data.england_tenancy_purpose
  );

  // Use shared utility for consistent inventory detection across review/preview/generation
  const hasInventoryData = detectInventoryData(data as Record<string, any>);

  // Add metadata flags for HMO premium
  const enrichedData = {
    ...data,
    premium: true,
    is_hmo: true,
    multiple_tenants: (data.number_of_tenants ?? data.tenants?.length ?? 0) > 1,
    product_tier:
      data.product_tier ||
      (jurisdiction === 'england'
        ? ENGLAND_PREMIUM_ASSURED_PERIODIC_TIER_LABEL
        : `HMO ${renderedAgreementTitle}`),
    generation_timestamp: data.generation_timestamp || generationTimestamp,
    document_id: data.document_id || documentId,
    jurisdiction_name: config.jurisdictionLabel,
    jurisdiction: jurisdiction,
    legal_framework: config.legalFramework,
    england_post_reform_regime: englandPostReformRegime,
    england_reform_warning: buildEnglandTenancyReformWarning(
      jurisdiction,
      data.tenancy_start_date,
      data.england_tenancy_purpose
    ),
    // Flag for inventory: premium tier uses wizard-completed if data exists
    inventory_wizard_completed: hasInventoryData,
    current_date: new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  };

  // PREMIUM PRODUCT: HMO Agreement + Inventory (wizard or blank fallback) + Compliance Checklist
  // Integration Layer: Always includes inventory and checklist
  // Use premiumHmo template if available (Scotland has HBS-style premium HMO template)
  const agreementTemplate = config.templatePaths.premiumHmo || config.templatePaths.premium;
  const templatePaths = [
    agreementTemplate,
    // Use wizard-completed inventory if data exists, otherwise blank template
    hasInventoryData ? config.templatePaths.inventory : config.templatePaths.inventoryBlank,
    config.templatePaths.complianceChecklist, // Jurisdiction-specific checklist
  ];

  // Compile and merge all templates
  const mergedHtml = await compileAndMergeTemplates(templatePaths, enrichedData);

  // Generate PDF from merged HTML
  const pdf = await htmlToPdf(mergedHtml);

  return {
    html: mergedHtml,
    pdf,
    metadata: {
      templateUsed: `${jurisdiction}_hmo_tenancy`,
      generatedAt: new Date().toISOString(),
      documentId,
      isPreview,
      jurisdiction,
      inventoryIncluded: true,
      inventoryType: hasInventoryData ? 'wizard-completed' : 'blank',
      complianceChecklistIncluded: true,
    },
  };
}

// ============================================================================
// UNIFIED GENERATOR (Enforces 2-Variant Rule)
// ============================================================================

/**
 * Generate a tenancy agreement by tier (standard or premium)
 *
 * This is the PREFERRED entry point for generating tenancy agreements.
 * It enforces the 2-variant rule:
 * - Standard: Base agreement, NO HMO clauses
 * - Premium: HMO-specific agreement with multi-occupancy clauses
 *
 * @param data - Tenancy data
 * @param tier - 'standard' or 'premium' (NO other values allowed)
 * @param isPreview - Whether to generate a preview
 * @returns Generated document
 *
 * @example
 * // Generate standard agreement
 * const doc = await generateTenancyAgreement(data, 'standard');
 *
 * // Generate HMO agreement
 * const doc = await generateTenancyAgreement(data, 'premium');
 */
// Runtime self-check flag to avoid repeated checks
let _runtimeSelfCheckDone = false;

export async function generateTenancyAgreement(
  data: ASTData,
  tier: TenancyTier,
  isPreview = false
): Promise<GeneratedDocument> {
  // RUNTIME GUARDRAIL: Validate tier is exactly 'standard' or 'premium'
  validateTenancyTier(tier);

  // RUNTIME SELF-CHECK: On first generation, validate all invariants
  // Logs warning in production if invariants fail, but throws when generating
  if (!_runtimeSelfCheckDone) {
    _runtimeSelfCheckDone = true;
    try {
      const configDir = path.join(process.cwd(), 'config/jurisdictions');
      const selfCheckResult = runtimeTenancyVariantsSelfCheck(configDir);

      // If self-check fails, throw to prevent generating invalid documents
      if (!selfCheckResult.valid) {
        throw new Error(
          `Tenancy variant invariants failed during generation. ` +
          `Errors: ${selfCheckResult.errors.join('; ')}`
        );
      }
    } catch (err) {
      // Log but continue - the individual generator functions have their own validation
      console.error('[AST Generator] Runtime self-check error:', err);
    }
  }

  // Route to correct generator based on tier
  if (tier === 'standard') {
    // RUNTIME GUARDRAIL: Ensure is_hmo is not accidentally set for standard
    if ((data as any).is_hmo === true) {
      console.warn(
        '[AST Generator] WARNING: is_hmo=true provided for standard tier. ' +
        'This will be overridden to false. Use "premium" tier for HMO properties.'
      );
    }
    return generateStandardAST(data, isPreview);
  }

  // Premium tier
  return generatePremiumAST(data, isPreview);
}

/**
 * Get the correct template path for a jurisdiction and tier
 * This is a helper for external code that needs to know which template will be used.
 */
export function getTemplatePath(
  jurisdiction: TenancyJurisdiction,
  tier: TenancyTier
): string {
  validateTenancyTier(tier);
  const config = getJurisdictionConfig(jurisdiction);
  if (tier === 'standard') {
    return config.templatePaths.standard;
  }
  // Premium tier: use premiumHmo if available (Scotland has HBS-style premium HMO template)
  return config.templatePaths.premiumHmo || config.templatePaths.premium;
}

/**
 * Get the document key for a jurisdiction and tier
 * This matches the keys used in pack-contents.ts
 */
export function getDocumentKey(
  jurisdiction: TenancyJurisdiction,
  tier: TenancyTier
): string {
  validateTenancyTier(tier);
  const config = getJurisdictionConfig(jurisdiction);

  // Document keys by jurisdiction and tier
  const keyMap: Record<TenancyJurisdiction, Record<TenancyTier, string>> = {
    england: { standard: 'ast_agreement', premium: 'ast_agreement_hmo' },
    wales: { standard: 'soc_agreement', premium: 'soc_agreement_hmo' },
    scotland: { standard: 'prt_agreement', premium: 'prt_agreement_hmo' },
    'northern-ireland': { standard: 'private_tenancy_agreement', premium: 'private_tenancy_agreement_hmo' },
  };

  return keyMap[jurisdiction][tier];
}

// ============================================================================
// UNBUNDLED DOCUMENT GENERATION (Separate PDFs)
// ============================================================================

export interface ASTPackDocument {
  title: string;
  description: string;
  category: 'agreement' | 'schedule' | 'checklist' | 'guidance' | 'notice';
  /** Canonical document type key matching pack-contents (e.g., 'ast_agreement', 'terms_schedule') */
  document_type: string;
  html: string;
  pdf?: Buffer;
  file_name: string;
  contentType?: string;
}

export interface ASTDocumentPack {
  case_id: string;
  tier: 'standard' | 'premium';
  generated_at: string;
  documents: ASTPackDocument[];
}

/**
 * Generate Standard tenancy agreement as separate documents (unbundled)
 * Jurisdiction-aware: uses correct templates and document_type for each UK jurisdiction
 *
 * IMPORTANT: Standard pack includes the main agreement plus inventory,
 * compliance checklist, and England deposit-support documents where applicable.
 */
export async function generateStandardASTDocuments(
  data: ASTData,
  caseId?: string
): Promise<ASTDocumentPack> {
  const errors = validateASTData(data);
  if (errors.length > 0) {
    throw new Error(`AST validation failed:\n${errors.join('\n')}`);
  }

  // Detect jurisdiction and get configuration
  const jurisdiction = detectJurisdiction(data);
  const config = getJurisdictionConfig(jurisdiction);

  console.log(`[AST Generator] Using jurisdiction: ${jurisdiction} (${config.legalFramework})`);

  // Set defaults
  const englandPostReformRegime = isEnglandPostReformRegime(
    jurisdiction,
    data.tenancy_start_date,
    data.england_tenancy_purpose
  );

  if (!data.rent_period) data.rent_period = 'month';
  if (!data.tenant_notice_period) data.tenant_notice_period = englandPostReformRegime ? '2 months' : '1 month';
  if (englandPostReformRegime) {
    data.is_fixed_term = false;
    data.tenancy_end_date = undefined;
    data.term_length = undefined;
    data.break_clause = false;
    data.break_clause_months = undefined;
    data.break_clause_notice_period = undefined;
  }
  if (jurisdiction === 'scotland') {
    data.is_fixed_term = false;
    data.tenancy_end_date = undefined;
    data.term_length = undefined;
    data.break_clause = false;
    data.break_clause_months = undefined;
    data.break_clause_notice_period = undefined;
  }

  const generationTimestamp = new Date().toISOString();
  const documentId = `${jurisdiction.toUpperCase()}-STD-${Date.now()}`;
  const renderedAgreementTitle = getRenderedAgreementTitle(
    config,
    jurisdiction,
    data.tenancy_start_date,
    data.england_tenancy_purpose
  );

  const enrichedData = {
    ...data,
    premium: false,
    is_hmo: false,
    multiple_tenants: (data.number_of_tenants ?? data.tenants?.length ?? 0) > 1,
    product_tier:
      data.product_tier ||
      (jurisdiction === 'england'
        ? ENGLAND_STANDARD_ASSURED_PERIODIC_TIER_LABEL
        : `Standard ${renderedAgreementTitle}`),
    generation_timestamp: generationTimestamp,
    document_id: documentId,
    jurisdiction_name: config.jurisdictionLabel,
    jurisdiction: jurisdiction,
    legal_framework: config.legalFramework,
    england_post_reform_regime: englandPostReformRegime,
    england_reform_warning: buildEnglandTenancyReformWarning(
      jurisdiction,
      data.tenancy_start_date,
      data.england_tenancy_purpose
    ),
    current_date: new Date().toISOString().split('T')[0],
  };

  const documents: ASTPackDocument[] = [];

  // Import generateDocument for individual templates
  const { generateDocument } = await import('./generator');

  // DOCUMENT 1: Main Agreement
  try {
    const agreementTemplate =
      jurisdiction === 'wales' && data.is_fixed_term && config.templatePaths.standardFixed
        ? config.templatePaths.standardFixed
        : config.templatePaths.standard;
    const agreementDoc = await generateDocument({
      templatePath: agreementTemplate,
      data: enrichedData,
      isPreview: false,
      outputFormat: 'both',
    });
    documents.push({
      title:
        jurisdiction === 'england'
          ? ENGLAND_STANDARD_ASSURED_PERIODIC_TIER_LABEL
          : jurisdiction === 'wales' && data.is_fixed_term
            ? 'Fixed Term Standard Occupation Contract'
            : renderedAgreementTitle,
      description: config.agreementDescription,
      category: 'agreement',
      document_type: config.agreementDocumentType, // jurisdiction-specific key
      html: agreementDoc.html,
      pdf: agreementDoc.pdf,
      file_name: 'tenancy_agreement.pdf',
    });
  } catch (err) {
    console.error(`Failed to generate ${config.agreementTitle}:`, err);
    throw err;
  }

  // DOCUMENT 2: Standalone Inventory & Schedule of Condition. A completed
  // inventory is only rendered when structured rows exist; otherwise this is
  // clearly a blank completion aid and is never appended as an attachment.
  try {
    const hasInventoryData = detectInventoryData(
      data as unknown as Record<string, unknown>
    );
    const structuredInventory =
      data.inventory ??
      (Array.isArray(data.inventory_rooms) ? { rooms: data.inventory_rooms } : null) ??
      (Array.isArray(data.inspection_rooms) ? { rooms: data.inspection_rooms } : null);
    const inventoryDoc = await generateDocument({
      templatePath: config.templatePaths.inventoryStandalone,
      data: {
        ...enrichedData,
        inventory: hasInventoryData ? structuredInventory : null,
        case_id: caseId || documentId,
        timestamp: Date.now(),
      },
      isPreview: false,
      outputFormat: 'both',
    });
    documents.push({
      title: 'Inventory & Schedule of Condition',
      description: hasInventoryData
        ? 'Completed inventory generated from the wizard information'
        : 'Blank inventory template for manual completion before it is supplied to the tenant',
      category: 'schedule',
      document_type: config.inventoryDocumentType,
      html: inventoryDoc.html,
      pdf: inventoryDoc.pdf,
      file_name: 'inventory_schedule.pdf',
    });
  } catch (err) {
    console.error(`Failed to generate inventory schedule:`, err);
    if (data.inventory_delivery_method === 'attached') throw err;
    console.warn(`[AST Generator] Inventory generation failed but continuing without it`);
  }

  // DOCUMENT 3: Standalone Pre-Tenancy Compliance Checklist
  try {
    const checklistDoc = await generateDocument({
      templatePath: config.templatePaths.complianceChecklistStandalone,
      data: {
        ...enrichedData,
        case_id: caseId || documentId,
        timestamp: Date.now(),
      },
      isPreview: false,
      outputFormat: 'both',
    });
    documents.push({
      title: `Pre-Tenancy Compliance Checklist (${config.jurisdictionLabel})`,
      description: `Non-contractual guidance for landlord compliance in ${config.jurisdictionLabel}`,
      category: 'checklist',
      document_type: config.checklistDocumentType,
      html: checklistDoc.html,
      pdf: checklistDoc.pdf,
      file_name: 'compliance_checklist.pdf',
    });
  } catch (err) {
    console.error(`Failed to generate compliance checklist:`, err);
    // Don't throw - checklist should never block generation
    console.warn(`[AST Generator] Checklist generation failed but continuing without it`);
  }

  await appendEnglandInformationSheetDocument(documents, config, data);

  await appendEnglandDepositSupportDocuments(
    documents,
    config,
    data,
    enrichedData,
    caseId || documentId,
    documentId
  );

  await appendInventoryScheduleToAgreementWhenClaimed(documents, data);
  await appendScotlandStatutorySupportingNotes(documents, config);
  await appendNorthernIrelandPrescribedDocuments(
    documents,
    config,
    enrichedData,
    caseId || documentId
  );
  appendNorthernIrelandPackageManifest(
    documents,
    config,
    data,
    caseId || documentId
  );

  console.log(`✅ Generated ${documents.length} documents for ${config.jurisdictionLabel} Standard pack`);

  return {
    case_id: caseId || documentId,
    tier: 'standard',
    generated_at: generationTimestamp,
    documents,
  };
}

/**
 * Generate Premium HMO tenancy agreement as separate documents (unbundled)
 * Jurisdiction-aware: uses correct templates for each UK jurisdiction
 *
 * PREMIUM PRODUCT includes the HMO agreement, inventory, checklist,
 * and England deposit-support documents where applicable:
 * 1. HMO-specific tenancy agreement (multi-occupancy clauses)
 * 2. Inventory & Schedule of Condition (wizard-completed if data available, blank otherwise)
 * 3. Pre-Tenancy Compliance Checklist (jurisdiction-specific)
 *
 * HMO clauses cover: multiple occupants, joint liability, shared facilities,
 * fire safety, licensing acknowledgement, house rules, occupancy limits.
 */
export async function generatePremiumASTDocuments(
  data: ASTData,
  caseId?: string
): Promise<ASTDocumentPack> {
  const errors = validateASTData(data);
  if (errors.length > 0) {
    throw new Error(`AST validation failed:\n${errors.join('\n')}`);
  }

  // Detect jurisdiction and get configuration
  const jurisdiction = detectJurisdiction(data);
  const config = getJurisdictionConfig(jurisdiction);

  console.log(`[AST Generator] Using jurisdiction: ${jurisdiction} (${config.legalFramework}) - HMO Premium`);

  // Set defaults
  const englandPostReformRegime = isEnglandPostReformRegime(
    jurisdiction,
    data.tenancy_start_date,
    data.england_tenancy_purpose
  );

  if (!data.rent_period) data.rent_period = 'month';
  if (!data.tenant_notice_period) data.tenant_notice_period = englandPostReformRegime ? '2 months' : '1 month';
  if (englandPostReformRegime) {
    data.is_fixed_term = false;
    data.tenancy_end_date = undefined;
    data.term_length = undefined;
    data.break_clause = false;
    data.break_clause_months = undefined;
    data.break_clause_notice_period = undefined;
  }
  if (jurisdiction === 'scotland') {
    data.is_fixed_term = false;
    data.tenancy_end_date = undefined;
    data.term_length = undefined;
    data.break_clause = false;
    data.break_clause_months = undefined;
    data.break_clause_notice_period = undefined;
  }

  const generationTimestamp = new Date().toISOString();
  const documentId = `${jurisdiction.toUpperCase()}-HMO-${Date.now()}`;
  const renderedAgreementTitle = getRenderedAgreementTitle(
    config,
    jurisdiction,
    data.tenancy_start_date,
    data.england_tenancy_purpose
  );

  // Use shared utility for consistent inventory detection across review/preview/generation
  const hasInventoryData = detectInventoryData(data as Record<string, any>);

  const enrichedData = {
    ...data,
    premium: true,
    is_hmo: true,
    multiple_tenants: (data.number_of_tenants ?? data.tenants?.length ?? 0) > 1,
    product_tier:
      jurisdiction === 'england'
        ? ENGLAND_PREMIUM_ASSURED_PERIODIC_TIER_LABEL
        : `HMO ${renderedAgreementTitle}`,
    generation_timestamp: generationTimestamp,
    document_id: documentId,
    jurisdiction_name: config.jurisdictionLabel,
    jurisdiction: jurisdiction,
    legal_framework: config.legalFramework,
    england_post_reform_regime: englandPostReformRegime,
    england_reform_warning: buildEnglandTenancyReformWarning(
      jurisdiction,
      data.tenancy_start_date,
      data.england_tenancy_purpose
    ),
    current_date: new Date().toISOString().split('T')[0],
    // Flag for inventory template to know if wizard data is present
    inventory_wizard_completed: hasInventoryData,
  };

  const documents: ASTPackDocument[] = [];

  const { generateDocument } = await import('./generator');

  // DOCUMENT 1: HMO-specific tenancy agreement
  // Includes HMO-specific clauses for multi-occupancy properties
  // Use premiumHmo template if available (Scotland has HBS-style premium HMO template)
  const hmoAgreementTemplate = config.templatePaths.premiumHmo || config.templatePaths.premium;
  try {
    const agreementDoc = await generateDocument({
      templatePath: hmoAgreementTemplate,
      data: enrichedData,
      isPreview: false,
      outputFormat: 'both',
    });

    // Get HMO-specific document type key
    const hmoDocumentType = config.agreementDocumentType + '_hmo';

    documents.push({
      title:
        jurisdiction === 'england'
          ? ENGLAND_PREMIUM_ASSURED_PERIODIC_TIER_LABEL
          : `HMO ${renderedAgreementTitle}`,
      description:
        jurisdiction === 'england'
          ? `Includes broader wording for HMO, shared-household, guarantor-backed, and multi-occupancy arrangements. Compliant with ${config.legalFramework}.`
          : `Includes HMO-specific clauses for multi-occupancy properties. Compliant with ${config.legalFramework}.`,
      category: 'agreement',
      document_type: hmoDocumentType,
      html: agreementDoc.html,
      pdf: agreementDoc.pdf,
      file_name: 'tenancy_agreement_hmo.pdf',
    });
  } catch (err) {
    console.error(`Failed to generate HMO ${config.agreementTitle}:`, err);
    throw err;
  }

  // DOCUMENT 2: Standalone Inventory & Schedule of Condition
  // Premium tier: Uses wizard-completed data if available, otherwise blank template
  try {
    const inventoryDoc = await generateDocument({
      templatePath: config.templatePaths.inventoryStandalone,
      data: {
        ...enrichedData,
        case_id: caseId || documentId,
        timestamp: Date.now(),
      },
      isPreview: false,
      outputFormat: 'both',
    });

    const inventoryDescription = hasInventoryData
      ? 'Wizard-completed inventory with property condition details'
      : 'Blank inventory template for manual completion at check-in';

    documents.push({
      title: 'Inventory & Schedule of Condition',
      description: inventoryDescription,
      category: 'schedule',
      document_type: config.inventoryDocumentType,
      html: inventoryDoc.html,
      pdf: inventoryDoc.pdf,
      file_name: 'inventory_schedule.pdf',
    });
  } catch (err) {
    console.error(`Failed to generate inventory schedule:`, err);
    if (data.inventory_delivery_method === 'attached') throw err;
    console.warn(`[AST Generator] Inventory generation failed but continuing without it`);
  }

  // DOCUMENT 3: Standalone Pre-Tenancy Compliance Checklist
  try {
    const checklistDoc = await generateDocument({
      templatePath: config.templatePaths.complianceChecklistStandalone,
      data: {
        ...enrichedData,
        case_id: caseId || documentId,
        timestamp: Date.now(),
      },
      isPreview: false,
      outputFormat: 'both',
    });
    documents.push({
      title: `Pre-Tenancy Compliance Checklist (${config.jurisdictionLabel})`,
      description: `Non-contractual guidance for landlord compliance in ${config.jurisdictionLabel}`,
      category: 'checklist',
      document_type: config.checklistDocumentType,
      html: checklistDoc.html,
      pdf: checklistDoc.pdf,
      file_name: 'compliance_checklist.pdf',
    });
  } catch (err) {
    console.error(`Failed to generate compliance checklist:`, err);
    // Don't throw - checklist should never block generation
    console.warn(`[AST Generator] Checklist generation failed but continuing without it`);
  }

  await appendEnglandInformationSheetDocument(documents, config, data);

  await appendEnglandDepositSupportDocuments(
    documents,
    config,
    data,
    enrichedData,
    caseId || documentId,
    documentId
  );

  await appendInventoryScheduleToAgreementWhenClaimed(documents, data);
  await appendScotlandStatutorySupportingNotes(documents, config);
  await appendNorthernIrelandPrescribedDocuments(
    documents,
    config,
    enrichedData,
    caseId || documentId
  );

  console.log(`✅ Generated ${documents.length} documents for ${config.jurisdictionLabel} HMO Premium pack`);

  await appendPremiumSupportDocuments(
    documents,
    config,
    enrichedData,
    caseId || documentId,
    documentId
  );
  appendNorthernIrelandPackageManifest(
    documents,
    config,
    data,
    caseId || documentId
  );

  return {
    case_id: caseId || documentId,
    tier: 'premium',
    generated_at: generationTimestamp,
    documents,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate recommended deposit amount (5 weeks rent max)
 */
export function calculateRecommendedDeposit(monthlyRent: number): number {
  const weeklyRent = monthlyRent / 4.33;
  const fiveWeeksRent = weeklyRent * 5;
  return Math.round(fiveWeeksRent * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate first payment (pro-rata if starting mid-month)
 */
export function calculateFirstPayment(
  monthlyRent: number,
  startDate: string,
  rentDueDay: number
): number {
  const start = new Date(startDate);
  const startDay = start.getDate();

  // If starting on rent due day, full month's rent
  if (startDay === rentDueDay) {
    return monthlyRent;
  }

  // Calculate pro-rata
  const daysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
  const daysToCharge = rentDueDay > startDay
    ? rentDueDay - startDay
    : daysInMonth - startDay + rentDueDay;

  const dailyRent = monthlyRent / daysInMonth;
  const proRata = dailyRent * daysToCharge;

  // Add next month's rent if pro-rata period goes into next month
  if (rentDueDay <= startDay) {
    return Math.round((proRata + monthlyRent) * 100) / 100;
  }

  return Math.round(proRata * 100) / 100;
}
