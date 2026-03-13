import type { Metadata } from 'next';
import type { ReactNode } from 'react';
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
  faqPageSchema,
} from '@/lib/seo/structured-data';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';

const canonical = 'https://landlordheaven.co.uk/serve-section-8-notice';

const section8WizardLink = buildWizardLink({
  product: 'notice_only',
  jurisdiction: 'england',
  src: 'seo_serve_section_8_notice',
  topic: 'eviction',
});

export const metadata: Metadata = {
  title:
    'How to Serve a Section 8 Notice | Grounds-Based Eviction Guide for Landlords',
  description:
    'Practical landlord guide to serving a Section 8 notice in England. Learn eviction grounds, notice periods, how service works, evidence requirements, and common mistakes that delay possession claims.',
  alternates: { canonical },
  openGraph: {
    title:
      'How to Serve a Section 8 Notice | Grounds-Based Eviction Guide for Landlords',
    description:
      'Guide to serving a Section 8 notice correctly including grounds, service evidence, and possession workflow.',
    url: canonical,
    siteName: 'LandlordHeaven',
    type: 'article',
  },
};

const jumpLinks = [
  { href: '#quick-answer', label: 'Quick answer' },
  { href: '#what-a-section-8-notice-is', label: 'What a Section 8 notice is' },
  { href: '#section-8-grounds', label: 'Section 8 grounds explained' },
  { href: '#before-serving', label: 'Before serving the notice' },
  { href: '#how-service-works', label: 'How Section 8 service works' },
  { href: '#evidence-for-section-8', label: 'Evidence landlords should prepare' },
  { href: '#common-mistakes', label: 'Common Section 8 mistakes' },
  { href: '#timeline-after-service', label: 'Timeline after service' },
  { href: '#section-8-checklist', label: 'Section 8 checklist' },
  { href: '#faqs', label: 'FAQs' },
  { href: '#next-steps', label: 'Next steps' },
] as const;

const faqs: FAQItem[] = [
  {
    question: 'What is a Section 8 notice?',
    answer:
      'A Section 8 notice is a grounds-based eviction notice used by landlords in England when a tenant has breached the tenancy agreement, such as through rent arrears or other tenancy breaches.',
  },
  {
    question: 'When should landlords use Section 8 instead of Section 21?',
    answer:
      'Section 8 is usually used when the landlord is relying on a specific legal ground such as rent arrears, anti-social behaviour, or damage to the property.',
  },
  {
    question: 'What grounds are most commonly used?',
    answer:
      'Ground 8, 10, and 11 are commonly used in rent arrears cases. Ground 8 is mandatory if the arrears threshold is met.',
  },
  {
    question: 'Can a Section 8 notice fail?',
    answer:
      'Yes. Incorrect grounds, weak evidence, incorrect notice periods, or poor service evidence can all cause delays or failure in court.',
  },
];

function Card({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <article
      id={id}
      className="scroll-mt-24 rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-6 md:p-8"
    >
      <h2 className="text-2xl font-semibold text-[#2a2161]">{title}</h2>
      {children}
    </article>
  );
}

