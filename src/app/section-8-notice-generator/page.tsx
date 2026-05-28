import type { Metadata } from 'next';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { Container } from '@/components/ui/Container';
import { FAQSection, type FAQItem } from '@/components/seo/FAQSection';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import {
  StructuredData,
  articleSchema,
  breadcrumbSchema,
  howToSchema,
  softwareApplicationSchema,
} from '@/lib/seo/structured-data';
import { generateMetadata, getCanonicalUrl } from '@/lib/seo';

const path = '/section-8-notice-generator';
const canonical = getCanonicalUrl(path);

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = generateMetadata({
  title: 'Section 8 Notice Generator | England Form 3A Tool',
  description:
    'Use the Section 8 notice generator for England landlords. Prepare Form 3A, grounds, dates, service record, N215, and evidence prompts before you serve.',
  path,
  type: 'article',
  keywords: [
    'section 8 notice generator',
    'section 8 notice',
    'form 3a generator',
    'section 8 eviction notice generator',
    'section 8 notice england',
    'eviction notice generator england',
    'ground 8 notice generator',
  ],
});

const faqs: FAQItem[] = [
  {
    question: 'What does the Section 8 notice generator create?',
    answer:
      'It helps England landlords prepare the Section 8 Form 3A notice route, including selected grounds, notice dates, service notes, and supporting evidence prompts. The Notice Only pack also includes the service file documents needed before serving.',
  },
  {
    question: 'Is this different from a free Section 8 template?',
    answer:
      'Yes. A template gives you a blank starting point. A guided generator asks for the landlord facts, checks the route, carries the selected grounds into the notice, and keeps the service record and next-step file aligned.',
  },
  {
    question: 'Can I use the generator for rent arrears?',
    answer:
      'Yes. Rent arrears are one of the main use cases for Section 8. You should still check the arrears figure, rent schedule, payment history, and evidence before serving.',
  },
  {
    question: 'What if the tenant does not leave after the notice?',
    answer:
      'If the notice expires and the tenant remains, you may need to prepare court papers. That is usually when the Complete Pack is the better fit because it joins the notice file to N5, N119, and court-stage paperwork.',
  },
];

const steps = [
  {
    title: 'Check the landlord problem',
    body:
      'Start with the practical reason for possession: arrears, breach, damage, anti-social behaviour, sale, occupation, or another ground that fits the evidence.',
  },
  {
    title: 'Choose Section 8 grounds',
    body:
      'The generator route helps keep the selected grounds tied to the facts you enter, so Form 3A explains why those grounds are being relied on.',
  },
  {
    title: 'Calculate dates and service',
    body:
      'Check the notice period, service method, deemed service position, and earliest court-paper date before anything goes to the tenant.',
  },
  {
    title: 'Prepare the notice and service file',
    body:
      'Create the notice-stage file, including Form 3A, service instructions, proof-of-service prompts, and the evidence reminders needed if the case moves on.',
  },
];

function RouteCard({
  title,
  body,
  href,
  label,
  primary = false,
}: {
  title: string;
  body: string;
  href: string;
  label: string;
  primary?: boolean;
}) {
  return (
    <article className="rounded-3xl border border-[#e6dbff] bg-white p-6 shadow-[0_18px_46px_rgba(24,11,49,0.07)]">
      <h2 className="text-2xl font-bold text-[#20143c]">{title}</h2>
      <p className="mt-3 leading-7 text-slate-700">{body}</p>
      <Link
        href={href}
        className={`mt-5 inline-flex rounded-lg px-5 py-3 font-semibold ${
          primary
            ? 'bg-primary text-white hover:bg-primary-dark'
            : 'border border-[#e6dbff] bg-[#fcfaff] text-primary hover:bg-white'
        }`}
      >
        {label}
      </Link>
    </article>
  );
}

