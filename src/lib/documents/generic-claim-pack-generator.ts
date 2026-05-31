import { CLAIM_CONFIGS_BY_ID } from '@/lib/claims/config';
import {
  EVIDENCE_INDEX_FOOTER,
  buildGenericEvidenceIndexRows,
  getVisibleEvidenceItems,
} from '@/lib/claims/evidence';
import type { ClaimTypeConfig, ClaimTypeId, ClaimWizardAnswers } from '@/lib/claims/types';
import { htmlToPdf } from '@/lib/documents/generator';

export type GenericClaimDocument = {
  title: string;
  description?: string;
  document_type: string;
  html: string;
  pdf?: Buffer;
  file_name: string;
};

export type GenericClaimPack = {
  pack_type: 'generic_small_claim_pack';
  documents: GenericClaimDocument[];
};

const GENERIC_CLAIM_DOCUMENTS = [
  {
    document_type: 'generic_letter_before_claim',
    title: 'Letter Before Claim',
    file_name: '01-letter-before-claim.pdf',
    description: 'Pre-action letter setting out the claim, amount, and response deadline.',
  },
  {
    document_type: 'generic_particulars_of_claim',
    title: 'Particulars of Claim',
    file_name: '02-particulars-of-claim.pdf',
    description: 'Structured particulars for the small claim.',
  },
  {
    document_type: 'generic_schedule_of_loss',
    title: 'Schedule of Loss',
    file_name: '03-schedule-of-loss.pdf',
    description: 'Money breakdown based on the user-entered line items.',
  },
  {
    document_type: 'generic_evidence_index',
    title: 'Evidence Index',
    file_name: '04-evidence-index.pdf',
    description: 'Index of selected evidence and what each item shows.',
  },
  {
    document_type: 'generic_filing_guide',
    title: 'Filing Guide',
    file_name: '05-filing-guide.pdf',
    description: 'Step-by-step filing guidance for the user.',
  },
  {
    document_type: 'generic_service_guide',
    title: 'Service Guide',
    file_name: '06-service-guide.pdf',
    description: 'Guidance on sending documents and keeping proof.',
  },
  {
    document_type: 'generic_hearing_preparation',
    title: 'Hearing Preparation',
    file_name: '07-hearing-preparation.pdf',
    description: 'Practical hearing preparation checklist.',
  },
  {
    document_type: 'generic_enforcement_guide',
    title: 'Enforcement Guide',
    file_name: '08-enforcement-guide.pdf',
    description: 'Post-judgment enforcement options.',
  },
] as const;

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getFact(facts: Record<string, any>, path: string): unknown {
  if (Object.prototype.hasOwnProperty.call(facts, path)) {
    return facts[path];
  }

  return path.split('.').reduce<unknown>((cursor, part) => {
    if (!cursor || typeof cursor !== 'object') return undefined;
    return (cursor as Record<string, unknown>)[part];
  }, facts);
}

function textFact(facts: Record<string, any>, path: string, fallback = ''): string {
  const value = getFact(facts, path);
  return typeof value === 'string' ? value.trim() : fallback;
}

function booleanFact(facts: Record<string, any>, path: string): boolean {
  return getFact(facts, path) === true;
}

function stringArrayFact(facts: Record<string, any>, path: string): string[] {
  const value = getFact(facts, path);
  return Array.isArray(value) && value.every((item) => typeof item === 'string') ? value : [];
}

function recordFact(facts: Record<string, any>, path: string): Record<string, string> {
  const value = getFact(facts, path);
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as Record<string, string>;
}

function resolveClaimConfig(facts: Record<string, any>): ClaimTypeConfig {
  const claimCategory =
    textFact(facts, 'claim_category') ||
    textFact(facts, 'generic_claim.category') ||
    textFact(facts, '__meta.claim_category');
  const config = CLAIM_CONFIGS_BY_ID[claimCategory as ClaimTypeId];

  if (!config || config.flowMode !== 'generic_small_claim') {
    throw new Error('Generic small-claim pack requested without a generic claim category');
  }

  return config;
}

function factsToClaimAnswers(facts: Record<string, any>): ClaimWizardAnswers {
  return facts as ClaimWizardAnswers;
}

function buildEvidenceRows(config: ClaimTypeConfig, facts: Record<string, any>) {
  const selectedIds = stringArrayFact(facts, 'generic_claim.evidence_items');
  const descriptions = recordFact(facts, 'generic_claim.evidence_descriptions');
  const visibleItems = getVisibleEvidenceItems(
    config.evidenceCategories,
    factsToClaimAnswers(facts)
  ).map((state) => state.item);

  return buildGenericEvidenceIndexRows({
    visibleItems,
    selectedIds,
    descriptions,
  });
}

