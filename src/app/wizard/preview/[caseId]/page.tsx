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
import { PRICING, formatPrice } from '@/config/pricing';

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

// Mirrors /api/documents shape (plus optional metadata)
interface DocumentRow {
  id: string;
  document_title: string;
  document_type: string;
  is_preview: boolean;
  created_at: string;
  file_path?: string | null;
  metadata?: {
    description?: string;
    pack_type?: string;
    [key: string]: any;
  } | null;
}

interface PricingOption {
  productType:
    | 'notice_only'
    | 'complete_pack'
    | 'money_claim'
    | 'sc_money_claim'
    | 'ast_standard'
    | 'ast_premium';
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

  // Preview docs for this case (is_preview = true)
  const [previewDocuments, setPreviewDocuments] = useState<DocumentRow[]>([]);
  const [previewDocsLoading, setPreviewDocsLoading] = useState(false);

  // Full pack documents (post-payment) for this case
  const [fullPackDocuments, setFullPackDocuments] = useState<DocumentRow[]>([]);
  const [fullPackDocsLoading, setFullPackDocsLoading] = useState(false);

  // Map case type to primary preview document type
  const getDocumentType = (caseType: string, caseData?: CaseData): string | null => {
    // Eviction: preview the main notice that matches the recommended route
    if (caseType === 'eviction') {
      const route = caseData?.recommended_route;

      // IMPORTANT: Smart recommend wins - no default fallback
      // If no route is recommended, we return null and show an error
      if (!route) {
        console.warn('No recommended_route found for eviction case - cannot determine document type');
        return null;
      }

      // Map the recommended route to the correct document type
      if (route === 'section_21' || route === 'accelerated_possession' || route === 'accelerated_section21') {
        return 'section21_notice';
      }

      if (route === 'section_8') {
        return 'section8_notice';
      }

      if (route === 'notice_to_leave') {
        return 'notice_to_leave';
      }

      // If we have a route but don't recognize it, log warning and return null
      console.warn(`Unrecognized recommended_route: ${route} - cannot determine document type`);
      return null;
    }

    // Tenancy agreements: check the product tier
    if (caseType === 'tenancy_agreement' && caseData?.collected_facts) {
      const originalProduct = caseData.collected_facts.__meta?.original_product;
      const productTier = caseData.collected_facts.product_tier;

      // Check original product first
      if (originalProduct === 'ast_standard') return 'ast_standard';
      if (originalProduct === 'ast_premium') return 'ast_premium';

      // Fallback to product_tier
      if (productTier === 'Standard AST') return 'ast_standard';
      if (productTier === 'Premium AST') return 'ast_premium';

      // Default to premium if no tier specified
      return 'ast_premium';
    }

    const mapping: Record<string, string> = {
      money_claim: 'money_claim',
    };

    return mapping[caseType] || null;
  };

