/**
 * Case Detail Page
 *
 * Individual case view with timeline, collected facts, and documents
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();
  const caseId = params.id as string;
  const paymentStatus = searchParams.get('payment');
  const paymentSuccess = paymentStatus === 'success';

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

  useEffect(() => {
    if (caseId) {
      fetchCaseDetails();
      fetchCaseDocuments();
      runAskHeaven();
    }
  }, [caseId]);

  const fetchCaseDetails = async () => {
    try {
      const response = await fetch(`/api/cases/${caseId}`);

      if (response.ok) {
        const data = await response.json();
        setCaseDetails(data.case);
        setEditedFacts(data.case.collected_facts || {});
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

  const runAskHeaven = async (question?: string) => {
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

  const getNextSteps = () => {
    if (!caseDetails) return [] as string[];

    if (caseDetails.case_type === 'money_claim') {
      if (caseDetails.jurisdiction === 'scotland') {
        return [
          'Review Simple Procedure Form 3A and particulars for accuracy before printing.',
          'Serve the Form 3A pack on the respondent using the Sheriff Clerk guidance.',
          'File your completed bundle with the Sheriff Court and keep proof of service.',
        ];
      }

      return [
        'Print and sign the N1 claim form and particulars of claim.',
        'Include the pre-action letter and information sheet when serving the defendant.',
        'File the claim via Money Claim Online or your local court and retain proof of service.',
      ];
    }

    return [
      'Download and review your documents.',
      'Follow the included filing or service instructions.',
      'Contact support if you need any help completing the process.',
    ];
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
      'This will regenerate the document with the current case data. Any unsaved changes will be lost. Continue?'
    );

    if (!confirmed) return;

    setIsRegenerating(true);
    setMessage(null);

    try {
      const response = await fetch('/api/documents/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: caseId,
          document_type: caseDetails.case_type,
          is_preview: false,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate document');
      }

      setMessage({ type: 'success', text: 'Document regenerated successfully!' });
      fetchCaseDocuments();
    } catch (err: any) {
      console.error('Error regenerating document:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to regenerate document' });
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
    } catch (err) {
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
          <div className="flex flex-wrap gap-3">
            {!isEditMode ? (
              <>
                <Button variant="primary" onClick={() => setIsEditMode(true)}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Case Details
                </Button>
                {caseDetails.wizard_progress < 100 && (
                  <Button variant="secondary" onClick={handleContinueWizard}>
                    Continue Wizard
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={handleRegenerateDocument}
                  disabled={isRegenerating}
                >
                  {isRegenerating ? 'Regenerating...' : 'Regenerate Document'}
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
                  disabled={isSaving}
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

        {/* Payment Success Summary */}
        {paymentSuccess && (
          <div className="mb-6 p-6 rounded-lg border border-success/20 bg-success/5">
            <div className="flex items-start gap-3">
              <div className="text-success text-2xl">✔</div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-charcoal">Payment received — your documents are ready</h3>
                <p className="text-gray-700 mt-1">
                  Download your bundle and follow the steps below to file your claim.
                </p>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h4 className="font-semibold text-charcoal mb-3">Documents in your pack</h4>
                    {documents.length === 0 ? (
                      <p className="text-gray-600 text-sm">Generating your documents...</p>
                    ) : (
                      <ul className="space-y-2 text-sm text-gray-800">
                        {documents.map((doc) => (
                          <li key={doc.id} className="flex items-center justify-between gap-2">
                            <span className="truncate">{doc.document_title}</span>
                            {doc.file_path && (
                              <a
                                href={doc.file_path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:text-primary-dark font-semibold"
                              >
                                Download
                              </a>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h4 className="font-semibold text-charcoal mb-3">Next steps</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-800">
                      {getNextSteps().map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                    <div className="mt-4">
                      <Link href="#ask-heaven">
                        <Button variant="secondary">Ask Heaven about this case</Button>
                      </Link>
                    </div>
                  </div>
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
                    {analysis?.case_summary?.route?.replace('_', ' ') || analysis?.recommended_route || 'money claim'}
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
                        <svg
                          className="w-8 h-8 text-primary shrink-0"
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
