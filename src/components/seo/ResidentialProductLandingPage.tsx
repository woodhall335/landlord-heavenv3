import Link from 'next/link';
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
import { ArrowRight, CheckCircle2, FileText, Link2 } from 'lucide-react';

interface ResidentialProductLandingPageProps {
  content: ResidentialLandingContent;
  canonicalUrl: string;
}

export function ResidentialProductLandingPage({
  content,
  canonicalUrl,
}: ResidentialProductLandingPageProps) {
  const product = RESIDENTIAL_LETTING_PRODUCTS[content.product];
  const relatedLinks = getResidentialRelatedLinks(content.product);
  const wizardHref = getResidentialWizardEntry(content.product);

  return (
    <div className="min-h-screen bg-white">
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
        <div className="mt-7 flex items-baseline justify-center gap-2 text-white">
          <span className="text-5xl font-bold">{product.displayPrice}</span>
          <span className="text-base text-white/80">one-time</span>
        </div>
        <TrustPositioningBar variant="compact" className="mx-auto mt-6 max-w-5xl" />
      </UniversalHero>

      <section className="bg-gray-50 py-14">
        <Container>
          <div className="mx-auto max-w-4xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="text-3xl font-bold text-gray-900">What This Product Does</h2>
            <p className="mt-4 text-lg leading-8 text-gray-700">{content.overview}</p>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-gray-900">What You Get</h2>
              </div>
              <ul className="mt-6 space-y-4">
                {content.whatYouGet.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-gray-700">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900">Why This Works Well In The Wizard</h2>
              <ul className="mt-6 space-y-4">
                {content.wizardHighlights.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-gray-700">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-gray-50 py-16">
        <Container>
          <div className="mx-auto max-w-4xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900">Best Fit For</h2>
            <ul className="mt-6 space-y-4">
              {content.bestFor.map((item) => (
                <li key={item} className="flex items-start gap-3 text-gray-700">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {relatedLinks.length > 0 && (
        <section className="py-16">
          <Container>
            <div className="mx-auto max-w-6xl">
              <div className="mb-8 flex items-center gap-3">
                <Link2 className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-gray-900">Often Paired With</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {relatedLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-primary/40 hover:shadow-md"
                  >
                    <h3 className="text-lg font-semibold text-gray-900">{link.label}</h3>
                    <p className="mt-3 text-sm leading-6 text-gray-600">{link.description}</p>
                    <span className="mt-4 inline-block text-sm font-medium text-primary">
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

      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 text-white">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold">Start The Guided Wizard</h2>
            <p className="mt-4 text-lg text-white/80">
              Collect the facts once, review the document, and add related landlord paperwork only when it actually fits the case.
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