function renderKeyFacts(config: ClaimTypeConfig, facts: Record<string, any>): string {
  const excludedPrefixes = new Set([
    'claim_category',
    'claim_flow_mode',
    'property_country',
    'jurisdiction',
    '__meta',
  ]);
  const entries = Object.entries(facts)
    .filter(([key, value]) => {
      if (excludedPrefixes.has(key)) return false;
      if (key.includes('.')) return true;
      return typeof value === 'string' || typeof value === 'boolean' || Array.isArray(value);
    })
    .slice(0, 28);

  if (entries.length === 0) return '<p>No additional claim facts were supplied.</p>';

  return `
    <table>
      <tbody>
        ${entries
          .map(([key, value]) => {
            const label = key
              .split('.')
              .at(-1)!
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (char) => char.toUpperCase());
            const display = Array.isArray(value) ? value.join(', ') : String(value);
            return `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(display)}</td></tr>`;
          })
          .join('')}
      </tbody>
    </table>
    <p class="note">Claim category: ${escapeHtml(config.label)}</p>
  `;
}

function renderLineItems(facts: Record<string, any>): string {
  const lineItems = textFact(facts, 'generic_claim.line_items', 'No line items entered.');
  return `<pre>${escapeHtml(lineItems)}</pre>`;
}

function renderEvidenceIndex(config: ClaimTypeConfig, facts: Record<string, any>): string {
  const rows = buildEvidenceRows(config, facts);
  if (rows.length === 0) {
    return `<p>No evidence items were selected.</p><p class="footer-note">${escapeHtml(EVIDENCE_INDEX_FOOTER)}</p>`;
  }

  return `
    <table>
      <thead>
        <tr><th>Evidence item</th><th>What this shows</th></tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (row) =>
              `<tr><td>${escapeHtml(row.label)}</td><td>${escapeHtml(row.description || 'No description entered.')}</td></tr>`
          )
          .join('')}
      </tbody>
    </table>
    <p class="footer-note">${escapeHtml(EVIDENCE_INDEX_FOOTER)}</p>
  `;
}

