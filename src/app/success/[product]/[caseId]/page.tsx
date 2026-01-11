/**
 * Success Page for Single-Transaction Products
 *
 * Displays post-payment confirmation for:
 * - notice_only
 * - ast_standard
 * - ast_premium
 *
 * Complex products (complete_pack, money_claim, sc_money_claim) redirect
 * to /dashboard/cases/[caseId]?payment=success instead.
 */

'use client';

import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RiCheckLine, RiDownloadLine, RiArrowRightLine, RiCustomerService2Line } from 'react-icons/ri';
import { trackPurchase } from '@/lib/analytics';
import { downloadDocument } from '@/lib/documents/download';
import { getPackContents, getNextSteps } from '@/lib/products';
import type { PackItem } from '@/lib/products';
import type { OrderStatusResponse } from '@/app/api/orders/status/route';
import { formatEditWindowEndDate } from '@/lib/payments/edit-window';

interface CaseDetails {
  id: string;
  case_type: string;
  jurisdiction: string;
  collected_facts: Record<string, unknown>;
}

interface Document {
  id: string;
  document_title: string;
  document_type: string;
  is_preview: boolean;
  pdf_url: string | null;
}

// Valid products for this success page
const VALID_PRODUCTS = ['notice_only', 'ast_standard', 'ast_premium'];

// Polling configuration
const POLL_INTERVAL_MS = 2500; // 2.5 seconds
const POLL_TIMEOUT_MS = 60000; // 60 seconds max polling

// Product display names
const PRODUCT_NAMES: Record<string, string> = {
  notice_only: 'Notice Only Pack',
  ast_standard: 'Standard Tenancy Agreement',
  ast_premium: 'Premium Tenancy Agreement',
};

