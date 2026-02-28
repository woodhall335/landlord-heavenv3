// @vitest-environment jsdom
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/components/layout/HeaderConfig', () => ({ HeaderConfig: () => <div data-testid="header-config" /> }));
vi.mock('@/components/landing/UniversalHero', () => ({ UniversalHero: () => <section data-testid="hero" /> }));
vi.mock('@/components/seo/FAQSection', () => ({ FAQSection: () => <section data-testid="faq" /> }));
vi.mock('@/components/seo/RelatedLinks', () => ({ RelatedLinks: () => <section data-testid="related-links" /> }));
vi.mock('@/components/seo/IntentProductCTA', () => ({ IntentProductCTA: ({ label }: { label: string }) => <a>{label}</a> }));
vi.mock('@/components/ui/Section21Countdown', () => ({ Section21Countdown: () => <div data-testid="countdown" /> }));
vi.mock('@/components/seo/EvictionNoticeBundlePreviewSection', () => ({
  EvictionNoticeBundlePreviewSection: () => <section>What&apos;s included in your eviction notice bundle</section>,
}));
vi.mock('@/components/products/Section21ComplianceTimingPanel', () => ({
  Section21ComplianceTimingPanel: () => <section>Section 21 Suitability</section>,
}));
vi.mock('@/lib/previews/noticeOnlyPreviews', () => ({
  getNoticeOnlyPreviewData: async () => ({})
}));

describe('eviction notice template page', () => {
  it('renders Section 21 Suitability before the bundle included section', async () => {
    const pageModule = await import('@/app/eviction-notice-template/page');
    const Page = pageModule.default;

    render(await Page());

    const suitability = screen.getByText('Section 21 Suitability');
    const included = screen.getByText("What's included in your eviction notice bundle");

    expect(suitability).toBeInTheDocument();
    expect(included).toBeInTheDocument();
    expect(suitability.compareDocumentPosition(included) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
