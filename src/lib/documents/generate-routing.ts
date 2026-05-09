import { normalizeRoute } from '@/lib/wizard/route-normalizer';

type GenerateRoutingFacts = Record<string, any> | null | undefined;

const COMPLETE_PACK_ONLY_DOCUMENT_TYPES = new Set([
  'n5_claim',
  'n119_particulars',
  'n5b_claim',
  'n325_request',
  'n325a_request',
  'witness_statement',
  'compliance_audit',
  'risk_assessment',
  'court_filing_guide',
]);

const NOTICE_DOCUMENT_TYPES = new Set([
  'section8_notice',
  'section21_notice',
  'notice_to_leave',
  'service_instructions',
  'service_checklist',
  'eviction_roadmap',
  'expert_guidance',
  'eviction_timeline',
  'cover_letter_to_tenant',
  'proof_of_service',
]);

const ENGLAND_FORM3A_DOCUMENT_TYPES = new Set([
  'section8_notice',
  'n5_claim',
  'n119_particulars',
  'n325_request',
  'n325a_request',
  'witness_statement',
  'compliance_audit',
  'risk_assessment',
  'court_filing_guide',
  'service_instructions',
  'service_checklist',
  'evidence_checklist',
  'proof_of_service',
  'arrears_schedule',
  'case_summary',
  'eviction_roadmap',
  'expert_guidance',
  'eviction_timeline',
  'cover_letter_to_tenant',
]);

const TENANCY_DOCUMENT_PRODUCTS: Record<string, string> = {
  ast_standard: 'ast_standard',
  ast_premium: 'ast_premium',
  prt_agreement: 'tenancy_agreement',
  prt_premium: 'tenancy_agreement',
  prt_hmo: 'tenancy_agreement',
  prt_hmo_premium: 'tenancy_agreement',
  private_tenancy: 'tenancy_agreement',
  private_tenancy_premium: 'tenancy_agreement',
};

function normalizeProduct(value: unknown): string | undefined {
  const product = typeof value === 'string' ? value.trim() : '';
  if (!product) return undefined;
  if (product === 'eviction_pack') return 'complete_pack';
  return product;
}

function productFromFacts(caseFacts: GenerateRoutingFacts): string | undefined {
  return normalizeProduct(
    caseFacts?.__meta?.canonical_product ||
      caseFacts?.__meta?.product ||
      caseFacts?.meta?.product ||
      caseFacts?.product ||
      caseFacts?.product_type ||
      caseFacts?.pack_type,
  );
}

export function resolveProductForDocument(
  documentType: string,
  caseFacts: GenerateRoutingFacts,
): string {
  if (TENANCY_DOCUMENT_PRODUCTS[documentType]) {
    return TENANCY_DOCUMENT_PRODUCTS[documentType];
  }

  if (COMPLETE_PACK_ONLY_DOCUMENT_TYPES.has(documentType)) {
    return 'complete_pack';
  }

  const factsProduct = productFromFacts(caseFacts);
  if (factsProduct === 'complete_pack' || factsProduct === 'notice_only') {
    return factsProduct;
  }

  if (NOTICE_DOCUMENT_TYPES.has(documentType)) {
    return 'notice_only';
  }

  return factsProduct || 'notice_only';
}

function resolveRouteForDocument(
  documentType: string,
  jurisdiction: string,
  effectiveRoute?: string | null,
): string {
  const route = normalizeRoute(effectiveRoute || undefined);

  if (jurisdiction === 'england' && documentType === 'section21_notice') {
    return 'section_8';
  }

  switch (documentType) {
    case 'section8_notice':
    case 'n5_claim':
    case 'n119_particulars':
      return 'section_8';
    case 'section21_notice':
    case 'n5b_claim':
      return 'section_21';
    case 'notice_to_leave':
      return 'notice_to_leave';
    case 'section173_notice':
      return 'section_173';
    case 'fault_based_notice':
      return 'fault_based';
    case 'ast_standard':
    case 'ast_premium':
    case 'prt_agreement':
    case 'prt_premium':
    case 'prt_hmo':
    case 'prt_hmo_premium':
    case 'private_tenancy':
    case 'private_tenancy_premium':
      return 'tenancy_agreement';
    default:
      break;
  }

  if (jurisdiction === 'england' && ENGLAND_FORM3A_DOCUMENT_TYPES.has(documentType)) {
    return 'section_8';
  }

  return route || 'section_8';
}

export function resolveGenerateValidationContext(input: {
  documentType: string;
  jurisdiction: string;
  effectiveRoute?: string | null;
  requestedProduct?: string | null;
  caseFacts?: GenerateRoutingFacts;
}): { product: string; route: string } {
  const documentProduct = resolveProductForDocument(input.documentType, input.caseFacts);
  const requestedProduct = normalizeProduct(input.requestedProduct);
  const isNoticeDocument =
    input.documentType === 'section8_notice' ||
    input.documentType === 'section21_notice' ||
    input.documentType === 'notice_to_leave';
  const product =
    TENANCY_DOCUMENT_PRODUCTS[input.documentType]
      ? 'tenancy_agreement'
      : isNoticeDocument
        ? 'notice_only'
        : COMPLETE_PACK_ONLY_DOCUMENT_TYPES.has(input.documentType)
          ? 'complete_pack'
          : requestedProduct || documentProduct;

  return {
    product,
    route: resolveRouteForDocument(input.documentType, input.jurisdiction, input.effectiveRoute),
  };
}
