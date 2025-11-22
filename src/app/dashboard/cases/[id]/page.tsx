/**
 * Case Detail Page
 *
 * Individual case view with timeline, collected facts, and documents
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

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
  file_path: string | null;
  created_at: string;
}

export default function CaseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const caseId = params.id as string;

  const [caseDetails, setCaseDetails] = useState<CaseDetails | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (caseId) {
      fetchCaseDetails();
      fetchCaseDocuments();
    }
  }, [caseId]);

  const fetchCaseDetails = async () => {
    try {
      const response = await fetch(`/api/cases/${caseId}`);

      if (response.ok) {
        const data = await response.json();
        setCaseDetails(data.case);
      } else {
        setError('Case not found');
      }
    } catch (err) {
      setError('Failed to load case details');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCaseDocuments = async () => {
    try {
      const response = await fetch(`/api/documents?case_id=${caseId}`);

      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.error('Failed to fetch documents:', err);
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
    } catch (err) {
      alert('Failed to delete case');
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
            <svg
              className="w-16 h-16 text-red-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
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

          {/* Action Buttons */}
          <div className="flex gap-3">
            {caseDetails.wizard_progress < 100 && (
              <Button variant="primary" onClick={handleContinueWizard}>
                Continue Wizard
              </Button>
            )}
            {documents.length > 0 && (
              <Link href={`/wizard/preview/${caseId}`}>
                <Button variant="secondary">View Documents</Button>
              </Link>
            )}
            <Button variant="outline" onClick={handleDeleteCase}>
              Delete Case
            </Button>
          </div>
        </Container>
      </div>

      <Container size="large" className="py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Collected Facts */}
            <Card padding="large">
              <h2 className="text-xl font-semibold text-charcoal mb-6">
                Collected Information
              </h2>

              {Object.keys(caseDetails.collected_facts).length === 0 ? (
                <p className="text-gray-600">No information collected yet.</p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(caseDetails.collected_facts).map(([key, value]) => (
                    <div key={key} className="pb-4 border-b border-gray-200 last:border-0">
                      <div className="text-sm text-gray-600 mb-1 capitalize">
                        {key.replace(/_/g, ' ')}
                      </div>
                      <div className="text-base text-charcoal font-medium">
                        {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* AI Analysis */}
            {caseDetails.ai_analysis && (
              <Card padding="large">
                <h2 className="text-xl font-semibold text-charcoal mb-6">
                  AI Analysis
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
                        <svg
                          className="w-8 h-8 text-primary flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                            clipRule="evenodd"
                          />
                        </svg>
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
                        {doc.file_path && (
                          <a
                            href={doc.file_path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary-dark"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                            </svg>
                          </a>
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
                  href="/docs"
                  className="flex items-center gap-2 text-gray-700 hover:text-primary"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  Documentation
                </Link>
                <Link
                  href="/support"
                  className="flex items-center gap-2 text-gray-700 hover:text-primary"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                    />
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