  // Get pricing options based on case type
  const getPricingOptions = (caseType: string, jurisdiction?: string): PricingOption[] => {
    const isScotland = jurisdiction === 'scotland';

    switch (caseType) {
      case 'eviction':
        return [
          {
            productType: 'notice_only',
            name: isScotland ? 'Notice to Leave Pack' : 'Notice Only Pack',
            price: formatPrice(PRICING.NOTICE_ONLY), // ✅ Fixed: £29.99 from config (was £69.99!)
            description: isScotland
              ? 'Complete pack: Notice to Leave + professional guidance documents. Everything you need to serve notice correctly.'
              : 'Complete pack: Official notice + professional guidance documents. Everything you need to serve notice correctly.',
            features: isScotland
              ? [
                  'Notice to Leave with auto-calculated notice period (28-84 days by ground)',
                  'Service Instructions - How to serve legally in Scotland',
                  'Service & Validity Checklist - Scotland route-specific verification',
                  'Smart guidance for grounds, evidence, and notice periods',
                  'All documents merged into one PDF pack',
                ]
              : [
                  'Section 8 notice (Form 3) OR Section 21 notice (Form 6A)',
                  'Service Instructions - How to serve legally with proof of service templates',
                  'Service & Validity Checklist - Route-specific compliance verification',
                  'Smart route recommendation based on your situation',
                  'Auto-calculated expiry dates and notice periods',
                  'All documents merged into one PDF pack',
                ],
          },
          {
            productType: 'complete_pack',
            name: isScotland ? 'Complete Eviction Pack (Scotland)' : 'Complete Eviction Pack',
            price: formatPrice(PRICING.COMPLETE_EVICTION_PACK), // ✅ £149.99 from config
            description: isScotland
              ? 'Everything you need from notice to First-tier Tribunal application.'
              : 'Everything you need from notice to court eviction.',
            features: isScotland
              ? [
                  'Notice to Leave with auto-calculated dates',
                  'Form E (First-tier Tribunal application)',
                  'Rent arrears schedule & payment history log',
                  'Step-by-step tribunal roadmap & lodging guide',
                  'Evidence checklist & proof of service templates',
                  'Lifetime access to all pack documents',
                ]
              : [
                  '☁️ Ask Heaven-drafted witness statement (saves £200-500)',
                  '☁️ Ask Heaven compliance audit (8 critical checks)',
                  '☁️ Ask Heaven risk assessment report',
                  'Section 8 and/or Section 21 notice (auto-selected)',
                  'Court claim forms (N5, N119, N5B where eligible)',
                  'Rent arrears schedule & payment history log',
                  'Evidence checklist & proof of service templates',
                  'Step-by-step eviction roadmap & filing guide',
                  'Lifetime access to all pack documents',
                ],
          },
        ];

      case 'money_claim':
        return [
          {
            productType: isScotland ? 'sc_money_claim' : 'money_claim',
            name: isScotland ? 'Simple Procedure Pack' : 'Money Claim Pack',
            price: formatPrice(PRICING.MONEY_CLAIM_PACK), // ✅ £179.99 from config
            description: isScotland
              ? 'Simple Procedure money claim bundle with Form 3A and pre-action letter.'
              : 'Recover rent arrears and damages in England & Wales.',
            features: [
              isScotland ? '☁️ Ask Heaven-drafted Simple Procedure claim (saves £300-600)' : '☁️ Ask Heaven-drafted Particulars of Claim (saves £300-600)',
              isScotland ? 'Simple Procedure Form 3A (sheriff court)' : 'Money claim form (N1) & particulars',
              isScotland ? '☁️ Ask Heaven-drafted pre-action letter' : '☁️ Ask Heaven-drafted Letter Before Action',
              'Rent arrears calculation & interest breakdown (8% statutory)',
              'Deposit deduction breakdown (where applicable)',
              'Evidence index & exhibit references',
              isScotland ? 'Sheriff Court filing guide & timeline' : 'Filing guide for County Court / MCOL',
              'Lifetime access to all pack documents',
            ],
          },
        ];

      case 'tenancy_agreement':
        return [
          {
            productType: 'ast_standard',
            name: 'Standard Tenancy Agreement',
            price: formatPrice(PRICING.STANDARD_AST), // ✅ £39.99 from config
            description: 'Legally compliant AST for typical lets.',
            features: [
              'Assured Shorthold Tenancy (AST) agreement',
              'Core government model tenancy clauses',
              'Deposit protection information clause',
              'Inventory template & check-in checklist',
              'How-to-Rent booklet download link',
              'Lifetime access to documents',
            ],
          },
          {
            productType: 'ast_premium',
            name: 'Premium Tenancy Agreement',
            price: formatPrice(PRICING.PREMIUM_AST), // ✅ £59.00 from config
            description: 'Enhanced protection with additional clauses.',
            features: [
              'Everything in Standard AST',
              'Enhanced tenant obligation & rent arrears clauses',
              'Pet clauses & special conditions (if applicable)',
              'Guarantor agreement template',
              'Right to Rent checklist & guidance',
              'Professional landlord pack for lets',
            ],
          },
        ];

      default:
        return [];
    }
  };

  // Load preview documents (is_preview = true)
  const loadPreviewDocuments = async (caseIdToLoad: string) => {
    try {
      setPreviewDocsLoading(true);
      const res = await fetch(
        `/api/documents?case_id=${encodeURIComponent(caseIdToLoad)}&is_preview=true`
      );

      if (!res.ok) {
        return;
      }

      const data = (await res.json()) as { documents?: DocumentRow[] };
      setPreviewDocuments(data.documents || []);
    } catch (err) {
      console.error('Failed to load preview documents:', err);
    } finally {
      setPreviewDocsLoading(false);
    }
  };