export default function Page() {
  return (
    <div className="min-h-screen bg-[#fcfaff]">
      <SeoLandingWrapper
        pagePath="/serve-section-8-notice"
        pageTitle={metadata.title as string}
        pageType="guide"
        jurisdiction="england"
      />

      <HeaderConfig mode="autoOnScroll" />

      <StructuredData
        data={articleSchema({
          headline: 'How to Serve a Section 8 Notice',
          description:
            metadata.description ??
            'Practical landlord guide to serving a Section 8 notice in England.',
          url: canonical,
          datePublished: '2026-03-01',
          dateModified: '2026-03-13',
        })}
      />

      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Serve Section 8 Notice', url: canonical },
        ])}
      />

      <StructuredData data={faqPageSchema(faqs)} />

      <UniversalHero
        title="How to Serve a Section 8 Notice"
        subtitle="A landlord guide to using Section 8 eviction grounds correctly, serving the notice properly, and preparing the evidence needed for court."
        primaryCta={{
          label: 'Start Section 8 Wizard',
          href: section8WizardLink,
        }}
        mediaSrc="/images/wizard-icons/14-section-8.png"
        mediaAlt="Section 8 notice guide"
        showTrustPositioningBar
      />

      <section className="border-b border-[#E6DBFF] bg-white py-8">
        <Container>
          <nav className="mx-auto max-w-5xl rounded-2xl border border-[#E6DBFF] bg-white p-6">
            <h2 className="text-2xl font-semibold text-[#2a2161]">
              In This Guide
            </h2>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {jumpLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </nav>
        </Container>
      </section>

      <section className="bg-white py-12">
        <Container>
          <div className="mx-auto max-w-5xl space-y-10">

            <Card id="quick-answer" title="Quick Answer">
              <p className="mt-4 leading-7 text-gray-700">
                A Section 8 notice is the legal eviction notice landlords use when a tenant
                has breached the tenancy agreement. Unlike Section 21, it relies on
                specific statutory grounds such as rent arrears, property damage, or
                anti-social behaviour.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                Serving the notice correctly is only one part of the process. Landlords
                must also choose the correct grounds, use the correct notice period, and
                preserve clear evidence supporting the claim. Most Section 8 problems arise
                not from the notice itself but from weak preparation before service.
              </p>
            </Card>

            <Card id="what-a-section-8-notice-is" title="What a Section 8 Notice Is">
              <p className="mt-4 leading-7 text-gray-700">
                Section 8 of the Housing Act 1988 allows landlords to seek possession of
                their property when tenants breach the tenancy agreement. Instead of a
                no-fault route, the landlord must rely on specific legal grounds.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                These grounds include rent arrears, property damage, anti-social behaviour,
                and other tenancy breaches. The notice formally informs the tenant that the
                landlord intends to seek possession through the court if the issue is not
                resolved.
              </p>
            </Card>

            <Card id="section-8-grounds" title="Section 8 Grounds Explained">
              <p className="mt-4 leading-7 text-gray-700">
                Section 8 includes multiple statutory eviction grounds. Some are mandatory
                grounds, meaning the court must grant possession if the ground is proven.
                Others are discretionary grounds where the judge decides based on the
                circumstances.
              </p>

              <ul className="mt-4 list-disc pl-5 text-gray-700 space-y-2">
                <li><strong>Ground 8:</strong> Serious rent arrears</li>
                <li><strong>Ground 10:</strong> Some rent arrears</li>
                <li><strong>Ground 11:</strong> Persistent late payment</li>
              </ul>

              <p className="mt-4 leading-7 text-gray-700">
                Choosing the right grounds is critical because the possession claim will
                rely on those grounds later in court.
              </p>
            </Card>

            <Card id="before-serving" title="Before Serving the Notice">
              <p className="mt-4 leading-7 text-gray-700">
                Before serving a Section 8 notice, landlords should ensure the grounds are
                supported by evidence. For example, rent arrears claims require a clear
                arrears schedule showing missed payments and the current balance.
              </p>

              <ul className="mt-4 list-disc pl-5 text-gray-700 space-y-2">
                <li>Confirm the correct eviction grounds</li>
                <li>Check the notice period</li>
                <li>Prepare evidence</li>
                <li>Use the correct prescribed form</li>
              </ul>
            </Card>

            <Card id="how-service-works" title="How Section 8 Service Works">
              <p className="mt-4 leading-7 text-gray-700">
                Service usually follows the tenancy agreement service clauses or accepted
                legal methods such as personal delivery or post. The key goal is ensuring
                the landlord can prove when and how the notice was served.
              </p>
            </Card>

            <Card id="evidence-for-section-8" title="Evidence Landlords Should Prepare">
              <p className="mt-4 leading-7 text-gray-700">
                Section 8 claims often succeed or fail based on evidence. Courts will
                review whether the alleged breach actually occurred and whether the
                landlord can prove it clearly.
              </p>

              <ul className="mt-4 list-disc pl-5 text-gray-700 space-y-2">
                <li>Rent arrears schedules</li>
                <li>Payment records</li>
                <li>Communication with the tenant</li>
                <li>Tenancy agreement</li>
              </ul>
            </Card>

            <Card id="common-mistakes" title="Common Section 8 Mistakes">
              <ul className="mt-4 list-disc pl-5 text-gray-700 space-y-2">
                <li>Using the wrong eviction ground</li>
                <li>Incorrect notice period</li>
                <li>Weak evidence</li>
                <li>Poor proof of service</li>
              </ul>
            </Card>

            <Card id="timeline-after-service" title="Timeline After Service">
              <p className="mt-4 leading-7 text-gray-700">
                After the notice is served, the tenant has the notice period to remedy the
                breach or leave the property. If the issue is not resolved, the landlord
                may proceed to the court possession stage.
              </p>
            </Card>

            <Card id="section-8-checklist" title="Section 8 Checklist">
              <ul className="mt-4 list-disc pl-5 text-gray-700 space-y-2">
                <li>Confirm the correct grounds</li>
                <li>Prepare supporting evidence</li>
                <li>Complete the prescribed notice form</li>
                <li>Serve the notice with proof</li>
                <li>Track the notice period</li>
              </ul>
            </Card>

          </div>
        </Container>
      </section>

      <section id="faqs" className="py-2">
        <FAQSection faqs={faqs} title="Serve Section 8 Notice FAQs" />
      </section>

      <section id="next-steps" className="bg-white pb-14 pt-6">
        <Container>
          <div className="mx-auto max-w-5xl rounded-2xl border border-[#E6DBFF] bg-[#F8F4FF] p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-[#2a2161]">
              Next Steps
            </h2>

            <p className="mt-4 leading-7 text-gray-700">
              If you need to start a Section 8 eviction process, the safest approach is
              usually preparing the notice and evidence together rather than treating the
              notice as a standalone step.
            </p>

            <div className="mt-6">
              <Link
                href={section8WizardLink}
                className="rounded-lg bg-primary px-5 py-3 text-white"
              >
                Start Section 8 Wizard
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}