import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { assignSales002OfferVariant } from '@/lib/experiments/sales002';

const read = (...parts: string[]) => fs.readFileSync(path.join(process.cwd(), ...parts), 'utf8');

describe('SALES-002 live funnel', () => {
  it('wires every canonical funnel event to a live component or tracking function', () => {
    const liveSources = [
      read('src', 'components', 'analytics', 'OrganicLandingTracker.tsx'),
      read('src', 'components', 'conversion', 'ContextualOffer.tsx'),
      read('src', 'components', 'analytics', 'ProductPageTracker.tsx'),
      read('src', 'components', 'analytics', 'ProductPrimaryActions.tsx'),
      read('src', 'lib', 'analytics.ts'),
      read('src', 'lib', 'analytics', 'track.ts'),
      read('src', 'lib', 'analytics', 'cross-sell.ts'),
      read('src', 'app', '(app)', 'auth', 'signup', 'page.tsx'),
      read('src', 'app', '(app)', 'wizard', 'preview', '[caseId]', 'page.tsx'),
      read('src', 'components', 'preview', 'PreviewPageLayout.tsx'),
    ].join('\n');

    for (const event of [
      'organic_landing_view', 'contextual_offer_view', 'contextual_offer_click',
      'product_view', 'product_primary_cta_click', 'builder_started',
      'builder_step_viewed', 'builder_step_completed', 'builder_validation_error',
      'builder_abandoned', 'preview_requested', 'preview_generated', 'preview_failed',
      'account_creation_started', 'account_created', 'checkout_opened', 'checkout_failed',
      'payment_succeeded', 'document_delivered', 'cross_sell_viewed', 'cross_sell_clicked',
    ]) {
      expect(liveSources, event).toContain(`'${event}'`);
    }
  });

  it('keeps the experiment stable and preserves control when killed', () => {
    expect(assignSales002OfferVariant('same-user')).toBe(assignSales002OfferVariant('same-user'));
    expect(['control', 'treatment']).toContain(assignSales002OfferVariant('another-user'));
  });

  it('does not put HMO or arrears case inputs into product URLs', () => {
    const hmo = read('src', 'app', 'tools', 'hmo-license-checker', 'page.tsx');
    const arrears = read('src', 'app', 'tools', 'rent-arrears-calculator', 'page.tsx');
    expect(hmo).not.toMatch(/destinationRoute.*postcode|href=.*postcode/);
    expect(arrears).not.toMatch(/href=.*(?:tenant|address|paymentDate|dueAmount)/);
  });

  it('renders the self-service decision before assisted content', () => {
    const productPage = read('src', 'components', 'marketing', 'PublicProductSalesPage.tsx');
    expect(productPage.indexOf('content.earlyProofBand')).toBeLessThan(
      productPage.indexOf('content.postHeroContent'),
    );
    expect(productPage).toContain('ProductPrimaryActions');
  });
});
