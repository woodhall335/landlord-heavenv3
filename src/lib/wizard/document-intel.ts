import { setFactPath } from '@/lib/case-facts/mapping';
import type { WizardFacts } from '@/lib/case-facts/schema';

type EvidenceAnalysisEntry = {
  document_type?: string;
  doc_type?: string;
  type?: string;
  confidence?: number;
  document_type_confidence?: number;
  type_confidence?: number;
  extracted?: Record<string, any>;
  extracted_fields?: Record<string, any>;
  fields?: Record<string, any>;
  parties?: Record<string, any>;
  amounts?: Record<string, any>;
  dates?: Record<string, any>;
  red_flags?: string[];
};

export interface DocumentIntelligenceResult {
  facts: WizardFacts;
  derivedRoutes: string[];
  inconsistencies: string[];
  complianceHints: string[];
  recommendedUploads: Array<{ type: string; reason: string }>;
}

const FIELD_MAPPINGS: Array<{ keys: string[]; target: string }> = [
  { keys: ['tenancy_start_date', 'start_date', 'commencement_date'], target: 'tenancy_start_date' },
  { keys: ['tenancy_end_date', 'end_date', 'expiry_date'], target: 'tenancy_end_date' },
  { keys: ['rent_amount', 'monthly_rent', 'rent'], target: 'rent_amount' },
  { keys: ['payment_day', 'rent_due_day'], target: 'payment_date' },
  { keys: ['tenant', 'tenant_name', 'tenant_full_name'], target: 'tenant_full_name' },
  { keys: ['landlord', 'landlord_name'], target: 'landlord_full_name' },
  { keys: ['notice_date', 'issue_date'], target: 'notice_date' },
  { keys: ['notice_expiry', 'expiry'], target: 'notice_expiry_date' },
];

function getAnalysisMap(facts: WizardFacts): Record<string, EvidenceAnalysisEntry> {
  const evidence = (facts as any).evidence || {};
  const analysis = (evidence.analysis || (facts as any)['case_facts.evidence.analysis']) as
    | Record<string, EvidenceAnalysisEntry>
    | undefined;

  if (analysis && typeof analysis === 'object') {
    return analysis;
  }

  return {};
}

function getHighConfidence(entry: EvidenceAnalysisEntry): number {
  return (
    entry.confidence ||
    entry.document_type_confidence ||
    entry.type_confidence ||
    0
  );
}

function deriveRouteFromDocType(docType?: string): string | null {
  if (!docType) return null;
  const lower = docType.toLowerCase();
  if (lower.includes('section 8')) return 'section_8';
  if (lower.includes('section 21')) return 'section_21';
  if (lower.includes('notice to leave')) return 'notice_to_leave';
  if (lower.includes('notice to quit')) return 'notice_to_quit';
  return null;
}

function collectExtracted(entry: EvidenceAnalysisEntry): Record<string, any> {
  const extracted =
    entry.extracted ||
    entry.extracted_fields ||
    entry.fields ||
    entry.dates ||
    entry.amounts ||
    {};
  return extracted as Record<string, any>;
}

function setIfMissing(facts: WizardFacts, path: string, value: any): WizardFacts {
  const current = (facts as any)[path];
  if (current !== undefined && current !== null && current !== '') return facts;
  return setFactPath(facts, path, value);
}

export function applyDocumentIntelligence(facts: WizardFacts): DocumentIntelligenceResult {
  let updatedFacts = { ...facts } as WizardFacts;
  const inconsistencies: string[] = [];
  const complianceHints: string[] = [];
  const recommendedUploads: Array<{ type: string; reason: string }> = [];
  const derivedRoutes: string[] = [];

  const analysisEntries = getAnalysisMap(updatedFacts);

  Object.values(analysisEntries).forEach((entry) => {
    const confidence = getHighConfidence(entry);
    const docType = entry.document_type || entry.doc_type || entry.type;
    const extracted = collectExtracted(entry);

    if (docType) {
      const inferredRoute = deriveRouteFromDocType(docType);
      if (inferredRoute && !derivedRoutes.includes(inferredRoute)) {
        derivedRoutes.push(inferredRoute);
      }
    }

    if (confidence >= 0.72) {
      FIELD_MAPPINGS.forEach(({ keys, target }) => {
        const foundKey = keys.find((key) => extracted?.[key] !== undefined);
        if (foundKey) {
          updatedFacts = setIfMissing(updatedFacts, target, extracted[foundKey]);
        }
      });

      if (entry.parties?.tenant && !updatedFacts['tenant_full_name']) {
        updatedFacts = setFactPath(updatedFacts, 'tenant_full_name', entry.parties.tenant);
      }
      if (entry.parties?.landlord && !updatedFacts['landlord_full_name']) {
        updatedFacts = setFactPath(updatedFacts, 'landlord_full_name', entry.parties.landlord);
      }
    }

    if (entry.red_flags?.length) {
      entry.red_flags.forEach((flag) => {
        const trimmed = flag.trim();
        if (trimmed.toLowerCase().includes('unsigned')) {
          complianceHints.push('Tenancy agreement appears unsigned in the uploaded file.');
        } else {
          complianceHints.push(trimmed);
        }
      });
    }

    if (confidence >= 0.85 && extracted?.rent_amount && updatedFacts['rent_amount']) {
      const claimed = Number(updatedFacts['rent_amount']);
      const detected = Number(extracted.rent_amount);
      if (!Number.isNaN(claimed) && !Number.isNaN(detected) && claimed !== detected) {
        inconsistencies.push(`Rent in answers (£${claimed}) differs from uploaded document (£${detected}).`);
      }
    }
  });

  const evidenceFlags = (updatedFacts as any).evidence || {};
  const evidenceUploads = [
    ['tenancy_agreement_uploaded', 'Tenancy agreement not uploaded yet – add it for grounding.'],
    ['rent_schedule_uploaded', 'Rent schedule missing – upload to evidence arrears.'],
    ['correspondence_uploaded', 'Correspondence not uploaded – add letters/emails if available.'],
  ];

  evidenceUploads.forEach(([flag, reason]) => {
    if (!evidenceFlags[flag]) {
      recommendedUploads.push({ type: flag.replace('_uploaded', ''), reason });
    }
  });

  if (derivedRoutes.length) {
    updatedFacts = setFactPath(updatedFacts, '__document_routes', derivedRoutes);
  }

  return { facts: updatedFacts, derivedRoutes, inconsistencies, complianceHints, recommendedUploads };
}
