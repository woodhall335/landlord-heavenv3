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
import {
  requiresRentSchedule,
  computeIncludedGrounds,
  validateNoticeOnlyCase,
} from '@/lib/validation/notice-only-case-validator';
import { hasWalesArrearsGroundSelected } from '@/lib/wales';
import { Loader2 } from 'lucide-react';
import { trackWizardPreviewViewed, trackCheckoutStarted } from '@/lib/analytics';

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
  const [validationErrors, setValidationErrors] = useState<{
    blocking_issues: ValidationIssue[];
    warnings: ValidationIssue[];
    failedDocumentType?: string;
    errorCode?: string;
    userMessage?: string;
  } | null>(null);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [generatedDocs, setGeneratedDocs] = useState<GeneratedDocument[]>([]);

  const normalizeValidationIssues = (issues: any[] = []): ValidationIssue[] =>
    issues.map((issue) => ({
      code: issue.code || 'VALIDATION_ISSUE',
      fields: Array.isArray(issue.fields) ? issue.fields : [],
      affected_question_id: issue.affected_question_id,
      alternate_question_ids: issue.alternate_question_ids,
      user_fix_hint: issue.user_fix_hint || issue.description || issue.message,
      legal_reason: issue.legal_reason,
    }));

  // Helper to get all document types that should be generated for a product
  const getDocumentTypesForProduct = (
    product: string,
    jurisdiction: string,
    noticeRoute: string,
    options: { includeArrearsSchedule?: boolean } = {}
  ): string[] => {
    const types: string[] = [];

    // Determine the main notice type
    const getNoticeType = (): string => {
      if (jurisdiction === 'scotland') return 'notice_to_leave';
      if (noticeRoute === 'section_21' || noticeRoute === 'accelerated_possession') return 'section21_notice';
      return 'section8_notice';
    };

    // Helper to check if route requires arrears schedule
    // Section 21 (no-fault) does NOT require arrears schedule
    // Section 8 and Wales fault-based routes need arrears schedule when arrears data exists
    const routeRequiresArrearsSchedule = (): boolean => {
      const isSection8 = noticeRoute === 'section_8' || noticeRoute === 'section-8';
      const isWalesFaultBased = noticeRoute === 'fault_based' || noticeRoute === 'fault-based' || noticeRoute === 'wales_fault_based';
      const isScotlandWithArrears = jurisdiction === 'scotland'; // Scotland Notice to Leave can include arrears grounds
      return isSection8 || isWalesFaultBased || isScotlandWithArrears;
    };

    if (product === 'notice_only') {
      // Notice only: just the main notice + guidance
      types.push(getNoticeType());
      types.push('service_instructions');
      types.push('service_checklist');
      // Include arrears schedule when applicable (Section 8 with arrears grounds + data)
      if (options.includeArrearsSchedule) {
        types.push('arrears_schedule');
      }
    } else if (product === 'complete_pack') {
      // Complete pack: all eviction documents
      types.push(getNoticeType());

      // Court forms (England/Wales only) - route-specific per pack-contents.ts
      if (jurisdiction === 'england' || jurisdiction === 'wales') {
        // England Section 21 uses accelerated N5B procedure ONLY (no N5/N119)
        // All other routes (England Section 8, Wales Section 173, Wales fault-based) use N5 + N119
        const isEnglandSection21 =
          jurisdiction === 'england' &&
          (noticeRoute === 'section_21' ||
            noticeRoute === 'section-21' ||
            noticeRoute === 'accelerated_possession' ||
            noticeRoute === 'accelerated_section21');

        if (isEnglandSection21) {
          // England Section 21: Use N5B accelerated procedure only
          types.push('n5b_claim');
        } else {
          // England Section 8, Wales Section 173, Wales fault-based: Use standard N5 + N119 procedure
          types.push('n5_claim');
          types.push('n119_particulars');
        }
      }

      // AI-generated documents
      // Note: compliance_audit and risk_assessment removed as of Jan 2026 pack restructure
      types.push('witness_statement');

      // Guidance documents
      // Note: eviction_roadmap removed as of Jan 2026 pack restructure
      types.push('service_instructions');
      types.push('service_checklist');

      if (jurisdiction === 'england' || jurisdiction === 'wales') {
        types.push('court_filing_guide');
      } else if (jurisdiction === 'scotland') {
        types.push('tribunal_lodging_guide');
      }

      // Evidence documents
      types.push('evidence_checklist');
      types.push('proof_of_service');

      // Arrears schedule: ONLY for routes that require it (Section 8, Wales fault-based, Scotland)
      // Section 21 (no-fault) does NOT need arrears schedule
      if (routeRequiresArrearsSchedule() && options.includeArrearsSchedule) {
        types.push('arrears_schedule');
      }
    } else if (product === 'ast_standard' || product === 'tenancy_agreement') {
      types.push('ast_standard');
    } else if (product === 'ast_premium') {
      types.push('ast_premium');
    }

    // Deduplicate document types to prevent race conditions and duplicate DB inserts
    // This is a belt-and-braces measure alongside the DB UPSERT
    return [...new Set(types)];
  };

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

        // Track preview viewed (Vercel Analytics)
        const productFromFacts =
          (fetchedCase.collected_facts as any)?.meta?.product ||
          (fetchedCase.collected_facts as any)?.__meta?.product ||
          (fetchedCase.collected_facts as any)?.__meta?.original_product ||
          'unknown';
        trackWizardPreviewViewed({
          product: productFromFacts,
          route: fetchedCase.recommended_route || 'unknown',
          jurisdiction: fetchedCase.jurisdiction || 'unknown',
        });

        // Try to generate/load preview
        const factsMeta = (fetchedCase.collected_facts as any)?.meta || {};
        const originalMeta = (fetchedCase.collected_facts as any)?.__meta || {};
        const wizardFacts = (fetchedCase.collected_facts as any) || {};

        // ROBUST PRODUCT INFERENCE ORDER:
        // 1. URL query param (most explicit)
        // 2. collected_facts.meta.product
        // 3. collected_facts.__meta.product
        // 4. collected_facts.__meta.original_product
        // 5. Infer from notice-only specific facts (selected_notice_route present indicates notice_only)
        const urlProduct = searchParams.get('product');
        let inferredProduct =
          urlProduct ||
          factsMeta.product ||
          originalMeta.product ||
          originalMeta.original_product;

        // If product still not determined, infer from case characteristics
        // Notice-only cases have selected_notice_route set (from the wizard flow)
        if (!inferredProduct) {
          const hasNoticeOnlyMarkers =
            wizardFacts.selected_notice_route ||
            wizardFacts.eviction_route ||
            (originalMeta.flow === 'notice_only');

          // If we have notice-only markers and it's an eviction case, infer notice_only
          if (hasNoticeOnlyMarkers && fetchedCase.case_type === 'eviction') {
            console.log('[Preview] Inferred product=notice_only from case markers:', {
              selected_notice_route: wizardFacts.selected_notice_route,
              eviction_route: wizardFacts.eviction_route,
              flow: originalMeta.flow,
            });
            inferredProduct = 'notice_only';
          }
        }

        if (inferredProduct === 'notice_only') {
          setSelectedProduct('notice_only');
        } else if (inferredProduct) {
          setSelectedProduct(inferredProduct);
        }

        // Determine if this is a notice_only case (for choosing correct preview API)
        const isNoticeOnly = inferredProduct === 'notice_only';

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

        // Generate preview documents for thumbnails based on product
        try {
          const productForGen = inferredProduct || 'notice_only';
          const jurisdictionForGen = fetchedCase.jurisdiction || 'england';
          const routeForGen = fetchedCase.recommended_route || 'section_8';
          const facts = (fetchedCase.collected_facts as any) || {};

          // =====================================================================
          // NOTICE ONLY: Use merged preview endpoint (validates at checkout)
          // This avoids calling /api/documents/generate which doesn't support
          // all jurisdiction/route combinations (e.g., Wales routes)
          // =====================================================================
          if (isNoticeOnly) {
            console.log('[Preview] Notice Only case - skipping individual document generation', {
              caseId,
              jurisdiction: jurisdictionForGen,
              route: routeForGen,
              product: productForGen,
            });

            // For Notice Only, we don't generate individual preview documents
            // The document cards will show based on getNoticeOnlyDocuments() config
            // Actual PDF pack is generated post-payment via /api/notice-only/preview/${caseId}
            //
            // This prevents the "Route section_21 is not available for wales/notice_only"
            // error that occurs when trying to use /api/documents/generate for Wales routes

            // Call the notice-only validate endpoint to check if there are blocking issues
            // This is a lightweight validation check without generating actual documents
            try {
              const validateResponse = await fetch(`/api/notice-only/validate/${caseId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
              });

              if (validateResponse.status === 422) {
                const validateData = await validateResponse.json().catch(() => ({}));
                console.warn('[Preview] Notice Only validation found issues:', {
                  caseId,
                  blocking_issues: validateData.blocking_issues?.length || 0,
                });
                if (validateData.blocking_issues?.length > 0) {
                  setValidationErrors({
                    blocking_issues: normalizeValidationIssues(validateData.blocking_issues),
                    warnings: normalizeValidationIssues(validateData.warnings),
                  });
                  setError('VALIDATION_ERROR');
                }
              } else if (validateResponse.ok) {
                console.log('[Preview] Notice Only validation passed');
              }
            } catch (validateError) {
              // Validation endpoint may not exist - that's OK, continue without it
              console.log('[Preview] Notice Only validation not available:', validateError);
            }
          } else {
            // NON-NOTICE-ONLY: Use legacy individual document generation
            // (complete_pack, money_claim, etc.)

            const shouldIncludeArrearsScheduleForGen = (): boolean => {
              // Check for arrears data (both flat and nested locations)
              const arrearsItems = facts.arrears_items ||
                                   facts.issues?.rent_arrears?.arrears_items || [];

              // If no arrears data exists, don't include arrears schedule
              if (arrearsItems.length === 0) return false;

              // For complete_pack: include arrears schedule only for routes that need it
              // Section 21 (no-fault) does NOT require arrears schedule
              if (productForGen === 'complete_pack') {
                const isSection8 = routeForGen === 'section_8' || routeForGen === 'section-8';
                const isWalesFaultBased = routeForGen === 'fault_based' || routeForGen === 'fault-based' || routeForGen === 'wales_fault_based';
                const isScotland = jurisdictionForGen === 'scotland';
                // Section 21 routes should NOT include arrears schedule
                const isSection21 = routeForGen === 'section_21' || routeForGen === 'section-21' || routeForGen === 'accelerated_possession';
                if (isSection21) return false;
                return isSection8 || isWalesFaultBased || isScotland;
              }

              // For notice_only: existing logic for arrears grounds check
              if (productForGen === 'notice_only') {
                // England Section 8 with arrears grounds (8/10/11)
                if (routeForGen === 'section_8' || routeForGen === 'section-8') {
                  const needsSchedule = requiresRentSchedule(facts);
                  return needsSchedule;
                }

                // Wales fault-based with arrears grounds (Section 157/159)
                if (routeForGen === 'fault_based' || routeForGen === 'wales_fault_based') {
                  const walesFaultGrounds = facts.wales_fault_grounds || [];
                  return hasWalesArrearsGroundSelected(walesFaultGrounds);
                }
              }

              return false;
            };

            const documentTypesToGenerate = getDocumentTypesForProduct(
              productForGen,
              jurisdictionForGen,
              routeForGen,
              { includeArrearsSchedule: shouldIncludeArrearsScheduleForGen() }
            );

            console.log('[Preview] Generating preview documents:', documentTypesToGenerate);

            let previewBlocked = false;

            const generateDoc = async (docType: string) => {
              try {
                if (previewBlocked) {
                  return null;
                }
                const response = await fetch('/api/documents/generate', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    case_id: caseId,
                    document_type: docType,
                    is_preview: true,
                  }),
                });

                if (response.ok) {
                  const result = await response.json();
                  if (result.document?.id) {
                    return {
                      id: result.document.id,
                      document_type: result.document.document_type,
                      title: result.document.document_title || result.document.title,
                    };
                  }
                }
                if (response.status === 422) {
                  const errorPayload = await response.json().catch(() => ({}));
                  console.warn('[Preview] Preview generation blocked:', {
                    caseId,
                    docType,
                    code: errorPayload.code,
                    user_message: errorPayload.user_message,
                    blocking_issues: errorPayload.blocking_issues,
                    errorPayload,
                  });
                  previewBlocked = true;

                  // Get user-friendly document title for display
                  const docTypeLabels: Record<string, string> = {
                    section8_notice: 'Section 8 Notice',
                    section21_notice: 'Section 21 Notice (Form 6A)',
                    n5_claim: 'Form N5 - Claim for Possession',
                    n119_particulars: 'Form N119 - Particulars of Claim',
                    n5b_claim: 'Form N5B - Accelerated Possession',
                    witness_statement: 'Witness Statement',
                    service_instructions: 'Service Instructions',
                    service_checklist: 'Service Checklist',
                    court_filing_guide: 'Court Filing Guide',
                    evidence_checklist: 'Evidence Checklist',
                    proof_of_service: 'Proof of Service',
                    arrears_schedule: 'Arrears Schedule',
                  };
                  const docTitle = docTypeLabels[docType] || docType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

                  setValidationErrors({
                    blocking_issues: normalizeValidationIssues(errorPayload.blocking_issues),
                    warnings: normalizeValidationIssues(errorPayload.warnings),
                    failedDocumentType: docTitle,
                    errorCode: errorPayload.code,
                    userMessage: errorPayload.user_message,
                  });
                  setError('VALIDATION_ERROR');
                  return null;
                }
                return null;
              } catch (err) {
                console.log(`[Preview] Failed to generate ${docType}:`, err);
                return null;
              }
            };

            const batchSize = 3;
            const newDocs: GeneratedDocument[] = [];

            for (let i = 0; i < documentTypesToGenerate.length; i += batchSize) {
              if (previewBlocked) break;
              const batch = documentTypesToGenerate.slice(i, i + batchSize);
              const results = await Promise.all(batch.map(generateDoc));
              results.forEach(doc => {
                if (doc) newDocs.push(doc);
              });
              if (previewBlocked) break;
            }

            if (newDocs.length > 0) {
              setGeneratedDocs(prev => {
                const combined = [...prev];
                newDocs.forEach(newDoc => {
                  if (!combined.some(d => d.id === newDoc.id)) {
                    combined.push(newDoc);
                  }
                });
                return combined;
              });
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
    // Use section_8 as fallback since it's the safer default (fault-based requires proving grounds)
    // Section 21 requires strict compliance which may not be met
    const noticeRoute = caseData.recommended_route || facts.selected_notice_route || facts.eviction_route || 'section_8';
    const caseType = caseData.case_type;

    let baseDocuments: DocumentInfo[];

    // Determine if arrears schedule should be included for Notice Only packs
    // Requires: (Section 8 route + arrears grounds) OR (Wales fault-based + arrears grounds) + arrears data exists
    const shouldIncludeArrearsSchedule = (): boolean => {
      if (product !== 'notice_only') return false;

      // Check for arrears data (both flat and nested locations)
      const arrearsItems = facts.arrears_items ||
                           facts.issues?.rent_arrears?.arrears_items || [];
      if (arrearsItems.length === 0) return false;

      // England Section 8 with arrears grounds (8/10/11)
      if (noticeRoute === 'section_8' || noticeRoute === 'section-8') {
        const needsSchedule = requiresRentSchedule(facts);
        return needsSchedule;
      }

      // Wales fault-based with arrears grounds (Section 157/159)
      if (noticeRoute === 'fault_based' || noticeRoute === 'wales_fault_based') {
        const walesFaultGrounds = facts.wales_fault_grounds || [];
        return hasWalesArrearsGroundSelected(walesFaultGrounds);
      }

      return false;
    };

    const includeArrearsSchedule = shouldIncludeArrearsSchedule();

    switch (product) {
      case 'notice_only':
        baseDocuments = getNoticeOnlyDocuments(jurisdiction, noticeRoute, { includeArrearsSchedule });
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
    // This enables matching generated documents (stored with document_type) to config cards (with id)
    const docTypeMapping: Record<string, string[]> = {
      // Section 8 / Form 3
      'notice-section-8': ['section8_notice', 'form_3_section8'],
      // Section 21 / Form 6A
      'notice-section-21': ['section21_notice', 'form_6a_section21'],
      // Wales
      'notice-section-173': ['section173_notice', 'wales_section_173', 'section_173_notice'],
      'notice-fault-based': ['fault_based_notice', 'wales_fault_based', 'fault_notice'],
      // Scotland
      'notice-to-leave': ['notice_to_leave', 'scotland_notice_to_leave'],
      // Court forms (PDF-based - thumbnails rendered from PDF page 1)
      'form-n5': ['n5_claim', 'form_n5', 'n5_possession_claim'],
      'form-n119': ['n119_particulars', 'form_n119', 'n119_particulars_of_claim'],
      'form-n5b': ['n5b_claim', 'form_n5b', 'n5b_accelerated_possession'],
      'form-e': ['form_e', 'tribunal_application', 'form_e_tribunal'],
      // AI documents
      'witness-statement': ['witness_statement'],
      'compliance-audit': ['compliance_audit'],
      'risk-assessment': ['risk_assessment'],
      // Service instructions (various routes)
      'service-instructions-s8': ['service_instructions'],
      'service-instructions-s21': ['service_instructions'],
      'service-instructions-s173': ['service_instructions'],
      'service-instructions-fault': ['service_instructions'],
      'service-instructions-ntl': ['service_instructions'],
      // Validity/Service checklists
      'validity-checklist-s8': ['service_checklist'],
      'validity-checklist-s21': ['service_checklist'],
      'validity-checklist-s173': ['service_checklist'],
      'validity-checklist-fault': ['service_checklist'],
      'validity-checklist-ntl': ['service_checklist'],
      // Pre-Service Compliance Declaration (England)
      'pre-service-compliance-s8': ['compliance_checklist', 'pre_service_compliance'],
      'pre-service-compliance-s21': ['compliance_checklist_section21', 'pre_service_compliance'],
      'pre-service-checklist-fault': ['compliance_checklist', 'pre_service_compliance'],
      // Guidance docs (consolidated - expert guidance, timeline, case summary merged into roadmap)
      'eviction-roadmap': ['eviction_roadmap'],
      'court-filing-guide': ['court_filing_guide'],
      'tribunal-lodging-guide': ['tribunal_lodging_guide'],
      // Evidence
      'arrears-schedule': ['arrears_schedule'],
      'evidence-checklist': ['evidence_checklist'],
      'proof-of-service': ['proof_of_service', 'proof_of_service_certificate'],
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

      // For notice_only products, use the notice-only thumbnail endpoint
      // This allows thumbnails without requiring database document records
      let thumbnailUrl: string | undefined;
      if (product === 'notice_only') {
        // Map config IDs to document_type for the thumbnail API
        const docTypeForThumbnail = possibleTypes[0] || doc.id;
        thumbnailUrl = `/api/notice-only/thumbnail/${caseId}?document_type=${encodeURIComponent(docTypeForThumbnail)}`;
      }

      return {
        ...doc,
        documentId: matchingGenDoc?.id,
        // For notice_only, use the new thumbnail endpoint
        // For other products, DocumentCard will use documentId to fetch from /api/documents/thumbnail
        thumbnailUrl: thumbnailUrl,
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
      // Build descriptive title and message based on what failed
      const hasBlockingIssues = validationErrors.blocking_issues && validationErrors.blocking_issues.length > 0;
      const failedDoc = validationErrors.failedDocumentType;
      const errorCode = validationErrors.errorCode;

      // Determine title based on error type
      let errorTitle = 'Unable to Generate Preview';
      let errorDescription = 'We need some additional information to complete your documents.';

      if (failedDoc) {
        errorTitle = `${failedDoc} Generation Blocked`;
        if (validationErrors.userMessage) {
          errorDescription = validationErrors.userMessage;
        } else if (errorCode === 'SECTION_21_BLOCKED') {
          errorDescription = 'Section 21 eligibility requirements not met. You may need to switch to Section 8 or resolve compliance issues.';
        } else if (errorCode === 'MISSING_REQUIRED_FIELDS') {
          errorDescription = `Some required information is missing for the ${failedDoc}.`;
        } else if (hasBlockingIssues) {
          errorDescription = `The following issues must be resolved before generating ${failedDoc}.`;
        }
      } else if (!hasBlockingIssues && validationErrors.userMessage) {
        errorDescription = validationErrors.userMessage;
      }

      return (
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {errorTitle}
              </h1>
              <p className="text-gray-600">
                {errorDescription}
              </p>
              {failedDoc && errorCode && (
                <p className="text-sm text-gray-500 mt-2">
                  Error code: {errorCode}
                </p>
              )}
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

  // Dynamically add rent schedule feature if included in documents
  const hasRentSchedule = documents.some(doc => doc.id === 'arrears-schedule');
  const dynamicFeatures = hasRentSchedule
    ? [...productMeta.features, 'Rent schedule (arrears breakdown)']
    : productMeta.features;

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
        features={dynamicFeatures}
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
