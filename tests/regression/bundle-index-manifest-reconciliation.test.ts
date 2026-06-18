import { describe, expect, it } from 'vitest';
import JSZip from 'jszip';

import {
  extractBundleIndexItems,
  reconcileBundleIndexWithZipManifest,
} from '@/lib/documents/bundle-index-manifest';

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

async function createDocxWithParagraphs(paragraphs: string[]): Promise<Buffer> {
  const zip = new JSZip();
  const body = paragraphs
    .map((paragraph) => `<w:p><w:r><w:t>${paragraph}</w:t></w:r></w:p>`)
    .join('');

  zip.file(
    'word/document.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}</w:body></w:document>`,
  );

  return zip.generateAsync({ type: 'nodebuffer' });
}

async function readDocxText(buffer: Buffer): Promise<string> {
  const docx = await JSZip.loadAsync(buffer);
  const xml = await docx.file('word/document.xml')?.async('string');
  if (!xml) throw new Error('word/document.xml missing from docx');

  return decodeXmlEntities(
    xml
      .replace(/<\/w:p>/g, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/[ \t]+/g, ' ')
      .trim(),
  );
}

async function createCustomerZip(entries: string[]): Promise<string[]> {
  const zip = new JSZip();
  for (const entry of entries) {
    zip.file(entry, 'placeholder');
  }
  const buffer = await zip.generateAsync({ type: 'nodebuffer' });
  const loaded = await JSZip.loadAsync(buffer);

  return Object.keys(loaded.files).filter((entry) => !loaded.files[entry]?.dir);
}

describe('bundle index manifest reconciliation', () => {
  it('passes when the Word bundle index matches the exported zip manifest', async () => {
    const docx = await createDocxWithParagraphs([
      'Bundle index',
      '00_READ_FIRST_CASE_SUMMARY_AND_INDEX: Case summary, bundle index, filing status and cover letter.',
      '01_SERVE_ON_MONDAY_22_JUNE_2026: Corrected joint-landlord Form 3A and service checklist.',
      '02_COMPLETE_AFTER_SERVICE: Draft N215 certificate of service to complete after service.',
      '03_COURT_FORMS_FOR_ISSUE_ON_OR_AFTER_06_JULY_2026: Draft N5 and N119 court forms.',
      '04_EVIDENCE_BUNDLE: Uploaded tenancy, compliance, correspondence and rent/payment evidence.',
      '05_WITNESS_STATEMENTS_TO_ADD: Witness statement templates and access log template.',
      'audit-landlord-pack-final-fix: Final validation and mapping audit report.',
    ]);
    const indexText = await readDocxText(docx);
    const zipEntries = await createCustomerZip([
      '00_READ_FIRST_CASE_SUMMARY_AND_INDEX/02-bundle-index.docx',
      '01_SERVE_ON_MONDAY_22_JUNE_2026/01-form-3a.pdf',
      '02_COMPLETE_AFTER_SERVICE/01-draft-n215.pdf',
      '03_COURT_FORMS_FOR_ISSUE_ON_OR_AFTER_06_JULY_2026/01-draft-n5.pdf',
      '04_EVIDENCE_BUNDLE/04_Tenancy_Agreement/01-tenancy.jpeg',
      '05_WITNESS_STATEMENTS_TO_ADD/01-witness-statement.docx',
      'audit-landlord-pack-final-fix/audit-landlord-pack-final-fix.docx',
    ]);

    const reconciliation = reconcileBundleIndexWithZipManifest(
      extractBundleIndexItems(indexText),
      zipEntries,
    );

    expect(reconciliation.ok).toBe(true);
    expect(reconciliation.missingIndexedItems).toEqual([]);
    expect(reconciliation.unindexedTopLevelItems).toEqual([]);
  });

  it('fails when the index references a stale backup folder or old audit folder name', async () => {
    const docx = await createDocxWithParagraphs([
      'Bundle index',
      '00_READ_FIRST_CASE_SUMMARY_AND_INDEX: Case summary, bundle index, filing status and cover letter.',
      '06_OFFICIAL_BLANK_FORMS_BACKUP: Blank official forms.',
      'audit-landlord-pack-mumford-fixes: Final validation and mapping audit report.',
    ]);
    const indexText = await readDocxText(docx);
    const zipEntries = await createCustomerZip([
      '00_READ_FIRST_CASE_SUMMARY_AND_INDEX/02-bundle-index.docx',
      'audit-landlord-pack-final-fix/audit-landlord-pack-final-fix.docx',
    ]);

    const reconciliation = reconcileBundleIndexWithZipManifest(
      extractBundleIndexItems(indexText),
      zipEntries,
    );

    expect(reconciliation.ok).toBe(false);
    expect(reconciliation.missingIndexedItems).toEqual([
      '06_OFFICIAL_BLANK_FORMS_BACKUP',
      'audit-landlord-pack-mumford-fixes',
    ]);
    expect(reconciliation.unindexedTopLevelItems).toEqual(['audit-landlord-pack-final-fix']);
  });
});
