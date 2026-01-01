/**
 * Wizard Preview & Checkout Page
 *
 * Displays document cards with locked/unlocked state and handles Stripe checkout
 * for one-time purchases (eviction, money claim, tenancy agreement)
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button, Card, Loading, ValidationErrors, type ValidationIssue } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { SignupModal } from '@/components/modals/SignupModal';
import { PreviewPageLayout, DocumentInfo } from '@/components/preview';
import {
  getNoticeOnlyDocuments,
  getCompletePackDocuments,
  getMoneyClaimDocuments,
  getASTDocuments,
  getProductMeta,
} from '@/lib/documents/document-configs';
import { Loader2 } from 'lucide-react';

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

interface GeneratedDocument {
  id: string;
  document_type: string;
  title: string;
}

export default function WizardPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const caseId = params.caseId as string;

  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ blocking_issues: ValidationIssue[]; warnings: ValidationIssue[] } | null>(null);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [generatedDocs, setGeneratedDocs] = useState<GeneratedDocument[]>([]);

  // Fetch case data
  useEffect(() => {
    const fetchCase = async () => {
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
            wizardFacts.eviction_route ||
            wizardFacts.route_recommendation?.recommended_route ||
            wizardFacts.recommended_route;
        }

        setCaseData(fetchedCase);

        // Try to generate/load preview
        const factsMeta = (fetchedCase.collected_facts as any)?.meta || {};
        const originalMeta = (fetchedCase.collected_facts as any)?.__meta || {};
        const inferredProduct =
          factsMeta.product || originalMeta.product || originalMeta.original_product;

        if (inferredProduct === 'notice_only') {
          setSelectedProduct('notice_only');
        } else if (inferredProduct) {
          setSelectedProduct(inferredProduct);
        }

        // Validate with checkpoint if needed for eviction cases
        if (fetchedCase.case_type === 'eviction' && !fetchedCase.recommended_route) {
          try {
            const checkpointResponse = await fetch('/api/wizard/checkpoint', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ case_id: caseId }),
            });

            const checkpointData = await checkpointResponse.json();

            if (checkpointResponse.status === 422) {
              if (checkpointData.code === 'LEGAL_BLOCK' && checkpointData.blocking_issues) {
                setValidationErrors({
                  blocking_issues: checkpointData.blocking_issues || [],
                  warnings: checkpointData.warnings || [],
                });
                setError('VALIDATION_ERROR');
                setLoading(false);
                return;
              }
            }

            // Refetch case if checkpoint updated it
            if (checkpointData.ok && checkpointData.recommended_route) {
              const refetchResponse = await fetch(`/api/cases/${caseId}`);
              if (refetchResponse.ok) {
                const refetchResult = await refetchResponse.json();
                setCaseData(refetchResult.case);
              }
            }
          } catch (checkpointError) {
            console.warn('Checkpoint validation failed:', checkpointError);
          }
        }

        // Fetch generated documents for this case (for thumbnails)
        try {
          const docsResponse = await fetch(`/api/cases/${caseId}/documents`);
          if (docsResponse.ok) {
            const docsResult = await docsResponse.json();
            if (docsResult.documents && Array.isArray(docsResult.documents)) {
              setGeneratedDocs(docsResult.documents.map((doc: any) => ({
                id: doc.id,
                document_type: doc.document_type,
                title: doc.document_title,
              })));
            }
          }
        } catch (docsError) {
          console.log('Could not fetch generated documents:', docsError);
        }

        // Generate preview documents for thumbnails
        try {
          const isNoticeOnly = inferredProduct === 'notice_only';
          if (!isNoticeOnly) {
            const previewResponse = await fetch('/api/documents/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                case_id: caseId,
                document_type: getDocumentType(fetchedCase),
                is_preview: true,
              }),
            });

            if (previewResponse.ok) {
              const previewResult = await previewResponse.json();
              if (previewResult.document?.id) {
                // Add this document to generated docs for thumbnails
                setGeneratedDocs(prev => {
                  const exists = prev.some(d => d.id === previewResult.document.id);
                  if (!exists) {
                    return [...prev, {
                      id: previewResult.document.id,
                      document_type: previewResult.document.document_type,
                      title: previewResult.document.title,
                    }];
                  }
                  return prev;
                });
              }
            }
          }
        } catch (previewError) {
          console.log('Preview generation not available:', previewError);
        }
      } catch (err: any) {
        console.error('Error loading case:', err);
        setError(err.message || 'Failed to load case');
      } finally {
        setLoading(false);
      }
    };

    if (caseId) {
      void fetchCase();
    }
  }, [caseId, showToast]);

  // Helper to determine document type
  const getDocumentType = (caseData: CaseData): string => {
    if (caseData.case_type === 'eviction') {
      const route = caseData.recommended_route;
      if (route === 'section_21' || route === 'accelerated_possession') {
        return 'section21_notice';
      }
      if (route === 'section_8') {
        return 'section8_notice';
      }
      if (route === 'notice_to_leave') {
        return 'notice_to_leave';
      }
    }
    if (caseData.case_type === 'money_claim') {
      return 'money_claim';
    }
    if (caseData.case_type === 'tenancy_agreement') {
      return 'ast_standard';
    }
    return 'section8_notice';
  };

  // Get documents based on product and case type, enriched with generated document IDs
  const getDocuments = (): DocumentInfo[] => {
    if (!caseData) return [];

    const facts = caseData.collected_facts as any || {};
    const product = selectedProduct || facts.product || facts.__meta?.product || searchParams.get('product') || 'notice_only';
    const jurisdiction = caseData.jurisdiction || 'england';
    const noticeRoute = caseData.recommended_route || facts.selected_notice_route || facts.eviction_route || 'section_21';
    const caseType = caseData.case_type;

    let baseDocuments: DocumentInfo[];

    switch (product) {
      case 'notice_only':
        baseDocuments = getNoticeOnlyDocuments(jurisdiction, noticeRoute);
        break;
      case 'complete_pack':
        baseDocuments = getCompletePackDocuments(jurisdiction, noticeRoute);
        break;
      case 'money_claim':
      case 'sc_money_claim':
        baseDocuments = getMoneyClaimDocuments(jurisdiction);
        break;
      case 'ast_standard':
      case 'tenancy_agreement':
        baseDocuments = getASTDocuments(jurisdiction, 'standard');
        break;
      case 'ast_premium':
        baseDocuments = getASTDocuments(jurisdiction, 'premium');
        break;
      default:
        // Infer from case type
        if (caseType === 'money_claim') {
          baseDocuments = getMoneyClaimDocuments(jurisdiction);
        } else if (caseType === 'tenancy_agreement') {
          baseDocuments = getASTDocuments(jurisdiction, 'standard');
        } else {
          baseDocuments = getNoticeOnlyDocuments(jurisdiction, noticeRoute);
        }
    }

    // Mapping from config document IDs to database document_type values
    const docTypeMapping: Record<string, string[]> = {
      // Section 8 / Form 3
      'notice-section-8': ['section8_notice', 'form_3_section8'],
      // Section 21 / Form 6A
      'notice-section-21': ['section21_notice', 'form_6a_section21'],
      // Wales
      'notice-section-173': ['section173_notice', 'wales_section_173'],
      'notice-fault-based': ['fault_based_notice', 'wales_fault_based'],
      // Scotland
      'notice-to-leave': ['notice_to_leave', 'scotland_notice_to_leave'],
      // Court forms
      'form-n5': ['n5_claim', 'form_n5'],
      'form-n119': ['n119_particulars', 'form_n119'],
      'form-n5b': ['n5b_claim', 'form_n5b'],
      'form-e': ['form_e', 'tribunal_application'],
      // AI documents
      'witness-statement': ['witness_statement'],
      'compliance-audit': ['compliance_audit'],
      'risk-assessment': ['risk_assessment'],
      // Guidance docs
      'eviction-roadmap': ['eviction_roadmap'],
      'expert-guidance': ['expert_guidance'],
      'court-filing-guide': ['court_filing_guide'],
      'tribunal-lodging-guide': ['tribunal_lodging_guide'],
      // Evidence
      'arrears-schedule': ['arrears_schedule'],
      'evidence-checklist': ['evidence_checklist'],
      'proof-of-service': ['proof_of_service'],
    };

    // Enrich documents with generated document IDs for thumbnails
    return baseDocuments.map(doc => {
      // Try to find a matching generated document
      const possibleTypes = docTypeMapping[doc.id] || [doc.id];
      const matchingGenDoc = generatedDocs.find(
        gd => possibleTypes.includes(gd.document_type) ||
              gd.document_type === doc.id ||
              gd.document_type.replace(/_/g, '-') === doc.id ||
              doc.id.replace(/-/g, '_') === gd.document_type
      );

      return {
        ...doc,
        documentId: matchingGenDoc?.id,
      };
    });
  };

  // Get product metadata
  const getProduct = (): string => {
    if (!caseData) return 'notice_only';
    const facts = caseData.collected_facts as any || {};
    return selectedProduct || facts.product || facts.__meta?.product || searchParams.get('product') || 'notice_only';
  };

  // Retry function for validation errors
  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setValidationErrors(null);
    window.location.reload();
  };

  // Route switching functions
  const getCurrentRoute = (): string | undefined => {
    if (caseData?.recommended_route) {
      return caseData.recommended_route;
    }
    const facts = caseData?.collected_facts as any;
    return facts?.selected_notice_route || facts?.eviction_route;
  };

  const getAlternativeRoutes = (): string[] => {
    const currentRoute = getCurrentRoute();
    const jurisdiction = caseData?.jurisdiction;

    if (jurisdiction === 'england' && currentRoute === 'section_21') {
      return ['section_8'];
    }
    if (jurisdiction === 'wales' && currentRoute === 'wales_section_173') {
      return ['wales_fault_based'];
    }
    return [];
  };

  const handleSwitchRoute = async (newRoute: string): Promise<void> => {
    try {
      const response = await fetch('/api/wizard/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: caseId,
          question_id: 'selected_notice_route',
          answer: newRoute,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to switch route');
      }

      showToast(`Switching to ${newRoute === 'section_8' ? 'Section 8' : newRoute}...`, 'success');
      window.location.reload();
    } catch (err: any) {
      console.error('Route switch failed:', err);
      showToast(err.message || 'Failed to switch route', 'error');
      throw err;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your documents...</p>
        </div>
      </div>
    );
  }

  // Error state with structured validation errors
  if (error || !caseData) {
    if (error === 'VALIDATION_ERROR' && validationErrors) {
      return (
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Unable to Generate Preview
              </h1>
              <p className="text-gray-600">
                We need some additional information to complete your documents.
              </p>
            </div>

            <ValidationErrors
              blocking_issues={validationErrors.blocking_issues}
              warnings={validationErrors.warnings}
              caseId={caseId}
              caseType={caseData?.case_type as 'eviction' | 'money_claim' | 'tenancy_agreement'}
              jurisdiction={caseData?.jurisdiction as 'england' | 'wales' | 'scotland' | 'northern-ireland'}
              product={(caseData?.collected_facts as any)?.__meta?.product}
              onRetry={handleRetry}
              currentRoute={getCurrentRoute()}
              alternativeRoutes={getAlternativeRoutes()}
              onSwitchRoute={handleSwitchRoute}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
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

  // Get documents and product info
  const documents = getDocuments();
  const product = getProduct();
  const productMeta = getProductMeta(product);

  return (
    <>
      <PreviewPageLayout
        caseId={caseId}
        product={product}
        productName={productMeta.name}
        price={productMeta.price}
        originalPrice={productMeta.originalPrice}
        savings={productMeta.savings}
        documents={documents}
        features={productMeta.features}
      />

      {/* Signup Modal */}
      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSuccess={async () => {
          setShowSignupModal(false);
          showToast('Account created! Proceeding to checkout...', 'success');
          // Reload page to refresh auth state
          window.location.reload();
        }}
        caseId={caseId}
      />
    </>
  );
}
