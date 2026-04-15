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
  const expectedKeys = new Set(packContents.map((item) => item.key));
  const assertPresent = (key: string, label: string) => {
    if (expectedKeys.has(key) && !docKeys.has(key)) {
      return { ok: false, error: `Canonical pack contents expect ${label} (${key}), but it is missing.` };
    }
    return null;
  };
  const assertAbsent = (key: string, label: string) => {
    if (!expectedKeys.has(key) && docKeys.has(key)) {
      return { ok: false, error: `Canonical pack contents do not include ${label} (${key}), but it was generated.` };
    }
    return null;
  };

  for (const [key, label] of [
    ['n5_claim', 'N5'],
    ['n119_particulars', 'N119'],
    ['n5b_claim', 'N5B'],
    ['proof_of_service', 'supporting proof-of-service record'],
    ['court_filing_guide', 'court filing guide'],
  ] as const) {
    const presentResult = assertPresent(key, label);
    if (presentResult) {
      return presentResult;
    }

    const absentResult = assertAbsent(key, label);
    if (absentResult) {
      return absentResult;
    }
  }

  if (docKeys.has('proof_of_service') && !expectedKeys.has('proof_of_service')) {
    return {
      ok: false,
      error: 'A proof-of-service record was generated outside the canonical complete-pack contents.',
    };
  }

  return { ok: true };
}
