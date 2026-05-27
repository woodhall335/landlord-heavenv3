'use client';

import { TrackedLink } from '@/components/analytics/TrackedLink';
import { Container } from '@/components/ui/Container';
import { PUBLIC_PRODUCT_DESCRIPTORS } from '@/lib/public-products';
import { Reveal, StaggerReveal, TrustPillRow } from './PremiumMotion';

const section8Steps = [
  {
    step: '01',
    title: 'Identify the problem',
    body:
      'Start with what is happening now: arrears, notice status, tenancy details, and whether the case is still at the notice stage.',
  },
  {
    step: '02',
    title: 'Check the next step',
    body:
      'Check that a Section 8 notice fits the England possession process before the paperwork is prepared.',
  },
  {
    step: '03',
    title: 'Prepare the notice file',
    body:
      'Build the notice, service record, arrears schedule, checklist, and case summary as one joined-up file.',
  },
  {
    step: '04',
    title: 'Progress if notice is ignored',
    body:
      'If the case moves beyond notice, step into the court possession papers with the notice details already aligned.',
  },
];

export function Section8WorkflowStory() {
  return (
    <section className="premium-surface premium-surface-lavender py-16 md:py-20">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <Reveal className="lg:sticky lg:top-28">
            <span className="public-eyebrow">Section 8 next steps</span>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-[#1c1431] md:text-5xl">
              From rent arrears to the right next step
            </h2>
            <p className="mt-5 text-lg leading-8 text-[#5d5672]">
              The steps keep the notice stage and court stage clear, so landlords do not mix up the paperwork before the case is ready.
            </p>
            <TrustPillRow
              className="mt-6"
              items={['For landlords in England', 'Notice file', 'Court possession papers']}
            />
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <TrackedLink
                href={PUBLIC_PRODUCT_DESCRIPTORS.notice_only.landingHref}
                pagePath="/"
                pageType="homepage"
                ctaLabel="Create my Section 8 notice"
                ctaPosition="section"
                eventName="homepage_primary_cta_click"
                routeIntent="section_8_notice_story"
                product="notice_only"
                className="hero-btn-primary text-center"
              >
                Create my Section 8 notice
              </TrackedLink>
              <TrackedLink
                href={PUBLIC_PRODUCT_DESCRIPTORS.complete_pack.landingHref}
                pagePath="/"
                pageType="homepage"
                ctaLabel="Prepare my court papers"
                ctaPosition="section"
                eventName="product_route_chosen"
                routeIntent="section_8_court_story"
                product="complete_pack"
                className="hero-btn-secondary text-center"
              >
                Prepare my court papers
              </TrackedLink>
            </div>
          </Reveal>

          <StaggerReveal className="grid gap-4">
            {section8Steps.map((item) => (
              <article
                key={item.step}
                className="standalone-premium-hover-lift rounded-[2rem] border border-[#E8E1F8] bg-white/90 p-6 shadow-[0_18px_46px_rgba(24,11,49,0.07)] backdrop-blur"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6D28D9]">
                  {item.step}
                </p>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight text-[#17142B]">
                  {item.title}
                </h3>
                <p className="mt-3 text-base leading-8 text-[#4B5565]">{item.body}</p>
              </article>
            ))}
          </StaggerReveal>
        </div>
      </Container>
    </section>
  );
}