  // Load full pack docs (post-payment)
  const loadFullPackDocuments = async (caseIdToLoad: string) => {
    try {
      setFullPackDocsLoading(true);
      const res = await fetch(`/api/documents?case_id=${encodeURIComponent(caseIdToLoad)}`);

      // If user is anonymous, this may 401 – just treat as “no pack docs yet”
      if (!res.ok) {
        return;
      }

      const data = (await res.json()) as { documents?: DocumentRow[] };
      const allDocs = data.documents || [];

      // Only keep eviction pack docs
      const packDocs = allDocs.filter((doc) => {
        const packType = doc.metadata?.pack_type;
        return (
          packType === 'complete_pack' ||
          packType === 'notice_only' ||
          packType === 'complete_eviction_pack'
        );
      });

      setFullPackDocuments(packDocs);
    } catch (err) {
      console.error('Failed to load full pack documents:', err);
    } finally {
      setFullPackDocsLoading(false);
    }
  };

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
        const fetchedCase: CaseData = caseResult.case;

        // Ensure recommended_route is set from wizard facts if not already set
        if (!fetchedCase.recommended_route && fetchedCase.collected_facts) {
          const wizardFacts = fetchedCase.collected_facts as any;
          fetchedCase.recommended_route =
            wizardFacts.selected_notice_route ||
            wizardFacts.route_recommendation?.recommended_route ||
            wizardFacts.recommended_route;
        }

        setCaseData(fetchedCase);

        const factsMeta = (fetchedCase.collected_facts as any)?.meta || {};
        const originalMeta = (fetchedCase.collected_facts as any)?.__meta || {};
        const inferredProduct =
          factsMeta.product || originalMeta.product || originalMeta.original_product;
        if (inferredProduct === 'notice_only') {
          setSelectedProduct('notice_only');
        }

        // Determine document type based on smart recommendation
        let documentType = getDocumentType(fetchedCase.case_type, fetchedCase);

