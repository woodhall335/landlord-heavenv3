/**
 * Validators Hub Page
 *
 * Lists all available document validators with descriptions and links.
 */

import Link from 'next/link';
import { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { RiFileCheckLine, RiAlertLine } from 'react-icons/ri';
import { getCanonicalUrl } from '@/lib/seo';
import { AskHeavenWidget } from '@/components/ask-heaven/AskHeavenWidget';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { HeaderConfig } from '@/components/layout';

export const metadata: Metadata = {
  title: 'Eviction Notice Validity Checker | Check Your Notice is Valid',
  description:
    "Free eviction notice validity checker. Upload your Section 21 or Section 8 notice and we'll check it meets all legal requirements. Instant results with fix suggestions.",
  keywords: [
    'eviction notice checker',
    'section 21 validity checker',
    'section 8 checker',
    'notice validity check',
    'is my eviction notice valid',
    'eviction notice validator',
    'landlord notice checker',
  ],
  openGraph: {
    title: 'Eviction Notice Validity Checker | Landlord Heaven',
    description:
      'Check if your eviction notice is legally valid. Free instant checker for Section 21 and Section 8.',
    type: 'website',
    url: getCanonicalUrl('/tools/validators'),
  },
  alternates: {
    canonical: getCanonicalUrl('/tools/validators'),
  },
};

const validators = [
  {
    slug: 'section-21',
    title: 'Section 21 Notice Validator',
    description: 'Check if your Section 21 notice is valid and court-ready for England.',
    jurisdiction: 'England',
    features: ['Deposit protection checks', 'Prescribed information', 'Notice period calculation', 'Form 6A compliance'],
  },
  {
    slug: 'section-8',
    title: 'Section 8 Notice Validator',
    description: 'Validate your Section 8 notice with grounds for possession for England.',
    jurisdiction: 'England',
    features: ['Ground validity checks', 'Notice period verification', 'Evidence requirements', 'Form 3 compliance'],
  },
];

export default function ValidatorsHubPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderConfig mode="autoOnScroll" />
      <UniversalHero
        badge="Free Tools"
        title="Eviction Notice Validity Checker"
        subtitle={
          <>
            Upload your notices and documents for instant AI-powered validation
            <span className="mt-2 block text-sm text-white/75">Get instant feedback on blockers, warnings, and next steps</span>
          </>
        }
        align="center"
        hideMedia
        showReviewPill={false}
        showUsageCounter={false}
      />

      {/* Disclaimer Banner */}
      <div className="border-b-2 border-warning-500 bg-warning-50 py-4">
        <Container>
          <div className="flex items-start gap-3">
            <RiAlertLine className="mt-1 h-6 w-6 shrink-0 text-warning-700" />
            <div>
              <p className="text-sm font-semibold text-warning-900">
                Free Validation Preview
              </p>
              <p className="text-sm text-warning-800">
                These validators provide helpful guidance but are not a substitute for legal advice.
                For court-ready documents with full validation, upgrade to our paid packs.
              </p>
            </div>
          </div>
        </Container>
      </div>

      {/* Validators Grid */}
      <div className="py-20 md:py-24">
        <Container>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {validators.map((validator) => (
              <Link
                key={validator.slug}
                href={`/tools/validators/${validator.slug}`}
                className="group block rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-primary-300"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                    <RiFileCheckLine className="h-6 w-6 text-primary group-hover:text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                        {validator.title}
                      </h3>
                    </div>
                    <span className="inline-block text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded mb-2">
                      {validator.jurisdiction}
                    </span>
                    <p className="text-sm text-gray-600 mb-4">
                      {validator.description}
                    </p>
                    <ul className="space-y-1">
                      {validator.features.slice(0, 3).map((feature) => (
                        <li key={feature} className="text-xs text-gray-500 flex items-center gap-1">
                          <span className="text-primary-500">✓</span> {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* How It Works */}
          <div className="mt-16 rounded-2xl border border-gray-200 bg-white p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              How Validators Work
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-100 text-primary font-bold text-xl mb-4">
                  1
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Upload Your Document</h3>
                <p className="text-sm text-gray-600">
                  Upload your notice, agreement, or other document in PDF or image format.
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-100 text-primary font-bold text-xl mb-4">
                  2
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">AI Analysis</h3>
                <p className="text-sm text-gray-600">
                  Our AI extracts key information and checks against legal requirements.
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-100 text-primary font-bold text-xl mb-4">
                  3
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Get Your Report</h3>
                <p className="text-sm text-gray-600">
                  Receive instant feedback on blockers, warnings, and recommended next steps.
                </p>
              </div>
            </div>
          </div>

          {/* Ask Heaven Widget */}
          <div className="mt-12 max-w-2xl mx-auto">
            <AskHeavenWidget
              variant="banner"
              source="validator"
              topic="general"
              title="Have questions about your documents?"
              description="Ask Heaven can help explain validation results and guide you on next steps."
            />
          </div>
        </Container>
      </div>
    </div>
  );
}
