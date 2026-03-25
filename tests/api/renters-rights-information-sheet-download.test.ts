import { describe, expect, it } from 'vitest';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { GET } from '@/app/downloads/renters-rights-act-information-sheet-2026/route';

describe("renters' rights information sheet download route", () => {
  it('returns the local PDF as an attachment', async () => {
    const response = await GET();
    const filePath = path.join(
      process.cwd(),
      'config',
      'mqs',
      'tenancy_agreement',
      'The_Renters__Rights_Act_Information_Sheet_2026.pdf'
    );
    const fileStat = await stat(filePath);
    const body = await response.arrayBuffer();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/pdf');
    expect(response.headers.get('Content-Disposition')).toContain(
      'attachment; filename="renters-rights-act-information-sheet-2026.pdf"'
    );
    expect(body.byteLength).toBe(fileStat.size);
    expect(body.byteLength).toBeGreaterThan(1000);
  });
});