        // SMART RECOMMEND WINS: If no recommendation for eviction cases, try calling checkpoint once to compute it
        if (!documentType && fetchedCase.case_type === 'eviction') {
          console.log('No recommended_route found - attempting checkpoint to compute recommendation');

          try {
            const checkpointResponse = await fetch('/api/wizard/checkpoint', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ case_id: caseId }),
            });

            const checkpointData = await checkpointResponse.json();
            console.log('Checkpoint response:', checkpointData);

            if (checkpointResponse.ok && checkpointData.ok) {
              // If checkpoint returned a recommendation, refetch the case
              if (checkpointData.recommended_route) {
                const refetchResponse = await fetch(`/api/cases/${caseId}`);
                if (refetchResponse.ok) {
                  const refetchResult = await refetchResponse.json();
                  const refetchedCase: CaseData = refetchResult.case;
                  setCaseData(refetchedCase);
                  documentType = getDocumentType(refetchedCase.case_type, refetchedCase);
                }
              }
            } else if (checkpointResponse.status === 422 || !checkpointData.ok) {
              // Checkpoint returned validation errors (422) or not ok - show helpful error
              const missingFields = checkpointData.missingFields || [];
              const reason = checkpointData.reason || 'Please complete the wizard and try again.';

              if (missingFields.length > 0) {
                throw new Error(
                  `Cannot generate preview: Missing required information - ${missingFields.join(', ')}. ${reason}`
                );
              } else {
                throw new Error(
                  `Cannot generate preview: ${checkpointData.error || 'The wizard is incomplete'}. ${reason}`
                );
              }
            }
          } catch (checkpointError) {
            console.error('Checkpoint failed:', checkpointError);
            // Re-throw to show error to user
            if (checkpointError instanceof Error) {
              throw checkpointError;
            }
            throw new Error('Failed to validate wizard completion. Please try again.');
          }
        }

        // After trying checkpoint, if still no documentType, show detailed error
        if (!documentType) {
          throw new Error(
            'Cannot generate preview: The system needs more information to recommend the right notice type. ' +
            'Please go back and complete all required questions (tenancy details, compliance checklist, grounds/route selection), ' +
            'or contact support if you believe this is an error.'
          );
        }

        // Generate preview document
        // For Notice Only, use the new merged preview API that includes all documents
        const isNoticeOnly = inferredProduct === 'notice_only';

        const previewResponse = isNoticeOnly
          ? await fetch(`/api/notice-only/preview/${caseId}`)
          : await fetch('/api/documents/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                case_id: caseId,
                document_type: documentType,
                is_preview: true,
              }),
            });

        if (!previewResponse.ok) {
          const errorData = await previewResponse.json().catch(() => ({}));
          const errorMessage = (errorData as any).error || 'Failed to generate preview document';
          const missingFields = (errorData as any).missing || [];
          const documentTypeFromError = (errorData as any).documentType || documentType;

          console.error('Preview generation error:', errorMessage, {
            documentType: documentTypeFromError,
            missingFields,
          });

          // Show user-friendly error with missing fields if available
          if (missingFields.length > 0) {
            throw new Error(
              `Missing required information for ${documentTypeFromError}: ${missingFields.join(', ')}. ` +
              'Please go back and complete these fields.'
            );
          }

          throw new Error(errorMessage);
        }

        // Handle preview response
        if (isNoticeOnly) {
          // Notice Only returns PDF directly - create blob URL
          const pdfBlob = await previewResponse.blob();
          const blobUrl = URL.createObjectURL(pdfBlob);
          setPreviewUrl(blobUrl);
        } else {
          // Other products return JSON with document ID
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
        }

        // Load any other docs for this case:
        await loadPreviewDocuments(caseId);
        if (fetchedCase.case_type === 'eviction') {
          await loadFullPackDocuments(caseId);
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
      void fetchCaseAndPreview();
    }
  }, [caseId, showToast]);

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

  const handleSignupSuccess = async () => {
    setShowSignupModal(false);
    showToast('Account created! Proceeding to checkout...', 'success');

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
            <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-6">{error || 'Failed to load preview'}</p>
            <Button onClick={() => router.push('/wizard')} variant="primary">
              Start Over
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const pricingOptions = getPricingOptions(caseData.case_type, caseData.jurisdiction);
  const factsMeta = (caseData.collected_facts as any)?.meta || {};
  const originalMeta = (caseData.collected_facts as any)?.__meta || {};
  const effectiveProduct =
    (factsMeta.product as string | undefined) ||
    (originalMeta.product as string | undefined) ||
    (originalMeta.original_product as string | undefined) ||
    null;
  const isEviction = caseData.case_type === 'eviction';
  const isMoneyClaim = caseData.case_type === 'money_claim';
  const isTenancy = caseData.case_type === 'tenancy_agreement';

  // Group full pack docs by category for nicer UI (eviction only)
  const categoryOrder: string[] = ['notice', 'court_form', 'guidance', 'evidence_tool', 'bonus'];
  const categoryLabels: Record<string, string> = {
    notice: 'Notices',
    court_form: 'Court forms',
    guidance: 'Guides & roadmap',
    evidence_tool: 'Evidence tools',
    bonus: 'Bonus documents',
    other: 'Other documents',
  };
  const categoryIcons: Record<string, string> = {
    notice: '📜',
    court_form: '⚖️',
    guidance: '🧭',
    evidence_tool: '📂',
    bonus: '🎁',
    other: '📁',
  };

  const groupedPackDocs: { key: string; label: string; icon: string; docs: DocumentRow[] }[] = [];
  if (fullPackDocuments.length > 0) {
    for (const cat of categoryOrder) {
      const docsInCat = fullPackDocuments.filter((d) => d.document_type === cat);
      if (docsInCat.length > 0) {
        groupedPackDocs.push({
          key: cat,
          label: categoryLabels[cat] || cat,
          icon: categoryIcons[cat] || '📁',
          docs: docsInCat,
        });
      }
    }
    const otherDocs = fullPackDocuments.filter(
      (d) => !categoryOrder.includes(d.document_type)
    );
    if (otherDocs.length > 0) {
      groupedPackDocs.push({
        key: 'other',
        label: categoryLabels.other,
        icon: categoryIcons.other,
        docs: otherDocs,
      });
    }
  }

  const isScotlandEviction = isEviction && caseData.jurisdiction === 'scotland';

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
              onClick={() =>
                router.push(
                  `/wizard/flow?type=${caseData.case_type}&jurisdiction=${caseData.jurisdiction}&case_id=${caseId}&mode=edit${
                    effectiveProduct ? `&product=${effectiveProduct}` : ''
                  }`
                )
              }
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
                {isEviction && effectiveProduct === 'notice_only'
                  ? '📦 Notice Only Pack Preview'
                  : isEviction
                  ? '📦 Eviction Pack Preview'
                  : '📄 Document Preview'}
              </h3>

              {/* Notice Only - Show special message about merged preview */}
              {effectiveProduct === 'notice_only' && (
                <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-purple-600 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">📦</div>
                    <div>
                      <h4 className="font-semibold text-purple-900 text-sm mb-1">
                        Complete Notice Only Pack Preview
                      </h4>
                      <p className="text-sm text-purple-800">
                        This preview shows your complete pack: the official notice plus professional guidance documents
                        ({isScotlandEviction ? 'service instructions and service & validity checklist' : 'service instructions and service & validity checklist'}).
                        All documents are merged into one convenient PDF for you to review.
                      </p>
                    </div>
                  </div>
                </div>
              )}

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
                  What you&apos;ll receive:
                </h4>

                {isEviction && (
                  <>
                    {/* Show auto-selected route */}
                    {caseData.recommended_route && (
                      <div className="mb-3 p-2 bg-blue-100 border border-blue-300 rounded">
                        <p className="text-sm font-semibold text-blue-900">
                          📋 Auto-selected route for your case:
                        </p>
                        <p className="text-sm text-blue-800 mt-1">
                          {isScotlandEviction && '★ Notice to Leave (Private Residential Tenancy)'}
                          {!isScotlandEviction && caseData.recommended_route === 'section_21' && '★ Section 21 notice (Form 6A) - No-fault possession'}
                          {!isScotlandEviction && caseData.recommended_route === 'section_8' && '★ Section 8 notice (Form 3) - Grounds-based possession'}
                        </p>
                      </div>
                    )}

                    <ul className="text-sm text-blue-800 space-y-1">
                      {/* NOTICE_ONLY product - notice-specific features */}
                      {effectiveProduct === 'notice_only' && isScotlandEviction && (
                        <>
                          <li>✅ Notice to Leave (PRT)</li>
                          <li>✅ Service Instructions (Scotland)</li>
                          <li>✅ Service & Validity Checklist (Scotland route-specific)</li>
                          <li>✅ Smart guidance features (grounds, notice periods, compliance verification)</li>
                          <li>✅ One merged PDF pack</li>
                        </>
                      )}

                      {effectiveProduct === 'notice_only' && !isScotlandEviction && (
                        <>
                          <li>✅ {caseData.recommended_route === 'section_21' ? 'Section 21 notice (Form 6A)' : 'Section 8 notice (Form 3)'}</li>
                          <li>✅ Service Instructions (how to serve legally)</li>
                          <li>✅ Service & Validity Checklist (route-specific)</li>
                          <li>✅ Smart guidance features (route/grounds/dates/compliance verification)</li>
                          <li>✅ All documents merged into one PDF pack</li>
                        </>
                      )}

                      {/* COMPLETE_PACK product - full eviction bundle */}
                      {effectiveProduct !== 'notice_only' && isScotlandEviction && (
                        <>
                          <li>✅ Notice to Leave with auto-calculated dates</li>
                          <li>✅ Form E (First-tier Tribunal application)</li>
                          <li>✅ Rent arrears schedule & payment history log</li>
                          <li>✅ Evidence checklist & proof of service templates</li>
                          <li>✅ Step-by-step tribunal roadmap & lodging guide</li>
                          <li>✅ Lifetime access to all documents in your dashboard</li>
                        </>
                      )}

                      {effectiveProduct !== 'notice_only' && !isScotlandEviction && (
                        <>
                          <li>✅ {caseData.recommended_route === 'section_21' ? 'Section 21 notice (Form 6A)' : caseData.recommended_route === 'section_8' ? 'Section 8 notice (Form 3)' : 'Required notice'} (auto-selected)</li>
                          <li>✅ Court possession claim forms (N5, N119, and N5B where eligible)</li>
                          <li>✅ Rent arrears schedule & payment history log</li>
                          <li>✅ Evidence checklist & proof of service templates</li>
                          <li>✅ Step-by-step court roadmap & filing guide</li>
                          <li>✅ Lifetime access to all documents in your dashboard</li>
                        </>
                      )}
                    </ul>
                  </>
                )}

                {isMoneyClaim && (
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>
                      ✅{' '}
                      {caseData.jurisdiction === 'scotland'
                        ? 'Simple Procedure Form 3A and supporting schedules'
                        : 'Money claim form (N1) and particulars'}
                    </li>
                    <li>✅ Rent arrears and interest calculation schedule</li>
                    <li>✅ Deposit deduction breakdown (if applicable)</li>
                    <li>✅ Pre-action / letter before action template</li>
                    <li>✅ Filing guide with step-by-step instructions</li>
                    <li>✅ Lifetime access to all documents in your dashboard</li>
                  </ul>
                )}

                {isTenancy && (
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>✅ Court-ready tenancy agreement (AST / PRT / NI as applicable)</li>
                    <li>✅ Editable version for future reuse</li>
                    <li>✅ Inventory and check-in templates</li>
                    <li>✅ Key compliance guidance (deposit, HTR, safety)</li>
                    <li>✅ Lifetime access in your dashboard</li>
                  </ul>
                )}

                {!isEviction && !isMoneyClaim && !isTenancy && (
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>✅ Court-ready PDF (no watermark)</li>
                    <li>✅ Editable HTML version</li>
                    <li>✅ Step-by-step filing or usage guide</li>
                    <li>✅ Lifetime access in your dashboard</li>
                  </ul>
                )}
              </div>

              {/* Eviction pack contents overview */}
              {isEviction && (
                <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    Pack contents for this case
                  </h4>

                  {fullPackDocsLoading && (
                    <p className="text-sm text-gray-600">
                      Checking for any existing pack documents…
                    </p>
                  )}

                  {!fullPackDocsLoading && groupedPackDocs.length === 0 && (
                    <p className="text-sm text-gray-600">
                      Your complete eviction pack will include multiple notices,
                      court / tribunal forms, schedules, checklists and guidance
                      documents tailored to this case. These will be fully
                      generated and unlocked in your dashboard after purchase.
                    </p>
                  )}

                  {!fullPackDocsLoading && groupedPackDocs.length > 0 && (
                    <>
                      {isScotlandEviction && (
                        <p className="text-sm text-gray-700 mb-3">
                          These documents form your bundle for the First-tier
                          Tribunal for Scotland (Housing and Property Chamber).
                        </p>
                      )}

                      {!isScotlandEviction && (
                        <p className="text-sm text-gray-700 mb-3">
                          The following documents have already been generated
                          for this case and will be available in your dashboard
                          as part of your eviction pack:
                        </p>
                      )}

                      <div className="space-y-3">
                        {groupedPackDocs.map((group) => (
                          <div
                            key={group.key}
                            className="border border-gray-200 rounded-md p-3 bg-white"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                <span>{group.icon}</span>
                                <span>{group.label}</span>
                              </span>
                              <span className="text-xs text-gray-500">
                                {group.docs.length} document
                                {group.docs.length > 1 ? 's' : ''}
                              </span>
                            </div>
                            <ul className="text-sm text-gray-700 space-y-1">
                              {group.docs.map((doc) => (
                                <li
                                  key={doc.id}
                                  className="flex items-center justify-between gap-2"
                                >
                                  <span>{doc.document_title}</span>
                                  {doc.is_preview && (
                                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                      Preview
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {previewDocsLoading && (
                    <p className="mt-3 text-xs text-gray-500">
                      Generating preview documents…
                    </p>
                  )}

                  {!previewDocsLoading && previewDocuments.length > 0 && (
                    <div className="mt-3 border-t border-gray-200 pt-3">
                      <h5 className="text-xs font-semibold text-gray-700 mb-1">
                        Preview documents created for this case
                      </h5>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {previewDocuments.map((doc) => (
                          <li key={doc.id}>• {doc.document_title}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
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
                    <h3 className="text-2xl font-bold text-gray-900">{option.name}</h3>
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
                Yes! All documents are based on official court and tribunal forms and
                government-approved templates. They&apos;re designed to be court-ready
                and comply with current UK landlord-tenant law.
              </p>
            </Card>

            <Card>
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I edit the documents after purchase?
              </h3>
              <p className="text-gray-600 text-sm">
                Yes! You&apos;ll receive both a PDF version (for printing/filing) and
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
