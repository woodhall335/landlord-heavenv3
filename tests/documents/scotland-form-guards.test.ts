import { describe, expect, it, vi } from 'vitest';
import path from 'path';
import fs from 'fs/promises';
import { assertOfficialFormExists } from '@/lib/documents/official-forms-filler';

describe('Scotland official form guards', () => {
  it('ships placeholder PDFs for tribunal filings (eviction)', async () => {
    const base = path.join(process.cwd(), 'public', 'official-forms', 'scotland');
    await expect(fs.access(path.join(base, 'notice_to_leave.pdf'))).resolves.toBeUndefined();
    await expect(fs.access(path.join(base, 'form_e_eviction.pdf'))).resolves.toBeUndefined();
  });

  it('ships placeholder PDFs for Simple Procedure (money claims)', async () => {
    const base = path.join(process.cwd(), 'public', 'official-forms', 'scotland');
    await expect(fs.access(path.join(base, 'simple_procedure_claim_form.pdf'))).resolves.toBeUndefined();
    await expect(fs.access(path.join(base, 'simple_procedure_response_form.pdf'))).resolves.toBeUndefined();
  });

  it('Simple Procedure PDFs are valid and non-empty', async () => {
    const base = path.join(process.cwd(), 'public', 'official-forms', 'scotland');

    const claimBytes = await fs.readFile(path.join(base, 'simple_procedure_claim_form.pdf'));
    expect(claimBytes.length).toBeGreaterThan(1000); // Ensure meaningful content

    const responseBytes = await fs.readFile(path.join(base, 'simple_procedure_response_form.pdf'));
    expect(responseBytes.length).toBeGreaterThan(1000);
  });

  it('surfaces a descriptive error if the PDF is missing', async () => {
    const accessSpy = vi.spyOn(fs, 'access').mockRejectedValueOnce(new Error('missing'));

    await expect(assertOfficialFormExists('scotland/notice_to_leave.pdf')).rejects.toThrow(
      /Official form "scotland\/notice_to_leave.pdf" is missing/
    );

    accessSpy.mockRestore();
  });
});
