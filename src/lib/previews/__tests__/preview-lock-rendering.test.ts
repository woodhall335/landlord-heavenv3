import { PDFDocument } from 'pdf-lib';
import { describe, expect, it } from 'vitest';

import { applyPreviewLockToPdfBytes } from '../preview-lock-rendering';

async function makePdf(pageCount: number): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  for (let index = 0; index < pageCount; index += 1) {
    const page = pdf.addPage([400, 560]);
    page.drawText(`Page ${index + 1}`);
  }
  return pdf.save();
}

describe('applyPreviewLockToPdfBytes', () => {
  it('marks a one-page unpaid PDF as partial', async () => {
    const original = await makePdf(1);
    const result = await applyPreviewLockToPdfBytes(original, { isPaid: false });

    expect(result.pageCount).toBe(1);
    expect(result.pageStates).toEqual(['partial']);
    expect(result.pdfBytes.byteLength).toBeGreaterThan(original.byteLength);
  });

  it('locks page two of a two-page unpaid PDF', async () => {
    const original = await makePdf(2);
    const result = await applyPreviewLockToPdfBytes(original, { isPaid: false });

    expect(result.pageCount).toBe(2);
    expect(result.pageStates).toEqual(['clear', 'locked']);
  });

  it('leaves paid PDFs clear', async () => {
    const original = await makePdf(4);
    const result = await applyPreviewLockToPdfBytes(original, { isPaid: true });

    expect(result.pageCount).toBe(4);
    expect(result.pageStates).toEqual(['clear', 'clear', 'clear', 'clear']);
    expect(result.pdfBytes).toBe(original);
  });
});
