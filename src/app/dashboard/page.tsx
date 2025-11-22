/**
 * User Dashboard
 *
 * Main dashboard after login - shows cases, documents, and orders
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { TealHero } from '@/components/ui';

interface Case {
  id: string;
  case_type: string;
  jurisdiction: string;
  status: string;
  wizard_progress: number;
  created_at: string;
}

interface Document {
  id: string;
  document_title: string;
  document_type: string;
  is_preview: boolean;
  created_at: string;
}

interface Order {
  id: string;
  product_name: string;
  total_amount: number;
  payment_status: string;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [cases, setCases] = useState<Case[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
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
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TealHero
        title="Dashboard"
        subtitle="Overview of your cases & activity"
        eyebrow="Workspace"
        actions={
          <Link href="/wizard">
            <Button variant="secondary" size="large" className="bg-white text-primary hover:bg-white/90">
              + New Document
            </Button>
          </Link>
        }
        align="left"
      />

      <Container size="large" className="py-8">
        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                            {caseItem.jurisdiction === 'england-wales' ? 'England & Wales' : caseItem.jurisdiction === 'scotland' ? 'Scotland' : 'Northern Ireland'}
                          </div>
                        </div>
                        <Badge
                          variant={caseItem.status === 'completed' ? 'success' : caseItem.status === 'in_progress' ? 'warning' : 'neutral'}
                        >
                          {caseItem.status}
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
                        <svg className="w-8 h-8 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
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
                <Link href="/dashboard/hmo">
                  <button className="w-full px-4 py-3 bg-gradient-to-r from-secondary to-primary text-white rounded-lg hover:opacity-90 transition-opacity text-left font-medium">
                    🏘️ HMO Pro Dashboard
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
                <Link href="/docs" className="flex items-center gap-2 text-gray-700 hover:text-primary">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Documentation
                </Link>
                <Link href="/support" className="flex items-center gap-2 text-gray-700 hover:text-primary">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
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
