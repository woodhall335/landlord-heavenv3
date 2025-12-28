import { describe, expect, it, vi } from 'vitest';
import path from 'path';
import fs from 'fs/promises';
import { PDFDocument } from 'pdf-lib';
import { assertOfficialFormExists } from '@/lib/documents/official-forms-filler';

describe('Scotland official form guards', () => {
  const base = path.join(process.cwd(), 'public', 'official-forms', 'scotland');

  it('ships official PDFs for tribunal filings (eviction)', async () => {
    await expect(fs.access(path.join(base, 'notice_to_leave.pdf'))).resolves.toBeUndefined();
    await expect(fs.access(path.join(base, 'form_e_eviction.pdf'))).resolves.toBeUndefined();
  });

  it('ships official PDFs for Simple Procedure (money claims)', async () => {
    await expect(fs.access(path.join(base, 'simple_procedure_response_form.pdf'))).resolves.toBeUndefined();
    // Note: form-3a.pdf (Simple Procedure Claim Form) should be added when available
  });

  it('Form E is a valid fillable PDF with expected fields', async () => {
    const formEBytes = await fs.readFile(path.join(base, 'form_e_eviction.pdf'));
    expect(formEBytes.length).toBeGreaterThan(100000); // Official form is ~234KB

    const pdfDoc = await PDFDocument.load(formEBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    // Official Form E has 31 fields (5 checkboxes + 26 text fields)
    expect(fields.length).toBe(31);

    // Check for key fields
    const fieldNames = fields.map(f => f.getName());
    expect(fieldNames).toContain('Check Box17'); // Rule 109 checkbox
    expect(fieldNames).toContain('grounds'); // Eviction grounds text area
    expect(fieldNames).toContain('TEL'); // Telephone field
    expect(fieldNames).toContain('eml'); // Email field
  });

  it('Simple Procedure Response Form (4A) is a valid fillable PDF', async () => {
    const responseBytes = await fs.readFile(path.join(base, 'simple_procedure_response_form.pdf'));
    expect(responseBytes.length).toBeGreaterThan(100000); // Official form is ~121KB

    const pdfDoc = await PDFDocument.load(responseBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    // Official Form 4A has 46 fields
    expect(fields.length).toBe(46);

    // Check for key fields
    const fieldNames = fields.map(f => f.getName());
    expect(fieldNames).toContain('4A_Respondent');
    expect(fieldNames).toContain('4A_A2_Name');
    expect(fieldNames).toContain('4A_D1'); // Background to claim
  });

  it('Notice to Leave PDF is non-fillable (requires HTML generation)', async () => {
    const ntlBytes = await fs.readFile(path.join(base, 'notice_to_leave.pdf'));
    expect(ntlBytes.length).toBeGreaterThan(100000); // Official form is ~230KB

    const pdfDoc = await PDFDocument.load(ntlBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    // Official Notice to Leave has NO fillable fields - must use HTML template
    expect(fields.length).toBe(0);
  });

  it('surfaces a descriptive error if the PDF is missing', async () => {
    const accessSpy = vi.spyOn(fs, 'access').mockRejectedValueOnce(new Error('missing'));

    await expect(assertOfficialFormExists('scotland/notice_to_leave.pdf')).rejects.toThrow(
      /Official form "scotland\/notice_to_leave.pdf" is missing/
    );

    accessSpy.mockRestore();
  });
});
