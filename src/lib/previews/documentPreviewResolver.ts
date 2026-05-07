import type { DocumentInfo } from '@/components/preview/DocumentCard';
import { isResidentialLettingProductSku } from '@/lib/residential-letting/products';
import {
  getSection13CheckoutPreviewUrl,
  getSection13CheckoutThumbnailUrl,
} from '@/lib/previews/section13CheckoutPreview';

export const DOCUMENT_PREVIEW_TYPE_MAPPING: Record<string, string[]> = {
  // Section 8 / Form 3
  'notice-section-8': ['section8_notice', 'form_3_section8'],
  'notice-form-3a': ['section8_notice', 'form_3_section8'],
  // Section 21 / Form 6A
  'notice-section-21': ['section21_notice', 'form_6a_section21'],
  // Wales
  'notice-section-173': ['section173_notice', 'wales_section_173', 'section_173_notice'],
  'notice-fault-based': ['fault_based_notice', 'wales_fault_based', 'fault_notice'],
  // Scotland
  'notice-to-leave': ['notice_to_leave', 'scotland_notice_to_leave'],
  // Court forms
  'form-n5': ['n5_claim', 'form_n5', 'n5_possession_claim'],
  'form-n119': ['n119_particulars', 'form_n119', 'n119_particulars_of_claim'],
  'form-n5b': ['n5b_claim', 'form_n5b', 'n5b_accelerated_possession'],
  'form-e': ['form_e', 'tribunal_application', 'form_e_tribunal'],
  // AI/support documents
  'witness-statement': ['witness_statement'],
  'case-summary-stage-1': ['case_summary'],
  'case-summary-stage-2': ['case_summary'],
  'compliance-audit': ['compliance_audit'],
  'risk-assessment': ['risk_assessment'],
  'court-readiness-status': ['court_readiness_status'],
  'service-instructions-form-3a': ['service_instructions'],
  'service-instructions-s8': ['service_instructions'],
  'service-instructions-s21': ['service_instructions'],
  'service-instructions-s173': ['service_instructions'],
  'service-instructions-fault': ['service_instructions'],
  'service-instructions-ntl': ['service_instructions'],
  'validity-checklist-form-3a': ['validity_checklist'],
  'validity-checklist-s8': ['service_checklist'],
  'validity-checklist-s21': ['service_checklist'],
  'validity-checklist-s173': ['service_checklist'],
  'validity-checklist-fault': ['service_checklist'],
  'validity-checklist-ntl': ['service_checklist'],
  'compliance-checklist-form-3a': ['compliance_declaration'],
  'pre-service-compliance-s8': ['compliance_checklist', 'pre_service_compliance'],
  'pre-service-compliance-s21': ['compliance_checklist_section21', 'pre_service_compliance'],
  'pre-service-checklist-fault': ['compliance_checklist', 'pre_service_compliance'],
  'eviction-roadmap': ['eviction_roadmap'],
  'court-filing-guide': ['court_filing_guide'],
  'tribunal-lodging-guide': ['tribunal_lodging_guide'],
  'arrears-schedule': ['arrears_schedule'],
  'arrears-schedule-complete': ['arrears_schedule'],
  'evidence-checklist': ['evidence_checklist'],
  'proof-of-service': ['proof_of_service', 'proof_of_service_certificate'],
  'proof-of-service-form-3a': ['proof_of_service', 'proof_of_service_certificate'],
  'hearing-checklist': ['hearing_checklist'],
  'what-happens-next-stage-1': ['what_happens_next'],
  'what-happens-next-stage-2': ['what_happens_next'],

  // Money claim
  'form-n1': ['form_n1', 'n1_claim', 'money_claim_form'],
  'form-3a': ['form_3a', 'simple_procedure_claim'],
  'particulars-of-claim': ['particulars_of_claim', 'money_claim_particulars'],
  'schedule-of-arrears': ['schedule_of_arrears', 'arrears_schedule'],
  'interest-calculation': ['interest_calculation', 'interest_workings'],
  'letter-before-claim': ['letter_before_claim', 'lba', 'pre_action_letter'],
  'information-sheet': ['information_sheet', 'information_sheet_for_defendants', 'defendant_info'],
  'reply-form': ['reply_form', 'defendant_reply'],
  'financial-statement': ['financial_statement', 'financial_statement_form'],
  'filing-guide': ['filing_guide', 'court_filing_guide', 'filing_guide_scotland'],
  'enforcement-guide': ['enforcement_guide', 'enforcement_guide_scotland'],

  // Section 13
  'section13-form-4a': ['section13_form_4a'],
  'section13-cover-letter': ['section13_cover_letter'],
  'section13-justification-report': ['section13_justification_report'],
  'section13-proof-of-service-record': ['section13_proof_of_service_record'],
  'section13-tribunal-argument-summary': ['section13_tribunal_argument_summary'],
  'section13-tribunal-defence-guide': ['section13_tribunal_defence_guide'],
  'section13-landlord-response-template': ['section13_landlord_response_template'],
  'section13-legal-briefing': ['section13_legal_briefing'],
  'section13-tribunal-bundle-pdf': ['section13_tribunal_bundle'],
  'section13-tribunal-bundle-zip': ['section13_tribunal_bundle_zip'],

  // Legacy tenancy agreement packs
  'tenancy-agreement': ['ast_agreement', 'soc_agreement', 'prt_agreement', 'private_tenancy_agreement'],
  'tenancy-agreement-hmo': [
    'ast_agreement_hmo',
    'soc_agreement_hmo',
    'prt_agreement_hmo',
    'private_tenancy_agreement_hmo',
  ],
  'inventory-schedule': [
    'inventory_schedule',
    'ast_inventory_schedule',
    'soc_inventory_schedule',
    'prt_inventory_schedule',
    'private_tenancy_inventory_schedule',
  ],
  'compliance-checklist': [
    'pre_tenancy_compliance_checklist',
    'ast_compliance_checklist',
    'soc_compliance_checklist',
    'prt_compliance_checklist',
    'private_tenancy_compliance_checklist',
  ],
  'renters-rights-information-sheet-2026': ['renters_rights_information_sheet_2026'],
  'deposit-protection-certificate': ['deposit_protection_certificate'],
  'prescribed-information-pack': ['tenancy_deposit_information'],
  'easy-read-notes-scotland': ['easy_read_notes_scotland'],
  'key-schedule': ['key_schedule'],
  'property-maintenance-guide': ['property_maintenance_guide'],
  'checkout-procedure': ['checkout_procedure'],
};