function wrapDocument(title: string, config: ClaimTypeConfig, facts: Record<string, any>, body: string): string {
  const claimant = textFact(facts, 'claimant.name', 'Claimant');
  const defendant = textFact(facts, 'defendant.name', 'Defendant');
  const summary = textFact(facts, 'generic_claim.summary');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { color: #111827; font-family: Arial, sans-serif; font-size: 12px; line-height: 1.55; margin: 42px; }
    h1 { color: #4c1d95; font-size: 24px; margin: 0 0 8px; }
    h2 { color: #111827; font-size: 16px; margin: 24px 0 8px; }
    .meta { border-bottom: 2px solid #ede9fe; margin-bottom: 22px; padding-bottom: 14px; }
    .summary { background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 8px; padding: 12px; }
    table { border-collapse: collapse; margin: 12px 0; width: 100%; }
    th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; vertical-align: top; }
    th { background: #f5f3ff; width: 32%; }
    pre { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; font-family: Arial, sans-serif; padding: 12px; white-space: pre-wrap; }
    .note, .footer-note { color: #4b5563; font-size: 11px; }
  </style>
</head>
<body>
  <div class="meta">
    <h1>${escapeHtml(title)}</h1>
    <p><strong>${escapeHtml(config.label)}</strong></p>
    <p>${escapeHtml(claimant)} v ${escapeHtml(defendant)}</p>
  </div>
  ${summary ? `<div class="summary"><strong>Claim summary:</strong> ${escapeHtml(summary)}</div>` : ''}
  ${body}
</body>
</html>`;
}

function buildDocumentBody(documentType: string, config: ClaimTypeConfig, facts: Record<string, any>): string {
  const claimant = textFact(facts, 'claimant.name', 'the Claimant');
  const defendant = textFact(facts, 'defendant.name', 'the Defendant');
  const amount = textFact(facts, 'generic_claim.value_estimate');
  const preAction = textFact(facts, 'generic_claim.pre_action', 'No pre-action history entered.');

  switch (documentType) {
    case 'generic_letter_before_claim':
      return `
        <h2>Draft Letter Before Claim</h2>
        <p>Dear ${escapeHtml(defendant)},</p>
        <p>${escapeHtml(claimant)} intends to claim ${amount ? `GBP ${escapeHtml(amount)}` : 'the sum set out below'} for ${escapeHtml(config.label.toLowerCase())}.</p>
        <p>Please pay the amount claimed or provide a written response before court proceedings are issued.</p>
        <h2>Basis of claim</h2>
        ${renderKeyFacts(config, facts)}
        <h2>Pre-action history</h2>
        <p>${escapeHtml(preAction)}</p>
      `;
    case 'generic_particulars_of_claim':
      return `
        <h2>Particulars of Claim</h2>
        <p>The Claimant is ${escapeHtml(claimant)}. The Defendant is ${escapeHtml(defendant)}.</p>
        <p>The claim concerns ${escapeHtml(config.label.toLowerCase())}. The Claimant claims the amount set out in the schedule of loss, plus any interest and court fee the court allows.</p>
        ${renderKeyFacts(config, facts)}
      `;
    case 'generic_schedule_of_loss':
      return `
        <h2>Schedule of Loss</h2>
        <p>Estimated claim value: ${amount ? `GBP ${escapeHtml(amount)}` : 'Not entered'}.</p>
        ${renderLineItems(facts)}
        <p>Interest requested for review: ${booleanFact(facts, 'generic_claim.interest') ? 'Yes' : 'No'}.</p>
      `;
    case 'generic_evidence_index':
      return `
        <h2>Evidence Index</h2>
        ${renderEvidenceIndex(config, facts)}
      `;
    case 'generic_filing_guide':
      return `
        <h2>Filing Guide</h2>
        <p>Check the claim form, particulars, schedule of loss, and evidence index before filing.</p>
        <p>Court fees are payable directly to HMCTS and are not included in this pack.</p>
        <p>Attach copies of the evidence listed in the evidence index when filing or when directed by the court.</p>
      `;
    case 'generic_service_guide':
      return `
        <h2>Service Guide</h2>
        <p>Keep copies of everything sent to the defendant and record the date, method, and address used.</p>
        <p>Use the defendant service address entered in the claim unless the court gives a different direction.</p>
      `;
    case 'generic_hearing_preparation':
      return `
        <h2>Hearing Preparation</h2>
        <p>Prepare a short chronology, the schedule of loss, and a bundle of evidence matching the evidence index.</p>
        <p>Be ready to explain what was agreed, what went wrong, how the amount is calculated, and what attempts were made to resolve the dispute.</p>
      `;
    case 'generic_enforcement_guide':
      return `
        <h2>Enforcement Guide</h2>
        <p>If judgment is obtained and unpaid, review enforcement options such as warrants of control, attachment of earnings, third party debt orders, or charging orders.</p>
        <p>The right option depends on what is known about the defendant's income, assets, and bank details.</p>
      `;
    default:
      return '<p>Document content unavailable.</p>';
  }
}

export function isGenericSmallClaimFacts(facts: Record<string, any> | null | undefined): boolean {
  if (!facts) return false;
  return (
    facts.claim_flow_mode === 'generic_small_claim' ||
    facts.__meta?.claim_flow_mode === 'generic_small_claim' ||
    facts.__meta?.generic_claim_pack === true ||
    facts.generic_claim?.flow_mode === 'generic_small_claim'
  );
}

export function getGenericSmallClaimPackContents() {
  return GENERIC_CLAIM_DOCUMENTS.map((doc) => ({
    key: doc.document_type,
    title: doc.title,
    description: doc.description,
    category: doc.document_type === 'generic_evidence_index' || doc.document_type === 'generic_schedule_of_loss'
      ? 'Evidence' as const
      : doc.document_type === 'generic_particulars_of_claim'
        ? 'Court forms' as const
        : 'Guidance' as const,
    required: true,
  }));
}

export async function generateGenericSmallClaimPack(facts: Record<string, any>): Promise<GenericClaimPack> {
  const config = resolveClaimConfig(facts);
  const documents: GenericClaimDocument[] = [];

  for (const doc of GENERIC_CLAIM_DOCUMENTS) {
    const html = wrapDocument(
      doc.title,
      config,
      facts,
      buildDocumentBody(doc.document_type, config, facts)
    );
    const pdf = await htmlToPdf(html, {});

    documents.push({
      ...doc,
      html,
      pdf,
    });
  }

  return {
    pack_type: 'generic_small_claim_pack',
    documents,
  };
}
