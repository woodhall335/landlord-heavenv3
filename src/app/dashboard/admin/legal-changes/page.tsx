/**
 * Admin Legal Changes Dashboard
 *
 * Main dashboard showing:
 * - Cron run status with "Needs Checking" badges
 * - Event counts by state
 * - Quick links to inbox and recent events
 *
 * Phase 23: Admin Portal Cron Summary + One-Click "Push PR" Workflow
 */

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  RiLockLine,
  RiTimeLine,
  RiCheckboxCircleLine,
  RiAlertLine,
  RiInboxLine,
  RiGitPullRequestLine,
  RiRefreshLine,
  RiPlayLine,
} from 'react-icons/ri';

interface JobStatus {
  jobName: string;
  lastRun?: {
    id: string;
    startedAt: string;
    finishedAt?: string;
    status: 'running' | 'success' | 'partial' | 'failed';
    summary: string;
    sourcesChecked: number;
    eventsCreated: number;
    errors: { message: string }[];
  };
  nextScheduledTime?: string;
  needsChecking: boolean;
  needsCheckingReasons: { reason: string; severity: string }[];
  successRate: number;
}

interface EventCounts {
  new: number;
  triaged: number;
  action_required: number;
  no_action: number;
  implemented: number;
  rolled_out: number;
  closed: number;
}

interface DashboardData {
  jobs: JobStatus[];
  eventCounts: EventCounts;
  recentEvents: Array<{
    id: string;
    title: string;
    state: string;
    severity?: string;
    detectedAt: string;
  }>;
  totalEvents: number;
  jobsNeedingAttention: number;
}

