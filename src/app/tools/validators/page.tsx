/**
 * Validators Hub Page
 *
 * Lists all available document validators with descriptions and links.
 */

import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { RiFileCheckLine, RiAlertLine } from 'react-icons/ri';

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
  {
    slug: 'wales-notice',
    title: 'Wales Notice Validator',
    description: 'Validate Renting Homes (Wales) Act notices (RHW16/RHW17/RHW23).',
    jurisdiction: 'Wales',
    features: ['Contract compliance', 'Notice period checks', 'Form compliance', 'Written statement verification'],
  },
  {
    slug: 'scotland-notice-to-leave',
    title: 'Scotland Notice to Leave Validator',
    description: 'Check your Notice to Leave under Private Residential Tenancy rules.',
    jurisdiction: 'Scotland',
    features: ['PRT compliance', 'Ground verification', 'Notice period checks', 'Tribunal readiness'],
  },
  {
    slug: 'tenancy-agreement',
    title: 'Tenancy Agreement Validator',
    description: 'Validate your AST, PRT, or Occupation Contract clauses.',
    jurisdiction: 'All UK',
    features: ['Required clauses', 'Unfair terms check', 'Deposit terms', 'Break clause validation'],
  },
  {
    slug: 'money-claim',
    title: 'Money Claim Validator',
    description: 'Check your rent arrears evidence and claim documents.',
    jurisdiction: 'England, Wales, Scotland',
    features: ['Arrears schedule', 'Pre-action protocol', 'Evidence completeness', 'Interest calculation'],
  },
];

export default function ValidatorsHubPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 pt-28 pb-16 md:pt-32 md:pb-20">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block bg-primary/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-semibold text-primary">Free Tools</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Document Validators
            </h1>
            <p className="text-xl md:text-2xl mb-6 text-gray-600">
              Upload your notices and documents for instant AI-powered validation
            </p>
            <p className="text-sm text-gray-500">
              Get instant feedback on blockers, warnings, and next steps
            </p>
          </div>
        </Container>
      </section>

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
      <div className="py-16 md:py-20">
        <Container>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {validators.map((validator) => (
              <Link
                key={validator.slug}
                href={`/tools/validators/${validator.slug}`}
                className="group block rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-primary-300"
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-primary-100 p-3">
                    <RiFileCheckLine className="h-6 w-6 text-primary-600" />
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
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 font-bold text-xl mb-4">
                  1
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Upload Your Document</h3>
                <p className="text-sm text-gray-600">
                  Upload your notice, agreement, or other document in PDF or image format.
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 font-bold text-xl mb-4">
                  2
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">AI Analysis</h3>
                <p className="text-sm text-gray-600">
                  Our AI extracts key information and checks against legal requirements.
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 font-bold text-xl mb-4">
                  3
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Get Your Report</h3>
                <p className="text-sm text-gray-600">
                  Receive instant feedback on blockers, warnings, and recommended next steps.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}
