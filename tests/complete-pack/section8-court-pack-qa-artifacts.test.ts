import fs from 'fs';
import path from 'path';

import { PDFCheckBox, PDFDocument, PDFTextField } from 'pdf-lib';
import { describe, expect, it } from 'vitest';

const QA_ROOT = path.join(process.cwd(), 'artifacts', 'golden-packs', 'section8_court_pack_qa');

function normalizeExtractedText(value: string): string {
  return value
    .replace(/\r/g, '')
    .replace(/Â£/g, '£')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function readArtifactText(...segments: string[]): string {
  const filePath = path.join(QA_ROOT, ...segments);
  return normalizeExtractedText(fs.readFileSync(filePath, 'utf8'));
}

async function readPdfFields(...segments: string[]): Promise<Map<string, string>> {
  const filePath = path.join(QA_ROOT, ...segments);
  const pdfDoc = await PDFDocument.load(fs.readFileSync(filePath));
  const form = pdfDoc.getForm();
  const values = new Map<string, string>();

  for (const field of form.getFields()) {
    if (field instanceof PDFTextField) {
      values.set(field.getName(), field.getText() ?? '');
      continue;
    }

    if (field instanceof PDFCheckBox) {
      values.set(field.getName(), field.isChecked() ? '[x]' : '[ ]');
    }
  }

  return values;
}

function getFieldValueByPrefix(fields: Map<string, string>, prefix: string): string | undefined {
  for (const [name, value] of fields.entries()) {
    if (name.startsWith(prefix)) {
      return value;
    }
  }
  return undefined;
}

function expectContainsAll(text: string, fragments: string[]) {
  for (const fragment of fragments) {
    expect(text).toContain(fragment);
  }
}

describe('Section 8 court-pack QA golden artifacts', () => {
  it('keeps official N119, N215, and N5 values aligned for the first-class-post complete pack', async () => {
    const n119Fields = await readPdfFields(
      'complete_pack_first_class_post_above_threshold',
      'n119_particulars_of_claim.pdf',
    );
    const n215Fields = await readPdfFields(
      'complete_pack_first_class_post_above_threshold',
      'form_n215_certificate_of_service.pdf',
    );
    const n5Fields = await readPdfFields(
      'complete_pack_first_class_post_above_threshold',
      'n5_claim_for_possession.pdf',
    );

    expect(n119Fields.get('3(a) Type of tenancy')).toBe('Assured tenancy');
    expect(n119Fields.get('3(a) Date of tenancy')).toBe('1 June 2024');
    expect(
      getFieldValueByPrefix(
        n119Fields,
        '3(c) Any unpaid rent or charge for use and occupation should be calculated at £',
      ),
    ).toBe('39.45');
    expect(n119Fields.get('4. (a) The reason the claimant is asking for possession is:')).toContain('The total arrears as at 4 March 2026 stand at £4800.00.');
    expect(n119Fields.get('4. (c) The reason the claimant is asking for possession is:')).toBe(
      'Ground 8 (mandatory) and Ground 10 (discretionary) of Schedule 2 to the Housing Act 1988.',
    );
    expect(n119Fields.get('5. The following steps have already been taken to recover any arrears:')).toContain(
      'The notice expires on 20 March 2026.',
    );
    expect(n119Fields.get('7. The following information is known about the defendant’s circumstances:')).toBe(
      "The claimant is not aware of any further information about the defendant's circumstances beyond the matters set out in the claim papers.",
    );
    expect(n119Fields.get('8. The claimant is asking the court to take the following financial or other information into account when making its decision whether or not to grant an order for possession:')).toContain(
      'the sustained non-payment of rent since 1 December 2025 and the total arrears of £4800.00 now outstanding.',
    );

    expect(n215Fields.get('Text Field 93')).toBe('04/03/26');
    expect(n215Fields.get('Text Field 94')).toBe('06/03/26');
    expect(n215Fields.get('Text1')).toBe('Form 3A notice');
    expect(n215Fields.get('Check Box3')).toBe('[x]');

    expect(n5Fields.get("In the court")).toBe('York County Court and Family Court');
    expect(n5Fields.get("claimant's details")).toContain('Daniel Mercer');
    expect(n5Fields.get("claimant's details")).toContain('27 Rowan Avenue');
    expect(n5Fields.get("defendant's details")).toContain('Ivy Carleton');
    expect(n5Fields.get('rent arrears - yes')).toBe('[x]');
  });

  it('renders recalculated dates, arrears totals, Ground 8 status, and validation summary across complete-pack support docs', () => {
    const witnessStatement = readArtifactText(
      'complete_pack_first_class_post_above_threshold',
      'witness_statement.txt',
    );
    const caseSummary = readArtifactText(
      'complete_pack_first_class_post_above_threshold',
      'eviction_case_summary.txt',
    );
    const hearingChecklist = readArtifactText(
      'complete_pack_first_class_post_above_threshold',
      'hearing_checklist.txt',
    );
    const bundleIndex = readArtifactText(
      'complete_pack_first_class_post_above_threshold',
      'court_bundle_index.txt',
    );
    const courtReadiness = readArtifactText(
      'complete_pack_first_class_post_above_threshold',
      'court_readiness_status.html',
    );

    expectContainsAll(witnessStatement, [
      'As at the date of this statement, the total arrears amount to £4,800.00.',
      'At the date of service of the Form 3A notice (4 March 2026), the total rent arrears stood at £4,800.00',
      'This significantly exceeds the Ground 8 threshold of 3 months\' rent (£3,600.00).',
    ]);

    for (const text of [caseSummary, hearingChecklist, bundleIndex]) {
      expectContainsAll(text, [
        'Court-pack validation summary',
        'DEEMED SERVICE DATE USED',
        '6 March 2026',
        'NOTICE EXPIRY DATE',
        '20 March 2026',
        'EARLIEST PROCEEDINGS DATE',
        'TOTAL ARREARS',
        '£4800.00',
        'GROUND 8 THRESHOLD',
        '£3600.00',
        'GROUND 8 STATUS',
        'ABOVE',
      ]);
    }

    expect(courtReadiness).toContain('Court-pack validation summary');
    expect(courtReadiness).toContain('Ground 8 threshold:');
    expect(courtReadiness).toContain('&#163;3600.00 (ABOVE)');
    expect(courtReadiness).toContain('Minimum notice period is at least 14 days from deemed service.');
  });

  it('captures the personal-service-after-cutoff Stage 1 risk position without raw object leaks', async () => {
    const stage1Summary = readArtifactText(
      'notice_only_personal_after_cutoff_at_threshold',
      'case_summary.txt',
    );
    const n215Fields = await readPdfFields(
      'notice_only_personal_after_cutoff_at_threshold',
      'form_n215_certificate_of_service.pdf',
    );

    expectContainsAll(stage1Summary, [
      'Court-pack validation summary',
      'DEEMED SERVICE DATE USED',
      '6 March 2026',
      'NOTICE EXPIRY DATE',
      '20 March 2026',
      'GROUND 8 STATUS',
      'AT',
      'Ground 8 threshold is exactly met at £3600.00 and should be treated as a risk position.',
      'Additional case detail supplied by the landlord: Total rent arrears: £3,600.00. Rent: £1,200.00 monthly.',
    ]);
    expect(stage1Summary).not.toContain('[object Object]');

    expect(n215Fields.get('Text Field 93')).toBe('05/03/26');
    expect(n215Fields.get('Text Field 94')).toBe('06/03/26');
  });

  it('uses the next business day for after-cutoff electronic service in the complete pack', () => {
    const electronicSummary = readArtifactText(
      'complete_pack_electronic_after_cutoff_above_threshold',
      'eviction_case_summary.txt',
    );

    expectContainsAll(electronicSummary, [
      'NOTICE SERVED',
      '6 March 2026',
      'DEEMED SERVICE DATE USED',
      '9 March 2026',
      'NOTICE EXPIRY DATE',
      '23 March 2026',
      'EARLIEST PROCEEDINGS DATE',
      '23 March 2026',
      'GROUND 8 STATUS',
      'ABOVE',
    ]);
  });
});
