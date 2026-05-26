import { describe, expect, it } from 'vitest';

import { buildRentCheckerEmailSequence } from '@/lib/section13/rent-checker-email';
import type { RentCheckerResult } from '@/lib/section13/rent-checker';

const baseResult = {
  marketLow: 950,
  marketHigh: 1100,
  marketMedian: 1025,
  challengeRiskLabel: 'Moderate',
  evidenceStrength: 'Strong',
  primaryCtaLabel: 'Prepare my tribunal-ready file - £69.99',
  primaryCtaHref:
    '/wizard/flow?type=rent_increase&jurisdiction=england&product=section13_defensive&src=rent_checker',
  bundleCtaHref: '/products/section-13-defence?src=rent_checker',
  recommendedProduct: 'section13_defensive',
} as RentCheckerResult;

describe('buildRentCheckerEmailSequence', () => {
  it('adds a rent checker handoff token to wizard links so the result can recover across devices', () => {
    const messages = buildRentCheckerEmailSequence(baseResult, {
      handoffToken: 'token-123',
    });

    expect(messages[0].html).toContain('/wizard/flow?');
    expect(messages[0].html).toContain('product=section13_defensive');
    expect(messages[0].html).toContain('rent_checker_token=token-123');
    expect(messages[1].html).toContain('product=section13_standard');
    expect(messages[1].html).toContain('rent_checker_token=token-123');
    expect(messages[2].html).toContain('product=section13_defensive');
    expect(messages[2].html).toContain('rent_checker_token=token-123');
  });

  it('keeps product-page links when no recovery token is available', () => {
    const messages = buildRentCheckerEmailSequence(baseResult);

    expect(messages[0].html).toContain(baseResult.primaryCtaHref);
    expect(messages[1].html).toContain('/products/section-13-standard?src=rent_checker_email');
    expect(messages[2].html).toContain('/products/section-13-defence?src=rent_checker_email');
    expect(messages.map((message) => message.html).join('\n')).not.toContain('rent_checker_token=');
  });
});
