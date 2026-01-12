/**
 * User Dashboard
 *
 * Main dashboard after login - shows cases, documents, and orders
 */

'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { TealHero } from '@/components/ui';
import { RiFileTextLine, RiBookOpenLine, RiCustomerService2Line, RiLoginBoxLine } from 'react-icons/ri';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import type { OrderBySessionResponse } from '@/app/api/orders/by-session/route';

interface Case {
  id: string;
  case_type: string;
  jurisdiction: string;
  status: string;
  wizard_progress: number;
  created_at: string;
  // Derived display status from API
  display_status?: string;
  display_label?: string;
  display_badge_variant?: 'neutral' | 'warning' | 'success';
  has_paid_order?: boolean;
}

interface Document {
  id: string;
  document_title: string;
  document_type: string;
  is_preview: boolean;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoading: authLoading, isAuthenticated, user } = useAuthCheck();
  const [cases, setCases] = useState<Case[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const statsSectionRef = useRef<HTMLDivElement>(null);

  // Session ID fallback redirect handling
  const sessionId = searchParams.get('session_id');
  const [sessionOrder, setSessionOrder] = useState<OrderBySessionResponse | null>(null);
  const [sessionOrderLoading, setSessionOrderLoading] = useState(false);

  const handleScrollToStats = () => {
    setTimeout(() => {
      statsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Fetch order by session_id if present
  const fetchSessionOrder = useCallback(async () => {
    if (!sessionId || !isAuthenticated) return;

    setSessionOrderLoading(true);
    try {
      const response = await fetch(`/api/orders/by-session?session_id=${encodeURIComponent(sessionId)}`);
      if (response.ok) {
        const data: OrderBySessionResponse = await response.json();
        setSessionOrder(data);
      }
    } catch (error) {
      console.error('Failed to fetch session order:', error);
    } finally {
      setSessionOrderLoading(false);
    }
  }, [sessionId, isAuthenticated]);

  const fetchDashboardData = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoadingData(true);
    try {
      const [casesRes, docsRes, statsRes] = await Promise.all([
        fetch('/api/cases'),
        fetch('/api/documents'),
        fetch('/api/cases/stats'),
      ]);

      if (casesRes.ok) {
        const casesData = await casesRes.json();
        setCases(casesData.cases || []);
      }

      if (docsRes.ok) {
        const docsData = await docsRes.json();
        setDocuments(docsData.documents || []);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoadingData(false);
    }
  }, [isAuthenticated]);

  // Only fetch data once auth check completes and user is authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchDashboardData();
      fetchSessionOrder();
    }
  }, [authLoading, isAuthenticated, fetchDashboardData, fetchSessionOrder]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card padding="large" className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <RiLoginBoxLine className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h1>
          <p className="text-gray-600 mb-6">
            Please log in to access your dashboard and manage your cases.
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
          <p className="text-gray-600">Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TealHero
        title="Dashboard"
        subtitle={
          <button onClick={handleScrollToStats} className="hero-btn-pulse">
            Overview of your cases & activity →
          </button>
        }
        eyebrow={`Welcome${user?.full_name ? `, ${user.full_name}` : ''}`}
        align="left"
      />

      <Container size="large" className="py-8">
        {/* Session Order Banner - shown when redirected from Stripe with session_id */}
        {sessionId && !sessionOrderLoading && sessionOrder && (
          <>
            {sessionOrder.found && sessionOrder.paid && sessionOrder.case_id ? (
              <div className="mb-6 p-6 rounded-lg border border-success/20 bg-success/5">
                <div className="flex items-start gap-3">
                  <div className="text-success text-2xl">✔</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-charcoal">Payment confirmed</h3>
                    <p className="text-gray-700 mt-1">
                      Your payment was successful. View your case to download your documents.
                    </p>
                    <div className="mt-4">
                      <Link href={`/dashboard/cases/${sessionOrder.case_id}`}>
                        <Button variant="primary">
                          View Your Case
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : sessionOrder.found && !sessionOrder.paid ? (
              <div className="mb-6 p-6 rounded-lg border border-gray-200 bg-gray-50">
                <div className="flex items-start gap-3">
                  <div className="text-gray-500 text-2xl">ℹ️</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-charcoal">Payment pending</h3>
                    <p className="text-gray-600 mt-1">
                      Your payment is being processed. Please check back shortly or contact support if you believe this is an error.
                    </p>
                  </div>
                </div>
              </div>
            ) : !sessionOrder.found ? (
              <div className="mb-6 p-6 rounded-lg border border-gray-200 bg-gray-50">
                <div className="flex items-start gap-3">
                  <div className="text-gray-500 text-2xl">ℹ️</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-charcoal">Session not found</h3>
                    <p className="text-gray-600 mt-1">
                      We couldn't find a purchase associated with this session. If you recently made a payment, it may still be processing.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </>
        )}

        {/* Stats Overview */}
        {stats && (
          <div ref={statsSectionRef} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 scroll-mt-8">
            <Card padding="medium">
              <div className="text-sm text-gray-600 mb-1">Total Cases</div>
              <div className="text-3xl font-bold text-charcoal">{stats.overview.total}</div>
            </Card>
            <Card padding="medium">
              <div className="text-sm text-gray-600 mb-1">In Progress</div>
              <div className="text-3xl font-bold text-primary">{stats.overview.in_progress}</div>
            </Card>
            <Card padding="medium">
              <div className="text-sm text-gray-600 mb-1">Completed</div>
              <div className="text-3xl font-bold text-green-600">{stats.overview.completed}</div>
            </Card>
            <Card padding="medium">
              <div className="text-sm text-gray-600 mb-1">Documents</div>
              <div className="text-3xl font-bold text-charcoal">{documents.length}</div>
            </Card>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Cases (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Cases */}
            <Card padding="large">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-charcoal">Recent Cases</h2>
                <Link href="/dashboard/cases" className="text-sm text-primary hover:text-primary-dark font-medium">
                  View all →
                </Link>
              </div>

              {cases.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">No cases yet</p>
                  <Link href="/wizard">
                    <Button variant="primary">Start Your First Case</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {cases.slice(0, 5).map((caseItem) => (
                    <div
                      key={caseItem.id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary transition-colors cursor-pointer"
                      onClick={() => router.push(`/dashboard/cases/${caseItem.id}`)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-charcoal capitalize">
                            {caseItem.case_type.replace('_', ' ')}
                          </div>
                          <div className="text-sm text-gray-600">
                            {caseItem.jurisdiction === 'england' ? 'England' : caseItem.jurisdiction === 'wales' ? 'Wales' : caseItem.jurisdiction === 'scotland' ? 'Scotland' : caseItem.jurisdiction === 'northern-ireland' ? 'Northern Ireland' : caseItem.jurisdiction}
                          </div>
                        </div>
                        <Badge
                          variant={caseItem.display_badge_variant || (caseItem.status === 'completed' ? 'success' : caseItem.status === 'in_progress' ? 'warning' : 'neutral')}
                        >
                          {caseItem.display_label || caseItem.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Progress: {caseItem.wizard_progress}%</span>
                        <span>•</span>
                        <span>{formatDate(caseItem.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Documents */}
            <Card padding="large">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-charcoal">Documents</h2>
                <Link href="/dashboard/documents" className="text-sm text-primary hover:text-primary-dark font-medium">
                  View all →
                </Link>
              </div>

              {documents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No documents generated yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.slice(0, 5).map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                          <RiFileTextLine className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-charcoal truncate">{doc.document_title}</div>
                          <div className="text-xs text-gray-500">{formatDate(doc.created_at)}</div>
                        </div>
                      </div>
                      {doc.is_preview && (
                        <Badge variant="warning" size="small">Preview</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Right Column: Quick Actions & Info (1/3) */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card padding="medium">
              <h3 className="font-semibold text-charcoal mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link href="/wizard">
                  <button className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-left font-medium">
                    📝 Create New Document
                  </button>
                </Link>
                {/* HMO Pro Dashboard removed - parked for later review */}
                <Link href="/dashboard/billing">
                  <button className="w-full px-4 py-3 bg-gray-100 text-charcoal rounded-lg hover:bg-gray-200 transition-colors text-left font-medium">
                    💳 Billing & Orders
                  </button>
                </Link>
                <Link href="/dashboard/settings">
                  <button className="w-full px-4 py-3 bg-gray-100 text-charcoal rounded-lg hover:bg-gray-200 transition-colors text-left font-medium">
                    ⚙️ Account Settings
                  </button>
                </Link>
              </div>
            </Card>

            {/* Help & Support */}
            <Card padding="medium">
              <h3 className="font-semibold text-charcoal mb-4">Need Help?</h3>
              <div className="space-y-3 text-sm">
                <Link href="/help" className="flex items-center gap-3 text-gray-700 hover:text-primary">
                  <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                    <RiBookOpenLine className="w-4 h-4 text-primary" />
                  </div>
                  Help Center
                </Link>
                <Link href="/contact" className="flex items-center gap-3 text-gray-700 hover:text-primary">
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
