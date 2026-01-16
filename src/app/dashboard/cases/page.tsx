/**
 * Cases List Page
 *
 * Full list of all user cases with filtering and sorting
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { RiFileTextLine, RiCalendarLine, RiLoginBoxLine } from 'react-icons/ri';
import { useAuthCheck } from '@/hooks/useAuthCheck';

interface Case {
  id: string;
  case_type: string;
  jurisdiction: string;
  status: string;
  wizard_progress: number;
  created_at: string;
  updated_at: string;
  // Derived display status from API
  display_status?: string;
  display_label?: string;
  display_badge_variant?: 'neutral' | 'warning' | 'success';
  has_paid_order?: boolean;
  has_fulfilled_order?: boolean;
}

type FilterStatus = 'all' | 'draft' | 'in_progress' | 'completed';
type SortBy = 'newest' | 'oldest' | 'progress';

export default function CasesListPage() {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated } = useAuthCheck();
  const [cases, setCases] = useState<Case[]>([]);
  const [filteredCases, setFilteredCases] = useState<Case[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortBy>('newest');

  const fetchCases = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoadingData(true);
    try {
      const response = await fetch('/api/cases');

      if (response.ok) {
        const data = await response.json();
        setCases(data.cases || []);
      }
    } catch (error) {
      console.error('Failed to fetch cases:', error);
    } finally {
      setIsLoadingData(false);
    }
  }, [isAuthenticated]);

  // Only fetch data once auth check completes and user is authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchCases();
    }
  }, [authLoading, isAuthenticated, fetchCases]);

  useEffect(() => {
    applyFiltersAndSort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cases, filterStatus, sortBy]);

  const applyFiltersAndSort = () => {
    let filtered = [...cases];

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((c) => c.status === filterStatus);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'progress':
          return b.wizard_progress - a.wizard_progress;
        default:
          return 0;
      }
    });

    setFilteredCases(filtered);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
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

  const getStatusColor = (caseItem: Case): 'neutral' | 'warning' | 'success' => {
    // Use derived badge variant if available
    if (caseItem.display_badge_variant) {
      return caseItem.display_badge_variant;
    }
    // Fallback to status-based color
    switch (caseItem.status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  const getStatusLabel = (caseItem: Case): string => {
    // Use derived display label if available
    if (caseItem.display_label) {
      return caseItem.display_label;
    }
    // Fallback to raw status
    return caseItem.status.replace('_', ' ');
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card padding="large" className="max-w-md mx-auto text-center">
          <RiLoginBoxLine className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h1>
          <p className="text-gray-600 mb-6">
            Please log in to view your cases.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/auth/login">
              <Button variant="primary" size="large" className="w-full">
                Log In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="secondary" size="large" className="w-full">
                Create Account
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Show loading while fetching data
  if (isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading cases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <Container size="large" className="py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-charcoal">All Cases</h1>
              <p className="text-gray-600 mt-1">
                {filteredCases.length} {filteredCases.length === 1 ? 'case' : 'cases'} found
              </p>
            </div>
            <Link href="/wizard">
              <Button variant="primary" size="large">
                + New Case
              </Button>
            </Link>
          </div>
        </Container>
      </div>

      <Container size="large" className="py-8">
        {/* Filters and Sorting */}
        <Card padding="medium" className="mb-6">
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            {/* Status Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Cases
              </button>
              <button
                onClick={() => setFilterStatus('draft')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'draft'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Draft
              </button>
              <button
                onClick={() => setFilterStatus('in_progress')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'in_progress'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => setFilterStatus('completed')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'completed'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Completed
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="progress">Progress</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Cases Grid */}
        {filteredCases.length === 0 ? (
          <Card padding="large">
            <div className="text-center py-12">
              <RiFileTextLine className="w-16 h-16 text-[#7C3AED] mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-charcoal mb-2">
                No cases found
              </h2>
              <p className="text-gray-600 mb-6">
                {filterStatus !== 'all'
                  ? `You don't have any ${filterStatus.replace('_', ' ')} cases yet.`
                  : "You haven't created any cases yet."}
              </p>
              <Link href="/wizard">
                <Button variant="primary">Create Your First Case</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCases.map((caseItem) => (
              <Card
                key={caseItem.id}
                padding="large"
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push(`/dashboard/cases/${caseItem.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-charcoal mb-1">
                      {getCaseTypeLabel(caseItem.case_type)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {getJurisdictionLabel(caseItem.jurisdiction)}
                    </p>
                  </div>
                  <Badge variant={getStatusColor(caseItem)}>
                    {getStatusLabel(caseItem)}
                  </Badge>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium text-charcoal">
                      {caseItem.wizard_progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${caseItem.wizard_progress}%` }}
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <RiCalendarLine className="w-4 h-4 text-[#7C3AED]" />
                    Created {formatDate(caseItem.created_at)}
                  </div>
                  <span>•</span>
                  <div>Updated {formatDate(caseItem.updated_at)}</div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
