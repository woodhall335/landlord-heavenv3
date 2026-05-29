import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { Container } from '@/components/ui/Container';
import { FAQSection, type FAQItem } from '@/components/seo/FAQSection';
import { SeoPageContextPanel } from '@/components/seo/SeoPageContextPanel';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { StructuredData, articleSchema, breadcrumbSchema } from '@/lib/seo/structured-data';
import {
  EVICTION_ENTITIES,
  formatAuthorityLinkLabel,
  getAuthorityLinks,
} from '@/lib/seo/eviction-authority';
import { CommercialSeoNextStep } from '@/components/seo/CommercialSeoNextStep';
import { Reveal, StaggerReveal } from '@/components/marketing/PremiumMotion';

export interface IntentSection {
  title: string;
  paragraphs: ReactNode[];
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
  diagrams?: Array<{ title: string; description: string; imageSrc: string; imageAlt: string }>;
}

function buildHowToSchema(props: HighIntentPageShellProps, canonical: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `${props.heroTitle}: step-by-step landlord guide`,
    description: props.description,
    url: canonical,
    step: [
      { '@type': 'HowToStep', name: 'Check the tenancy facts and what has gone wrong' },
      { '@type': 'HowToStep', name: 'Serve the right notice and keep proof of service' },
      { '@type': 'HowToStep', name: 'Track deadlines and keep your evidence in order' },
      { '@type': 'HowToStep', name: 'Prepare the court papers if the tenant does not comply' },
      { '@type': 'HowToStep', name: 'Move to enforcement if possession is still refused' },
    ],
  };
}

