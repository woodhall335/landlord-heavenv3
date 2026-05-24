// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CommercialSeoNextStep } from '@/components/seo/CommercialSeoNextStep';
import { trackEvent } from '@/lib/analytics';

vi.mock('@/lib/analytics', () => ({
  trackEvent: vi.fn(),
}));

describe('CommercialSeoNextStep tracking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, '', '/tenant-not-paying-rent');
  });

  it('tracks primary CTA impressions and product clicks with conversion context', async () => {
    render(
      <CommercialSeoNextStep
        primaryHref="/products/money-claim"
        secondaryHref="/products/complete-pack"
        sourcePage="/tenant-not-paying-rent"
        intent="tenant-not-paying-rent"
      />
    );

    await waitFor(() => {
      expect(trackEvent).toHaveBeenCalledWith(
        'journey_cta_impression',
        expect.objectContaining({
          sourcePage: '/tenant-not-paying-rent',
          pagePath: '/tenant-not-paying-rent',
          pageType: 'guide',
          intent: 'tenant-not-paying-rent',
          ctaPosition: 'mid',
          destination: '/products/money-claim',
          recommendedProduct: '/products/money-claim',
          productClicked: 'money_claim',
          userType: 'landlord',
        }),
        expect.objectContaining({ dedupeScope: 'page' })
      );
    });

    const primaryCta = screen.getByTestId('guide-primary-cta');
    primaryCta.addEventListener('click', (event) => event.preventDefault());
    fireEvent.click(primaryCta);

    expect(trackEvent).toHaveBeenCalledWith(
      'journey_cta_click',
      expect.objectContaining({
        destination: '/products/money-claim',
        productClicked: 'money_claim',
        userType: 'landlord',
      })
    );
    expect(trackEvent).toHaveBeenCalledWith(
      'product_cta_clicked',
      expect.objectContaining({
        sourcePage: '/tenant-not-paying-rent',
        destination: '/products/money-claim',
        productClicked: 'money_claim',
        userType: 'landlord',
      })
    );
  });
});
