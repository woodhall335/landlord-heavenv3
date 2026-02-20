'use client';

import { useState } from 'react';
import { DocumentList } from './DocumentList';
import { DocumentInfo } from './DocumentCard';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { CheckCircle, Shield, Clock, Download, Scale, AlertTriangle, XCircle } from 'lucide-react';
import { getCheckoutRedirectUrls, type CheckoutProduct } from '@/lib/payments/redirects';
import { trackBeginCheckout, trackCheckoutStarted } from '@/lib/analytics';
import { getCheckoutAttribution } from '@/lib/wizard/wizardAttribution';
import type { SanitizedComplianceIssue } from '@/lib/documents/compliance-timing-types';

/**
 * Solicitor cost comparison data by product
 * Source: Average UK solicitor fees for residential landlord matters (2024)
 */
const SOLICITOR_COSTS: Record<string, { low: string; high: string; label: string }> = {
  notice_only: { low: '200', high: '300', label: 'eviction notices' },
  complete_pack: { low: '1,500', high: '2,500', label: 'eviction packs' },
  money_claim: { low: '800', high: '1,200', label: 'money claims' },
  ast_standard: { low: '150', high: '400', label: 'tenancy agreements' },
  ast_premium: { low: '150', high: '400', label: 'tenancy agreements' },
  tenancy_agreement: { low: '150', high: '400', label: 'tenancy agreements' },
};

interface PreviewPageLayoutProps {
  caseId: string;
  product: string;
  productName: string;
  price: string;
  originalPrice?: string;
  documents: DocumentInfo[];
  features?: string[];
  savings?: string;
}

/**
 * Compliance timing block state for displaying blocker UI
 */
interface ComplianceBlockState {
  issues: SanitizedComplianceIssue[];
  message: string;
}

export function PreviewPageLayout({
  caseId,
  product,
  productName,
  price,
  originalPrice,
  documents,
  features,
  savings,
}: PreviewPageLayoutProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [complianceBlock, setComplianceBlock] = useState<ComplianceBlockState | null>(null);
  const supabase = getSupabaseBrowserClient();

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);
    setComplianceBlock(null); // Clear any previous compliance block

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Redirect to signup with return URL
        const returnUrl = `/wizard/preview/${caseId}`;
        window.location.href = `/auth/signup?redirect=${encodeURIComponent(returnUrl)}&case_id=${caseId}`;
        return;
      }

      // Link case to user if not already linked
      await fetch(`/api/cases/${caseId}/link`, { method: 'POST' });

      // Get product-aware redirect URLs
      const { successUrl, cancelUrl } = getCheckoutRedirectUrls({
        product: product as CheckoutProduct,
        caseId,
      });

      // Get attribution data for checkout
      const attribution = getCheckoutAttribution();

      // Create checkout session with attribution
      const response = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_type: product,
          case_id: caseId,
          success_url: successUrl,
          cancel_url: cancelUrl,
          // Attribution fields for revenue tracking
          ...attribution,
        }),
      });

      const data = await response.json();

      // Handle compliance timing block (422 with COMPLIANCE_TIMING_BLOCK code)
      if (response.status === 422 && data.code === 'COMPLIANCE_TIMING_BLOCK') {
        setComplianceBlock({
          issues: data.issues || [],
          message: data.message || 'Compliance requirements not met.',
        });
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Handle idempotent checkout responses
      if (data.status === 'already_paid') {
        // User already purchased this product - redirect to case page
        window.location.href = data.redirect_url;
        return;
      }

      if (data.status === 'pending') {
        // Reusing existing checkout session
        window.location.href = data.checkout_url;
        return;
      }

      // New checkout session (status === 'new' or legacy response)
      const checkoutUrl = data.session_url || data.checkout_url;
      if (checkoutUrl) {
        // Track checkout initiation in analytics (GA4 + FB Pixel)
        const priceValue = parseFloat(price.replace(/[£,]/g, '')) || 0;
        trackBeginCheckout(product, productName, priceValue);

        // Track checkout started (Vercel Analytics)
        trackCheckoutStarted({ product });

        window.location.href = checkoutUrl;
      }
    } catch (err) {
      console.error('Checkout failed:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{productName}</h1>
          <p className="text-gray-600 mt-2 text-lg">
            {documents.length} documents ready for instant download
          </p>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Document List - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* What's Included Card */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">What's Included</h2>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {documents.length} Documents
                </span>
              </div>
              <DocumentList
                documents={documents}
                isLocked={true}
                onUnlock={handleCheckout}
                groupByCategory={true}
              />
            </div>

          </div>

          {/* Pricing Sidebar - 1 column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border-2 border-blue-100 p-6 sticky top-8">
              {/* Price */}
              <div className="text-center mb-6">
                {originalPrice && (
                  <p className="text-gray-400 line-through text-lg">{originalPrice}</p>
                )}
                <p className="text-4xl font-bold text-gray-900">{price}</p>
                <p className="text-gray-600 mt-1">One-time payment</p>
                {savings && (
                  <p className="text-green-600 font-medium mt-2">{savings}</p>
                )}
              </div>

              {/* Solicitor Comparison Box */}
              {SOLICITOR_COSTS[product] && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Scale className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-900">
                        Solicitor comparison
                      </p>
                      <p className="text-sm text-green-800 mt-1">
                        A property solicitor typically charges{' '}
                        <span className="font-semibold">
                          £{SOLICITOR_COSTS[product].low}–£{SOLICITOR_COSTS[product].high}
                        </span>{' '}
                        for {SOLICITOR_COSTS[product].label}.
                      </p>
                      <p className="text-xs text-green-700 mt-2">
                        You pay: <span className="font-bold text-green-900">{price}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* CTA Button */}
              <button
                data-testid="preview-checkout-cta"
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full py-4 bg-primary text-white rounded-xl font-semibold text-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Get Your Documents'
                )}
              </button>

              {error && (
                <p className="text-red-600 text-sm mt-3 text-center">{error}</p>
              )}

              {/* Compliance Timing Block UI */}
              {complianceBlock && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-amber-900 text-sm">
                        Action Required
                      </h4>
                      <p className="text-sm text-amber-800 mt-1">
                        {complianceBlock.message}
                      </p>
                      {complianceBlock.issues.length > 0 && (
                        <ul className="mt-3 space-y-2">
                          {complianceBlock.issues.map((issue, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                              <div>
                                <span className="font-medium text-gray-800">
                                  {issue.documentLabel}:
                                </span>
                                <span className="text-gray-700 ml-1">
                                  {issue.message}
                                </span>
                                {issue.actual && (
                                  <span className="text-gray-500 text-xs block mt-0.5">
                                    Current value: {issue.actual}
                                  </span>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                      <a
                        href={`/wizard/eviction/${caseId}?section=compliance`}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
                      >
                        Update Compliance Dates
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Trust Signals */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Download className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>Instant download after payment</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Shield className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>Court-ready documents</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Clock className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>Unlimited regeneration</span>
                </div>
              </div>

              {/* Features */}
              {features && features.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold text-gray-800 mb-3">Includes:</h3>
                  <ul className="space-y-2">
                    {features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Guarantee */}
              <div className="mt-6 pt-6 border-t text-center">
                <p className="text-xs text-gray-500">
                  Secure payment via Stripe
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Questions? support@landlordheaven.co.uk
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
