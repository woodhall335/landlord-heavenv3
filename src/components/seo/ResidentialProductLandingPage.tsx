import Link from 'next/link';
import type { ReactNode } from 'react';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { TrustPositioningBar } from '@/components/marketing/TrustPositioningBar';
import { FAQSection } from '@/components/seo/FAQSection';
import { Container } from '@/components/ui/Container';
import { StructuredData, breadcrumbSchema, productSchema } from '@/lib/seo/structured-data';
import {
  getResidentialRelatedLinks,
  getResidentialWizardEntry,
  type ResidentialLandingComparison,
  type ResidentialLandingContent,
} from '@/lib/seo/residential-product-landing-content';
import {
  isResidentialLettingProductSku,
  RESIDENTIAL_LETTING_PRODUCTS,
} from '@/lib/residential-letting/products';
import { getResidentialStandaloneProfile } from '@/lib/residential-letting/standalone-profiles';
import { getResidentialStandaloneThemeVars } from '@/lib/residential-letting/standalone-theme';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileText,
  Link2,
  Scale,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface ResidentialProductLandingPageProps {
  content: ResidentialLandingContent;
  canonicalUrl: string;
}

function SectionList({
  title,
  items,
  icon,
}: {
  title: string;
  items: string[];
  icon: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex items-center gap-3">
        {icon}
        <h3 className="text-xl font-bold text-slate-950">{title}</h3>
      </div>
      <ul className="mt-6 space-y-4">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-slate-700">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LinkGrid({
  title,
  links,
  icon,
  ctaLabel,
}: {
  title: string;
  links: Array<{ label: string; href: string; description: string }>;
  icon: ReactNode;
  ctaLabel: string;
}) {
  if (links.length === 0) {
    return null;
  }

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex items-center gap-3">
        {icon}
        <h2 className="text-2xl font-bold text-slate-950">{title}</h2>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {links.map((link) => (
          <Link
            key={`${link.href}-${link.label}`}
            href={link.href}
            className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-md"
          >
            <h3 className="text-lg font-semibold text-slate-950">{link.label}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{link.description}</p>
            <span className="mt-4 inline-block text-sm font-medium text-slate-900">{ctaLabel}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ComparisonTable({ comparison }: { comparison: ResidentialLandingComparison }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">Which document is closer to your situation?</h2>
          <p className="mt-2 text-slate-600">
            If you are deciding between this document and{' '}
            <Link href={comparison.alternativeHref} className="font-medium text-slate-900 underline decoration-slate-300 underline-offset-4">
              {comparison.alternativeLabel}
            </Link>
            , use the differences below.
          </p>
        </div>
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 text-sm uppercase tracking-[0.18em] text-slate-500">
              <th className="px-4 py-3">Point</th>
              <th className="px-4 py-3">This document</th>
              <th className="px-4 py-3">{comparison.alternativeLabel}</th>
            </tr>
          </thead>
          <tbody>
            {comparison.rows.map((row) => (
              <tr key={row.point} className="border-b border-slate-100 align-top">
                <th className="px-4 py-4 text-sm font-semibold text-slate-900">{row.point}</th>
                <td className="px-4 py-4 text-sm leading-6 text-slate-700">{row.thisDocument}</td>
                <td className="px-4 py-4 text-sm leading-6 text-slate-700">{row.alternative}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function dedupeLinks(links: Array<{ label: string; href: string; description: string }>) {
  const seen = new Set<string>();

  return links.filter((link) => {
    const key = `${link.href}:${link.label}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export function ResidentialProductLandingPage({
  content,
  canonicalUrl,
}: ResidentialProductLandingPageProps) {
  const product = RESIDENTIAL_LETTING_PRODUCTS[content.product];
  const standaloneProfile = isResidentialLettingProductSku(content.product)
    ? getResidentialStandaloneProfile(content.product)
    : null;
  const themeStyle = standaloneProfile
    ? getResidentialStandaloneThemeVars(standaloneProfile.theme)
    : undefined;
  const relatedLinks = getResidentialRelatedLinks(content.product);
  const wizardHref = getResidentialWizardEntry(content.product);
  const guideLinks = dedupeLinks(content.guideLinks);
  const documentLinks = dedupeLinks([...content.internalLinks, ...relatedLinks]);

  return (
    <div
      className="min-h-screen bg-[#f7f4ec]"
      style={
        standaloneProfile
          ? {
              ...themeStyle,
              backgroundImage:
                'radial-gradient(circle at top, var(--standalone-page-glow), transparent 22%), linear-gradient(180deg, var(--standalone-page), #f7f4ec 62%, #ffffff 100%)',
            }
          : undefined
      }
    >
      <StructuredData
        data={productSchema({
          name: content.h1,
          description: content.description,
          price: String(product.price.toFixed(2)),
          url: canonicalUrl,
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: content.h1, url: canonicalUrl },
        ])}
      />

      <HeaderConfig mode="autoOnScroll" />

      <UniversalHero
        trustText="England-only document - Updated for current housing law - Guided setup"
        title={content.h1}
        subtitle={content.subheading}
        align="center"
        actionsSlot={
          <div className="flex flex-col items-center gap-3">
            <Link href={wizardHref} className="hero-btn-primary">
              Start {product.shortLabel} Wizard <ArrowRight className="ml-1 inline h-5 w-5" />
            </Link>
            <p className="text-sm text-white/80">England only | One-time {product.displayPrice}</p>
          </div>
        }
      >
        <TrustPositioningBar variant="compact" className="mx-auto mt-6 max-w-5xl" />
      </UniversalHero>

      <section className="bg-white/80 py-8">
        <Container>
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-3 text-sm text-slate-700">
            <span className="rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
              Updated {content.lastUpdated}
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
              England residential lettings only
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
              One-time price {product.displayPrice}
            </span>
          </div>
        </Container>
      </section>

      {content.cautionBanner && (
        <section className="bg-[#f7f4ec] py-10">
          <Container>
            <div className="mx-auto max-w-5xl rounded-3xl border border-amber-200 bg-amber-50 px-6 py-5 text-amber-950 shadow-sm">
              <div className="text-sm font-semibold uppercase tracking-[0.22em]">{content.cautionBanner.title}</div>
              <p className="mt-2 text-base leading-7">{content.cautionBanner.body}</p>
            </div>
          </Container>
        </section>
      )}

      <section className="py-16">
        <Container>
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-3xl font-bold text-slate-950">What this document is used for</h2>
            <p className="mt-4 text-lg leading-8 text-slate-700">{content.quickAnswer}</p>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <SectionList
                title="When to use this document"
                items={content.whenToUse}
                icon={<ShieldCheck className="h-6 w-6 text-slate-900" />}
              />
              <SectionList
                title="Common mistakes to avoid"
                items={content.commonMistakes}
                icon={<AlertTriangle className="h-6 w-6 text-slate-900" />}
              />
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-16">
        <Container>
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-3xl font-bold text-slate-950">Why landlords use this instead of editing a blank template</h2>
            <p className="mt-4 text-lg leading-8 text-slate-700">{content.overview}</p>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <SectionList
                title="Why this route works"
                items={content.whyUseThis}
                icon={<Sparkles className="h-6 w-6 text-slate-900" />}
              />
              <SectionList
                title="How the wizard builds it"
                items={content.howWizardWorks}
                icon={<FileText className="h-6 w-6 text-slate-900" />}
              />
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
            <SectionList
              title="What the final document includes"
              items={content.includedHighlights}
              icon={<ShieldCheck className="h-6 w-6 text-slate-900" />}
            />
            <SectionList
              title="How to complete and use it properly"
              items={content.howToUseAfterDownload}
              icon={<FileText className="h-6 w-6 text-slate-900" />}
            />
          </div>
        </Container>
      </section>

      <section className="bg-[#f7f4ec] py-16">
        <Container>
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
            <SectionList
              title="Who this is for"
              items={content.whoThisIsFor}
              icon={<ShieldCheck className="h-6 w-6 text-slate-900" />}
            />
            <SectionList
              title="When this is not the right document"
              items={content.notFor}
              icon={<Sparkles className="h-6 w-6 text-slate-900" />}
            />
          </div>
          <div className="mx-auto mt-8 max-w-5xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <Scale className="h-6 w-6 text-slate-900" />
              <h2 className="text-2xl font-bold text-slate-950">Legal position</h2>
            </div>
            <p className="mt-4 text-lg leading-8 text-slate-700">{content.legalExplainer}</p>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="mx-auto max-w-6xl">
            <ComparisonTable comparison={content.comparison} />
          </div>
        </Container>
      </section>

      <section className="bg-white py-16">
        <Container>
          <div className="mx-auto max-w-6xl space-y-8">
            <LinkGrid
              title="Related guides"
              links={guideLinks}
              icon={<Link2 className="h-6 w-6 text-slate-900" />}
              ctaLabel="Read guide"
            />
            <LinkGrid
              title="Related documents"
              links={documentLinks}
              icon={<Link2 className="h-6 w-6 text-slate-900" />}
              ctaLabel="View document page"
            />
          </div>
        </Container>
      </section>

      <FAQSection
        title="Frequently Asked Questions"
        faqs={content.faqs}
        showContactCTA={false}
        variant="gray"
      />

      <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 py-16 text-white">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold">Start the guided wizard</h2>
            <p className="mt-4 text-lg text-white/80">
              Answer the questions once, review the document summary, and pay only when the document looks right for your case.
            </p>
            <div className="mt-8">
              <Link href={wizardHref} className="hero-btn-primary">
                Start now for {product.displayPrice}
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
