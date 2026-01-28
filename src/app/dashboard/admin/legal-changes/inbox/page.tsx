/**
 * Admin Legal Changes Inbox
 *
 * Lists all legal change events grouped by state with filtering:
 * - New
 * - Triaged
 * - Action Required
 * - Implemented
 * - Rolled Out
 * - Closed
 *
 * Phase 23: Admin Portal Cron Summary + One-Click "Push PR" Workflow
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  RiLockLine,
  RiFilterLine,
  RiSearchLine,
  RiArrowRightLine,
  RiGitPullRequestLine,
  RiUserLine,
} from 'react-icons/ri';

interface EventSummary {
  id: string;
  title: string;
  state: string;
  severity?: string;
  jurisdictions: string[];
  sourceId: string;
  detectedAt: string;
  impactedRuleCount: number;
  assignedTo?: string;
}

type StateFilter = 'all' | 'new' | 'triaged' | 'action_required' | 'no_action' | 'implemented' | 'rolled_out' | 'closed';

const STATE_LABELS: Record<string, string> = {
  all: 'All Events',
  new: 'New',
  triaged: 'Triaged',
  action_required: 'Action Required',
  no_action: 'No Action',
  implemented: 'Implemented',
  rolled_out: 'Rolled Out',
  closed: 'Closed',
};

const STATE_COLORS: Record<string, 'success' | 'warning' | 'error'> = {
  new: 'warning',
  triaged: 'warning',
  action_required: 'error',
  no_action: 'success',
  implemented: 'success',
  rolled_out: 'success',
  closed: 'success',
};

export default function LegalChangesInboxPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [events, setEvents] = useState<EventSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [error, setError] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);

  // Filters from URL
  const statesParam = searchParams.get('states');
  const filterParam = searchParams.get('filter');
  const [selectedState, setSelectedState] = useState<StateFilter>(
    (statesParam as StateFilter) || 'all'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Jurisdiction filter
  const [selectedJurisdictions, setSelectedJurisdictions] = useState<string[]>([]);

  useEffect(() => {
    checkAccessAndFetch();
  }, []);

  useEffect(() => {
    if (hasAccess) {
      fetchEvents();
    }
  }, [selectedState, page, hasAccess]);

  useEffect(() => {
    // Handle special filter param
    if (filterParam === 'attention') {
      setSelectedState('all');
      // Will filter to new + action_required
    }
  }, [filterParam]);

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
    } catch {
      setError('Failed to load inbox');
      setIsLoading(false);
    }
  };

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('pageSize', '20');

      if (selectedState !== 'all') {
        params.set('states', selectedState);
      } else if (filterParam === 'attention') {
        params.set('states', 'new,action_required');
      }

      if (selectedJurisdictions.length > 0) {
        params.set('jurisdictions', selectedJurisdictions.join(','));
      }

      const res = await fetch(`/api/admin/legal-change/events?${params.toString()}`);

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setEvents(data.data || []);
          setTotalCount(data.meta?.totalCount || 0);
        }
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStateChange = (state: StateFilter) => {
    setSelectedState(state);
    setPage(1);

    // Update URL
    const params = new URLSearchParams(searchParams.toString());
    if (state === 'all') {
      params.delete('states');
    } else {
      params.set('states', state);
    }
    params.delete('filter');
    router.push(`/dashboard/admin/legal-changes/inbox?${params.toString()}`);
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

  const formatRelativeTime = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
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

  const filteredEvents = events.filter((event) => {
    if (searchQuery) {
      return event.title.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  if (!hasAccess && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card padding="large">
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <RiLockLine className="w-10 h-10 text-[#7C3AED]" />
            </div>
            <h2 className="text-2xl font-bold text-charcoal mb-3">Access Denied</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You do not have permission to access this page.
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <Container size="large" className="py-6">
          <div>
            <Link
              href="/dashboard/admin/legal-changes"
              className="text-sm text-white/80 hover:text-white font-medium mb-2 inline-block"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-extrabold">Legal Change Inbox</h1>
            <p className="opacity-90 mt-1">
              {totalCount} event{totalCount !== 1 ? 's' : ''} total
            </p>
          </div>
        </Container>
      </div>

      <Container size="large" className="py-6">
        {/* Filters Row */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* State Tabs */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(STATE_LABELS).map(([state, label]) => (
              <button
                key={state}
                onClick={() => handleStateChange(state as StateFilter)}
                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                  selectedState === state
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* More Filters */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
          >
            <RiFilterLine className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <Card padding="medium" className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jurisdiction
                </label>
                <div className="flex flex-wrap gap-2">
                  {['england', 'wales', 'scotland', 'uk_wide'].map((j) => (
                    <button
                      key={j}
                      onClick={() => {
                        setSelectedJurisdictions((prev) =>
                          prev.includes(j)
                            ? prev.filter((x) => x !== j)
                            : [...prev, j]
                        );
                      }}
                      className={`px-2 py-1 text-xs rounded ${
                        selectedJurisdictions.includes(j)
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {j.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Events List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading events...</p>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="space-y-3">
            {filteredEvents.map((event) => (
              <Link
                key={event.id}
                href={`/dashboard/admin/legal-changes/${event.id}`}
                className="block"
              >
                <Card padding="medium" className="hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-charcoal truncate">
                          {event.title}
                        </h3>
                        {event.state === 'action_required' && (
                          <RiGitPullRequestLine className="w-4 h-4 text-orange-500 flex-shrink-0" />
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-2">
                        <span>{event.sourceId}</span>
                        <span>•</span>
                        <span>{event.jurisdictions.join(', ')}</span>
                        <span>•</span>
                        <span>{formatRelativeTime(event.detectedAt)}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={STATE_COLORS[event.state] || 'success'}
                          size="small"
                        >
                          {event.state.replace('_', ' ')}
                        </Badge>

                        {event.severity && (
                          <Badge
                            variant={getSeverityColor(event.severity)}
                            size="small"
                          >
                            {event.severity.replace('_', ' ')}
                          </Badge>
                        )}

                        {event.impactedRuleCount > 0 && (
                          <span className="text-xs text-gray-500">
                            {event.impactedRuleCount} rule
                            {event.impactedRuleCount !== 1 ? 's' : ''} impacted
                          </span>
                        )}

                        {event.assignedTo && (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <RiUserLine className="w-3 h-3" />
                            {event.assignedTo}
                          </span>
                        )}
                      </div>
                    </div>

                    <RiArrowRightLine className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card padding="large">
            <div className="text-center py-8">
              <p className="text-gray-500">
                {searchQuery
                  ? 'No events match your search'
                  : selectedState !== 'all'
                    ? `No events in "${STATE_LABELS[selectedState]}" state`
                    : 'No events found'}
              </p>
            </div>
          </Card>
        )}

        {/* Pagination */}
        {totalCount > 20 && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {Math.ceil(totalCount / 20)}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * 20 >= totalCount}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </Container>
    </div>
  );
}
