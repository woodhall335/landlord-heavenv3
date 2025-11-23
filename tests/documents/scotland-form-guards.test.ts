import { describe, expect, it, vi } from 'vitest';
import path from 'path';
import fs from 'fs/promises';
import { assertOfficialFormExists } from '@/lib/documents/official-forms-filler';

describe('Scotland official form guards', () => {
  it('ships placeholder PDFs for tribunal filings', async () => {
    const base = path.join(process.cwd(), 'public', 'official-forms', 'scotland');
    await expect(fs.access(path.join(base, 'notice_to_leave.pdf'))).resolves.toBeUndefined();
    await expect(fs.access(path.join(base, 'form_e_eviction.pdf'))).resolves.toBeUndefined();
  });

  it('surfaces a descriptive error if the PDF is missing', async () => {
    const accessSpy = vi.spyOn(fs, 'access').mockRejectedValueOnce(new Error('missing'));

    await expect(assertOfficialFormExists('scotland/notice_to_leave.pdf')).rejects.toThrow(
      /Official form "scotland\/notice_to_leave.pdf" is missing/
    );

    accessSpy.mockRestore();
  });
});
