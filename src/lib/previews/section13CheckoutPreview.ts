const SECTION13_THUMBNAIL_DOCUMENT_TYPES_BY_ID: Record<string, string> = {
  'section13-form-4a': 'section13_form_4a',
  'section13-cover-letter': 'section13_cover_letter',
  'section13-justification-report': 'section13_justification_report',
  'section13-proof-of-service-record': 'section13_proof_of_service_record',
  'section13-tribunal-argument-summary': 'section13_tribunal_argument_summary',
  'section13-tribunal-defence-guide': 'section13_tribunal_defence_guide',
  'section13-landlord-response-template': 'section13_landlord_response_template',
  'section13-legal-briefing': 'section13_legal_briefing',
  'section13-evidence-checklist': 'section13_evidence_checklist',
  'section13-negotiation-email-template': 'section13_negotiation_email_template',
};

function getSection13CheckoutDocumentType(documentId: string): string | undefined {
  return SECTION13_THUMBNAIL_DOCUMENT_TYPES_BY_ID[documentId];
}

export function getSection13CheckoutThumbnailUrl(
  caseId: string,
  documentId: string
): string | undefined {
  const documentType = getSection13CheckoutDocumentType(documentId);

  if (!documentType) {
    return undefined;
  }

  return `/api/section13/thumbnail/${caseId}?document_type=${encodeURIComponent(documentType)}`;
}

export function getSection13CheckoutPreviewUrl(
  caseId: string,
  documentId: string,
  product: 'section13_standard' | 'section13_defensive'
): string | undefined {
  const documentType = getSection13CheckoutDocumentType(documentId);

  if (!documentType) {
    return undefined;
  }

  return `/api/section13/embed/${caseId}?document_type=${encodeURIComponent(documentType)}&product=${encodeURIComponent(product)}`;
}
