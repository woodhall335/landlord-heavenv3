import type { ReactNode } from 'react';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { Container } from '@/components/ui';
import { FunnelCta } from '@/components/funnels';
import { FAQSection } from '@/components/seo/FAQSection';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { StructuredData, breadcrumbSchema, articleSchema } from '@/lib/seo/structured-data';

interface HeroCta {
  label: string;
  href: string;
}

interface McolStyleScaffoldProps {
  canonicalUrl: string;
  title: string;
  subtitle: string;
  badge: string;
  trustText: string;
  primaryCta: HeroCta;
  secondaryCta: HeroCta;
  topicLabel: string;
  intro: string;
  faqs: Array<{ question: string; answer: string }>;
  relatedLinks: Array<{ href: string; title: string; description?: string }>;
  children?: ReactNode;
}

export function McolStyleScaffold({
  canonicalUrl,
  title,
  subtitle,
  badge,
  trustText,
  primaryCta,
  secondaryCta,
  topicLabel,
  intro,
  faqs,
  relatedLinks,
  children,
}: McolStyleScaffoldProps) {
  const breadcrumbs = [
    { name: 'Home', url: 'https://landlordheaven.co.uk' },
    { name: title, url: canonicalUrl },
  ];

  return (
    <div className="min-h-screen bg-[#fcfaff]">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={articleSchema({
          headline: title,
          description: subtitle,
          url: canonicalUrl,
          datePublished: '2026-01-01',
          dateModified: '2026-01-01',
        })}
      />
      <StructuredData data={breadcrumbSchema(breadcrumbs)} />

      <UniversalHero
        badge={badge}
        title={title}
        subtitle={subtitle}
        align="center"
        hideMedia
        showTrustPositioningBar
        trustText={trustText}
        primaryCta={primaryCta}
        secondaryCta={secondaryCta}
      />

      <section className="pb-8">
        <Container>
          <div className="mx-auto -mt-6 grid max-w-5xl gap-4 rounded-3xl border border-[#E6DBFF] bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)] md:grid-cols-3 md:p-6">
            <div className="rounded-2xl border border-[#EFE7FF] bg-[#fcfaff] p-4">
              <p className="text-sm font-semibold text-[#5B21B6]">Built for landlords</p>
              <p className="mt-1 text-sm text-slate-600">Guided steps and practical next actions.</p>
            </div>
            <div className="rounded-2xl border border-[#EFE7FF] bg-[#fcfaff] p-4">
              <p className="text-sm font-semibold text-[#5B21B6]">{topicLabel}</p>
              <p className="mt-1 text-sm text-slate-600">Aligned to UK process and common pitfalls.</p>
            </div>
            <div className="rounded-2xl border border-[#EFE7FF] bg-[#fcfaff] p-4">
              <p className="text-sm font-semibold text-[#5B21B6]">Conversion-ready</p>
              <p className="mt-1 text-sm text-slate-600">Start in minutes with the guided wizard.</p>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-10 md:py-14">
        <Container>
          <div className="mx-auto max-w-4xl rounded-3xl border border-[#E6DBFF] bg-white p-7 shadow-sm md:p-10">
            <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">What this page covers</h2>
            <p className="mt-4 text-slate-700">{intro}</p>
          </div>
        </Container>
      </section>

      {children}

      <section className="py-10 md:py-14">
        <Container>
          <div className="mx-auto max-w-5xl rounded-3xl border border-[#E6DBFF] bg-white p-6 shadow-sm md:p-8">
            <FAQSection faqs={faqs} title="Frequently asked questions" />
          </div>
        </Container>
      </section>

      <section className="pb-10 md:pb-14">
        <Container>
          <div className="mx-auto max-w-5xl rounded-3xl border border-[#E6DBFF] bg-white p-6 shadow-sm md:p-8">
            <RelatedLinks title="Related landlord guides" links={relatedLinks} />
          </div>
        </Container>
      </section>

      <section className="pb-16">
        <Container>
          <div className="mx-auto max-w-5xl rounded-3xl border border-[#E6DBFF] bg-gradient-to-r from-white to-[#f7f0ff] p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">Ready to take the next step?</h2>
            <p className="mt-2 text-slate-700">Use the guided wizard to generate the right documents and action plan.</p>
            <div className="mt-6">
              <FunnelCta
                title="Start your landlord workflow"
                subtitle="Answer a few questions and get matched to the right path."
                primaryHref={primaryCta.href}
                primaryText={primaryCta.label}
                location="bottom"
                secondaryLinks={[{ href: secondaryCta.href, text: secondaryCta.label }]}
              />
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