export default function SuccessPage() {
  const params = useParams();
  const router = useRouter();
  const product = params.product as string;
  const caseId = params.caseId as string;

  const [caseDetails, setCaseDetails] = useState<CaseDetails | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [orderStatus, setOrderStatus] = useState<OrderStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingTimedOut, setPollingTimedOut] = useState(false);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollStartTimeRef = useRef<number | null>(null);
  const purchaseTrackedRef = useRef(false);

  // Validate product type
  useEffect(() => {
    if (!VALID_PRODUCTS.includes(product)) {
      // Redirect invalid products to dashboard
      router.replace(`/dashboard/cases/${caseId}?payment=success`);
    }
  }, [product, caseId, router]);

  // Fetch case details
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
    }
  }, [caseId]);

  // Fetch documents
  const fetchDocuments = useCallback(async () => {
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

  // Fetch order status
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

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  // Start polling for document fulfillment
  const startPolling = useCallback(() => {
    if (pollIntervalRef.current) return;

    setIsPolling(true);
    setPollingTimedOut(false);
    pollStartTimeRef.current = Date.now();

    pollIntervalRef.current = setInterval(async () => {
      const elapsed = Date.now() - (pollStartTimeRef.current || 0);
      if (elapsed >= POLL_TIMEOUT_MS) {
        stopPolling();
        setPollingTimedOut(true);
        return;
      }

      const status = await fetchOrderStatus();
      if (status?.has_final_documents) {
        stopPolling();
        fetchDocuments();
      }
    }, POLL_INTERVAL_MS);
  }, [fetchOrderStatus, stopPolling, fetchDocuments]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Initial data fetch
  useEffect(() => {
    if (!caseId || !VALID_PRODUCTS.includes(product)) return;

    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchCaseDetails(), fetchDocuments(), fetchOrderStatus()]);
      setIsLoading(false);
    };

    loadData();
  }, [caseId, product, fetchCaseDetails, fetchDocuments, fetchOrderStatus]);

  // Start polling if paid but no documents
  useEffect(() => {
    if (orderStatus?.paid && !orderStatus.has_final_documents) {
      startPolling();
    }
  }, [orderStatus?.paid, orderStatus?.has_final_documents, startPolling]);

  // Track purchase conversion
  useEffect(() => {
    if (orderStatus?.paid && caseDetails && !purchaseTrackedRef.current) {
      purchaseTrackedRef.current = true;

      const productName = PRODUCT_NAMES[product] || product;
      const amount = orderStatus.total_amount || 29.99;
      const currency = orderStatus.currency || 'GBP';

      trackPurchase(caseId, amount, currency, [
        {
          item_id: product,
          item_name: productName,
          item_category: 'legal_document',
          price: amount,
          quantity: 1,
        },
      ]);
    }
  }, [orderStatus?.paid, orderStatus?.total_amount, orderStatus?.currency, caseDetails, caseId, product]);

  // Handle document download
  const handleDocumentDownload = async (docId: string) => {
    setDownloadingDocId(docId);
    try {
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

  // Get pack contents for display
  const getPackContentsForCase = (): PackItem[] => {
    if (!caseDetails) return [];

    const facts = caseDetails.collected_facts || {};
    const route = (facts.route || facts.notice_route || facts.eviction_route || null) as string | null;
    const hasArrears = Boolean(
      facts.has_arrears ||
      facts.rent_arrears ||
      facts.arrears_amount ||
      (Array.isArray(facts.ground_codes) && (
        facts.ground_codes.includes('8') ||
        facts.ground_codes.includes('10') ||
        facts.ground_codes.includes('11')
      ))
    );

    return getPackContents({
      product,
      jurisdiction: caseDetails.jurisdiction,
      route,
      has_arrears: hasArrears,
      include_arrears_schedule: hasArrears,
    });
  };

  // Get next steps
  const getNextStepsForCase = () => {
    if (!caseDetails) {
      return {
        title: 'What to do next',
        steps: ['Review your documents and follow the included instructions.'],
      };
    }

    const facts = caseDetails.collected_facts || {};
    const route = (facts.route || facts.notice_route || facts.eviction_route || null) as string | null;
    const noticePeriodDays = (facts.notice_period_days || facts.notice_period || null) as number | null;

    return getNextSteps({
      product,
      jurisdiction: caseDetails.jurisdiction,
      route,
      notice_period_days: noticePeriodDays,
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your purchase...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card padding="large" className="max-w-md text-center">
          <h2 className="text-xl font-semibold text-charcoal mb-4">{error}</h2>
          <p className="text-gray-600 mb-6">
            If you believe this is an error, please contact support.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/dashboard">
              <Button variant="primary">Go to Dashboard</Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline">Contact Support</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const productName = PRODUCT_NAMES[product] || product;
  const packContents = getPackContentsForCase();
  const nextSteps = getNextStepsForCase();
  const hasFinalDocuments = orderStatus?.has_final_documents;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Container size="medium">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <RiCheckLine className="w-8 h-8 text-success" />
          </div>
          <h1 className="text-3xl font-bold text-charcoal mb-2">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for purchasing the {productName}
          </p>
        </div>

        {/* Edit Window Status */}
        {orderStatus?.paid && orderStatus.edit_window_ends_at && (
          <div className={`mb-6 p-4 rounded-lg text-sm text-center ${
            orderStatus.edit_window_open
              ? 'bg-primary/5 border border-primary/20 text-charcoal'
              : 'bg-warning/10 border border-warning/20 text-warning-dark'
          }`}>
            {orderStatus.edit_window_open ? (
              <span>
                You can edit and regenerate documents until{' '}
                <strong>{formatEditWindowEndDate(orderStatus.edit_window_ends_at)}</strong>{' '}
                (30 days from purchase). Downloads are available forever.
              </span>
            ) : (
              <span>
                The 30-day edit window ended{' '}
                <strong>{formatEditWindowEndDate(orderStatus.edit_window_ends_at)}</strong>.
                Downloads remain available.
              </span>
            )}
          </div>
        )}

        {/* Document Status Card */}
        {!hasFinalDocuments && !pollingTimedOut && (
          <Card padding="large" className="mb-6 border-primary/20 bg-primary/5">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0" />
              <div>
                <h2 className="text-xl font-semibold text-charcoal">
                  Preparing your documents...
                </h2>
                <p className="text-gray-700 mt-1">
                  We're generating your final documents. This usually takes just a few seconds.
                </p>
              </div>
            </div>
          </Card>
        )}

        {pollingTimedOut && !hasFinalDocuments && (
          <Card padding="large" className="mb-6 border-warning/20 bg-warning/5">
            <div className="flex items-start gap-4">
              <div className="text-2xl">⏳</div>
              <div>
                <h2 className="text-xl font-semibold text-charcoal">
                  Still generating your documents
                </h2>
                <p className="text-gray-700 mt-1">
                  Document generation is taking longer than expected. Please try refreshing the page.
                  If documents don't appear within a few minutes, contact support with your Case ID:{' '}
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">{caseId}</code>
                </p>
                <div className="mt-4 flex gap-3">
                  <Button variant="primary" onClick={() => window.location.reload()}>
                    Refresh Page
                  </Button>
                  <Link href="/contact">
                    <Button variant="outline">Contact Support</Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Main Content Grid */}
        {hasFinalDocuments && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* What's Included */}
            <Card padding="medium">
              <h3 className="font-semibold text-charcoal mb-4">What's included</h3>
              {packContents.length === 0 ? (
                <p className="text-sm text-gray-600">See generated documents below.</p>
              ) : (
                <ul className="space-y-2 text-sm text-gray-700">
                  {packContents.map((item) => (
                    <li key={item.key} className="flex items-start gap-2">
                      <span className="text-success mt-0.5">•</span>
                      <span>{item.title}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {/* Your Documents */}
            <Card padding="medium">
              <h3 className="font-semibold text-charcoal mb-4">Your documents</h3>
              {documents.length === 0 ? (
                <p className="text-sm text-gray-600">No documents found.</p>
              ) : (
                <ul className="space-y-3">
                  {documents.map((doc) => (
                    <li key={doc.id} className="flex items-center justify-between gap-2">
                      <span className="text-sm text-gray-800 truncate flex-1">
                        {doc.document_title}
                      </span>
                      {doc.pdf_url && (
                        <button
                          onClick={() => handleDocumentDownload(doc.id)}
                          disabled={downloadingDocId === doc.id}
                          className="text-primary hover:text-primary-dark disabled:opacity-50 flex-shrink-0"
                          title="Download document"
                        >
                          {downloadingDocId === doc.id ? (
                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <RiDownloadLine className="w-5 h-5" />
                          )}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {/* Next Steps */}
            <Card padding="medium">
              <h3 className="font-semibold text-charcoal mb-4">{nextSteps.title}</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-800">
                {nextSteps.steps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </Card>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href={`/dashboard/cases/${caseId}`}>
            <Button variant="primary" className="flex items-center gap-2">
              View Case Details
              <RiArrowRightLine className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/dashboard/cases">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        {/* Support Link */}
        <div className="text-center mt-8">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary"
          >
            <RiCustomerService2Line className="w-4 h-4" />
            Need help? Contact support
          </Link>
        </div>
      </Container>
    </div>
  );
}
