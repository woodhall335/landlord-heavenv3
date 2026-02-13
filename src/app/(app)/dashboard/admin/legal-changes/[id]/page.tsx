/**
 * Admin Legal Change Event Detail Page
 *
 * Shows:
 * - Event timeline (state history)
 * - Full impact analysis
 * - Proposed change summary
 * - Governance requirements
 * - Action buttons including "Push PR"
 *
 * Phase 23: Admin Portal Cron Summary + One-Click "Push PR" Workflow
 */

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  RiLockLine,
  RiGitPullRequestLine,
  RiExternalLinkLine,
  RiCheckLine,
  RiCloseLine,
  RiTimeLine,
  RiUserLine,
  RiAlertLine,
  RiInformationLine,
  RiArrowRightLine,
} from 'react-icons/ri';

interface EventDetails {
  event: {
    id: string;
    title: string;
    summary: string;
    sourceId: string;
    sourceName: string;
    sourceUrl: string;
    referenceUrl: string;
    detectedAt: string;
    state: string;
    jurisdictions: string[];
    topics: string[];
    trustLevel: string;
    confidenceLevel: string;
    createdAt: string;
    updatedAt: string;
    assignedTo?: string;
    linkedPrUrls?: string[];
    stateHistory: Array<{
      from: string;
      to: string;
      timestamp: string;
      actor: string;
      reason?: string;
    }>;
    impactAssessment?: {
      severity: string;
      severityRationale: string;
      impactedRuleIds: string[];
      impactedProducts: string[];
      impactedRoutes: string[];
      requiredReviewers: string[];
      humanSummary: string;
      requiresRuleChange: boolean;
      requiresMessageUpdate: boolean;
      requiresDocUpdate: boolean;
      requiresUrgentAction: boolean;
    };
  };
  source: {
    id: string;
    name: string;
    url: string;
  } | null;
  auditLog: Array<{
    id: string;
    timestamp: string;
    action: string;
    actor: string;
    details: Record<string, unknown>;
  }>;
  allowedActions: string[];
}

interface PRInfo {
  canPushPR: boolean;
  eligibility: {
    eligible: boolean;
    reasons: string[];
    requiredReviewers: string[];
    reviewerHandles: string[];
  } | null;
  prInfo: {
    prUrl: string | null;
    prNumber: number | null;
    prStatus: {
      state: string;
      overallCheckStatus: string;
      checks: Array<{ name: string; status: string; conclusion: string | null }>;
    } | null;
  } | null;
  linkedPRs: string[];
}

