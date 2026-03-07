'use client';

import { useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { HeaderConfig } from '@/components/layout';
import { Container } from '@/components/ui/Container';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { productLinks, blogLinks, landingPageLinks } from '@/lib/seo/internal-links';
import { StructuredData, breadcrumbSchema, faqPageSchema } from '@/lib/seo/structured-data';
import { ToolFunnelTracker } from '@/components/tools/ToolFunnelTracker';
import WizardFlowPage from '@/app/(app)/wizard/flow/page';

const REQUIRED_PARAMS = {
  type: 'eviction',
  jurisdiction: 'england',
  product: 'notice_only',
  src: 'product_page',
  topic: 'eviction',
} as const;

const faqItems = [
  {
    question: 'What does this Section 21 tool do?',
    answer: 'It guides you through the details needed to build a Section 21 notice preview.',
  },
  {
    question: 'How long does it take?',
    answer: 'Most landlords can complete the guided flow in a few minutes.',
  },
  {
    question: 'Can I review details before finalising?',
    answer: 'Yes. You can preview and review your notice details before proceeding further.',
  },
];

export default function FreeSection21ToolClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const needsParamUpdate = useMemo(() => {
    return Object.entries(REQUIRED_PARAMS).some(
      ([key, value]) => searchParams.get(key) !== value
    );
  }, [searchParams]);

  useEffect(() => {
    if (!needsParamUpdate) return;

    const next = new URLSearchParams(searchParams.toString());
    Object.entries(REQUIRED_PARAMS).forEach(([key, value]) => {
      next.set(key, value);
    });

    router.replace(`?${next.toString()}`, { scroll: false });
  }, [needsParamUpdate, router, searchParams]);

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderConfig mode="autoOnScroll" />
      <ToolFunnelTracker
        toolName="Section 21 Notice Generator"
        toolType="generator"
        jurisdiction="england"
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Tools', url: 'https://landlordheaven.co.uk/tools' },
          {
            name: 'Section 21 Generator',
            url: 'https://landlordheaven.co.uk/tools/free-section-21-notice-generator',
          },
        ])}
      />
      <StructuredData data={faqPageSchema(faqItems)} />

      <UniversalHero
        title="Section 21 Notice Generator"
        subtitle="Create a compliant Section 21 notice preview in minutes."
        align="center"
        hideMedia
        showReviewPill={false}
        showUsageCounter
        primaryCta={{ label: 'Start now', href: '#generator' }}
      />

      <div className="py-20 md:py-24" id="generator">
        <Container>
          <div className="mx-auto max-w-5xl space-y-8">
            <section className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900">How it works</h2>
              <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-gray-700">
                <li>Start now and answer a few questions</li>
                <li>Preview your notice instantly</li>
                <li>Unlock the final version when you&apos;re ready</li>
              </ol>
            </section>

            {!needsParamUpdate && <WizardFlowPage />}
          </div>
        </Container>
      </div>

      <RelatedLinks
        title="Related Resources"
        links={[
          productLinks.noticeOnly,
          productLinks.completePack,
          blogLinks.whatIsSection21,
          blogLinks.howToServeNotice,
          landingPageLinks.section21Template,
        ]}
      />
    </div>
  );
}
