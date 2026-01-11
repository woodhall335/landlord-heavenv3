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
import { RiErrorWarningLine, RiEditLine, RiFileTextLine, RiExternalLinkLine, RiBookOpenLine, RiCustomerService2Line, RiDownloadLine, RiRefreshLine } from 'react-icons/ri';
import { trackPurchase } from '@/lib/analytics';
import { downloadDocument } from '@/lib/documents/download';
import type { OrderStatusResponse } from '@/app/api/orders/status/route';
import { getPackContents, getNextSteps } from '@/lib/products';
import type { PackItem } from '@/lib/products';
import { formatEditWindowEndDate } from '@/lib/payments/edit-window';

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
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedFacts, setEditedFacts] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);
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

  const fetchCaseDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/cases/${caseId}`);

      if (response.ok) {
        const data = await response.json();
        setCaseDetails(data.case);
        setEditedFacts(data.case.collected_facts || {});
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

  // Cleanup polling on unmount or navigation
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
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

  // Fetch order status and handle auto-retry + polling
  useEffect(() => {
    if (!caseId) return;

    const checkOrderStatus = async () => {
      const status = await fetchOrderStatus();

      if (!status?.paid || status.has_final_documents) return;

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
  }, [caseId, fetchOrderStatus, startPolling, retryFulfillment, retryErrorFatal]);

  // Track purchase conversion when payment is confirmed via DB
  useEffect(() => {
    if (orderStatus?.paid && caseDetails) {
      // Prevent duplicate tracking by checking sessionStorage
      const purchaseKey = `purchase_tracked_${caseId}`;
      if (sessionStorage.getItem(purchaseKey)) return;

      // Get product info from case type
      const productName = getCaseTypeLabel(caseDetails.case_type);
      const amount = orderStatus.total_amount || 29.99;
      const currency = orderStatus.currency || 'GBP';

      // Track purchase in analytics (GA4 + FB Pixel)
      trackPurchase(caseId, amount, currency, [
        {
          item_id: caseDetails.case_type,
          item_name: productName,
          item_category: 'legal_document',
          price: amount,
          quantity: 1,
        },
      ]);

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

  const getCaseTypeLabel = (caseType: string): string => {
    const labels: Record<string, string> = {
      eviction: 'Eviction Notice',
      money_claim: 'Money Claim',
      tenancy_agreement: 'Tenancy Agreement',
    };
    return labels[caseType] || caseType;
  };

  const getJurisdictionLabel = (jurisdiction: string): string => {
    const labels: Record<string, string> = {
      'england-wales': 'England & Wales',
      scotland: 'Scotland',
      'northern-ireland': 'Northern Ireland',
    };
    return labels[jurisdiction] || jurisdiction;
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

  // Derive product and case parameters from case details
  const getProductAndParams = () => {
    if (!caseDetails) return null;

    const facts = caseDetails.collected_facts || {};

    // Determine product type from case_type and facts
    let product = facts.product || facts.original_product || '';

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

    return {
      product,
      jurisdiction: caseDetails.jurisdiction,
      route,
      noticePeriodDays,
      hasArrears,
      includeArrearsSchedule,
      grounds: facts.ground_codes || null,
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

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/cases/${caseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collected_facts: editedFacts,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save changes');
      }

      setMessage({ type: 'success', text: 'Changes saved successfully!' });
      setIsEditMode(false);
      fetchCaseDetails();
    } catch (err: any) {
      console.error('Error saving changes:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to save changes' });
    } finally {
      setIsSaving(false);
    }
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

  const handleFieldChange = (key: string, value: any) => {
    setEditedFacts({
      ...editedFacts,
      [key]: value,
    });
  };

  const handleCancelEdit = () => {
    setEditedFacts(caseDetails?.collected_facts || {});
    setIsEditMode(false);
    setMessage(null);
  };

  const handleContinueWizard = () => {
    router.push(`/wizard/flow?type=${caseDetails?.case_type}&jurisdiction=${caseDetails?.jurisdiction}&case_id=${caseId}`);
  };

  const handleDeleteCase = async () => {
    if (!confirm('Are you sure you want to delete this case? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/cases/${caseId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/dashboard/cases');
      } else {
        alert('Failed to delete case');
      }
    } catch {
      alert('Failed to delete case');
    }
  };

  const renderFieldValue = (key: string, value: any) => {
    if (!isEditMode) {
      // View mode - just display the value
      return (
        <div className="text-base text-charcoal font-medium">
          {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
        </div>
      );
    }

    // Edit mode - render appropriate input
    if (typeof value === 'boolean') {
      return (
        <select
          value={value ? 'true' : 'false'}
          onChange={(e) => handleFieldChange(key, e.target.value === 'true')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      );
    }

    if (typeof value === 'number') {
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => handleFieldChange(key, parseFloat(e.target.value) || 0)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      );
    }

    if (typeof value === 'string' && value.length > 100) {
      return (
        <textarea
          value={value}
          onChange={(e) => handleFieldChange(key, e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      );
    }

    if (typeof value === 'object' && value !== null) {
      return (
        <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    }

    return (
      <input
        type="text"
        value={value || ''}
        onChange={(e) => handleFieldChange(key, e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
      />
    );
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
              <h1 className="text-3xl font-extrabold text-charcoal">
                {getCaseTypeLabel(caseDetails.case_type)}
              </h1>
              <p className="text-gray-600 mt-1">
                {getJurisdictionLabel(caseDetails.jurisdiction)}
              </p>
            </div>
            <Badge variant={getStatusColor(caseDetails.status)} size="large">
              {caseDetails.status.replace('_', ' ')}
            </Badge>
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

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {!isEditMode ? (
              <>
                <Button
                  variant="primary"
                  onClick={() => setIsEditMode(true)}
                  disabled={orderStatus?.paid && !orderStatus?.edit_window_open}
                >
                  <RiEditLine className="w-4 h-4 mr-2 text-white" />
                  Edit Case Details
                </Button>
                {caseDetails.wizard_progress < 100 && (
                  <Button
                    variant="secondary"
                    onClick={handleContinueWizard}
                    disabled={orderStatus?.paid && !orderStatus?.edit_window_open}
                  >
                    Continue Wizard
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={handleRegenerateDocument}
                  disabled={isRegenerating || (orderStatus?.paid && !orderStatus?.edit_window_open)}
                >
                  {isRegenerating ? 'Regenerating...' : 'Regenerate Documents'}
                </Button>
                {documents.length > 0 && (
                  <Link href={`/wizard/preview/${caseId}`}>
                    <Button variant="outline">View Preview</Button>
                  </Link>
                )}
                <Button variant="outline" onClick={handleDeleteCase}>
                  Delete Case
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="primary"
                  onClick={handleSaveChanges}
                  disabled={isSaving || (orderStatus?.paid && !orderStatus?.edit_window_open)}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </Container>
      </div>

      <Container size="large" className="py-8">
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

        {/* Payment Success Summary - DB-backed status */}
        {orderStatus?.paid && orderStatus.has_final_documents && (
          <div className="mb-6 p-6 rounded-lg border border-success/20 bg-success/5">
            <div className="flex items-start gap-3">
              <div className="text-success text-2xl">✔</div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-charcoal">Payment received — your documents are ready</h3>
                <p className="text-gray-700 mt-1">
                  Your purchase is complete. Download your documents below and follow the next steps.
                </p>

                <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
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

                  {/* Generated documents - actual files */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h4 className="font-semibold text-charcoal mb-3">Generated documents</h4>
                    <ul className="space-y-2 text-sm text-gray-800">
                      {documents.map((doc) => (
                        <li key={doc.id} className="flex items-center justify-between gap-2">
                          <span className="truncate">{doc.document_title}</span>
                          {doc.pdf_url && (
                            <button
                              onClick={() => handleDocumentDownload(doc.id)}
                              disabled={downloadingDocId === doc.id}
                              className="text-primary hover:text-primary-dark font-semibold disabled:opacity-50"
                            >
                              {downloadingDocId === doc.id ? 'Loading...' : 'Download'}
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
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
        {orderStatus?.paid && !orderStatus.has_final_documents && !pollingTimedOut && !retryErrorFatal && !retryError && orderStatus.fulfillment_status !== 'failed' && (
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

        {/* Edit Mode Warning */}
        {isEditMode && (
          <div className="mb-6 p-4 bg-warning/10 border border-warning/20 rounded-lg">
            <p className="text-warning font-semibold">Edit Mode Active</p>
            <p className="text-sm text-gray-700">Make your changes and click "Save Changes" when done, or "Cancel" to discard changes.</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Collected Facts */}
            <Card padding="large">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-charcoal">
                  Collected Information
                </h2>
                {isEditMode && (
                  <span className="text-sm text-warning font-medium">Editing...</span>
                )}
              </div>

              {Object.keys(editedFacts).length === 0 ? (
                <p className="text-gray-600">No information collected yet.</p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(editedFacts).map(([key, value]) => (
                    <div key={key} className="pb-4 border-b border-gray-200 last:border-0">
                      <div className="text-sm text-gray-600 mb-2 capitalize font-medium">
                        {key.replace(/_/g, ' ')}
                      </div>
                      {renderFieldValue(key, value)}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Ask Heaven Case Q&A */}
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
                  <p className="text-sm text-gray-600">
                    Interest: {analysis?.case_summary?.interest_rate ?? 8}%{analysis?.case_summary?.interest_start_date
                      ? ` from ${analysis.case_summary.interest_start_date}`
                      : ''}
                  </p>
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

            {/* Documents */}
            <Card padding="large">
              <h2 className="text-xl font-semibold text-charcoal mb-6">Documents</h2>

              {documents.length === 0 ? (
                <p className="text-gray-600">No documents generated yet.</p>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
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
                            onClick={() => handleDocumentDownload(doc.id)}
                            disabled={downloadingDocId === doc.id}
                            className="text-primary hover:text-primary-dark disabled:opacity-50"
                            title="Download document"
                          >
                            {downloadingDocId === doc.id ? (
                              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <RiDownloadLine className="w-5 h-5" />
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
                    <Badge variant={getStatusColor(caseDetails.status)}>
                      {caseDetails.status.replace('_', ' ')}
                    </Badge>
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
          </div>
        </div>
      </Container>
    </div>
  );
}
