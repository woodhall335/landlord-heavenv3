import { describe, expect, it } from 'vitest';
import { buildFunnelProcessSectionModel } from '@/lib/marketing/funnelProcessSection';
import type { NoticeOnlyPreviewData } from '@/lib/previews/noticeOnlyPreviews';
import type { CompletePackPreviewData } from '@/lib/previews/completePackPreviews';

const emptyNoticeVariantSet = {
  section21: [],
  section8: [],
  section173: [],
  rhw23: [],
  'notice-to-leave': [],
};

const noticePreviews: NoticeOnlyPreviewData = {
  england: {
    ...emptyNoticeVariantSet,
    section21: [
      {
        key: 'service instructions',
        title: 'Service Instructions',
        src: '/images/previews/notice-only/england/section21/service instructions.webp',
        alt: 'Service instructions',
      },
      {
        key: 'section21 form6a eviction notice',
        title: 'Section 21 Form 6A Eviction Notice',
        src: '/images/previews/notice-only/england/section21/section21 form6a eviction notice.webp',
        alt: 'Section 21 notice',
      },
    ],
    section8: [
      {
        key: 'section-8-eviction-notice',
        title: 'Section 8 Eviction Notice',
        src: '/images/previews/notice-only/england/section8/section-8-eviction-notice.webp',
        alt: 'Section 8 notice',
      },
    ],
  },
  wales: {
    ...emptyNoticeVariantSet,
    section173: [
      {
        key: 'section173_notice -2',
        title: 'Section 173 Notice',
        src: '/images/previews/notice-only/wales/section173/section173_notice -2.webp',
        alt: 'Section 173 notice',
      },
    ],
    rhw23: [
      {
        key: 'eviction_notice',
        title: 'Eviction Notice',
        src: '/images/previews/notice-only/wales/rhw23/eviction_notice.webp',
        alt: 'RHW23 notice',
      },
    ],
  },
  scotland: {
    ...emptyNoticeVariantSet,
  },
};

const completePackPreviews: CompletePackPreviewData = {
  section21: [
    {
      key: 'notice',
      title: 'Section 21 Notice',
      src: '/images/previews/complete-pack/england/section21/notice.webp',
      alt: 'Section 21 notice',
    },
  ],
  section8: [
    {
      key: 'n5',
      title: 'Form N5',
      src: '/images/previews/complete-pack/england/section8/n5.webp',
      alt: 'N5 form',
    },
    {
      key: 'n119',
      title: 'Form N119',
      src: '/images/previews/complete-pack/england/section8/n119.webp',
      alt: 'N119 form',
    },
  ],
};

describe('buildFunnelProcessSectionModel', () => {
  it('builds the notice-only model as an England-only Section 8 route', () => {
    const model = buildFunnelProcessSectionModel({
      product: 'notice_only',
      noticePreviews,
    });

    expect(model.heading).toBe('Understand Why Each Section 8 Notice Document Matters');
    expect(model.tabs.map((tab) => tab.id)).toEqual(['england']);

    const englandTab = model.tabs[0];
    expect(englandTab?.routes.map((route) => route.id)).toEqual(['section8']);
    expect(englandTab?.routes[0].label).toBe('Section 8 notice pack');
    expect(englandTab?.routes[0].steps[0].docTitle).toBe('Section 8 Eviction Notice');
    expect(englandTab?.routes[0].steps[0].whatItDoes).toContain('current England route');
  });

  it('uses fallback document steps when England previews are missing', () => {
    const model = buildFunnelProcessSectionModel({
      product: 'notice_only',
      noticePreviews: {
        ...noticePreviews,
        england: {
          ...emptyNoticeVariantSet,
        },
      },
    });

    const englandTab = model.tabs.find((tab) => tab.id === 'england');
    const route = englandTab?.routes[0];

    expect(route?.steps.length).toBeGreaterThan(0);
    expect(route?.steps[0].docTitle).toBe('England Form 3A Possession Notice');
    for (const step of route?.steps ?? []) {
      expect(step.whatItDoes.length).toBeGreaterThan(0);
      expect(step.whyItMatters.length).toBeGreaterThan(0);
    }
  });

  it('builds complete-pack route models with mapped copy for court forms', () => {
    const model = buildFunnelProcessSectionModel({
      product: 'complete_pack',
      completePackPreviews,
    });

    const englandTab = model.tabs.find((tab) => tab.id === 'england');
    const steps = englandTab?.routes[0].steps ?? [];

    expect(steps.map((step) => step.docKey)).toEqual(['n5', 'n119']);
    expect(steps[0].whatItDoes).toContain('standard possession proceedings');
    expect(steps[1].whatItDoes).toContain('detailed possession particulars');
  });

  it('provides money-claim fallback steps when preview images are unavailable', () => {
    const model = buildFunnelProcessSectionModel({
      product: 'money_claim',
      moneyClaimPreviews: [],
    });

    const route = model.tabs[0]?.routes[0];
    expect(route?.steps[0].docTitle).toBe('Form N1 Claim Form');
    expect(route?.steps.length).toBeGreaterThanOrEqual(10);

    for (const step of route?.steps ?? []) {
      expect(step.whatItDoes).not.toBe('');
      expect(step.whyItMatters).not.toBe('');
    }
  });
});