export default function LegalChangeEventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [details, setDetails] = useState<EventDetails | null>(null);
  const [prInfo, setPRInfo] = useState<PRInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [error, setError] = useState('');
  const [isPushingPR, setIsPushingPR] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    checkAccessAndFetch();
  }, [eventId]);

  const checkAccessAndFetch = async () => {
    try {
      const checkResponse = await fetch('/api/admin/check-access');

      if (checkResponse.status === 403) {
        setHasAccess(false);
        setIsLoading(false);
        return;
      }

      if (!checkResponse.ok) {
        setError('Failed to verify admin access');
        setIsLoading(false);
        return;
      }

      setHasAccess(true);
      await fetchEventDetails();
    } catch {
      setError('Failed to load event details');
      setIsLoading(false);
    }
  };

  const fetchEventDetails = async () => {
    setIsLoading(true);
    try {
      const [detailsRes, prInfoRes] = await Promise.all([
        fetch(`/api/admin/legal-change/events/${eventId}?include=fullAuditLog`),
        fetch(`/api/admin/legal-change/events/${eventId}/push-pr`),
      ]);

      if (detailsRes.ok) {
        const data = await detailsRes.json();
        if (data.success && data.data) {
          setDetails(data.data);
        } else {
          setError(data.error || 'Event not found');
        }
      } else {
        setError('Failed to load event details');
      }

      if (prInfoRes.ok) {
        const prData = await prInfoRes.json();
        if (prData.success && prData.data) {
          setPRInfo(prData.data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch event details:', err);
      setError('Failed to load event details');
    } finally {
      setIsLoading(false);
    }
  };

  const executeAction = async (action: string, reason?: string) => {
    setActionLoading(action);
    setActionMessage(null);

    try {
      const res = await fetch(`/api/admin/legal-change/events/${eventId}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      });

      const data = await res.json();

      if (data.success) {
        setActionMessage({ type: 'success', message: `Action '${action}' completed successfully` });
        await fetchEventDetails();
      } else {
        setActionMessage({ type: 'error', message: data.error || 'Action failed' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', message: 'Failed to execute action' });
    } finally {
      setActionLoading(null);
    }
  };

  const handlePushPR = async () => {
    if (!confirm('This will create a GitHub PR with the generated changes. Continue?')) {
      return;
    }

    setIsPushingPR(true);
    setActionMessage(null);

    try {
      const res = await fetch(`/api/admin/legal-change/events/${eventId}/push-pr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (data.success) {
        setActionMessage({
          type: 'success',
          message: `PR created successfully: ${data.data.prUrl}`,
        });
        await fetchEventDetails();
      } else {
        setActionMessage({
          type: 'error',
          message: data.error || 'Failed to create PR',
        });
      }
    } catch (err) {
      setActionMessage({ type: 'error', message: 'Failed to create PR' });
    } finally {
      setIsPushingPR(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSeverityColor = (severity?: string): 'success' | 'warning' | 'error' => {
    switch (severity) {
      case 'emergency':
      case 'legal_critical':
        return 'error';
      case 'behavioral':
        return 'warning';
      default:
        return 'success';
    }
  };

  const getStateColor = (state: string): 'success' | 'warning' | 'error' => {
    switch (state) {
      case 'new':
      case 'triaged':
        return 'warning';
      case 'action_required':
        return 'error';
      default:
        return 'success';
    }
  };

  if (!hasAccess && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card padding="large">
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <RiLockLine className="w-10 h-10 text-[#7C3AED]" />
            </div>
            <h2 className="text-2xl font-bold text-charcoal mb-3">Access Denied</h2>
            <Link href="/dashboard">
              <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium">
                Back to Dashboard
              </button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card padding="large">
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold text-charcoal mb-2">
              {error || 'Event not found'}
            </h2>
            <Link href="/dashboard/admin/legal-changes/inbox">
              <button className="mt-4 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium">
                Back to Inbox
              </button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const { event } = details;
  const impact = event.impactAssessment;
  const canPushPR = prInfo?.canPushPR && prInfo?.eligibility?.eligible;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <Container size="large" className="py-6">
          <div>
            <Link
              href="/dashboard/admin/legal-changes/inbox"
              className="text-sm text-white/80 hover:text-white font-medium mb-2 inline-block"
            >
              ← Back to Inbox
            </Link>
            <h1 className="text-2xl font-extrabold">{event.title}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <Badge variant={getStateColor(event.state)} size="small">
                {event.state.replace('_', ' ')}
              </Badge>
              {impact && (
                <Badge variant={getSeverityColor(impact.severity)} size="small">
                  {impact.severity.replace('_', ' ')}
                </Badge>
              )}
              <span className="text-white/80">{event.id}</span>
            </div>
          </div>
        </Container>
      </div>

      <Container size="large" className="py-6">
        {/* Action Message */}
        {actionMessage && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              actionMessage.type === 'success'
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            {actionMessage.type === 'success' ? (
              <RiCheckLine className="w-5 h-5 text-green-600" />
            ) : (
              <RiCloseLine className="w-5 h-5 text-red-600" />
            )}
            <p
              className={
                actionMessage.type === 'success' ? 'text-green-700' : 'text-red-700'
              }
            >
              {actionMessage.message}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Summary */}
            <Card padding="large">
              <h2 className="text-lg font-semibold text-charcoal mb-4">Summary</h2>
              <p className="text-gray-600 mb-4">{event.summary}</p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Source</span>
                  <p className="font-medium">{event.sourceName}</p>
                </div>
                <div>
                  <span className="text-gray-500">Detected</span>
                  <p className="font-medium">{formatDate(event.detectedAt)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Jurisdictions</span>
                  <p className="font-medium">{event.jurisdictions.join(', ')}</p>
                </div>
                <div>
                  <span className="text-gray-500">Topics</span>
                  <p className="font-medium">{event.topics.join(', ')}</p>
                </div>
              </div>

              {event.referenceUrl && (
                <a
                  href={event.referenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 text-primary hover:underline text-sm"
                >
                  <RiExternalLinkLine className="w-4 h-4" />
                  View Source
                </a>
              )}
            </Card>

            {/* Impact Analysis */}
            {impact && (
              <Card padding="large">
                <h2 className="text-lg font-semibold text-charcoal mb-4">
                  Impact Analysis
                </h2>

                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Severity Rationale</p>
                  <p className="text-gray-700">{impact.severityRationale}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-charcoal">
                      {impact.impactedRuleIds.length}
                    </div>
                    <div className="text-xs text-gray-500">Rules Impacted</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-charcoal">
                      {impact.impactedProducts.length}
                    </div>
                    <div className="text-xs text-gray-500">Products</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-charcoal">
                      {impact.impactedRoutes.length}
                    </div>
                    <div className="text-xs text-gray-500">Routes</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-charcoal">
                      {impact.requiredReviewers.length}
                    </div>
                    <div className="text-xs text-gray-500">Reviewers</div>
                  </div>
                </div>

                {impact.impactedRuleIds.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Impacted Rules
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {impact.impactedRuleIds.map((ruleId) => (
                        <code
                          key={ruleId}
                          className="px-2 py-1 bg-gray-100 rounded text-xs"
                        >
                          {ruleId}
                        </code>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {impact.requiresRuleChange && (
                    <Badge variant="error" size="small">
                      Requires Rule Change
                    </Badge>
                  )}
                  {impact.requiresMessageUpdate && (
                    <Badge variant="warning" size="small">
                      Requires Message Update
                    </Badge>
                  )}
                  {impact.requiresDocUpdate && (
                    <Badge variant="warning" size="small">
                      Requires Doc Update
                    </Badge>
                  )}
                  {impact.requiresUrgentAction && (
                    <Badge variant="error" size="small">
                      Urgent Action Required
                    </Badge>
                  )}
                </div>
              </Card>
            )}

            {/* State Timeline */}
            <Card padding="large">
              <h2 className="text-lg font-semibold text-charcoal mb-4">Timeline</h2>

              <div className="space-y-4">
                {event.stateHistory.length > 0 ? (
                  event.stateHistory.map((transition, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <RiArrowRightLine className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-charcoal">
                          {transition.from.replace('_', ' ')} → {transition.to.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(transition.timestamp)} by {transition.actor}
                        </p>
                        {transition.reason && (
                          <p className="text-sm text-gray-600 mt-1">{transition.reason}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <RiTimeLine className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-charcoal">Event Created</p>
                      <p className="text-xs text-gray-500">{formatDate(event.createdAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card padding="large">
              <h2 className="text-lg font-semibold text-charcoal mb-4">Actions</h2>

              <div className="space-y-3">
                {/* Push PR Button */}
                {event.state === 'action_required' && (
                  <button
                    onClick={handlePushPR}
                    disabled={isPushingPR || !canPushPR}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                      canPushPR
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <RiGitPullRequestLine className="w-5 h-5" />
                    {isPushingPR ? 'Creating PR...' : 'Push PR'}
                  </button>
                )}

                {/* Eligibility Info */}
                {prInfo?.eligibility && !prInfo.eligibility.eligible && event.state === 'action_required' && (
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <p className="text-xs font-medium text-amber-700 mb-2">
                      Cannot Push PR:
                    </p>
                    <ul className="text-xs text-amber-600 space-y-1">
                      {prInfo.eligibility.reasons.map((reason, idx) => (
                        <li key={idx}>• {reason}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* State Actions */}
                {details.allowedActions.includes('triage') && (
                  <button
                    onClick={() => executeAction('triage', 'Manual triage')}
                    disabled={actionLoading === 'triage'}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                  >
                    {actionLoading === 'triage' ? 'Processing...' : 'Triage Event'}
                  </button>
                )}

                {details.allowedActions.includes('mark_action_required') && (
                  <button
                    onClick={() => executeAction('mark_action_required', 'Action required after review')}
                    disabled={actionLoading === 'mark_action_required'}
                    className="w-full px-4 py-2 border border-orange-200 text-orange-600 rounded-lg text-sm hover:bg-orange-50 disabled:opacity-50"
                  >
                    {actionLoading === 'mark_action_required' ? 'Processing...' : 'Mark Action Required'}
                  </button>
                )}

                {details.allowedActions.includes('mark_no_action') && (
                  <button
                    onClick={() => executeAction('mark_no_action', 'No action needed')}
                    disabled={actionLoading === 'mark_no_action'}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                  >
                    {actionLoading === 'mark_no_action' ? 'Processing...' : 'Mark No Action'}
                  </button>
                )}

                {details.allowedActions.includes('mark_implemented') && (
                  <button
                    onClick={() => executeAction('mark_implemented', 'Changes implemented')}
                    disabled={actionLoading === 'mark_implemented'}
                    className="w-full px-4 py-2 border border-blue-200 text-blue-600 rounded-lg text-sm hover:bg-blue-50 disabled:opacity-50"
                  >
                    {actionLoading === 'mark_implemented' ? 'Processing...' : 'Confirm Implementation'}
                  </button>
                )}

                {details.allowedActions.includes('mark_rolled_out') && (
                  <button
                    onClick={() => executeAction('mark_rolled_out', 'Changes rolled out')}
                    disabled={actionLoading === 'mark_rolled_out'}
                    className="w-full px-4 py-2 border border-green-200 text-green-600 rounded-lg text-sm hover:bg-green-50 disabled:opacity-50"
                  >
                    {actionLoading === 'mark_rolled_out' ? 'Processing...' : 'Mark Rolled Out'}
                  </button>
                )}

                {details.allowedActions.includes('close') && (
                  <button
                    onClick={() => executeAction('close', 'Event closed')}
                    disabled={actionLoading === 'close'}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                  >
                    {actionLoading === 'close' ? 'Processing...' : 'Close Event'}
                  </button>
                )}
              </div>
            </Card>

            {/* Linked PRs */}
            {event.linkedPrUrls && event.linkedPrUrls.length > 0 && (
              <Card padding="large">
                <h2 className="text-lg font-semibold text-charcoal mb-4">Linked PRs</h2>
                <div className="space-y-2">
                  {event.linkedPrUrls.map((url, idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <RiGitPullRequestLine className="w-4 h-4" />
                      {url.split('/').pop()}
                    </a>
                  ))}
                </div>

                {prInfo?.prInfo?.prStatus && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">PR Status</p>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          prInfo.prInfo.prStatus.state === 'merged'
                            ? 'success'
                            : prInfo.prInfo.prStatus.state === 'open'
                              ? 'warning'
                              : 'error'
                        }
                        size="small"
                      >
                        {prInfo.prInfo.prStatus.state}
                      </Badge>
                      <Badge
                        variant={
                          prInfo.prInfo.prStatus.overallCheckStatus === 'success'
                            ? 'success'
                            : prInfo.prInfo.prStatus.overallCheckStatus === 'pending'
                              ? 'warning'
                              : 'error'
                        }
                        size="small"
                      >
                        Checks: {prInfo.prInfo.prStatus.overallCheckStatus}
                      </Badge>
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Governance */}
            {impact && (
              <Card padding="large">
                <h2 className="text-lg font-semibold text-charcoal mb-4">Governance</h2>
                <div>
                  <p className="text-xs text-gray-500 mb-2">Required Reviewers</p>
                  <div className="flex flex-wrap gap-2">
                    {impact.requiredReviewers.map((reviewer) => (
                      <span
                        key={reviewer}
                        className="px-2 py-1 bg-gray-100 rounded text-xs"
                      >
                        {reviewer}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Metadata */}
            <Card padding="large">
              <h2 className="text-lg font-semibold text-charcoal mb-4">Details</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Trust Level</span>
                  <span className="font-medium">{event.trustLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Confidence</span>
                  <span className="font-medium">{event.confidenceLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Created</span>
                  <span className="font-medium">{formatDate(event.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Updated</span>
                  <span className="font-medium">{formatDate(event.updatedAt)}</span>
                </div>
                {event.assignedTo && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Assigned To</span>
                    <span className="font-medium">{event.assignedTo}</span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}