export default function Section8NoticeGeneratorPage() {
  return (
    <div className="min-h-screen bg-[#fcfaff]">
      <SeoLandingWrapper
        pagePath={path}
        pageTitle="Section 8 Notice Generator"
        pageType="notice"
        jurisdiction="england"
      />
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={articleSchema({
          headline: 'Section 8 Notice Generator for England Landlords',
          description:
            'A guided Section 8 notice generator page for England landlords preparing Form 3A, grounds, dates, service records, and next-step paperwork.',
          url: canonical,
          datePublished: '2026-05-28',
          dateModified: '2026-05-28',
        })}
      />
      <StructuredData data={softwareApplicationSchema()} />
      <StructuredData
        data={howToSchema({
          name: 'How to use the Section 8 notice generator',
          description:
            'Check the Section 8 route, choose grounds, calculate dates, and prepare the Form 3A notice file before service.',
          url: canonical,
          steps: steps.map((step) => ({ name: step.title, text: step.body })),
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Eviction guides', url: 'https://landlordheaven.co.uk/eviction-guides' },
          { name: 'Section 8 Notice', url: 'https://landlordheaven.co.uk/section-8-notice' },
          { name: 'Section 8 Notice Generator', url: canonical },
        ])}
      />

      <UniversalHero
        title="Section 8 notice generator for England landlords"
        subtitle="Prepare the current Form 3A Section 8 notice route with the grounds, dates, service record, and evidence prompts kept together before you serve."
        showReviewPill
        showTrustPositioningBar
        hideMedia
        primaryCta={{ label: 'Create my Section 8 notice', href: '/products/notice-only' }}
        secondaryCta={{ label: 'Check dates first', href: '/tools/section-8-notice-date-calculator' }}
      >
        <ul className="mt-6 space-y-2 text-sm text-white/90 md:text-base">
          <li>Built for England landlords using the current Form 3A route.</li>
          <li>Helps connect grounds, dates, service, and evidence before the notice is served.</li>
          <li>Routes you into Notice Only or the Complete Pack depending on what happens next.</li>
        </ul>
      </UniversalHero>

      <section className="border-b border-[#e6dbff] bg-white py-10">
        <Container>
          <div className="mx-auto max-w-5xl rounded-3xl border border-[#cab6ff] bg-[#f8f4ff] p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Quick answer
            </p>
            <h2 className="mt-3 text-3xl font-bold text-[#20143c]">
              Use a generator when you need more than a blank Section 8 template
            </h2>
            <p className="mt-4 leading-8 text-slate-700">
              A Section 8 notice generator should help you turn landlord facts into a usable
              notice-stage file. That means the selected grounds, explanation, notice period,
              service method, N215/service record, and evidence prompts should all point in the
              same direction. If the tenant does not leave, that same file should be ready to
              support the next possession step.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-[#fcfaff] py-12">
        <Container>
          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-3xl border border-[#e6dbff] bg-white p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                How it works
              </p>
              <h2 className="mt-3 text-3xl font-bold text-[#20143c]">
                From landlord problem to notice file
              </h2>
              <div className="mt-6 space-y-4">
                {steps.map((step, index) => (
                  <div key={step.title} className="rounded-2xl border border-[#eadfff] bg-[#fcfaff] p-5">
                    <p className="text-sm font-semibold text-primary">Step {index + 1}</p>
                    <h3 className="mt-2 text-xl font-semibold text-[#20143c]">{step.title}</h3>
                    <p className="mt-2 leading-7 text-slate-700">{step.body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <RouteCard
                title="Not served the notice yet?"
                body="Use Notice Only when the immediate job is preparing the Section 8 notice, grounds, date checks, service instructions, and notice-stage file before anything goes to the tenant."
                href="/products/notice-only"
                label="Create my Section 8 notice"
                primary
              />
              <RouteCard
                title="Need the court stage as well?"
                body="Use Complete Pack if the case is already likely to move into possession paperwork, or if you want the notice, N5, N119, witness evidence, and filing guide joined up from the start."
                href="/products/complete-pack"
                label="Prepare my court pack"
              />
              <RouteCard
                title="Still checking the timing?"
                body="Use the free date calculator first if you want to test the likely notice period, deemed service date, and earliest court-paper date before generating the pack."
                href="/tools/section-8-notice-date-calculator"
                label="Calculate Section 8 dates"
              />
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-12">
        <Container>
          <div className="mx-auto max-w-5xl space-y-6">
            <article className="rounded-3xl border border-[#e6dbff] bg-white p-6 md:p-8">
              <h2 className="text-3xl font-bold text-[#20143c]">
                What the generator should help protect
              </h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {[
                  'Wrong or unsupported grounds',
                  'Notice periods calculated from the wrong date',
                  'Weak 4.3 factual explanation on Form 3A',
                  'No clear proof of service',
                  'Arrears figures that do not match the rent record',
                  'Notice wording that does not line up with later court papers',
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-[#eadfff] bg-[#fcfaff] p-4 text-sm font-semibold text-[#2a2161]">
                    {item}
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-3xl border border-[#cab6ff] bg-[#f8f4ff] p-6 md:p-8">
              <h2 className="text-3xl font-bold text-[#20143c]">
                Read the full Section 8 notice guide
              </h2>
              <p className="mt-4 leading-8 text-slate-700">
                If you want the broader explanation of Form 3A, Section 8 grounds, notice periods,
                evidence, service, and what happens after the notice expires, use the main Section
                8 notice guide as the pillar page.
              </p>
              <Link
                href="/section-8-notice"
                className="mt-5 inline-flex rounded-lg border border-[#e6dbff] bg-white px-5 py-3 font-semibold text-primary hover:bg-[#fcfaff]"
              >
                Read the Section 8 notice guide
              </Link>
            </article>
          </div>
        </Container>
      </section>

      <FAQSection faqs={faqs} title="Section 8 notice generator FAQs" />
    </div>
  );
}
