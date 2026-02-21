/**
 * WizardLandingPage Component
 *
 * Comprehensive SEO landing page for wizard entry points.
 * Renders all content sections with proper semantic HTML for SEO.
 */

import { Container } from '@/components/ui';
import { UsageTodayCounter } from '@/components/seo/UsageTodayCounter';
import {
  Eye,
  RefreshCw,
  Cloud,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Scale,
  AlertTriangle,
} from 'lucide-react';
import { FAQSection } from '@/components/seo/FAQSection';
import { StructuredData, productSchema, faqPageSchema, breadcrumbSchema } from '@/lib/seo/structured-data';
import { AskHeavenWidget } from '@/components/ask-heaven/AskHeavenWidget';
import { IntentProductCTA, RelatedProductsModule, type IntentProduct } from '@/components/seo/IntentProductCTA';
import type { WizardLandingContent, NoticeType, CourtForm, JurisdictionCoverage, WhyUseThisSection, LegalValidationExplainer } from '@/lib/seo/wizard-landing-content';

interface WizardLandingPageProps {
  content: WizardLandingContent;
  structuredDataUrl: string;
}

export function WizardLandingPage({ content, structuredDataUrl }: WizardLandingPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Structured Data */}
      <StructuredData
        data={productSchema({
          name: content.h1,
          description: content.description,
          price: content.price.replace('£', ''),
          url: structuredDataUrl,
        })}
      />
      <StructuredData data={faqPageSchema(content.faqs)} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Products', url: 'https://landlordheaven.co.uk/pricing' },
          { name: content.h1, url: structuredDataUrl },
        ])}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 pt-28 pb-16 md:pt-32 md:pb-24">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">{content.h1}</h1>
            <p className="text-xl md:text-2xl mb-4 text-gray-600">{content.subheading}</p>

            {/* Jurisdiction badges */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {content.jurisdictions.map((jurisdiction) => (
                <span
                  key={jurisdiction}
                  className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded-full"
                >
                  {getJurisdictionFlag(jurisdiction)} {jurisdiction}
                </span>
              ))}
            </div>

            {/* England-only warning if applicable */}
            {content.jurisdictions.length === 1 && content.jurisdictions[0] === 'England' && (
              <p className="text-sm text-amber-700 bg-amber-50 inline-block px-3 py-1 rounded-full mb-4">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                England only
              </p>
            )}

            {/* Price */}
            <div className="flex items-baseline justify-center gap-2 mb-6">
              <span className="text-5xl md:text-6xl font-bold text-gray-900">{content.price}</span>
              <span className="text-gray-500 text-lg">one-time</span>
            </div>

            {/* Key differentiators */}
            <div className="flex flex-wrap justify-center gap-4 mb-8 text-sm">
              <span className="flex items-center gap-1 text-gray-700">
                <Eye className="w-4 h-4 text-primary" /> Preview before you buy
              </span>
              <span className="flex items-center gap-1 text-gray-700">
                <RefreshCw className="w-4 h-4 text-primary" /> Edit &amp; regenerate (unlimited)
              </span>
              <span className="flex items-center gap-1 text-gray-700">
                <Cloud className="w-4 h-4 text-primary" /> Portal storage (12+ months)
              </span>
            </div>

            {/* CTA */}
            <IntentProductCTA
              intent={{ product: toIntentProduct(content.product), src: "seo_landing" }}
              label="Start My Case Bundle"
              className="hero-btn-primary"
            />
            <div className="mt-4 mb-2">
              <UsageTodayCounter className="mx-auto" />
            </div>
          </div>
        </Container>
      </section>

      {/* What You Get Section */}
      <section className="py-16 md:py-20 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-8 text-center">
              What You Get
            </h2>
            <ul className="grid md:grid-cols-2 gap-4">
              {content.whatYouGet.map((item, index) => (
                <li key={index} className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* Why Use This Section (NEW) */}
      <WhyUseThisSectionComponent whyUseThis={content.whyUseThis} />

      {/* Notice Types (if applicable) */}
      {content.noticeTypes && content.noticeTypes.length > 0 && (
        <NoticeTypesSection noticeTypes={content.noticeTypes} />
      )}

      {/* Court Forms (if applicable) */}
      {content.courtForms && content.courtForms.length > 0 && (
        <CourtFormsSection courtForms={content.courtForms} />
      )}

      {/* Jurisdiction Coverage (if applicable) */}
      {content.jurisdictionCoverage && content.jurisdictionCoverage.length > 0 && (
        <JurisdictionCoverageSection jurisdictionCoverage={content.jurisdictionCoverage} />
      )}

      {/* How Validation Works */}
      <section className="py-16 md:py-20 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4 text-center">
              How Validation Works
            </h2>
            <p className="text-center text-gray-600 mb-8">
              Our system performs systematic validation to ensure documents are correctly generated
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {content.howValidationWorks.map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Legal Validation Explainer (NEW) */}
      <LegalValidationExplainerSection explainer={content.legalValidationExplainer} />

      {/* Who This Is For */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-8 text-center">
              Who This Is For
            </h2>
            <ul className="space-y-4 max-w-2xl mx-auto">
              {content.whoThisIsFor.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold shrink-0">
                    {index + 1}
                  </div>
                  <span className="text-gray-700 pt-1">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* FAQ Section */}
      <FAQSection
        title="Frequently Asked Questions"
        faqs={content.faqs}
        showContactCTA={false}
        variant="gray"
      />

      {/* Ask Heaven Widget */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-2xl mx-auto">
            <AskHeavenWidget
              variant="banner"
              source="seo"
              product={content.product}
              title="Have questions?"
              description="Ask Heaven can help you understand your options and requirements."
            />
          </div>
        </Container>
      </section>

      <RelatedProductsModule products={buildRelatedIntentProducts(content.product)} />

      {/* Final CTA */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Ready to Get Started?</h2>
            <p className="text-xl mb-8 text-gray-600">
              Preview before you pay. Edit and regenerate instantly. Stored in your portal.
            </p>
            <IntentProductCTA
              intent={{ product: toIntentProduct(content.product), src: "seo_landing" }}
              label={`Start My Case Bundle - ${content.price}`}
              className="hero-btn-primary"
            />
            <p className="mt-4 text-sm text-gray-600">
              One-time payment • Unlimited regenerations • No subscription
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}

/**
 * Notice Types Section Component
 */
function NoticeTypesSection({ noticeTypes }: { noticeTypes: NoticeType[] }) {
  return (
    <section className="py-16 md:py-20">
      <Container>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4 text-center">
            Notice Types We Generate
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Legally validated and procedurally correct notices for each jurisdiction
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-4 border-b font-semibold">Notice Type</th>
                  <th className="text-left p-4 border-b font-semibold">Jurisdiction</th>
                  <th className="text-left p-4 border-b font-semibold">Description</th>
                  <th className="text-left p-4 border-b font-semibold">Legal Basis</th>
                </tr>
              </thead>
              <tbody>
                {noticeTypes.map((notice, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">{notice.name}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded text-sm">
                        {getJurisdictionFlag(notice.jurisdiction)} {notice.jurisdiction}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 text-sm">{notice.description}</td>
                    <td className="p-4 text-gray-500 text-sm">{notice.legalBasis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Container>
    </section>
  );
}

/**
 * Court Forms Section Component
 */
function CourtFormsSection({ courtForms }: { courtForms: CourtForm[] }) {
  return (
    <section className="py-16 md:py-20">
      <Container>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4 text-center">
            Court Forms Included
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Official HMCTS forms generated and validated with your case details
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {courtForms.map((form, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{form.name}</h3>
                    <span className="text-sm text-primary font-mono">{form.formNumber}</span>
                    <p className="text-gray-600 text-sm mt-2">{form.description}</p>
                    {form.route && (
                      <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {form.route === 'section21' ? 'Section 21 Route' : 'Section 8 Route'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

/**
 * Jurisdiction Coverage Section Component
 */
function JurisdictionCoverageSection({
  jurisdictionCoverage,
}: {
  jurisdictionCoverage: JurisdictionCoverage[];
}) {
  return (
    <section className="py-16 md:py-20">
      <Container>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4 text-center">
            Coverage by Jurisdiction
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Jurisdiction-specific agreements with correct terminology and legal requirements
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {jurisdictionCoverage.map((jurisdiction, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{jurisdiction.flag}</span>
                  <h3 className="text-lg font-semibold text-charcoal">{jurisdiction.name}</h3>
                </div>
                <p className="text-sm font-medium text-primary mb-2">{jurisdiction.agreementType}</p>
                <p className="text-xs text-gray-500 mb-3">{jurisdiction.legalBasis}</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {jurisdiction.keyFeatures.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                {jurisdiction.notes && (
                  <p className="mt-3 text-xs text-gray-500 italic">{jurisdiction.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

/**
 * Why Use This Section Component (NEW)
 */
function WhyUseThisSectionComponent({ whyUseThis }: { whyUseThis: WhyUseThisSection }) {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50">
      <Container>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4 text-center">
            {whyUseThis.heading}
          </h2>
          <p className="text-center text-gray-700 mb-8 max-w-3xl mx-auto">
            {whyUseThis.intro}
          </p>
          <ul className="space-y-3">
            {whyUseThis.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-3 bg-white p-4 rounded-lg shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <span className="text-gray-700">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}

/**
 * Legal Validation Explainer Section Component (NEW)
 */
function LegalValidationExplainerSection({ explainer }: { explainer: LegalValidationExplainer }) {
  return (
    <section className="py-16 md:py-20 bg-gray-50">
      <Container>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Scale className="w-6 h-6 text-primary" />
            <h2 className="text-2xl md:text-3xl font-bold text-charcoal">
              What &quot;Validation&quot; Means
            </h2>
          </div>
          <p className="text-center text-gray-600 mb-8">
            Our system performs procedural checks — not legal advice
          </p>

          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="font-semibold text-charcoal mb-4">What our validation checks:</h3>
            <ul className="space-y-2">
              {explainer.whatItMeans.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <ShieldCheck className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-800">
                {explainer.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}


function toIntentProduct(product: string): IntentProduct {
  if (product === 'ast_standard' || product === 'ast_premium' || product === 'tenancy_agreement') {
    return 'ast';
  }
  if (product === 'notice_only' || product === 'money_claim' || product === 'complete_pack') {
    return product;
  }
  return 'notice_only';
}

function buildRelatedIntentProducts(product: string): IntentProduct[] {
  const current = toIntentProduct(product);
  const all: IntentProduct[] = ['notice_only', 'money_claim', 'complete_pack', 'ast'];
  return [current, ...all.filter((item) => item !== current)].slice(0, 3);
}

/**
 * Helper function to get jurisdiction flag
 */
function getJurisdictionFlag(jurisdiction: string): string {
  const flags: Record<string, string> = {
    England: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    Wales: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
    Scotland: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    'Northern Ireland': '🇬🇧',
  };
  return flags[jurisdiction] || '🇬🇧';
}
