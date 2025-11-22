/**
 * Wizard Preview & Checkout Page
 *
 * Displays watermarked preview document and handles Stripe checkout
 * for one-time purchases (eviction, money claim, tenancy agreement)
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Card, Loading } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { SignupModal } from '@/components/modals/SignupModal';

interface CaseData {
  id: string;
  case_type: string;
  jurisdiction: string;
  status: string;
  collected_facts: Record<string, any>;
  recommended_route?: string;
  recommended_grounds?: string[];
  created_at: string;
}

interface PricingOption {
  productType: 'notice_only' | 'complete_pack' | 'money_claim' | 'ast_standard' | 'ast_premium';
  name: string;
  price: string;
  description: string;
  features: string[];
}

export default function WizardPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const caseId = params.caseId as string;

  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  // Fetch case data and generate preview
  useEffect(() => {
    const fetchCaseAndPreview = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch case data
        const caseResponse = await fetch(`/api/cases/${caseId}`);
        if (!caseResponse.ok) {
          throw new Error('Failed to fetch case data');
        }

        const caseResult = await caseResponse.json();
        setCaseData(caseResult.case);

        // Generate preview document
        const previewResponse = await fetch('/api/documents/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            case_id: caseId,
            document_type: getDocumentType(caseResult.case.case_type),
            is_preview: true,
          }),
        });

        if (!previewResponse.ok) {
          // Get the actual error message from the server
          const errorData = await previewResponse.json().catch(() => ({}));
          const errorMessage = errorData.error || 'Failed to generate preview document';
          console.error('Preview generation error:', errorMessage);
          throw new Error(errorMessage);
        }

        const previewResult = await previewResponse.json();

        // Get signed URL for preview
        if (previewResult.document?.id) {
          const signedUrlResponse = await fetch(
            `/api/documents/preview/${previewResult.document.id}`
          );

          if (signedUrlResponse.ok) {
            const signedUrlResult = await signedUrlResponse.json();
            setPreviewUrl(signedUrlResult.preview_url);
          }
        }
      } catch (err: any) {
        console.error('Error loading preview:', err);
        setError(err.message || 'Failed to load preview');
        showToast('Failed to load preview. Please try again.', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (caseId) {
      fetchCaseAndPreview();
    }
  }, [caseId, showToast]);

  // Map case type to document type
  const getDocumentType = (caseType: string): string => {
    const mapping: Record<string, string> = {
      eviction: 'section8_notice',
      money_claim: 'money_claim',
      tenancy_agreement: 'ast_premium',
    };
    return mapping[caseType] || 'section8_notice';
  };

  // Get pricing options based on case type
  const getPricingOptions = (caseType: string): PricingOption[] => {
    switch (caseType) {
      case 'eviction':
        return [
          {
            productType: 'complete_pack',
            name: 'Complete Eviction Pack',
            price: '£149.99',
            description: 'Everything you need to evict your tenant legally',
            features: [
              'Section 8 or Section 21 Notice',
              'Court claim forms (N5/N5A)',
              'Letter before action',
              'Step-by-step filing guide',
              'Multi-jurisdiction support',
              'Lifetime access to documents',
            ],
          },
        ];

      case 'money_claim':
        return [
          {
            productType: 'money_claim',
            name: 'Money Claim Pack',
            price: '£129.99',
            description: 'Recover rent arrears and damages',
            features: [
              'Money claim form (N1)',
              'Rent arrears calculation',
              'Deposit deduction breakdown',
              'Letter before action',
              'Filing guide for Money Claim Online',
              'Lifetime access to documents',
            ],
          },
        ];

      case 'tenancy_agreement':
        return [
          {
            productType: 'ast_standard',
            name: 'Standard Tenancy Agreement',
            price: '£39.99',
            description: 'Legally compliant AST',
            features: [
              'Assured Shorthold Tenancy (AST)',
              'Government model tenancy clauses',
              'Deposit protection certificate',
              'Inventory template',
              'How-to-Rent booklet',
              'Lifetime access to documents',
            ],
          },
          {
            productType: 'ast_premium',
            name: 'Premium Tenancy Agreement',
            price: '£59.00',
            description: 'Enhanced protection with additional clauses',
            features: [
              'Everything in Standard',
              'Enhanced tenant obligation clauses',
              'Pet clauses (if applicable)',
              'Guarantor agreement template',
              'Right to Rent checklist',
              'Professional lettings pack',
            ],
          },
        ];

      default:
        return [];
    }
  };

  // Handle checkout
  const handleCheckout = async (productType: string) => {
    try {
      setCheckoutLoading(true);

      // Check if user is authenticated
      const authCheckResponse = await fetch('/api/auth/me');

      if (!authCheckResponse.ok) {
        // User is anonymous - show signup modal
        setSelectedProduct(productType);
        setShowSignupModal(true);
        setCheckoutLoading(false);
        return;
      }

      // User is authenticated - proceed to checkout
      await proceedToCheckout(productType);
    } catch (err: any) {
      console.error('Checkout error:', err);
      showToast('Failed to start checkout. Please try again.', 'error');
      setCheckoutLoading(false);
    }
  };

  const proceedToCheckout = async (productType: string) => {
    try {
      const response = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_type: productType,
          case_id: caseId,
          success_url: `${window.location.origin}/dashboard/cases/${caseId}?payment=success`,
          cancel_url: `${window.location.origin}/wizard/preview/${caseId}?payment=cancelled`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const result = await response.json();

      // Redirect to Stripe Checkout
      if (result.session_url) {
        window.location.href = result.session_url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      showToast('Failed to start checkout. Please try again.', 'error');
      setCheckoutLoading(false);
    }
  };

  const handleSignupSuccess = async (userId: string) => {
    // Close modal
    setShowSignupModal(false);

    // Show success message
    showToast('Account created! Proceeding to checkout...', 'success');

    // Proceed to checkout with selected product
    if (selectedProduct) {
      await proceedToCheckout(selectedProduct);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loading variant="spinner" size="large" />
          <p className="text-gray-600">Generating your preview...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !caseData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <div className="text-center">
            <div className="text-red-600 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-6">
              {error || 'Failed to load preview'}
            </p>
            <Button onClick={() => router.push('/wizard')} variant="primary">
              Start Over
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const pricingOptions = getPricingOptions(caseData.case_type);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your Documents Are Ready! 🎉
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Review your preview below. Purchase to download the final documents
            without watermarks.
          </p>
          <div className="mt-6">
            <Button
              onClick={() => router.push(`/wizard/flow?type=${caseData.case_type}&jurisdiction=${caseData.jurisdiction}&edit=${caseId}`)}
              variant="secondary"
              size="medium"
            >
              ✏️ Edit Answers
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Preview Section */}
          <div>
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📄 Document Preview
              </h3>

              {previewUrl ? (
                <div className="relative bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 bg-yellow-50 border-b border-yellow-200 px-4 py-2 z-10">
                    <p className="text-sm text-yellow-800 text-center font-medium">
                      ⚠️ PREVIEW MODE - Watermarked document. Purchase to remove
                      watermark.
                    </p>
                  </div>

                  <iframe
                    src={previewUrl}
                    className="w-full h-[600px] mt-12"
                    title="Document Preview"
                  />
                </div>
              ) : (
                <div className="bg-gray-100 rounded-lg p-12 text-center">
                  <p className="text-gray-600">Preview not available</p>
                </div>
              )}

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">
                  What you'll receive:
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✅ Court-ready PDF (no watermark)</li>
                  <li>✅ Editable HTML version</li>
                  <li>✅ Step-by-step filing guide</li>
                  <li>✅ Lifetime access in your dashboard</li>
                  <li>✅ Multi-jurisdiction support</li>
                </ul>
              </div>
            </Card>
          </div>

          {/* Pricing Section */}
          <div>
            <div className="space-y-6">
              {pricingOptions.map((option, index) => (
                <Card
                  key={option.productType}
                  className={
                    index === pricingOptions.length - 1
                      ? 'border-2 border-primary shadow-lg'
                      : ''
                  }
                >
                  {index === pricingOptions.length - 1 && (
                    <div className="bg-primary text-white text-center py-1 text-sm font-semibold -mt-6 -mx-6 mb-4 rounded-t-lg">
                      RECOMMENDED
                    </div>
                  )}

                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {option.name}
                    </h3>
                    <p className="text-gray-600 mt-1">{option.description}</p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-primary">
                        {option.price}
                      </span>
                      <span className="text-gray-600">one-time payment</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {option.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-green-600 text-lg">✓</span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleCheckout(option.productType)}
                    variant="primary"
                    size="large"
                    className="w-full"
                    disabled={checkoutLoading}
                  >
                    {checkoutLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loading variant="spinner" size="small" />
                        Processing...
                      </span>
                    ) : (
                      `Buy ${option.name}`
                    )}
                  </Button>

                  <p className="text-center text-xs text-gray-500 mt-3">
                    Secure payment via Stripe • Instant download
                  </p>
                </Card>
              ))}
            </div>

            {/* Trust indicators */}
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span>🔒</span>
                  <span>Secure checkout</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>⚡</span>
                  <span>Instant access</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>✅</span>
                  <span>Court-approved</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-2">
                Are these documents legally valid?
              </h3>
              <p className="text-gray-600 text-sm">
                Yes! All documents are based on official court forms and
                government-approved templates. They're designed to be
                court-ready and comply with current UK landlord-tenant law.
              </p>
            </Card>

            <Card>
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I edit the documents after purchase?
              </h3>
              <p className="text-gray-600 text-sm">
                Yes! You'll receive both a PDF version (for printing/filing) and
                an HTML version that you can edit if needed.
              </p>
            </Card>

            <Card>
              <h3 className="font-semibold text-gray-900 mb-2">
                What if I need to regenerate the documents?
              </h3>
              <p className="text-gray-600 text-sm">
                Your documents are stored in your dashboard with lifetime access.
                You can download them anytime. If you need to create a new set
                with different information, simply start a new case.
              </p>
            </Card>

            <Card>
              <h3 className="font-semibold text-gray-900 mb-2">
                Is my payment information secure?
              </h3>
              <p className="text-gray-600 text-sm">
                Absolutely! We use Stripe for payment processing. We never store
                your card details. All transactions are encrypted and PCI
                compliant.
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Signup Modal */}
      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSuccess={handleSignupSuccess}
        caseId={caseId}
      />
    </div>
  );
}
