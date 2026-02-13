/**
 * Case Detail Page
 *
 * Individual case view with timeline, collected facts, and documents
 */

'use client';

import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { RiErrorWarningLine, RiEditLine, RiFileTextLine, RiExternalLinkLine, RiBookOpenLine, RiCustomerService2Line, RiDownloadLine, RiRefreshLine, RiCheckboxCircleLine, RiLoader4Line, RiDeleteBinLine, RiAlertLine } from 'react-icons/ri';
import { Section21ActionRequired } from '@/components/dashboard/Section21ActionRequired';
import { PostPurchaseCrossSell } from '@/components/dashboard/PostPurchaseCrossSell';
import { TenancySummaryPanel } from '@/components/dashboard/TenancySummaryPanel';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { trackPurchase, trackPaymentSuccessLanded, trackDocumentDownloadClicked, trackCaseArchived, trackMoneyClaimPurchaseCompleted, type PurchaseAttribution, type MoneyClaimReason } from '@/lib/analytics';
import { getAttributionForAnalytics } from '@/lib/wizard/wizardAttribution';
import { downloadDocument } from '@/lib/documents/download';
import type { OrderStatusResponse } from '@/app/api/orders/status/route';
import { getPackContents, getNextSteps } from '@/lib/products';
import type { PackItem } from '@/lib/products';
import { formatEditWindowEndDate } from '@/lib/payments/edit-window';
import { deriveDisplayStatus } from '@/lib/case-status';
import { validateUrlProduct, type CanonicalJurisdiction } from '@/lib/tenancy/product-normalization';

interface CaseDetails {
  id: string;
  case_type: string;
  jurisdiction: string;
  status: string;
  wizard_progress: number;
  collected_facts: Record<string, any>;
  ai_analysis: any;
  created_at: string;
  updated_at: string;
}

interface Document {
  id: string;
  document_title: string;
  document_type: string;
  is_preview: boolean;
  pdf_url: string | null;
  created_at: string;
}

// Polling configuration
const POLL_INTERVAL_MS = 2500; // 2.5 seconds
const POLL_TIMEOUT_MS = 60000; // 60 seconds max polling

/**
 * Check if a case is a tenancy agreement case
 */
function isTenancyAgreementCase(caseType: string | undefined): boolean {
  return caseType === 'tenancy_agreement';
}

/**
 * Check if a case is a Scottish tenancy agreement case
 */
function isScottishTenancyAgreementCase(
  caseType: string | undefined,
  jurisdiction: string | undefined
): boolean {
  return isTenancyAgreementCase(caseType) && jurisdiction === 'scotland';
}

/**
 * Get the appropriate route/type label for tenancy agreement cases
 * This prevents showing eviction routes like "notice_to_leave" for agreement cases
 */
function getTenancyAgreementRouteLabel(
  jurisdiction: string | undefined,
  isPremium: boolean
): string {
  switch (jurisdiction) {
    case 'scotland':
      return isPremium ? 'HMO Private Residential Tenancy' : 'Private Residential Tenancy';
    case 'wales':
      return isPremium ? 'HMO Occupation Contract' : 'Standard Occupation Contract';
    case 'northern-ireland':
      return isPremium ? 'HMO Private Tenancy' : 'Private Tenancy';
    case 'england':
    default:
      return isPremium ? 'HMO Assured Shorthold Tenancy' : 'Assured Shorthold Tenancy';
  }
}