export interface DocumentPreviewResolverInput {
  caseId: string;
  product: string;
  document: DocumentInfo;
  possibleTypes?: string[];
  jurisdiction?: string;
  noticeRoute?: string;
  variant?: string;
}

export interface DocumentPreviewResolution {
  thumbnailUrl?: string;
  previewUrl?: string;
  previewUnavailableReason?: string;
}

function isSection13Product(product: string): product is 'section13_standard' | 'section13_defensive' {
  return product === 'section13_standard' || product === 'section13_defensive';
}

function isTenancyPreviewProduct(product: string): boolean {
  return (
    product === 'ast_standard' ||
    product === 'ast_premium' ||
    product === 'tenancy_agreement' ||
    isResidentialLettingProductSku(product)
  );
}

function firstPreviewDocumentType(document: DocumentInfo, possibleTypes?: string[]): string {
  return possibleTypes?.[0] || document.id;
}

function appendSearchParams(path: string, params: Record<string, string | undefined>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) searchParams.set(key, value);
  }

  const query = searchParams.toString();
  return query ? `${path}?${query}` : path;
}

export function getPreviewDocumentTypes(document: DocumentInfo): string[] {
  return DOCUMENT_PREVIEW_TYPE_MAPPING[document.id] || [document.id];
}

export function resolveDocumentPreview({
  caseId,
  product,
  document,
  possibleTypes = getPreviewDocumentTypes(document),
  variant,
}: DocumentPreviewResolverInput): DocumentPreviewResolution {
  const documentType = firstPreviewDocumentType(document, possibleTypes);
  const encodedDocumentParams = { document_type: documentType };

  if (product === 'notice_only') {
    return {
      thumbnailUrl: appendSearchParams(`/api/notice-only/thumbnail/${caseId}`, {
        pack: 'notice_only',
        document_type: documentType,
      }),
      previewUrl: appendSearchParams(`/api/notice-only/embed/${caseId}`, {
        pack: 'notice_only',
        document_type: documentType,
      }),
    };
  }

  if (product === 'complete_pack') {
    return {
      thumbnailUrl: appendSearchParams(`/api/notice-only/thumbnail/${caseId}`, {
        pack: 'complete_pack',
        document_type: documentType,
      }),
      previewUrl: appendSearchParams(`/api/notice-only/embed/${caseId}`, {
        pack: 'complete_pack',
        document_type: documentType,
      }),
    };
  }

  if (product === 'money_claim') {
    return {
      thumbnailUrl: appendSearchParams(`/api/money-claim/thumbnail/${caseId}`, encodedDocumentParams),
      previewUrl: appendSearchParams(`/api/money-claim/embed/${caseId}`, encodedDocumentParams),
    };
  }

  if (product === 'sc_money_claim') {
    return {
      thumbnailUrl: appendSearchParams(`/api/money-claim/thumbnail/${caseId}`, encodedDocumentParams),
      previewUnavailableReason: 'Preview temporarily unavailable',
    };
  }

  if (isSection13Product(product)) {
    return {
      thumbnailUrl: getSection13CheckoutThumbnailUrl(caseId, document.id),
      previewUrl: getSection13CheckoutPreviewUrl(caseId, document.id, product),
    };
  }

  if (isTenancyPreviewProduct(product)) {
    const tier = variant || (product === 'ast_premium' ? 'premium' : 'standard');
    const tenancyParams = {
      document_type: documentType,
      tier,
      product: isResidentialLettingProductSku(product) ? product : undefined,
    };

    return {
      thumbnailUrl: appendSearchParams(`/api/tenancy-agreement/thumbnail/${caseId}`, tenancyParams),
      previewUrl: appendSearchParams(`/api/tenancy-agreement/embed/${caseId}`, tenancyParams),
    };
  }

  if (document.documentId) {
    return {
      thumbnailUrl: `/api/documents/thumbnail/${document.documentId}`,
      previewUnavailableReason: 'Preview temporarily unavailable',
    };
  }

  return {
    previewUnavailableReason: 'Preview temporarily unavailable',
  };
}