export default function LegalChangesDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [error, setError] = useState('');
  const [isRunningCheck, setIsRunningCheck] = useState(false);

  useEffect(() => {
    checkAccessAndFetch();
  }, []);

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
      await fetchDashboardData();
    } catch {
      setError('Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const [cronRes, eventsRes] = await Promise.all([
        fetch('/api/admin/legal-change/cron-runs?view=summary'),
        fetch('/api/admin/legal-change/events?view=dashboard'),
      ]);

      let jobs: JobStatus[] = [];
      let eventCounts: EventCounts = {
        new: 0,
        triaged: 0,
        action_required: 0,
        no_action: 0,
        implemented: 0,
        rolled_out: 0,
        closed: 0,
      };
      let recentEvents: DashboardData['recentEvents'] = [];
      let totalEvents = 0;
      let jobsNeedingAttention = 0;

      if (cronRes.ok) {
        const cronData = await cronRes.json();
        if (cronData.success) {
          jobs = cronData.data.jobs || [];
          jobsNeedingAttention = cronData.data.jobsNeedingAttention || 0;
        }
      }

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        if (eventsData.success && eventsData.data) {
          eventCounts = eventsData.data.summary?.byState || eventCounts;
          recentEvents = eventsData.data.recentEvents || [];
          totalEvents = eventsData.data.summary?.totalEvents || 0;
        }
      }

      setData({
        jobs,
        eventCounts,
        recentEvents,
        totalEvents,
        jobsNeedingAttention,
      });
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    }
  };

  const runManualCheck = async () => {
    setIsRunningCheck(true);
    try {
      const res = await fetch('/api/admin/legal-change/check-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (res.ok) {
        // Refresh data after check
        await fetchDashboardData();
      }
    } catch (err) {
      console.error('Failed to run manual check:', err);
    } finally {
      setIsRunningCheck(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' => {
    switch (status) {
      case 'success':
        return 'success';
      case 'partial':
        return 'warning';
      case 'failed':
      case 'running':
        return 'error';
      default:
        return 'warning';
    }
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading legal changes dashboard...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card padding="large">
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <RiLockLine className="w-10 h-10 text-[#7C3AED]" />
            </div>
            <h2 className="text-2xl font-bold text-charcoal mb-3">Access Denied</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You do not have permission to access the legal changes dashboard.
            </p>
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

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card padding="large">
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold text-charcoal mb-2">
              {error || 'Failed to load dashboard'}
            </h2>
            <Link href="/dashboard/admin">
              <button className="mt-4 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium">
                Back to Admin
              </button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const pendingCount = data.eventCounts.new + data.eventCounts.action_required;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <Container size="large" className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/dashboard/admin"
                className="text-sm text-white/80 hover:text-white font-medium mb-2 inline-block"
              >
                ← Back to Admin
              </Link>
              <h1 className="text-3xl font-extrabold">Legal Changes Dashboard</h1>
              <p className="opacity-90 mt-1">Phase 23: Cron Summary + Push PR Workflow</p>
            </div>
            <button
              onClick={runManualCheck}
              disabled={isRunningCheck}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50"
            >
              {isRunningCheck ? (
                <RiRefreshLine className="w-5 h-5 animate-spin" />
              ) : (
                <RiPlayLine className="w-5 h-5" />
              )}
              {isRunningCheck ? 'Running...' : 'Run Check Now'}
            </button>
          </div>
        </Container>
      </div>

      <Container size="large" className="py-8">
        {/* Attention Banner */}
        {data.jobsNeedingAttention > 0 && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
            <RiAlertLine className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-amber-800">
                {data.jobsNeedingAttention} job(s) need attention
              </p>
              <p className="text-sm text-amber-600">
                Review the cron status panels below for details
              </p>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card padding="medium">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Pending Attention</span>
              <RiInboxLine className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-3xl font-bold text-charcoal">{pendingCount}</div>
            <Link
              href="/dashboard/admin/legal-changes/inbox?filter=attention"
              className="text-xs text-primary hover:underline"
            >
              View inbox →
            </Link>
          </Card>

          <Card padding="medium">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">New Events</span>
              <RiAlertLine className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-charcoal">{data.eventCounts.new}</div>
            <Link
              href="/dashboard/admin/legal-changes/inbox?states=new"
              className="text-xs text-primary hover:underline"
            >
              View new →
            </Link>
          </Card>

          <Card padding="medium">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Action Required</span>
              <RiCheckboxCircleLine className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-3xl font-bold text-charcoal">
              {data.eventCounts.action_required}
            </div>
            <Link
              href="/dashboard/admin/legal-changes/inbox?states=action_required"
              className="text-xs text-primary hover:underline"
            >
              View actions →
            </Link>
          </Card>

          <Card padding="medium">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Events</span>
              <RiGitPullRequestLine className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-charcoal">{data.totalEvents}</div>
            <Link
              href="/dashboard/admin/legal-changes/inbox"
              className="text-xs text-primary hover:underline"
            >
              View all →
            </Link>
          </Card>
        </div>

        {/* Cron Status Panels */}
        <h2 className="text-xl font-semibold text-charcoal mb-4">Cron Job Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {data.jobs.map((job) => (
            <Card key={job.jobName} padding="medium">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-charcoal">{job.jobName}</h3>
                  <p className="text-xs text-gray-500">
                    Success rate: {job.successRate}%
                  </p>
                </div>
                {job.needsChecking && (
                  <Badge variant="warning" size="small">
                    Needs Checking
                  </Badge>
                )}
              </div>

              {job.lastRun ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Last Run</span>
                    <span className="text-charcoal">
                      {formatRelativeTime(job.lastRun.startedAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status</span>
                    <Badge variant={getStatusColor(job.lastRun.status)} size="small">
                      {job.lastRun.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Sources Checked</span>
                    <span className="text-charcoal">{job.lastRun.sourcesChecked}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Events Created</span>
                    <span className="text-charcoal">{job.lastRun.eventsCreated}</span>
                  </div>

                  {job.needsCheckingReasons.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-600 mb-2">Issues:</p>
                      {job.needsCheckingReasons.map((reason, idx) => (
                        <p
                          key={idx}
                          className={`text-xs ${
                            reason.severity === 'error'
                              ? 'text-red-600'
                              : reason.severity === 'warning'
                                ? 'text-amber-600'
                                : 'text-blue-600'
                          }`}
                        >
                          • {reason.reason}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No runs recorded yet</p>
              )}

              {job.nextScheduledTime && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <RiTimeLine className="w-3 h-3" />
                    Next run: {formatDate(job.nextScheduledTime)}
                  </div>
                </div>
              )}
            </Card>
          ))}

          {data.jobs.length === 0 && (
            <Card padding="medium" className="col-span-2">
              <p className="text-center text-gray-500 py-4">
                No cron job data available. Run a manual check to start.
              </p>
            </Card>
          )}
        </div>

        {/* Event Counts by State */}
        <h2 className="text-xl font-semibold text-charcoal mb-4">Events by State</h2>
        <Card padding="medium" className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {Object.entries(data.eventCounts).map(([state, count]) => (
              <Link
                key={state}
                href={`/dashboard/admin/legal-changes/inbox?states=${state}`}
                className="text-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="text-2xl font-bold text-charcoal">{count}</div>
                <div className="text-xs text-gray-500 capitalize">
                  {state.replace('_', ' ')}
                </div>
              </Link>
            ))}
          </div>
        </Card>

        {/* Recent Events */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-charcoal">Recent Events</h2>
          <Link
            href="/dashboard/admin/legal-changes/inbox"
            className="text-sm text-primary hover:underline"
          >
            View all →
          </Link>
        </div>
        <Card padding="medium">
          {data.recentEvents.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {data.recentEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/dashboard/admin/legal-changes/${event.id}`}
                  className="flex items-center justify-between py-3 hover:bg-gray-50 -mx-4 px-4 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-charcoal truncate">{event.title}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(event.detectedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {event.severity && (
                      <Badge variant={getSeverityColor(event.severity)} size="small">
                        {event.severity.replace('_', ' ')}
                      </Badge>
                    )}
                    <Badge
                      variant={
                        event.state === 'new' || event.state === 'action_required'
                          ? 'warning'
                          : 'success'
                      }
                      size="small"
                    >
                      {event.state.replace('_', ' ')}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No events yet</p>
          )}
        </Card>
      </Container>
    </div>
  );
}