export default function CaseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const caseId = params.id as string;

  // payment=success only means "arrived from checkout", not proof of payment
  const arrivedFromCheckout = searchParams.get('payment') === 'success';

  const [caseDetails, setCaseDetails] = useState<CaseDetails | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [askInput, setAskInput] = useState('');
  const [askHistory, setAskHistory] = useState<
    { role: 'user' | 'assistant'; content: string; timestamp: number }[]
  >([]);
  const [askLoading, setAskLoading] = useState(false);
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);

  // Order status state (DB-backed, authoritative)
  const [orderStatus, setOrderStatus] = useState<OrderStatusResponse | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingTimedOut, setPollingTimedOut] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);
  const [retryErrorFatal, setRetryErrorFatal] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollStartTimeRef = useRef<number | null>(null);
  const autoRetryAttemptedRef = useRef(false);

  // Payment confirmation state (for webhook delay handling)
  const [awaitingPaymentConfirmation, setAwaitingPaymentConfirmation] = useState(false);
  const [paymentConfirmationTimedOut, setPaymentConfirmationTimedOut] = useState(false);
  const paymentPollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const paymentPollStartTimeRef = useRef<number | null>(null);

  // Downloads section ref for auto-scroll on payment success
  const downloadsSectionRef = useRef<HTMLDivElement>(null);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [packContents, setPackContents] = useState<PackItem[]>([]);

  // Delete/Archive modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDocumentDownload = async (docId: string, documentType?: string) => {
    setDownloadingDocId(docId);
    try {
      // Track document download (Vercel Analytics)
      const params = caseDetails ? getProductAndParams() : null;
      trackDocumentDownloadClicked({
        document_type: documentType || 'unknown',
        product: params?.product,
      });

      const success = await downloadDocument(docId);
      if (!success) {
        alert('Failed to download document. Please try again.');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download document. Please try again.');
    } finally {
      setDownloadingDocId(null);
    }
  };

  const fetchCaseDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/cases/${caseId}`);

      if (response.ok) {
        const data = await response.json();
        setCaseDetails(data.case);
      } else {
        setError('Case not found');
      }
    } catch {
      setError('Failed to load case details');
    } finally {
      setIsLoading(false);
    }
  }, [caseId]);

  const fetchCaseDocuments = useCallback(async () => {
    try {
      const response = await fetch(`/api/documents?case_id=${caseId}`);

      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    }
  }, [caseId]);

  // Fetch order status from DB (authoritative source)
  const fetchOrderStatus = useCallback(async (): Promise<OrderStatusResponse | null> => {
    try {
      const response = await fetch(`/api/orders/status?case_id=${caseId}`);
      if (response.ok) {
        const data: OrderStatusResponse = await response.json();
        setOrderStatus(data);
        return data;
      }
    } catch (err) {
      console.error('Failed to fetch order status:', err);
    }
    return null;
  }, [caseId]);

  // Stop polling and cleanup
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  // Start polling for document fulfillment
  const startPolling = useCallback(() => {
    if (pollIntervalRef.current) return; // Already polling

    setIsPolling(true);
    setPollingTimedOut(false);
    pollStartTimeRef.current = Date.now();

    pollIntervalRef.current = setInterval(async () => {
      // Check timeout
      const elapsed = Date.now() - (pollStartTimeRef.current || 0);
      if (elapsed >= POLL_TIMEOUT_MS) {
        stopPolling();
        setPollingTimedOut(true);
        return;
      }

      // Fetch latest status
      const status = await fetchOrderStatus();
      if (status?.has_final_documents) {
        stopPolling();
        // Refresh documents list
        fetchCaseDocuments();
      }
    }, POLL_INTERVAL_MS);
  }, [fetchOrderStatus, stopPolling, fetchCaseDocuments]);

  // Stop payment confirmation polling
  const stopPaymentPolling = useCallback(() => {
    if (paymentPollIntervalRef.current) {
      clearInterval(paymentPollIntervalRef.current);
      paymentPollIntervalRef.current = null;
    }
    setAwaitingPaymentConfirmation(false);
  }, []);

  // Start polling for payment confirmation (when arriving from checkout but webhook hasn't fired)
  const startPaymentPolling = useCallback(() => {
    if (paymentPollIntervalRef.current) return; // Already polling

    console.log('[CaseDetailPage] Starting payment confirmation polling');
    setAwaitingPaymentConfirmation(true);
    setPaymentConfirmationTimedOut(false);
    paymentPollStartTimeRef.current = Date.now();

    paymentPollIntervalRef.current = setInterval(async () => {
      // Check timeout
      const elapsed = Date.now() - (paymentPollStartTimeRef.current || 0);
      if (elapsed >= POLL_TIMEOUT_MS) {
        console.log('[CaseDetailPage] Payment confirmation polling timed out');
        stopPaymentPolling();
        setPaymentConfirmationTimedOut(true);
        return;
      }

      // Fetch latest status
      const status = await fetchOrderStatus();
      if (status?.paid) {
        console.log('[CaseDetailPage] Payment confirmed via polling');
        stopPaymentPolling();
        // If paid but no final docs, start document polling
        if (!status.has_final_documents) {
          startPolling();
        }
      }
    }, POLL_INTERVAL_MS);
  }, [fetchOrderStatus, stopPaymentPolling, startPolling]);

  // Retry fulfillment - derives product from case details
  const retryFulfillment = useCallback(async (): Promise<boolean> => {
    setIsRetrying(true);
    setRetryError(null);
    setRetryErrorFatal(false);

    try {
      // Derive product from case details
      const params = caseDetails ? getProductAndParams() : null;
      const product = params?.product;

      const response = await fetch('/api/orders/fulfill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_id: caseId, product }),
      });

      const data = await response.json();

      if (!response.ok) {
        // 422 = missing user, 403 = permission denied - both are fatal
        if (response.status === 422 || response.status === 403) {
          setRetryError(data.user_message || data.error || 'Unable to generate documents. Please contact support.');
          setRetryErrorFatal(true);
          setIsRetrying(false);
          return false;
        }

        // Other errors - allow retry
        setRetryError(data.message || data.error || 'Document generation failed. Please try again.');
        setIsRetrying(false);
        return false;
      }

      // Success - refresh order status and documents
      if (data.status === 'fulfilled' || data.status === 'already_fulfilled') {
        await fetchOrderStatus();
        await fetchCaseDocuments();
        setIsRetrying(false);
        return true;
      }

      // Still processing - continue polling
      setIsRetrying(false);
      return true;
    } catch (err) {
      console.error('Retry fulfillment error:', err);
      setRetryError('Network error. Please check your connection and try again.');
      setIsRetrying(false);
      return false;
    }
  }, [caseId, caseDetails, fetchOrderStatus, fetchCaseDocuments]);

  // Cleanup polling on unmount or navigation
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      if (paymentPollIntervalRef.current) {
        clearInterval(paymentPollIntervalRef.current);
      }
    };
  }, []);

  const runAskHeaven = useCallback(
    async (question?: string) => {
      if (!caseId) return;

      setAskLoading(!!question);

    try {
      const response = await fetch('/api/wizard/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_id: caseId, ...(question ? { question } : {}) }),
      });

      if (!response.ok) {
        throw new Error('Failed to run Ask Heaven analysis');
      }

      const data = await response.json();
      setAnalysis(data);

      if (question) {
        setAskHistory((prev) => [
          ...prev,
          { role: 'user', content: question, timestamp: Date.now() },
          {
            role: 'assistant',
            content:
              data.ask_heaven_answer ||
              'We generated your summary above. For detailed advice, continue the wizard or contact support.',
            timestamp: Date.now(),
          },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: (err as Error).message || 'Ask Heaven is unavailable right now.' });
    } finally {
      setAskLoading(false);
    }
  },
    [caseId],
  );

  // Initial data fetch
  useEffect(() => {
    if (!caseId) return;

    fetchCaseDetails();
    fetchCaseDocuments();
    runAskHeaven();
  }, [caseId, fetchCaseDetails, fetchCaseDocuments, runAskHeaven]);

  // Load pack contents when case details are available
  useEffect(() => {
    if (!caseDetails) return;

    try {
      const facts = caseDetails.collected_facts || {};

      // Determine product from case_type
      const product = caseDetails.case_type === 'money_claim'
        ? (caseDetails.jurisdiction === 'scotland' ? 'sc_money_claim' : 'money_claim')
        : caseDetails.case_type === 'eviction'
          ? (facts.__meta?.product || 'complete_pack')
          : caseDetails.case_type === 'tenancy_agreement'
            ? (facts.tier === 'premium' ? 'ast_premium' : 'ast_standard')
            : caseDetails.case_type;

      // Compute hasInventoryData for tenancy agreements
      const inventoryData = facts.inventory || {};
      const hasInventoryData = Boolean(
        inventoryData.rooms?.length > 0 ||
        facts.inventory_attached ||
        facts.inventory_provided
      );

      const contents = getPackContents({
        product,
        jurisdiction: caseDetails.jurisdiction as 'england' | 'wales' | 'scotland' | 'northern-ireland',
        route: facts.eviction_route,
        hasInventoryData,
      });
      setPackContents(contents);
    } catch (err) {
      console.error('Failed to load pack contents:', err);
    }
  }, [caseDetails]);

  // Show payment success banner and auto-scroll to downloads
  useEffect(() => {
    if (arrivedFromCheckout && orderStatus?.paid && !showPaymentSuccess) {
      setShowPaymentSuccess(true);

      // Track payment success landing (Vercel Analytics)
      const params = caseDetails ? getProductAndParams() : null;
      trackPaymentSuccessLanded({
        product: params?.product,
        caseId_present: !!caseId,
      });

      // Auto-scroll to downloads section after a short delay
      setTimeout(() => {
        downloadsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arrivedFromCheckout, orderStatus?.paid, showPaymentSuccess]);

  // Fetch order status and handle auto-retry + polling
  useEffect(() => {
    if (!caseId) return;

    const checkOrderStatus = async () => {
      const status = await fetchOrderStatus();

      // Case 1: Arrived from checkout but payment not confirmed yet (webhook delay)
      // Start payment confirmation polling
      if (arrivedFromCheckout && !status?.paid) {
        console.log('[CaseDetailPage] Arrived from checkout, payment not yet confirmed - starting payment polling');
        startPaymentPolling();
        return;
      }

      // Case 2: Not paid and not from checkout - nothing to poll for
      if (!status?.paid) return;

      // Case 3: Already has documents - nothing to do
      if (status.has_final_documents) return;

      // Case 4: Paid but no documents - need to poll for document generation
      // If fulfillment is stuck in 'ready_to_generate' or 'failed', attempt ONE auto-retry
      const shouldAutoRetry =
        !autoRetryAttemptedRef.current &&
        !retryErrorFatal &&
        (status.fulfillment_status === 'ready_to_generate' ||
          status.fulfillment_status === 'failed');

      if (shouldAutoRetry) {
        autoRetryAttemptedRef.current = true;
        retryFulfillment().then(() => {
          // Whether success or not, start polling to check for completion
          if (!retryErrorFatal) {
            startPolling();
          }
        });
      } else if (!retryErrorFatal) {
        // No auto-retry needed, just start polling
        startPolling();
      }
    };

    checkOrderStatus();
  }, [caseId, arrivedFromCheckout, fetchOrderStatus, startPolling, startPaymentPolling, retryFulfillment, retryErrorFatal]);

  // Track purchase conversion when payment is confirmed via DB
  useEffect(() => {
    if (orderStatus?.paid && caseDetails) {
      // Prevent duplicate tracking by checking sessionStorage
      const purchaseKey = `purchase_tracked_${caseId}`;
      if (sessionStorage.getItem(purchaseKey)) return;

      // Get product info from case type
      const productName = getCaseTypeLabel(caseDetails.case_type);
      const amount = orderStatus.total_amount || 49.99;
      const currency = orderStatus.currency || 'GBP';

      // Get attribution data from session/local storage
      const attributionData = getAttributionForAnalytics();
      const attribution: PurchaseAttribution = {
        landing_path: attributionData.landing_path,
        utm_source: attributionData.utm_source,
        utm_medium: attributionData.utm_medium,
        utm_campaign: attributionData.utm_campaign,
        utm_term: attributionData.utm_term,
        utm_content: attributionData.utm_content,
        referrer: attributionData.referrer,
        jurisdiction: caseDetails.jurisdiction,
        product_type: caseDetails.case_type,
      };

      // Track purchase in analytics (GA4 + FB Pixel) with attribution
      trackPurchase(caseId, amount, currency, [
        {
          item_id: caseDetails.case_type,
          item_name: productName,
          item_category: 'legal_document',
          price: amount,
          quantity: 1,
        },
      ], attribution);

      // Additional tracking for money claims with claim reasons
      if (caseDetails.case_type === 'money_claim' && caseDetails.collected_facts) {
        const facts = caseDetails.collected_facts;
        const reasons: MoneyClaimReason[] = [];

        // Extract claim reasons from collected_facts
        if (facts.claiming_rent_arrears === true) reasons.push('rent_arrears');
        const otherTypes: string[] = facts.money_claim?.other_amounts_types || [];
        if (otherTypes.includes('property_damage')) reasons.push('property_damage');
        if (otherTypes.includes('cleaning')) reasons.push('cleaning');
        if (otherTypes.includes('unpaid_utilities')) reasons.push('unpaid_utilities');
        if (otherTypes.includes('unpaid_council_tax')) reasons.push('unpaid_council_tax');
        if (facts.claiming_other === true || otherTypes.includes('other_charges')) reasons.push('other_tenant_debt');

        // Calculate totals if available
        const arrearsItems = facts.arrears_items || facts.issues?.rent_arrears?.arrears_items || [];
        const arrearsAmount = Array.isArray(arrearsItems)
          ? arrearsItems.reduce((sum: number, item: any) => sum + (item.arrears || 0), 0)
          : 0;

        const damageItems = facts.money_claim?.damage_items || facts.damage_items || [];
        const damagesAmount = Array.isArray(damageItems)
          ? damageItems.reduce((sum: number, item: any) => sum + (item.amount || 0), 0)
          : 0;

        trackMoneyClaimPurchaseCompleted({
          reasons,
          jurisdiction: caseDetails.jurisdiction,
          order_id: caseId,
          revenue: amount,
          arrears_amount: arrearsAmount,
          damages_amount: damagesAmount,
          total_claim_amount: arrearsAmount + damagesAmount,
        });
      }

      sessionStorage.setItem(purchaseKey, 'true');
    }
  }, [orderStatus?.paid, orderStatus?.total_amount, orderStatus?.currency, caseDetails, caseId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get effective product type - prioritizes order's product_type over inferred values
  const getEffectiveProduct = (): string => {
    // First, check if we have a paid order with product_type
    if (orderStatus?.paid && orderStatus.product_type) {
      return orderStatus.product_type;
    }

    // Fall back to inferring from case details
    const params = getProductAndParams();
    return params?.product || 'notice_only';
  };

  const getCaseTypeLabel = (caseType: string): string => {
    // For eviction cases, check product type to distinguish between notice_only and complete_pack
    if (caseType === 'eviction') {
      const product = getEffectiveProduct();
      return product === 'complete_pack' ? 'Eviction Pack' : 'Eviction Notice';
    }

    const labels: Record<string, string> = {
      money_claim: 'Money Claim',
      tenancy_agreement: 'Tenancy Agreement',
    };
    return labels[caseType] || caseType;
  };

  // Get detailed case header including jurisdiction and route
  const getCaseHeaderDetails = (): { title: string; subtitle: string } => {
    const caseType = caseDetails?.case_type || '';
    const title = getCaseTypeLabel(caseType);

    // Build detailed subtitle
    const parts: string[] = [];

    // Add jurisdiction
    if (caseDetails?.jurisdiction) {
      parts.push(getJurisdictionLabel(caseDetails.jurisdiction));
    }

    // Add route/type for different case types
    if (caseType === 'eviction') {
      // Eviction cases show the notice route
      const facts = caseDetails?.collected_facts || {};
      const route = facts.route || facts.notice_route || facts.eviction_route;
      if (route) {
        const routeLabels: Record<string, string> = {
          section_8: 'Section 8',
          section_21: 'Section 21',
          section_173: 'Section 173',
          fault_based: 'Fault-Based',
          notice_to_leave: 'Notice to Leave',
        };
        const routeLabel = routeLabels[route] || route.replace(/_/g, ' ');

        // Add grounds info for Section 8
        if (route === 'section_8' && facts.ground_codes?.length > 0) {
          const groundsList = facts.ground_codes.join(', ');
          parts.push(`${routeLabel} (Ground${facts.ground_codes.length > 1 ? 's' : ''} ${groundsList})`);
        } else {
          parts.push(routeLabel);
        }
      }
    } else if (caseType === 'tenancy_agreement') {
      // Tenancy agreement cases show the agreement type, not eviction routes
      const facts = caseDetails?.collected_facts || {};
      const isPremium = facts.tier === 'premium' ||
        facts.product_tier?.includes('premium') ||
        facts.__meta?.product_tier?.includes('premium') ||
        facts.is_hmo === true;
      const agreementLabel = getTenancyAgreementRouteLabel(caseDetails?.jurisdiction, isPremium);
      parts.push(agreementLabel);
    }

    return {
      title,
      subtitle: parts.join(' — '),
    };
  };

  const getJurisdictionLabel = (jurisdiction: string): string => {
    const labels: Record<string, string> = {
      england: 'England',
      wales: 'Wales',
      'england-wales': 'England & Wales',
      scotland: 'Scotland',
      'northern-ireland': 'Northern Ireland',
    };
    // Capitalize first letter as fallback
    return labels[jurisdiction] || jurisdiction.charAt(0).toUpperCase() + jurisdiction.slice(1);
  };

  const getStatusColor = (status: string): 'neutral' | 'warning' | 'success' => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  // Get derived display status for the badge
  const getDerivedDisplayStatus = () => {
    if (!caseDetails) return { label: 'Loading...', badgeVariant: 'neutral' as const };

    // Get final documents status from orderStatus
    const hasFinalDocs = orderStatus?.has_final_documents || false;

    const displayInfo = deriveDisplayStatus({
      caseStatus: caseDetails.status,
      wizardProgress: caseDetails.wizard_progress,
      wizardCompletedAt: null, // We use wizard_progress from API which is already corrected
      paymentStatus: orderStatus?.paid ? 'paid' : null,
      fulfillmentStatus: orderStatus?.fulfillment_status || null,
      hasFinalDocuments: hasFinalDocs,
    });

    return displayInfo;
  };

  // Derive product and case parameters from case details
  const getProductAndParams = () => {
    if (!caseDetails) return null;

    const facts = caseDetails.collected_facts || {};

    // PRIORITY: Use order's product_type if available (authoritative for paid cases)
    // This prevents accidental product downgrade for paid complete_pack cases
    let product = '';
    if (orderStatus?.paid && orderStatus.product_type) {
      product = orderStatus.product_type;
    } else {
      // Fall back to facts-based inference for unpaid cases
      product = facts.product || facts.original_product || '';

      // Map case_type to product if not explicitly set
      if (!product) {
        if (caseDetails.case_type === 'money_claim') {
          product = caseDetails.jurisdiction === 'scotland' ? 'sc_money_claim' : 'money_claim';
        } else if (caseDetails.case_type === 'tenancy_agreement') {
          product = facts.tier === 'premium' ? 'ast_premium' : 'ast_standard';
        } else if (caseDetails.case_type === 'eviction') {
          product = facts.pack_type === 'complete_pack' ? 'complete_pack' : 'notice_only';
        } else {
          // Fallback - try to infer from pack_type
          product = facts.pack_type || 'notice_only';
        }
      }
    }

    // Determine route
    const route = facts.route || facts.notice_route || facts.eviction_route || null;

    // Determine notice period
    const noticePeriodDays = facts.notice_period_days || facts.notice_period || null;

    // Check for arrears
    const hasArrears = Boolean(
      facts.has_arrears ||
      facts.rent_arrears ||
      facts.arrears_amount ||
      (facts.ground_codes && (
        facts.ground_codes.includes('8') ||
        facts.ground_codes.includes('10') ||
        facts.ground_codes.includes('11')
      ))
    );

    // Check if arrears schedule is in documents
    const includeArrearsSchedule = hasArrears || documents.some(
      doc => doc.document_type === 'arrears_schedule'
    );

    // Check if inventory data was completed via wizard (for tenancy agreements)
    // Inventory data exists if inventory.rooms array has items
    const inventoryData = facts.inventory || {};
    const hasInventoryData = Boolean(
      inventoryData.rooms?.length > 0 ||
      facts.inventory_attached ||
      facts.inventory_provided
    );

    return {
      product,
      jurisdiction: caseDetails.jurisdiction,
      route,
      noticePeriodDays,
      hasArrears,
      includeArrearsSchedule,
      grounds: facts.ground_codes || null,
      hasInventoryData,
    };
  };

  // Get pack contents for "What's included" section
  const getPackContentsForCase = (): PackItem[] => {
    const params = getProductAndParams();
    if (!params) return [];

    return getPackContents({
      product: params.product,
      jurisdiction: params.jurisdiction,
      route: params.route,
      grounds: params.grounds,
      has_arrears: params.hasArrears,
      include_arrears_schedule: params.includeArrearsSchedule,
      hasInventoryData: params.hasInventoryData,
    });
  };

  // Get next steps for the case
  const getNextStepsForCase = () => {
    const params = getProductAndParams();
    if (!params) {
      return {
        title: 'What to do next',
        steps: ['Review your documents and follow the included instructions.'],
      };
    }

    return getNextSteps({
      product: params.product,
      jurisdiction: params.jurisdiction,
      route: params.route,
      notice_period_days: params.noticePeriodDays,
    });
  };

  const handleRegenerateDocument = async () => {
    if (!caseDetails) return;

    const confirmed = confirm(
      'This will regenerate all your purchased documents with the current case data. Continue?'
    );

    if (!confirmed) return;

    setIsRegenerating(true);
    setMessage(null);

    try {
      const response = await fetch('/api/orders/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: caseId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error types
        if (data.error === 'EDIT_WINDOW_EXPIRED') {
          throw new Error(data.message || 'The 30-day editing period has ended. Downloads remain available.');
        }
        throw new Error(data.message || data.error || 'Failed to regenerate documents');
      }

      setMessage({
        type: 'success',
        text: `Successfully regenerated ${data.regenerated_count || 'your'} document(s)!`,
      });

      // Refresh documents and order status
      await Promise.all([fetchCaseDocuments(), fetchOrderStatus()]);
    } catch (err: any) {
      console.error('Error regenerating documents:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to regenerate documents' });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleContinueWizard = () => {
    // SAFETY GUARD: For paid cases, always use the order's product_type
    // This prevents accidental downgrade from complete_pack to notice_only
    let product = '';
    if (orderStatus?.paid && orderStatus.product_type) {
      product = orderStatus.product_type;
    } else {
      const params = getProductAndParams();
      product = params?.product || '';
    }

    // Normalize product for jurisdiction to ensure Scotland flows use PRT, not AST
    const isTenancyFlow = caseDetails?.case_type === 'tenancy_agreement' ||
      product?.includes('ast') || product?.includes('prt') ||
      product?.includes('occupation') || product?.includes('ni_');
    const jurisdiction = (caseDetails?.jurisdiction || 'england') as CanonicalJurisdiction;

    const normalizedProduct = isTenancyFlow && product
      ? validateUrlProduct(product, jurisdiction)
      : product;

    const productParam = normalizedProduct ? `&product=${normalizedProduct}` : '';
    router.push(`/wizard/flow?type=${caseDetails?.case_type}&jurisdiction=${jurisdiction}&case_id=${caseId}${productParam}`);
  };

  const handleDeleteCase = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/cases/${caseId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Track case archived (Vercel Analytics)
        trackCaseArchived({
          had_paid_order: !!orderStatus?.paid,
        });

        setShowDeleteModal(false);
        router.push('/dashboard/cases?archived=true');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to archive case');
        setIsDeleting(false);
      }
    } catch {
      alert('Failed to archive case');
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading case details...</p>
        </div>
      </div>
    );
  }

  if (error || !caseDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card padding="large">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <RiErrorWarningLine className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-charcoal mb-2">{error}</h2>
            <Link href="/dashboard/cases">
              <Button variant="primary">Back to Cases</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <Container size="large" className="py-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <Link
                href="/dashboard/cases"
                className="text-sm text-primary hover:text-primary-dark font-medium mb-2 inline-block"
              >
                ← Back to Cases
              </Link>
              {(() => {
                const headerDetails = getCaseHeaderDetails();
                return (
                  <>
                    <h1 className="text-3xl font-extrabold text-charcoal">
                      {headerDetails.title}
                    </h1>
                    <p className="text-gray-600 mt-1">
                      {headerDetails.subtitle}
                    </p>
                  </>
                );
              })()}
            </div>
            {(() => {
              const displayInfo = getDerivedDisplayStatus();
              return (
                <Badge variant={displayInfo.badgeVariant} size="large">
                  {displayInfo.label}
                </Badge>
              );
            })()}
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600 font-medium">Overall Progress</span>
              <span className="font-semibold text-charcoal">
                {caseDetails.wizard_progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-primary h-3 rounded-full transition-all duration-300"
                style={{ width: `${caseDetails.wizard_progress}%` }}
              />
            </div>
          </div>

          {/* Edit Window Status */}
          {orderStatus?.paid && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              orderStatus.edit_window_open
                ? 'bg-primary/5 border border-primary/20 text-charcoal'
                : 'bg-warning/10 border border-warning/20 text-warning-dark'
            }`}>
              {orderStatus.edit_window_open ? (
                <span>
                  Unlimited edits &amp; regeneration until{' '}
                  <strong>{formatEditWindowEndDate(orderStatus.edit_window_ends_at!)}</strong>{' '}
                  (30 days from purchase).
                </span>
              ) : (
                <span>
                  This case is locked — the 30-day edit window ended{' '}
                  <strong>{formatEditWindowEndDate(orderStatus.edit_window_ends_at!)}</strong>.
                  Downloads remain available.
                </span>
              )}
            </div>
          )}

          {/* Action Buttons - Simplified for clarity */}
          <div className="flex flex-wrap gap-3">
            {/* Primary action: Continue wizard if not complete, or update answers if paid and edit window open */}
            {caseDetails.wizard_progress < 100 && !orderStatus?.paid && (
              <Button
                variant="primary"
                onClick={handleContinueWizard}
              >
                Continue Wizard
              </Button>
            )}

            {/* Update Answers - only if paid and edit window open */}
            {orderStatus?.paid && orderStatus?.edit_window_open && (
              <Button
                variant="secondary"
                onClick={handleContinueWizard}
              >
                <RiEditLine className="w-4 h-4 mr-2" />
                Update Answers
              </Button>
            )}

            {/* Help link */}
            <Link href="/help">
              <Button variant="outline">
                <RiBookOpenLine className="w-4 h-4 mr-2" />
                Get Help
              </Button>
            </Link>

            {/* Delete/Archive Case */}
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(true)}
              className="text-gray-600 hover:text-red-600 hover:border-red-300"
            >
              <RiDeleteBinLine className="w-4 h-4 mr-2" />
              Delete Case
            </Button>
          </div>
        </Container>
      </div>

      <Container size="large" className="py-8">
        {/* Payment Success Banner */}
        {showPaymentSuccess && orderStatus?.paid && (
          <div className="mb-6 p-6 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <RiCheckboxCircleLine className="w-7 h-7 text-green-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-green-800 mb-1">
                  Payment received — your documents are ready!
                </h2>
                <p className="text-green-700 mb-3">
                  Thank you for your purchase. Your legal documents have been generated and are ready to download below.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => downloadsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <RiDownloadLine className="w-4 h-4 mr-2" />
                    Go to Downloads
                  </button>
                  <button
                    onClick={() => setShowPaymentSuccess(false)}
                    className="text-green-600 hover:text-green-800 font-medium"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Message Display */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-success/10 text-success border border-success/20'
                : 'bg-error/10 text-error border border-error/20'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Confirming Payment - webhook hasn't fired yet */}
        {awaitingPaymentConfirmation && !paymentConfirmationTimedOut && (
          <div className="mb-6 p-6 rounded-lg border border-primary/20 bg-primary/5">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-charcoal">
                  Confirming your payment...
                </h3>
                <p className="text-gray-700 mt-1">
                  We're verifying your payment with our payment provider. This usually takes just a few seconds.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Confirmation Timeout */}
        {paymentConfirmationTimedOut && !orderStatus?.paid && (
          <div className="mb-6 p-6 rounded-lg border border-warning/20 bg-warning/5">
            <div className="flex items-start gap-3">
              <div className="text-warning text-2xl">⏳</div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-charcoal">Still confirming your payment</h3>
                <p className="text-gray-700 mt-1">
                  Payment confirmation is taking longer than expected. This can happen during high traffic.
                  Your payment may still be processing.
                </p>
                <p className="text-gray-600 mt-2 text-sm">
                  Case ID: <code className="bg-gray-100 px-2 py-1 rounded text-sm">{caseId}</code>
                </p>
                <div className="mt-4 flex gap-3">
                  <Button variant="primary" onClick={() => window.location.reload()}>
                    <RiRefreshLine className="w-4 h-4 mr-2" />
                    Refresh Page
                  </Button>
                  <Link href="/contact">
                    <Button variant="outline">
                      <RiCustomerService2Line className="w-4 h-4 mr-2" />
                      Contact Support
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Success Summary - DB-backed status (simplified - documents shown in main section below) */}
        {orderStatus?.paid && orderStatus.has_final_documents && (
          <div className="mb-6 p-6 rounded-lg border border-success/20 bg-success/5">
            <div className="flex items-start gap-3">
              <div className="text-success text-2xl">✔</div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-charcoal">Payment received — your documents are ready</h3>
                <p className="text-gray-700 mt-1">
                  Your purchase is complete. Download your documents from the &quot;Your Documents&quot; section below and follow the next steps.
                </p>

                <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* What's included - informational */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h4 className="font-semibold text-charcoal mb-3">Included in your purchase</h4>
                    {getPackContentsForCase().length === 0 ? (
                      <p className="text-sm text-gray-600">See generated documents below.</p>
                    ) : (
                      <ul className="space-y-1.5 text-sm text-gray-700">
                        {getPackContentsForCase().map((item) => (
                          <li key={item.key} className="flex items-start gap-2">
                            <span className="text-success mt-0.5">•</span>
                            <span>{item.title}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Next steps */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h4 className="font-semibold text-charcoal mb-3">{getNextStepsForCase().title}</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-800">
                      {getNextStepsForCase().steps.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fatal Error State - Cannot retry */}
        {orderStatus?.paid && retryErrorFatal && !orderStatus.has_final_documents && (
          <div className="mb-6 p-6 rounded-lg border border-error/20 bg-error/5">
            <div className="flex items-start gap-3">
              <RiErrorWarningLine className="w-6 h-6 text-error flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-charcoal">Unable to generate documents</h3>
                <p className="text-gray-700 mt-1">
                  {retryError}
                </p>
                <p className="text-gray-600 mt-2 text-sm">
                  Case ID: <code className="bg-gray-100 px-2 py-1 rounded text-sm">{caseId}</code>
                </p>
                <div className="mt-4 flex gap-3">
                  <Link href="/contact">
                    <Button variant="primary">
                      <RiCustomerService2Line className="w-4 h-4 mr-2" />
                      Contact Support
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Retryable Error State */}
        {orderStatus?.paid && !retryErrorFatal && retryError && !orderStatus.has_final_documents && !isRetrying && (
          <div className="mb-6 p-6 rounded-lg border border-error/20 bg-error/5">
            <div className="flex items-start gap-3">
              <RiErrorWarningLine className="w-6 h-6 text-error flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-charcoal">
                  We're having trouble generating your documents
                </h3>
                <p className="text-gray-700 mt-1">
                  {retryError}
                </p>
                <div className="mt-4 flex gap-3">
                  <Button variant="primary" onClick={retryFulfillment} disabled={isRetrying}>
                    <RiRefreshLine className="w-4 h-4 mr-2" />
                    Retry Generation
                  </Button>
                  <Link href="/contact">
                    <Button variant="outline">
                      <RiCustomerService2Line className="w-4 h-4 mr-2" />
                      Contact Support
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 21 Requires Action - user needs to confirm statutory requirements */}
        {/* Only show for Section 21 cases, not Section 8 or other routes */}
        {orderStatus?.paid && orderStatus.fulfillment_status === 'requires_action' && !orderStatus.has_final_documents && (() => {
          // Determine if this is a Section 21 case based on collected_facts
          const route = caseDetails?.collected_facts?.selected_notice_route ||
            caseDetails?.collected_facts?.eviction_route ||
            caseDetails?.collected_facts?.notice_type ||
            caseDetails?.case_type;
          const routeLower = (route || '').toString().toLowerCase();
          const isSection21 = routeLower.includes('section_21') ||
            routeLower.includes('section 21') ||
            routeLower === 'no_fault' ||
            routeLower === 'accelerated_possession' ||
            routeLower === 'accelerated_section21';
          return isSection21;
        })() && (
          <div className="mb-6">
            <Section21ActionRequired
              caseId={caseId}
              requiredActions={orderStatus.metadata?.required_actions || [
                // Fallback to blockers from metadata if required_actions not populated
                ...(orderStatus.metadata?.section21_blockers || []).map((code: string) => ({
                  fieldKey: code.toLowerCase().replace('s21_', '').replace('_unknown', '_served'),
                  label: code.replace('S21_', '').replace(/_/g, ' '),
                  errorCode: code,
                  helpText: 'Please confirm this requirement has been met.',
                })),
              ]}
              onResumeFulfillment={async () => {
                // Refresh order status and documents after resume
                await fetchOrderStatus();
                await fetchCaseDocuments();
              }}
              onSuccess={() => {
                // Start polling for documents
                startPolling();
              }}
            />
          </div>
        )}

        {/* Fulfillment Failed State (from order status) */}
        {orderStatus?.paid && !retryErrorFatal && !retryError && orderStatus.fulfillment_status === 'failed' && !orderStatus.has_final_documents && !isRetrying && (
          <div className="mb-6 p-6 rounded-lg border border-error/20 bg-error/5">
            <div className="flex items-start gap-3">
              <RiErrorWarningLine className="w-6 h-6 text-error flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-charcoal">
                  We're having trouble generating your documents
                </h3>
                <p className="text-gray-700 mt-1">
                  {orderStatus.fulfillment_error || 'Document generation failed. Please try again.'}
                </p>
                <div className="mt-4 flex gap-3">
                  <Button variant="primary" onClick={retryFulfillment} disabled={isRetrying}>
                    <RiRefreshLine className="w-4 h-4 mr-2" />
                    Retry Generation
                  </Button>
                  <Link href="/contact">
                    <Button variant="outline">
                      <RiCustomerService2Line className="w-4 h-4 mr-2" />
                      Contact Support
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Finalizing Documents - shown when paid but documents still generating */}
        {orderStatus?.paid && !orderStatus.has_final_documents && !pollingTimedOut && !retryErrorFatal && !retryError && orderStatus.fulfillment_status !== 'failed' && orderStatus.fulfillment_status !== 'requires_action' && (
          <div className="mb-6 p-6 rounded-lg border border-primary/20 bg-primary/5">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-charcoal">
                  {isRetrying ? 'Retrying document generation...' : 'Finalizing your documents...'}
                </h3>
                <p className="text-gray-700 mt-1">
                  Your payment has been received. We're generating your final documents now. This usually takes just a few seconds.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Polling Timeout - shown when documents didn't arrive in time */}
        {orderStatus?.paid && !orderStatus.has_final_documents && pollingTimedOut && !retryErrorFatal && (
          <div className="mb-6 p-6 rounded-lg border border-warning/20 bg-warning/5">
            <div className="flex items-start gap-3">
              <div className="text-warning text-2xl">⏳</div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-charcoal">Still generating your documents</h3>
                <p className="text-gray-700 mt-1">
                  Your payment was successful, but document generation is taking longer than expected.
                  You can try retrying or refresh the page.
                </p>
                <p className="text-gray-600 mt-2 text-sm">
                  Case ID: <code className="bg-gray-100 px-2 py-1 rounded text-sm">{caseId}</code>
                </p>
                <div className="mt-4 flex gap-3">
                  <Button variant="primary" onClick={retryFulfillment} disabled={isRetrying}>
                    <RiRefreshLine className="w-4 h-4 mr-2" />
                    {isRetrying ? 'Retrying...' : 'Retry Generation'}
                  </Button>
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Refresh Page
                  </Button>
                  <Link href="/contact">
                    <Button variant="outline">Contact Support</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tenancy Summary Panel - shown for tenancy agreement cases after payment success */}
        {isTenancyAgreementCase(caseDetails.case_type) && orderStatus?.paid && orderStatus.has_final_documents && (
          <TenancySummaryPanel
            collectedFacts={caseDetails.collected_facts || {}}
            jurisdiction={(caseDetails.jurisdiction || 'england') as CanonicalJurisdiction}
            isPremium={
              caseDetails.collected_facts?.tier === 'premium' ||
              caseDetails.collected_facts?.product_tier?.includes('premium') ||
              caseDetails.collected_facts?.__meta?.product_tier?.includes('premium') ||
              caseDetails.collected_facts?.is_hmo === true
            }
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ask Heaven Case Q&A - hidden for tenancy agreement cases on payment success */}
            {!(isTenancyAgreementCase(caseDetails.case_type) && showPaymentSuccess) && (
            <Card padding="large" id="ask-heaven">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-charcoal">Ask Heaven — Case Q&A</h2>
                  <p className="text-sm text-gray-600">
                    Quick answers generated from your case facts. For binding advice, speak to a solicitor.
                  </p>
                </div>
                <Button variant="outline" onClick={() => runAskHeaven()} disabled={askLoading}>
                  Refresh summary
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Jurisdiction</p>
                  <p className="text-lg font-semibold text-charcoal">
                    {analysis?.case_summary?.jurisdiction || caseDetails?.jurisdiction || '—'}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">Route</p>
                  <p className="text-base text-charcoal capitalize">
                    {(analysis?.recommended_route || analysis?.case_summary?.route || 'eviction')?.replace('_', ' ')}
                  </p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-1">
                  <p className="text-sm text-gray-600">Arrears & charges</p>
                  <p className="text-base text-charcoal">
                    Arrears: {analysis?.case_summary?.total_arrears != null ? `£${analysis.case_summary.total_arrears}` : '—'}
                  </p>
                  <p className="text-base text-charcoal">Damages: £{analysis?.case_summary?.damages ?? 0}</p>
                  <p className="text-base text-charcoal">Other charges: £{analysis?.case_summary?.other_charges ?? 0}</p>
                  {analysis?.case_summary?.charge_interest === true && (
                    <p className="text-sm text-gray-600">
                      Interest: {analysis?.case_summary?.interest_rate ?? 8}%{analysis?.case_summary?.interest_start_date
                        ? ` from ${analysis.case_summary.interest_start_date}`
                        : ''}
                    </p>
                  )}
                  {analysis?.case_summary?.charge_interest !== true && (
                    <p className="text-sm text-gray-400">Interest: Not claimed</p>
                  )}
                </div>
              </div>

              <div className="space-y-3 mb-4 text-sm text-gray-700">
                <p>
                  {analysis?.ask_heaven_answer ||
                    'Ask a question below to get a quick summary based on your current wizard answers.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    value={askInput}
                    onChange={(e) => setAskInput(e.target.value)}
                    placeholder="e.g. Do I need to send another demand before filing?"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <Button
                    variant="primary"
                    onClick={() => {
                      if (!askInput.trim()) return;
                      runAskHeaven(askInput.trim());
                      setAskInput('');
                    }}
                    disabled={askLoading}
                  >
                    {askLoading ? 'Working...' : 'Ask Heaven'}
                  </Button>
                </div>
              </div>

              {askHistory.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-charcoal">Conversation</h3>
                  <div className="space-y-2 text-sm">
                    {askHistory.map((entry, idx) => (
                      <div
                        key={`${entry.timestamp}-${idx}`}
                        className={`p-3 rounded-lg border ${
                          entry.role === 'user'
                            ? 'bg-white border-gray-200'
                            : 'bg-primary/5 border-primary/20 text-primary-darker'
                        }`}
                      >
                        <p className="font-semibold capitalize">{entry.role}</p>
                        <p className="whitespace-pre-wrap">{entry.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
            )}

            {/* Case Analysis */}
            {caseDetails.ai_analysis && (
              <Card padding="large">
                <h2 className="text-xl font-semibold text-charcoal mb-6">
                  Case Analysis
                </h2>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {JSON.stringify(caseDetails.ai_analysis, null, 2)}
                  </pre>
                </div>
              </Card>
            )}

            {/* Downloads Section */}
            <div ref={downloadsSectionRef}>
              <Card padding="large">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-charcoal">
                    {orderStatus?.paid ? 'Your Documents' : 'Documents'}
                  </h2>
                  {orderStatus?.paid && documents.length > 0 && (
                    <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                      <RiCheckboxCircleLine className="w-4 h-4" />
                      Ready to download
                    </span>
                  )}
                </div>

                {/* What's Included - Pack Contents */}
                {orderStatus?.paid && packContents.length > 0 && (
                  <div className="mb-6 p-4 bg-purple-50 border border-purple-100 rounded-lg">
                    <h3 className="text-sm font-semibold text-purple-900 mb-2">
                      What&apos;s included in your pack:
                    </h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-1 text-sm text-purple-800">
                      {packContents.slice(0, 10).map((item) => {
                        const docExists = documents.some(
                          (d) => d.document_type === item.key && !d.is_preview
                        );
                        return (
                          <li key={item.key} className="flex items-center gap-2">
                            {docExists ? (
                              <RiCheckboxCircleLine className="w-4 h-4 text-green-600 flex-shrink-0" />
                            ) : (
                              <RiLoader4Line className="w-4 h-4 text-purple-400 animate-spin flex-shrink-0" />
                            )}
                            <span className={docExists ? '' : 'text-purple-500'}>
                              {item.title}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                    {packContents.length > 10 && (
                      <p className="text-xs text-purple-600 mt-2">
                        + {packContents.length - 10} more items
                      </p>
                    )}
                  </div>
                )}

                {documents.length === 0 ? (
                  <div className="text-center py-8">
                    {isPolling ? (
                      <div className="space-y-3">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-gray-600">Generating your documents...</p>
                        <p className="text-sm text-gray-500">This usually takes less than a minute.</p>
                      </div>
                    ) : orderStatus?.paid ? (
                      <div className="space-y-3">
                        <p className="text-gray-600">Documents are being prepared.</p>
                        <Button variant="outline" onClick={handleRegenerateDocument}>
                          <RiRefreshLine className="w-4 h-4 mr-2" />
                          Retry Generation
                        </Button>
                      </div>
                    ) : (
                      <p className="text-gray-600">No documents generated yet.</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-purple-200 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                            <RiFileTextLine className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-charcoal truncate">
                              {doc.document_title}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDate(doc.created_at)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {doc.is_preview && (
                            <Badge variant="warning" size="small">
                              Preview
                            </Badge>
                          )}
                          {doc.pdf_url && (
                            <button
                              onClick={() => handleDocumentDownload(doc.id, doc.document_type)}
                              disabled={downloadingDocId === doc.id}
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark disabled:opacity-50 transition-colors"
                              title="Download document"
                            >
                              {downloadingDocId === doc.id ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <>
                                  <RiDownloadLine className="w-4 h-4" />
                                  Download
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>

          {/* Right Column: Timeline & Metadata */}
          <div className="space-y-6">
            {/* Case Info */}
            <Card padding="medium">
              <h3 className="font-semibold text-charcoal mb-4">Case Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-gray-600">Case ID</div>
                  <div className="text-charcoal font-mono text-xs mt-1">
                    {caseDetails.id}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Created</div>
                  <div className="text-charcoal mt-1">
                    {formatDate(caseDetails.created_at)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Last Updated</div>
                  <div className="text-charcoal mt-1">
                    {formatDate(caseDetails.updated_at)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Status</div>
                  <div className="mt-1">
                    {(() => {
                      const displayInfo = getDerivedDisplayStatus();
                      return (
                        <Badge variant={displayInfo.badgeVariant}>
                          {displayInfo.label}
                        </Badge>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </Card>

            {/* Help Card */}
            <Card padding="medium">
              <h3 className="font-semibold text-charcoal mb-4">Need Help?</h3>
              <div className="space-y-3 text-sm">
                <Link
                  href="/help"
                  className="flex items-center gap-3 text-gray-700 hover:text-primary"
                >
                  <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                    <RiBookOpenLine className="w-4 h-4 text-primary" />
                  </div>
                  Help Center
                </Link>
                <Link
                  href="/contact"
                  className="flex items-center gap-3 text-gray-700 hover:text-primary"
                >
                  <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                    <RiCustomerService2Line className="w-4 h-4 text-primary" />
                  </div>
                  Contact Support
                </Link>
              </div>
            </Card>

            {/* Post-Purchase Cross-Sell */}
            {orderStatus?.paid && (
              <PostPurchaseCrossSell
                purchasedProduct={getEffectiveProduct()}
                caseId={caseId}
              />
            )}
          </div>
        </div>
      </Container>

      {/* Delete/Archive Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteCase}
        title="Delete this case?"
        message={
          orderStatus?.paid ? (
            <div className="space-y-2">
              <p>
                This will archive the case and remove it from your dashboard.
              </p>
              <p className="text-amber-600 font-medium">
                Your purchased documents may no longer be easily accessible.
              </p>
            </div>
          ) : (
            <p>
              This will archive the case and remove it from your dashboard.
              You can contact support if you need to restore it later.
            </p>
          )
        }
        confirmLabel="Delete Case"
        cancelLabel="Keep Case"
        variant={orderStatus?.paid ? 'warning' : 'danger'}
        isLoading={isDeleting}
      />
    </div>
  );
}
