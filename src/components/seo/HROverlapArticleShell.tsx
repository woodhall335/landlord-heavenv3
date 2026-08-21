import Link from 'next/link';
import type { ReactNode } from 'react';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { Container } from '@/components/ui/Container';
import { FAQSection, type FAQItem } from '@/components/seo/FAQSection';
import { StructuredData, articleSchema, breadcrumbSchema, faqPageSchema } from '@/lib/seo/structured-data';
import { UniversalHero } from '@/components/landing/UniversalHero';

export type HROverlapSection = {
  heading: string;
  body: ReactNode;
};

export type HROverlapRelatedResource = {
  href: string;
  label: string;
  description: string;
};

export type HROverlapArticleShellProps = {
  canonical: string;
  title: string;
  description: string;
  eyebrow: string;
  intro: ReactNode;
  sections: HROverlapSection[];
  faqs: FAQItem[];
  readingTime: string;
  relatedResources: HROverlapRelatedResource[];
  conclusion: ReactNode;
  disclaimer?: ReactNode;
  assistedPrepCta?: ReactNode;
  primaryCta?: {
    href: string;
    label: string;
  };
  secondaryCta?: {
    href: string;
    label: string;
  };
};

export function HROverlapArticleShell({
  canonical,
  title,
  description,
  eyebrow,
  intro,
  sections,
  faqs,
  readingTime,
  relatedResources,
  conclusion,
  disclaimer,
  assistedPrepCta,
  primaryCta,
  secondaryCta,
}: HROverlapArticleShellProps) {
  return (
    <>
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: title, url: canonical },
        ])}
      />
      <StructuredData
        data={articleSchema({
          headline: title,
          description,
          url: canonical,
          datePublished: '2026-06-25',
          dateModified: '2026-06-25',
        })}
      />
      <StructuredData data={faqPageSchema(faqs)} />

      <main className="bg-[#fbf9ff] text-[#20143b]">
        <UniversalHero
          preset="content_index"
          preTitleLabel={eyebrow}
          title={title}
          subtitle={intro}
          primaryCta={primaryCta}
          secondaryCta={secondaryCta ?? { label: 'Read the guide', href: '#guide-content' }}
          trustText="Practical landlord guidance reviewed for the current England route"
        >
          <dl className="mt-6 grid max-w-3xl grid-cols-2 gap-2 text-xs text-[#443a59] sm:grid-cols-4 sm:text-sm">
            <div className="rounded-xl border border-[#e5ddf7] bg-white/88 px-3 py-2"><dt className="font-semibold text-[#21153d]">Author</dt><dd>Editorial team</dd></div>
            <div className="rounded-xl border border-[#e5ddf7] bg-white/88 px-3 py-2"><dt className="font-semibold text-[#21153d]">Reviewed</dt><dd>25 June 2026</dd></div>
            <div className="rounded-xl border border-[#e5ddf7] bg-white/88 px-3 py-2"><dt className="font-semibold text-[#21153d]">Updated</dt><dd>25 June 2026</dd></div>
            <div className="rounded-xl border border-[#e5ddf7] bg-white/88 px-3 py-2"><dt className="font-semibold text-[#21153d]">Reading time</dt><dd>{readingTime}</dd></div>
          </dl>
        </UniversalHero>

        {assistedPrepCta ? (
          <section className="border-b border-[#e8ddff] bg-white py-8">
            <Container>{assistedPrepCta}</Container>
          </section>
        ) : null}
        <Container id="guide-content" className="scroll-mt-28 py-12">
          <article className="mx-auto max-w-4xl rounded-[1.5rem] border border-[#e8ddff] bg-white p-6 shadow-sm md:p-10">
            <div className="space-y-10 text-base leading-8 text-[#4d4365]">
              {sections.map((section) => (
                <section key={section.heading}>
                  <h2 className="text-2xl font-bold tracking-tight text-[#20143b]">{section.heading}</h2>
                  <div className="mt-4 space-y-5 [&_a]:font-semibold [&_a]:text-[#6d28d9] [&_a]:underline-offset-4 [&_a:hover]:underline [&_li]:mb-2 [&_ul]:ml-5 [&_ul]:list-disc">
                    {section.body}
                  </div>
                </section>
              ))}
              <section>
                <h2 className="text-2xl font-bold tracking-tight text-[#20143b]">
                  How to use this guide alongside your landlord file
                </h2>
                <div className="mt-4 space-y-5">
                  <p>
                    Treat this guide as an operational checklist, not as a substitute for the documents that sit in the
                    landlord or employment file. The safest approach is to keep a clean line between three records: the
                    property file, the tenant-facing document file, and the staff or business operations file. The property
                    file records what happened at the address. The tenant-facing document file records the tenancy, notices,
                    service steps, rent records, evidence, and court documents. The staff file records who was authorised to
                    do work for the business, what they were allowed to decide, and how they were expected to keep records.
                  </p>
                  <p>
                    When those records agree with each other, the landlord can explain the situation calmly. When they do
                    not agree, even a straightforward case can become harder to present. For example, a property manager's
                    note may say one thing, a tenant email may say another, and the formal notice may say a third. That is
                    why the best time to improve paperwork is before a dispute turns urgent. Set up the file so a person
                    who has never seen the property can read the documents and understand who did what, when it happened,
                    what was said, and which document supports the point.
                  </p>
                  <p>
                    Use plain labels. Avoid storing evidence under vague folder names such as "miscellaneous" or "old
                    messages". Use headings like tenancy agreement, rent record, repair log, inspection photographs,
                    correspondence, notice, proof of service, employment documents, authority record, and handover notes.
                    Where a document is important, make sure it has a date, a clear title, and enough context for someone
                    else to understand why it matters. If a document is missing, record that honestly and explain what other
                    evidence is available.
                  </p>
                  <p>
                    Finally, check the file before anyone acts. If the next step is a tenancy agreement, make sure the
                    landlord, tenant, property, rent, deposit, and occupier facts are correct. If the next step is a notice,
                    make sure the ground, facts, notice period, service method, and evidence match. If the next step is a
                    claim, make sure the documents tell one consistent story. Good administration does not remove every
                    risk, but it makes the landlord's position easier to understand and much easier to evidence.
                  </p>
                </div>
              </section>
              <section>
                <h2 className="text-2xl font-bold tracking-tight text-[#20143b]">Related Landlord Heaven guides</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {relatedResources.map((resource) => (
                    <Link
                      key={resource.href}
                      href={resource.href}
                      className="rounded-2xl border border-[#e8ddff] bg-[#fbf9ff] p-5 transition hover:border-[#c7b6ff] hover:bg-[#f5f0ff]"
                    >
                      <span className="text-base font-bold text-[#2b1952]">{resource.label}</span>
                      <span className="mt-2 block text-sm leading-6 text-[#625579]">{resource.description}</span>
                    </Link>
                  ))}
                </div>
              </section>
              <section>
                <h2 className="text-2xl font-bold tracking-tight text-[#20143b]">Conclusion</h2>
                <div className="mt-4 space-y-5">{conclusion}</div>
              </section>
              <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
                <h2 className="text-base font-bold text-amber-950">Important note</h2>
                <div className="mt-2">
                  {disclaimer ?? (
                    <p>
                      This guide is general information for landlords and property businesses in England. It is not legal
                      advice, employment advice, or a guarantee of outcome. Check the facts of your own property, tenancy,
                      documents, and staff arrangements before acting.
                    </p>
                  )}
                </div>
              </section>
            </div>
          </article>
          <div className="mx-auto mt-10 max-w-4xl">
            <FAQSection faqs={faqs} includeSchema={false} showContactCTA={false} />
          </div>
        </Container>
      </main>
    </>
  );
}