export function HighIntentPageShell(props: HighIntentPageShellProps) {
  const canonical = `https://landlordheaven.co.uk/${props.slug}`;
  const authorityLinks = getAuthorityLinks(props.slug);
  const howToSchema = buildHowToSchema(props, canonical);

  return (
    <div className="min-h-screen bg-[#fcfaff]">
      <SeoLandingWrapper
        pagePath={`/${props.slug}`}
        pageTitle={props.title}
        pageType="guide"
        jurisdiction="england"
      />
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={articleSchema({
          headline: props.title,
          description: props.description,
          url: canonical,
          datePublished: '2026-03-01',
          dateModified: '2026-03-01',
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Eviction guides', url: 'https://landlordheaven.co.uk/eviction-guides' },
          { name: props.heroTitle, url: canonical },
        ])}
      />
      <StructuredData data={howToSchema} />

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
          {props.heroBullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-white/90"
              />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </UniversalHero>

      <section className="border-b border-[#E6DBFF] bg-[linear-gradient(180deg,#ffffff_0%,#fbf7ff_100%)] py-10">
        <Container>
          <Reveal className="mx-auto max-w-5xl rounded-[1.75rem] border border-[#E6DBFF] bg-[#F8F4FF] p-6 shadow-[0_22px_60px_rgba(91,33,182,0.10)] md:p-8">
            <h2 className="text-2xl font-semibold text-[#2a2161]">Start here</h2>
            <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-primary">
              Question
            </p>
            <p className="mt-1 text-lg font-semibold text-[#2a2161]">
              {`If you are dealing with ${props.heroTitle.toLowerCase()}, what should you do first?`}
            </p>
            <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-primary">
              Short answer
            </p>
            <p className="mt-1 text-gray-700">
              Start by checking the tenancy facts, serving the right notice, and keeping your dates
              and evidence straight before you file anything. That usually saves the most time later,
              because it cuts down avoidable mistakes and makes the court stage much easier if the
              tenant still does not comply.
            </p>
            <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-primary">
              What to do next
            </p>
            <p className="mt-1 text-gray-700">
              Use this guide when the problem on the page is the landlord task in front of you and
              you need to decide between reading, using a free tool, or starting the document route.
              It is written to make the route fit, evidence checks, compliance risk, and commercial
              next step visible before you click into a product.
            </p>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-gray-700">
              <li>Check the tenancy facts and be clear about what has gone wrong.</li>
              <li>Serve the correct notice and record proof of service straight away.</li>
              <li>Keep the deadlines, tenant responses, and key documents in one clear timeline.</li>
              <li>Only file the court paperwork when the dates and supporting documents all match.</li>
              <li>Move to enforcement if needed without having to rebuild the whole file.</li>
            </ol>
          </Reveal>
        </Container>
      </section>

      <CommercialSeoNextStep
        primaryHref={props.primaryCta.href}
        secondaryHref={props.secondaryCta?.href}
        sourcePage={`/${props.slug}`}
        pageType="guide"
        intent={props.slug}
        ctaPosition="mid"
      />

      {props.diagrams && props.diagrams.length > 0 ? (
        <section className="border-b border-[#E6DBFF] bg-white py-8">
          <Container>
            <Reveal className="mx-auto max-w-5xl rounded-[1.75rem] border border-[#E6DBFF] bg-[#F8F4FF] p-6 shadow-[0_18px_50px_rgba(91,33,182,0.08)]">
              <h2 className="text-2xl font-semibold text-[#2a2161]">
                Eviction diagrams and process maps
              </h2>
              <StaggerReveal className="mt-5 grid gap-4 md:grid-cols-3">
                {props.diagrams.map((diagram) => (
                  <article
                    key={diagram.title}
                    className="rounded-xl border border-[#E6DBFF] bg-white p-4 shadow-sm standalone-premium-hover-lift"
                  >
                    <Image
                      src={diagram.imageSrc}
                      alt={diagram.imageAlt}
                      width={64}
                      height={64}
                      className="h-16 w-16"
                    />
                    <p className="mt-2 text-xs text-gray-500">Illustration: {diagram.imageAlt}.</p>
                    <h3 className="mt-3 text-base font-semibold text-[#2a2161]">{diagram.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-700">{diagram.description}</p>
                  </article>
                ))}
              </StaggerReveal>
            </Reveal>
          </Container>
        </section>
      ) : null}

      <section className="bg-[linear-gradient(180deg,#ffffff_0%,#faf7ff_100%)] py-12">
        <Container>
          <StaggerReveal className="mx-auto max-w-5xl space-y-10">
            <SeoPageContextPanel
              pathname={`/${props.slug}`}
              className="border border-[#CAB6FF] bg-[#FBF8FF]"
            />
            {props.sections.map((section) => (
              <article
                key={section.title}
                className="rounded-[1.5rem] border border-[#E6DBFF] bg-[#FCFAFF] p-6 shadow-[0_14px_40px_rgba(91,33,182,0.06)] md:p-8 standalone-premium-hover-lift"
              >
                <h2 className="text-2xl font-semibold text-[#2a2161]">{section.title}</h2>
                <div className="mt-4 space-y-4 leading-7 text-gray-700">
                  {section.paragraphs.map((paragraph, index) => (
                    <p key={`${section.title}-${index}`}>{paragraph}</p>
                  ))}
                </div>
                {section.bullets ? (
                  <ul className="mt-5 list-disc space-y-2 pl-5 text-gray-700">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </StaggerReveal>
        </Container>
      </section>

      {authorityLinks ? (
        <section className="border-y border-[#E6DBFF] bg-white py-10">
          <Container>
            <Reveal className="mx-auto max-w-5xl rounded-[1.75rem] border border-[#E6DBFF] bg-[#F8F4FF] p-6 shadow-[0_18px_50px_rgba(91,33,182,0.08)]">
              <h2 className="text-2xl font-semibold text-[#2a2161]">Useful next steps</h2>
              <p className="mt-3 text-gray-700">
                Use these links when you want to move from reading into the next practical step
                without losing track of the case.
              </p>
              <StaggerReveal className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                <Link
                  href={authorityLinks.parent}
                  className="rounded-lg border border-[#E6DBFF] bg-white px-4 py-3 text-primary transition hover:bg-[#F8F4FF] standalone-premium-hover-lift"
                >
                  Main guide: {formatAuthorityLinkLabel(authorityLinks.parent)}
                </Link>
                {authorityLinks.supporting.map((href) => (
                  <Link
                    key={href}
                    href={href}
                    className="rounded-lg border border-[#E6DBFF] bg-white px-4 py-3 text-primary transition hover:bg-[#F8F4FF] standalone-premium-hover-lift"
                  >
                    Related guide: {formatAuthorityLinkLabel(href)}
                  </Link>
                ))}
                <Link
                  href={authorityLinks.tool}
                  className="rounded-lg border border-[#E6DBFF] bg-white px-4 py-3 text-primary transition hover:bg-[#F8F4FF] standalone-premium-hover-lift"
                >
                  Free tool: {formatAuthorityLinkLabel(authorityLinks.tool)}
                </Link>
                <Link
                  href={authorityLinks.product}
                  className="rounded-lg border border-[#E6DBFF] bg-white px-4 py-3 text-primary transition hover:bg-[#F8F4FF] standalone-premium-hover-lift"
                >
                  Document pack: {formatAuthorityLinkLabel(authorityLinks.product)}
                </Link>
              </StaggerReveal>
              <h3 className="mt-6 text-lg font-semibold text-[#2a2161]">Key topics covered here</h3>
              <StaggerReveal className="mt-3 grid gap-2 text-sm text-gray-700 md:grid-cols-3">
                {EVICTION_ENTITIES.map((entity) => (
                  <p
                    key={entity}
                    className="rounded-lg border border-[#E6DBFF] bg-white px-3 py-2 shadow-sm"
                  >
                    {entity}
                  </p>
                ))}
              </StaggerReveal>
            </Reveal>
          </Container>
        </section>
      ) : null}

      <section className="py-12">
        <Container>
          <Reveal className="mx-auto max-w-5xl rounded-[1.75rem] border border-[#E6DBFF] bg-white p-6 shadow-[0_18px_50px_rgba(91,33,182,0.08)] md:p-8">
            <h2 className="text-2xl font-semibold text-[#2a2161]">Related guides and next steps</h2>
            <StaggerReveal className="mt-4 grid gap-3 md:grid-cols-2">
              {props.relatedLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary transition hover:bg-[#F8F4FF] standalone-premium-hover-lift"
                >
                  {link.label}
                </Link>
              ))}
            </StaggerReveal>
          </Reveal>
        </Container>
      </section>

      <FAQSection faqs={props.faqs} title={`${props.heroTitle} FAQs`} />
    </div>
  );
}
