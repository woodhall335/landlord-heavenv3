import type { EvictionPackDocument } from '@/lib/documents/eviction-pack-generator';
import { getPackContents } from '@/lib/products';

interface ValidationResult {
  ok: boolean;
  error?: string;
}

interface ValidateCompletePackDocumentsInput {
  documents: EvictionPackDocument[];
  jurisdiction: 'england';
  route: 'section_8' | 'section_21';
}

export function validateCompletePackDocuments(
  input: ValidateCompletePackDocumentsInput
): ValidationResult {
  const docKeys = new Set(input.documents.map((doc) => doc.document_type));
  const packContents = getPackContents({
    product: 'complete_pack',
    jurisdiction: input.jurisdiction,
    route: input.route,
  });
  const expectsN119 = packContents.some((item) => item.key === 'n119_particulars');

  if (input.route === 'section_8') {
    if (!docKeys.has('n5_claim')) {
      return { ok: false, error: 'Section 8 complete pack is missing N5 (n5_claim).' };
    }
    if (!docKeys.has('n119_particulars')) {
      return { ok: false, error: 'Section 8 complete pack is missing N119 (n119_particulars).' };
    }
    if (docKeys.has('n5b_claim')) {
      return { ok: false, error: 'Section 8 complete pack should not include N5B (n5b_claim).' };
    }
  }

  if (input.route === 'section_21') {
    if (!docKeys.has('n5b_claim')) {
      return { ok: false, error: 'Section 21 complete pack is missing N5B (n5b_claim).' };
    }
    if (docKeys.has('n5_claim')) {
      return { ok: false, error: 'Section 21 complete pack should not include N5 (n5_claim).' };
    }
  }

  if (expectsN119 && !docKeys.has('n119_particulars')) {
    return { ok: false, error: 'Canonical pack contents expect N119, but it is missing.' };
  }

  if (!expectsN119 && docKeys.has('n119_particulars')) {
    return { ok: false, error: 'Canonical pack contents do not include N119, but it was generated.' };
  }

  return { ok: true };
}
