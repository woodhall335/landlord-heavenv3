import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { Container } from '@/components/ui/Container';
import { FAQSection, type FAQItem } from '@/components/seo/FAQSection';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { StructuredData, articleSchema, breadcrumbSchema, faqPageSchema } from '@/lib/seo/structured-data';

export interface PillarComparisonRow {
  factor: string;
  routeA: string;
  routeB: string;
  routeC: string;
}

export interface PillarSection {
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface PillarPageContent {
  slug: string;
  title: string;
  description: string;
  heroTitle: string;
  heroSubtitle: string;
  icon: string;
  heroBullets: string[];
  quickAnswer: string[];
  routeExplanation: string[];
  processSteps: Array<{ title: string; detail: string }>;
  checklists: Array<{ title: string; items: string[] }>;
  comparisonTable: PillarComparisonRow[];
  decisionGuide: Array<{ question: string; recommendation: string }>;
  sections: PillarSection[];
  supportingLinks: Array<{ label: string; href: string }>;
  toolLinks: Array<{ label: string; href: string }>;
  productLink: { label: string; href: string };
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  faqs: FAQItem[];
}

export function PillarPageShell(content: PillarPageContent) {
  const canonical = `https://landlordheaven.co.uk/${content.slug}`;

  return (
    <div className="min-h-screen bg-[#fcfaff]">
      <SeoLandingWrapper pagePath={`/${content.slug}`} pageTitle={content.title} pageType="guide" jurisdiction="england" />
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData data={articleSchema({ headline: content.title, description: content.description, url: canonical, datePublished: '2026-03-11', dateModified: '2026-03-11' })} />
      <StructuredData data={faqPageSchema(content.faqs.filter((f): f is {question: string; answer: string} => typeof f.answer === 'string'))} />
      <StructuredData data={breadcrumbSchema([{ name: 'Home', url: 'https://landlordheaven.co.uk' }, { name: 'Eviction guides', url: 'https://landlordheaven.co.uk/eviction-guides' }, { name: content.heroTitle, url: canonical }])} />

      <UniversalHero
        title={content.heroTitle}
        subtitle={content.heroSubtitle}
        primaryCta={content.primaryCta}
        secondaryCta={content.secondaryCta}
        mediaSrc={content.icon}
        mediaAlt={`${content.heroTitle} icon`}
        showReviewPill
        showTrustPositioningBar
      >
        <ul className="mt-6 space-y-2 text-sm text-white/90 md:text-base">
          {content.heroBullets.map((bullet) => <li key={bullet}>✓ {bullet}</li>)}
        </ul>
      </UniversalHero>

      <section className="py-10 bg-white border-b border-[#E6DBFF]">
        <Container>
          <div className="mx-auto max-w-5xl rounded-2xl border border-[#E6DBFF] bg-[#F8F4FF] p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-[#2a2161]">Quick answer</h2>
            <div className="mt-4 space-y-4 text-gray-700 leading-7">
              {content.quickAnswer.map((paragraph) => <p key={paragraph.slice(0, 40)}>{paragraph}</p>)}
            </div>
          </div>
        </Container>
      </section>

      <section className="py-12 bg-white">
        <Container>
          <div className="mx-auto max-w-5xl space-y-8">
            <article className="rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-[#2a2161]">Eviction route explanation</h2>
              <div className="mt-4 space-y-4 text-gray-700 leading-7">
                {content.routeExplanation.map((paragraph) => <p key={paragraph.slice(0, 40)}>{paragraph}</p>)}
              </div>
            </article>

            <article className="rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-[#2a2161]">Process steps</h2>
              <ol className="mt-4 space-y-4">
                {content.processSteps.map((step, index) => (
                  <li key={step.title} className="rounded-xl border border-[#E6DBFF] bg-white p-4">
                    <h3 className="font-semibold text-[#2a2161]">Step {index + 1}: {step.title}</h3>
                    <p className="mt-2 text-gray-700 leading-7">{step.detail}</p>
                  </li>
                ))}
              </ol>
            </article>

            <article className="rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-[#2a2161]">Comparison table: selecting the right route</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-[#F2EAFF]">
                      <th className="border border-[#E6DBFF] p-3 font-semibold text-[#2a2161]">Decision factor</th>
                      <th className="border border-[#E6DBFF] p-3 font-semibold text-[#2a2161]">Section 21</th>
                      <th className="border border-[#E6DBFF] p-3 font-semibold text-[#2a2161]">Section 8</th>
                      <th className="border border-[#E6DBFF] p-3 font-semibold text-[#2a2161]">Court / enforcement focus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {content.comparisonTable.map((row) => (
                      <tr key={row.factor} className="bg-white even:bg-[#FCFAFF]">
                        <td className="border border-[#E6DBFF] p-3 text-gray-700">{row.factor}</td>
                        <td className="border border-[#E6DBFF] p-3 text-gray-700">{row.routeA}</td>
                        <td className="border border-[#E6DBFF] p-3 text-gray-700">{row.routeB}</td>
                        <td className="border border-[#E6DBFF] p-3 text-gray-700">{row.routeC}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-[#2a2161]">Decision guide</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {content.decisionGuide.map((item) => (
                  <div key={item.question} className="rounded-xl border border-[#E6DBFF] bg-white p-4">
                    <h3 className="font-semibold text-[#2a2161]">{item.question}</h3>
                    <p className="mt-2 text-gray-700 leading-7">{item.recommendation}</p>
                  </div>
                ))}
              </div>
            </article>

            {content.sections.map((section) => (
              <article key={section.title} className="rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-6 md:p-8">
                <h2 className="text-2xl font-semibold text-[#2a2161]">{section.title}</h2>
                <div className="mt-4 space-y-4 text-gray-700 leading-7">
                  {section.paragraphs.map((paragraph) => <p key={paragraph.slice(0, 48)}>{paragraph}</p>)}
                </div>
                {section.bullets ? (
                  <ul className="mt-5 list-disc space-y-2 pl-5 text-gray-700">
                    {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                  </ul>
                ) : null}
              </article>
            ))}

            <article className="rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-[#2a2161]">Landlord checklists</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {content.checklists.map((checklist) => (
                  <div key={checklist.title} className="rounded-xl border border-[#E6DBFF] bg-white p-4">
                    <h3 className="font-semibold text-[#2a2161]">{checklist.title}</h3>
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-gray-700">
                      {checklist.items.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </Container>
      </section>

      <section className="py-12">
        <Container>
          <div className="mx-auto max-w-5xl rounded-2xl border border-[#E6DBFF] bg-white p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-[#2a2161]">Core supporting pages</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {content.supportingLinks.map((link) => (
                <Link key={link.href} href={link.href} className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]">
                  {link.label}
                </Link>
              ))}
            </div>
            <h3 className="mt-8 text-xl font-semibold text-[#2a2161]">Tools and product actions</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {content.toolLinks.map((link) => (
                <Link key={link.href} href={link.href} className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]">
                  {link.label}
                </Link>
              ))}
              <Link href={content.productLink.href} className="rounded-lg border border-[#CAB6FF] bg-[#F8F4FF] px-4 py-3 text-primary font-semibold hover:bg-[#F2EAFF]">
                {content.productLink.label}
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <FAQSection faqs={content.faqs} title={`${content.heroTitle} FAQs`} includeSchema={false} />
    </div>
  );
}
