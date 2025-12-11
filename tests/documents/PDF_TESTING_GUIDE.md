# PDF Field Mapping Test Guide

This suite validates that our official PDF forms are present and that the field names referenced in `src/lib/documents/official-forms-filler.ts` match the actual AcroForm fields.

## How to run

```bash
PUPPETEER_SKIP_DOWNLOAD=true npm install  # only if dependencies are missing
npm run test:pdf -- tests/documents/pdf-field-mapping.test.ts
```

## What the test covers

- Confirms required England & Wales PDFs exist in `public/official-forms/`.
- Verifies every form listed in `public/official-forms/forms-manifest.json` is available on disk (including Scotland and Northern Ireland entries).
- Checks a set of critical field names for N5, N5B, N119, N1, and Form 6A to ensure mappings match the live PDFs.

If a test fails, re-run `node scripts` or inspect the PDF with a form field inspector to confirm the exact field name (including smart quotes or trailing spaces) and update the filler accordingly.
