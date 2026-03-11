import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { Container } from '@/components/ui/Container';
import { FAQSection, type FAQItem } from '@/components/seo/FAQSection';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { StructuredData, articleSchema, breadcrumbSchema, faqPageSchema } from '@/lib/seo/structured-data';
import { EVICTION_ENTITIES, getAuthorityLinks } from '@/lib/seo/eviction-authority';

export interface IntentSection {
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

interface HighIntentPageShellProps {
  slug: string;
  title: string;
  description: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBullets: string[];
  icon: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  sections: IntentSection[];
  relatedLinks: Array<{ label: string; href: string }>;
  faqs: FAQItem[];
}

export function HighIntentPageShell(props: HighIntentPageShellProps) {
  const canonical = `https://landlordheaven.co.uk/${props.slug}`;
  const authorityLinks = getAuthorityLinks(props.slug);

  return (
    <div className="min-h-screen bg-[#fcfaff]">
      <SeoLandingWrapper pagePath={`/${props.slug}`} pageTitle={props.title} pageType="guide" jurisdiction="england" />
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData data={articleSchema({ headline: props.title, description: props.description, url: canonical, datePublished: '2026-03-01', dateModified: '2026-03-01' })} />
      <StructuredData data={faqPageSchema(props.faqs.filter((f): f is {question: string; answer: string} => typeof f.answer === 'string'))} />
      <StructuredData data={breadcrumbSchema([{ name: 'Home', url: 'https://landlordheaven.co.uk' }, { name: 'Eviction guides', url: 'https://landlordheaven.co.uk/eviction-guides' }, { name: props.heroTitle, url: canonical }])} />

      <UniversalHero
        title={props.heroTitle}
        subtitle={props.heroSubtitle}
        primaryCta={props.primaryCta}
        secondaryCta={props.secondaryCta}
        mediaSrc={props.icon}
        mediaAlt={`${props.heroTitle} icon`}
        showReviewPill
        showTrustPositioningBar
      >
        <ul className="mt-6 space-y-2 text-sm text-white/90 md:text-base">
          {props.heroBullets.map((bullet) => <li key={bullet}>✓ {bullet}</li>)}
        </ul>
      </UniversalHero>

      <section className="py-12 bg-white">
        <Container>
          <div className="mx-auto max-w-5xl space-y-10">
            {props.sections.map((section) => (
              <article key={section.title} className="rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-6 md:p-8">
                <h2 className="text-2xl font-semibold text-[#2a2161]">{section.title}</h2>
                <div className="mt-4 space-y-4 text-gray-700 leading-7">
                  {section.paragraphs.map((paragraph) => <p key={paragraph.slice(0, 36)}>{paragraph}</p>)}
                </div>
                {section.bullets ? (
                  <ul className="mt-5 list-disc space-y-2 pl-5 text-gray-700">
                    {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
        </Container>
      </section>


      {authorityLinks ? (
        <section className="py-10 bg-white border-y border-[#E6DBFF]">
          <Container>
            <div className="mx-auto max-w-5xl rounded-2xl border border-[#E6DBFF] bg-[#F8F4FF] p-6">
              <h2 className="text-2xl font-semibold text-[#2a2161]">Eviction process quick actions</h2>
              <p className="mt-3 text-gray-700">Move from notice to possession claim with stronger internal pathways: canonical parent, supporting pages, tool support, and product action.</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2 text-sm">
                <Link href={authorityLinks.parent} className="rounded-lg border border-[#E6DBFF] bg-white px-4 py-3 text-primary hover:bg-[#F8F4FF]">Canonical parent: {authorityLinks.parent}</Link>
                {authorityLinks.supporting.map((href) => <Link key={href} href={href} className="rounded-lg border border-[#E6DBFF] bg-white px-4 py-3 text-primary hover:bg-[#F8F4FF]">Supporting page: {href}</Link>)}
                <Link href={authorityLinks.tool} className="rounded-lg border border-[#E6DBFF] bg-white px-4 py-3 text-primary hover:bg-[#F8F4FF]">Tool page: {authorityLinks.tool}</Link>
                <Link href={authorityLinks.product} className="rounded-lg border border-[#E6DBFF] bg-white px-4 py-3 text-primary hover:bg-[#F8F4FF]">Product page: {authorityLinks.product}</Link>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-[#2a2161]">Core entities reinforced</h3>
              <div className="mt-3 grid gap-2 md:grid-cols-3 text-sm text-gray-700">
                {EVICTION_ENTITIES.map((entity) => <p key={entity} className="rounded-lg border border-[#E6DBFF] bg-white px-3 py-2">{entity}</p>)}
              </div>
            </div>
          </Container>
        </section>
      ) : null}

      <section className="py-12">
        <Container>
          <div className="mx-auto max-w-5xl rounded-2xl border border-[#E6DBFF] bg-white p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-[#2a2161]">Related guides and next steps</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {props.relatedLinks.map((link) => (
                <Link key={link.href} href={link.href} className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <FAQSection faqs={props.faqs} title={`${props.heroTitle} FAQs`} />
    </div>
  );
}
