import { describe, expect, it } from 'vitest';

import { buildPdfEmbedHtml } from '../documentEmbedShell';

describe('buildPdfEmbedHtml', () => {
  it('configures the PDF.js worker before rendering', () => {
    const html = buildPdfEmbedHtml('Preview', new Uint8Array([37, 80, 68, 70, 45]));

    expect(html).toContain('pdfjsLib.GlobalWorkerOptions.workerSrc');
    expect(html).toContain('pdf.worker.min.js');
    expect(html).toContain('pdfjsLib.getDocument');
  });
});
