import Image from 'next/image';
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
  type ResidentialLandingContent,
} from '@/lib/seo/residential-product-landing-content';
import { RESIDENTIAL_LETTING_PRODUCTS } from '@/lib/residential-letting/products';
import { ArrowRight, CheckCircle2, FileText, Link2, ShieldCheck, Sparkles } from 'lucide-react';

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
        <h2 className="text-2xl font-bold text-slate-950">{title}</h2>
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

export function ResidentialProductLandingPage({
  content,
  canonicalUrl,
}: ResidentialProductLandingPageProps) {
  const product = RESIDENTIAL_LETTING_PRODUCTS[content.product];
  const relatedLinks = getResidentialRelatedLinks(content.product);
  const wizardHref = getResidentialWizardEntry(content.product);

  return (
    <div className="min-h-screen bg-[#f7f4ec]">
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
        <div className="mx-auto mt-8 max-w-5xl rounded-[2rem] border border-white/15 bg-white/10 p-6 backdrop-blur">
          <div className="grid gap-6 lg:grid-cols-[180px,1fr] lg:items-center">
            <div className="flex justify-center">
              <div className="rounded-[2rem] bg-white/10 p-4">
                <Image src={content.icon} alt="" width={160} height={160} className="h-32 w-32 object-contain" />
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <div className="text-left text-sm font-semibold uppercase tracking-[0.24em] text-white/70">
                  What You Get
                </div>
                <ul className="mt-3 space-y-2 text-left text-white/90">
                  {content.includedHighlights.slice(0, 4).map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-left text-sm font-semibold uppercase tracking-[0.24em] text-white/70">
                  Preview Anatomy
                </div>
                <ul className="mt-3 space-y-2 text-left text-white/90">
                  {content.documentPreviewAnatomy.slice(0, 3).map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-6 flex items-baseline justify-center gap-2 text-white">
            <span className="text-5xl font-bold">{product.displayPrice}</span>
            <span className="text-base text-white/80">one-time</span>
          </div>
        </div>
        <TrustPositioningBar variant="compact" className="mx-auto mt-6 max-w-5xl" />
      </UniversalHero>

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
            <h2 className="text-3xl font-bold text-slate-950">Why Landlords Use This Instead Of A Blank Template</h2>
            <p className="mt-4 text-lg leading-8 text-slate-700">{content.overview}</p>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <SectionList
                title="Why Use This"
                items={content.whyUseThis}
                icon={<Sparkles className="h-6 w-6 text-slate-900" />}
              />
              <SectionList
                title="How The Wizard Works"
                items={content.howWizardWorks}
                icon={<FileText className="h-6 w-6 text-slate-900" />}
              />
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-16">
        <Container>
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
            <SectionList
              title="What The Premium Output Includes"
              items={content.includedHighlights}
              icon={<ShieldCheck className="h-6 w-6 text-slate-900" />}
            />
            <SectionList
              title="Document Preview Anatomy"
              items={content.documentPreviewAnatomy}
              icon={<FileText className="h-6 w-6 text-slate-900" />}
            />
          </div>
        </Container>
      </section>

      <section className="bg-[#f7f4ec] py-16">
        <Container>
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
            <SectionList
              title="Who This Is For"
              items={content.whoThisIsFor}
              icon={<ShieldCheck className="h-6 w-6 text-slate-900" />}
            />
            <SectionList
              title="When This Is Not The Right Document"
              items={content.notFor}
              icon={<Sparkles className="h-6 w-6 text-slate-900" />}
            />
          </div>
          <div className="mx-auto mt-8 max-w-5xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-950">Legal Positioning</h2>
            <p className="mt-4 text-lg leading-8 text-slate-700">{content.legalExplainer}</p>
          </div>
        </Container>
      </section>

      {(content.internalLinks.length > 0 || relatedLinks.length > 0) && (
        <section className="py-16">
          <Container>
            <div className="mx-auto max-w-6xl">
              <div className="mb-8 flex items-center gap-3">
                <Link2 className="h-6 w-6 text-slate-900" />
                <h2 className="text-2xl font-bold text-slate-950">Related Next Steps</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {[...content.internalLinks, ...relatedLinks].slice(0, 6).map((link) => (
                  <Link
                    key={`${link.href}-${link.label}`}
                    href={link.href}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                  >
                    <h3 className="text-lg font-semibold text-slate-950">{link.label}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{link.description}</p>
                    <span className="mt-4 inline-block text-sm font-medium text-slate-900">
                      View document
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </Container>
        </section>
      )}

      <FAQSection
        title="Frequently Asked Questions"
        faqs={content.faqs}
        showContactCTA={false}
        variant="gray"
      />

      <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 py-16 text-white">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold">Start The Guided Wizard</h2>
            <p className="mt-4 text-lg text-white/80">
              Collect the facts once, review the premium document summary, and only add related landlord paperwork when it actually fits the case.
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
