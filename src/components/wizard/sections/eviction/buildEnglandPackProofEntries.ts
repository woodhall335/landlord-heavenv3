'use client';

import type { DocumentProofEntry } from '@/components/preview/DocumentProofShowcase';
import type { WizardFacts } from '@/lib/case-facts/schema';
import { getPackContents } from '@/lib/products/pack-contents';

type EnglandEvictionPackProduct = 'notice_only' | 'complete_pack';

const DOCUMENT_TYPE_BY_PACK_KEY: Record<string, string> = {
  section8_notice: 'section8_notice',
  service_instructions: 'service_instructions',
  validity_checklist: 'validity_checklist',
  compliance_declaration: 'compliance_declaration',
  proof_of_service: 'proof_of_service',
  arrears_schedule: 'arrears_schedule',
  n5_claim: 'n5_claim',
  n119_particulars: 'n119_particulars',
  evidence_checklist: 'evidence_checklist',
  witness_statement: 'witness_statement',
  court_bundle_index: 'court_bundle_index',
  hearing_checklist: 'hearing_checklist',
  arrears_engagement_letter: 'arrears_engagement_letter',
  case_summary: 'case_summary',
};

export function buildEnglandPackProofEntries({
  product,
  caseId,
  facts,
}: {
  product: EnglandEvictionPackProduct;
  caseId: string;
  facts: WizardFacts;
}): DocumentProofEntry[] {
  const arrearsItems = facts.issues?.rent_arrears?.arrears_items || facts.arrears_items || [];
  const packContents = getPackContents({
    product,
    jurisdiction: 'england',
    route: 'section_8',
    grounds: (facts.section8_grounds as string[]) || [],
    has_arrears: Boolean(arrearsItems.length),
    include_arrears_schedule: Boolean(arrearsItems.length),
  });

  const entries: DocumentProofEntry[] = [];

  for (const item of packContents) {
    const documentType = DOCUMENT_TYPE_BY_PACK_KEY[item.key];
    if (!documentType) {
      continue;
    }

    const query = `pack=${encodeURIComponent(product)}&document_type=${encodeURIComponent(documentType)}`;

    entries.push({
      id: item.key,
      title: item.title,
      description: item.description || 'Included in the generated pack from your current answers.',
      thumbnailUrl: `/api/notice-only/thumbnail/${caseId}?${query}`,
      badge: 'Actual draft',
      previewUrl: `/api/notice-only/embed/${caseId}?${query}`,
    });
  }

  return entries;
}
