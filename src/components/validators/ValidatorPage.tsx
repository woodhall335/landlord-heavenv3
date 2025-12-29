/**
 * Shared Validator Page Component
 *
 * Renders a document validator page with upload, validation display, and CTAs.
 * Creates an anonymous case via wizard/start and uses UploadField for document upload.
 */

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { UploadField } from '@/components/wizard/fields/UploadField';
import { EmailCaptureModal } from '@/components/leads/EmailCaptureModal';
import { RiAlertLine, RiCheckboxCircleLine } from 'react-icons/ri';
import type { Jurisdiction } from '@/lib/jurisdiction/types';

export interface ValidatorCTA {
  label: string;
  href: string;
  price: number;
  primary?: boolean;
}

export interface ValidatorPageProps {
  /** Validator type key (e.g., 'section_21', 'section_8') */
  validatorKey: string;
  /** Page title */
  title: string;
  /** Page description */
  description: string;
  /** Jurisdiction for this validator */
  jurisdiction: Jurisdiction;
  /** Case type for wizard/start */
  caseType: 'eviction' | 'money_claim' | 'tenancy_agreement';
  /** Product variant for wizard/start */
  productVariant: string;
  /** CTA buttons to display */
  ctas: ValidatorCTA[];
  /** Features list for display */
  features?: string[];
  /** Additional info text */
  additionalInfo?: string;
}

export function ValidatorPage({
  validatorKey,
  title,
  description,
  jurisdiction,
  caseType,
  productVariant,
  ctas,
  features = [],
  additionalInfo,
}: ValidatorPageProps): React.ReactElement {
  const [caseId, setCaseId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  // Create anonymous case on mount
  useEffect(() => {
    const createCase = async () => {
      try {
        const response = await fetch('/api/wizard/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jurisdiction,
            case_type: caseType,
            product: caseType === 'eviction' ? 'notice_only' : caseType === 'money_claim' ? 'money_claim' : 'tenancy_agreement',
            product_variant: productVariant,
          }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to start validation session');
        }

        const data = await response.json();
        setCaseId(data.caseId);
      } catch (err) {
        console.error('Failed to create case:', err);
        setError(err instanceof Error ? err.message : 'Failed to start validation session');
      } finally {
        setIsLoading(false);
      }
    };

    void createCase();
  }, [jurisdiction, caseType, productVariant]);

  const primaryCta = ctas.find((c) => c.primary) || ctas[0];
  const secondaryCtas = ctas.filter((c) => c !== primaryCta);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 pt-28 pb-16 md:pt-32 md:pb-20">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block bg-primary/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-semibold text-primary">Free Validator</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              {title}
            </h1>
            <p className="text-xl md:text-2xl mb-6 text-gray-600">
              {description}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a href="#validator" className="hero-btn-primary">
                Start Validation →
              </a>
              {primaryCta && (
                <Link href={primaryCta.href} className="hero-btn-secondary">
                  Get Court-Ready Pack →
                </Link>
              )}
            </div>
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
                This validator provides helpful guidance but is not a substitute for legal advice.
                For court-ready documents with full validation, upgrade to our paid packs.
              </p>
            </div>
          </div>
        </Container>
      </div>

      {/* Main Content */}
      <div className="py-16 md:py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div id="validator" className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">
                Upload Your Document
              </h2>

              {isLoading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4" />
                  <p className="text-sm text-gray-600">Starting validation session...</p>
                </div>
              )}

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4 mb-6">
                  <p className="text-sm text-red-700">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-2 text-sm text-red-600 underline hover:no-underline"
                  >
                    Try again
                  </button>
                </div>
              )}

              {caseId && !isLoading && (
                <>
                  <p className="text-sm text-gray-600 mb-6">
                    Upload your document (PDF or image) and our AI will analyze it for compliance issues.
                  </p>

                  <UploadField
                    caseId={caseId}
                    questionId={`validator_${validatorKey}`}
                    jurisdiction={jurisdiction}
                    label="Document Upload"
                    description="Drag and drop or click to upload your document"
                  />

                  {/* Email Report Section */}
                  <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-700">Email me my report</p>
                        <p className="text-xs text-gray-500">Get a copy of your validation results</p>
                      </div>
                      <button
                        type="button"
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                        onClick={() => setEmailOpen(true)}
                      >
                        Email report
                      </button>
                    </div>
                    {emailStatus && (
                      <p className="mt-2 text-xs text-gray-600">{emailStatus}</p>
                    )}
                  </div>
                </>
              )}

              {/* Features List */}
              {features.length > 0 && (
                <div className="mt-8 rounded-xl bg-primary-50 p-6">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">
                    What We Check
                  </h3>
                  <ul className="grid md:grid-cols-2 gap-3">
                    {features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                        <RiCheckboxCircleLine className="h-5 w-5 text-primary-600 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* CTAs */}
              <div className="mt-8 rounded-xl border-2 border-primary-200 bg-gradient-to-br from-purple-50 to-white p-6">
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Need Court-Ready Documents?
                </h3>
                <p className="mb-4 text-sm text-gray-700">
                  Upgrade to get professionally validated documents with full legal compliance checks.
                </p>
                <div className="flex flex-wrap gap-3">
                  {primaryCta && (
                    <Link
                      href={primaryCta.href}
                      className="rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-primary-700"
                    >
                      {primaryCta.label} (£{primaryCta.price.toFixed(2)})
                    </Link>
                  )}
                  {secondaryCtas.map((cta) => (
                    <Link
                      key={cta.href}
                      href={cta.href}
                      className="rounded-xl border-2 border-primary-300 bg-white px-6 py-3 text-sm font-semibold text-primary-700 transition-all hover:bg-primary-50"
                    >
                      {cta.label} (£{cta.price.toFixed(2)})
                    </Link>
                  ))}
                </div>
              </div>

              {/* Additional Info */}
              {additionalInfo && (
                <div className="mt-8 rounded-xl bg-blue-50 p-6">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {additionalInfo}
                  </p>
                </div>
              )}
            </div>

            {/* Back to Hub */}
            <div className="mt-8 text-center">
              <Link
                href="/tools/validators"
                className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
              >
                ← Back to all validators
              </Link>
            </div>
          </div>
        </Container>
      </div>

      {/* Email Report Modal */}
      <EmailCaptureModal
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        source={`validator:${validatorKey}`}
        jurisdiction={jurisdiction}
        caseId={caseId ?? undefined}
        tags={['validator', validatorKey]}
        title="Email me this report"
        description="We'll send you a copy of your validation report and helpful resources."
        primaryLabel="Send report"
        includeEmailReport={true}
        reportCaseId={caseId ?? undefined}
        onSuccess={() => {
          setEmailStatus('Report queued. Check your inbox soon.');
        }}
      />
    </div>
  );
}
