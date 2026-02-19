'use client';

import { useEffect, useMemo, Suspense } from 'react';
import Image from 'next/image';
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

function FreeSection21ToolInner() {
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
          <div className="mx-auto max-w-5xl">{!needsParamUpdate && <WizardFlowPage />}</div>
        </Container>
      </div>

      <Container>
        <section className="mx-auto mb-12 max-w-5xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm md:p-10">
          <h2 className="text-2xl font-bold text-gray-900">Free Section 21 notice preview</h2>
          <div className="mt-4 space-y-4 text-sm text-gray-700 md:text-base">
            <p>
              A Section 21 notice is used by landlords in England to seek possession at the end
              of an assured shorthold tenancy (AST), usually without relying on a specific tenant
              breach. This guided flow helps you create a free preview so you can see the notice
              structure and key details before committing.
            </p>
            <p>
              Section 21 is often called a “no-fault” route, so it does not rely on Section 8
              possession grounds. Instead, whether a notice is likely to be valid usually depends
              on correct tenancy information, notice timing, and key compliance steps. This wizard
              validates those details as you go to reduce common errors. You can preview first,
              then unlock the final downloadable version when you&apos;re ready.
            </p>
            <div className="grid gap-8 md:grid-cols-2 md:gap-10">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">What the wizard checks</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    <li>AST, landlord, tenant, and property details are complete and consistent</li>
                    <li>Notice dates align with high-level timing rules for Section 21 service</li>
                    <li>Core compliance signals that can affect validity are captured for review</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Typical validity issues</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    <li>
                      Commonly valid: correct tenancy details, timing, and required documents
                      tracked
                    </li>
                    <li>
                      Commonly invalid: key details missing, date logic errors, or compliance gaps
                    </li>
                    <li>
                      Section 21 does not use possession grounds lists in the way Section 8 does
                    </li>
                  </ul>
                </div>
              </div>
              <div className="flex items-center justify-center p-4 md:p-6">
                <Image
                  src="/images/previews/notice-only/england/section21/section21 form6a eviction notice.webp"
                  alt="Section 21 notice (Form 6A) preview"
                  width={900}
                  height={1273}
                  className="h-auto w-full max-w-md"
                />
              </div>
            </div>
          </div>
        </section>
      </Container>

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

export default function FreeSection21ToolPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <FreeSection21ToolInner />
    </Suspense>
  );
}
