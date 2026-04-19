import fs from 'fs/promises';
import path from 'path';

import { describe, expect, it } from 'vitest';

import { extractPdfText } from '@/lib/evidence/extract-pdf-text';
import {
  SECTION13_MINIMUM_INTERVAL_WEEKS,
  SECTION13_MINIMUM_NOTICE_MONTHS,
  validateSection13StartDate,
} from '@/lib/section13/rules';

describe('Form 4A official wording and Section 13 guidance regression', () => {
  it('keeps the official Form 4A template wording for the two-month notice rule', async () => {
    const officialFormPath = path.join(process.cwd(), 'artifacts', 'update', 'Form_4A.pdf');
    const formBytes = await fs.readFile(officialFormPath);
    const extracted = await extractPdfText(Buffer.from(formBytes));
    const officialText = extracted.text;

    expect(officialText).toContain(
      'Landlord’s notice proposing a new rent for assured tenancies in the private rented sector'
    );
    expect(officialText).toMatch(
      /This notice must be served on the tenant\(s\) at least two months\s+before the new rent can start\./
    );
    expect(officialText).toContain('Housing Act 1988 section 13(2), as amended');
  });

  it('keeps the live Section 13 start-date validation aligned with the two-month notice rule', () => {
    const valid = validateSection13StartDate({
      tenancyStartDate: '2025-01-25',
      currentRentFrequency: 'monthly',
      proposedStartDate: '2026-05-25',
      serviceDate: '2026-03-25',
      lastRentIncreaseDate: '2025-03-25',
      firstIncreaseAfter2003Date: '2025-03-25',
    });

    expect(valid.earliestValidStartDate).toBe('2026-05-25');
    expect(valid.isValid).toBe(true);

    const tooEarly = validateSection13StartDate({
      tenancyStartDate: '2025-01-25',
      currentRentFrequency: 'monthly',
      proposedStartDate: '2026-05-24',
      serviceDate: '2026-03-25',
      lastRentIncreaseDate: '2025-03-25',
      firstIncreaseAfter2003Date: '2025-03-25',
    });

    expect(tooEarly.isValid).toBe(false);
    expect(tooEarly.issues).toContain(
      `The proposed start date must be at least ${SECTION13_MINIMUM_NOTICE_MONTHS} months after the notice is served.`
    );
  });

  it('keeps the first-year cadence floor at fifty-two weeks before any later increase can start', () => {
    const result = validateSection13StartDate({
      tenancyStartDate: '2026-01-25',
      currentRentFrequency: 'weekly',
      proposedStartDate: '2027-01-17',
      serviceDate: '2026-10-01',
    });

    expect(result.earliestValidStartDate).toBe('2027-01-24');
    expect(result.isValid).toBe(false);
    expect(result.issues).toContain(
      `The proposed start date must be at least ${SECTION13_MINIMUM_INTERVAL_WEEKS} weeks after the tenancy start date.`
    );
  });
});
