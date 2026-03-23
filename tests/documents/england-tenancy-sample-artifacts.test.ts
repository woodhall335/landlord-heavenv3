import fs from 'fs';
import path from 'path';

import { describe, expect, it } from 'vitest';

import { extractPdfText } from '@/lib/evidence/extract-pdf-text';
import {
  ENGLAND_ASSURED_PERIODIC_AGREEMENT_TITLE,
  ENGLAND_PREMIUM_ASSURED_PERIODIC_TIER_LABEL,
  ENGLAND_STANDARD_ASSURED_PERIODIC_TIER_LABEL,
} from '@/lib/tenancy/england-agreement-constants';

const standardSamplePath = path.join(process.cwd(), 'artifacts', 'test', 'tenancy_agreement.pdf');
const premiumSamplePath = path.join(
  process.cwd(),
  'artifacts',
  'test',
  'prem tenancy england',
  'tenancy_agreement_hmo.pdf',
);

describe('England tenancy sample artifacts', () => {
  it('standard England sample uses assured periodic wording', async () => {
    const result = await extractPdfText(fs.readFileSync(standardSamplePath), 20);

    expect(result.error).toBeUndefined();
    expect(result.text).toContain(ENGLAND_ASSURED_PERIODIC_AGREEMENT_TITLE);
    expect(result.text).toContain(ENGLAND_STANDARD_ASSURED_PERIODIC_TIER_LABEL);
    expect(result.text).not.toContain('Assured Shorthold Tenancy Agreement');
  }, 20000);

  it('premium England sample uses assured periodic wording and keeps premium/shared-household content', async () => {
    const result = await extractPdfText(fs.readFileSync(premiumSamplePath), 20);

    expect(result.error).toBeUndefined();
    expect(result.text).toContain(ENGLAND_ASSURED_PERIODIC_AGREEMENT_TITLE);
    expect(result.text).toContain(ENGLAND_PREMIUM_ASSURED_PERIODIC_TIER_LABEL);
    expect(result.text).toMatch(/HMO\s*&\s*SHARED FACILITIES/i);
    expect(result.text).not.toContain('HMO Assured Shorthold Tenancy Agreement');
    expect(result.text).not.toContain('Premium Assured Shorthold Tenancy Agreement');
  }, 20000);
});
