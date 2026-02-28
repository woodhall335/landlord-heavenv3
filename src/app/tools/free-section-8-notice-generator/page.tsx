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
    question: 'What does this Section 8 tool do?',
    answer: 'It guides you through key details to produce a structured Section 8 notice preview.',
  },
  {
    question: 'How quickly can I complete it?',
    answer: 'Most users can complete the guided questions in just a few minutes.',
  },
  {
    question: 'Can I review answers before finishing?',
    answer: 'Yes. You can review your answers and notice preview before moving forward.',
  },
];

function FreeSection8ToolInner() {
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
        toolName="Section 8 Notice Generator"
        toolType="generator"
        jurisdiction="england"
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Tools', url: 'https://landlordheaven.co.uk/tools' },
          {
            name: 'Section 8 Generator',
            url: 'https://landlordheaven.co.uk/tools/free-section-8-notice-generator',
          },
        ])}
      />
      <StructuredData data={faqPageSchema(faqItems)} />

      <UniversalHero
        title="Section 8 Notice Generator"
        subtitle="Build a Section 8 notice preview with the correct grounds and structure."
        align="center"
        hideMedia
        showReviewPill={false}
        showTrustPositioningBar
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
          <h2 className="text-2xl font-bold text-gray-900">Free Section 8 notice preview</h2>
          <div className="mt-4 space-y-4 text-sm text-gray-700 md:text-base">
            <p>
              A Section 8 notice is used in England when a landlord seeks possession based on specific
              legal grounds, such as rent arrears or other tenancy breaches. This tool helps you build
              a free preview so you can review your draft notice before deciding whether to unlock the
              final version.
            </p>
            <p>
              The guided wizard is not just a document builder. It supports grounds selection and
              checks core inputs to reduce avoidable errors, including consistency between grounds,
              high-level notice timing expectations by ground, and rent arrears details where
              relevant. You can preview first and unlock the final downloadable version when ready.
            </p>
          </div>

          <div className="mt-8 grid gap-8 md:grid-cols-2 md:gap-10 md:items-start">
            <div className="space-y-6 text-sm text-gray-700 md:text-base">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Common Section 8 grounds</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Rent arrears grounds, including Grounds 8, 10, and 11</li>
                  <li>Tenancy breach-related grounds, such as damage, nuisance, or other breaches</li>
                  <li>Other grounds like false statement (Ground 17), depending on the facts</li>
                </ul>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">What the wizard checks</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Selected grounds align with your stated possession reason</li>
                  <li>Notice timing inputs are checked against high-level ground-based expectations</li>
                  <li>Rent arrears figures, periods, and dates are captured for clearer review</li>
                </ul>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Typical validity issues</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Commonly valid: facts and evidence match the grounds selected</li>
                  <li>
                    Commonly invalid: wrong grounds chosen, inconsistent arrears data, or timing
                    errors
                  </li>
                  <li>
                    Mixing mandatory and discretionary grounds without clear facts can weaken a notice
                  </li>
                </ul>
              </div>
            </div>
            <div className="flex items-center justify-center p-4 md:self-center md:p-6">
              <Image
                src="/images/section%208%20notice.webp"
                alt="Section 8 notice (Form 3) preview"
                width={900}
                height={1273}
                className="h-auto w-full max-w-md"
              />
            </div>
          </div>
        </section>
      </Container>

      <RelatedLinks
        title="Related Resources"
        links={[
          productLinks.noticeOnly,
          productLinks.completePack,
          blogLinks.section21VsSection8,
          blogLinks.rentArrearsEviction,
          landingPageLinks.section8Template,
        ]}
      />
    </div>
  );
}

export default function FreeSection8Tool() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <FreeSection8ToolInner />
    </Suspense>
  );
}
