/**
 * Documents Page
 *
 * Full list of all generated documents with download functionality
 */

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { RiFileTextLine, RiDownloadLine, RiDeleteBinLine } from 'react-icons/ri';

interface Document {
  id: string;
  case_id: string | null;
  document_title: string;
  document_type: string;
  is_preview: boolean;
  pdf_url: string | null;  // Correct field name from schema
  created_at: string;
}

type FilterType = 'all' | 'eviction' | 'money_claim' | 'tenancy_agreement';
type SortBy = 'newest' | 'oldest' | 'title';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [showPreviewOnly, setShowPreviewOnly] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documents, filterType, sortBy, showPreviewOnly]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents');

      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...documents];

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter((doc) => doc.document_type === filterType);
    }

    // Apply preview filter
    if (showPreviewOnly) {
      filtered = filtered.filter((doc) => doc.is_preview);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'title':
          return a.document_title.localeCompare(b.document_title);
        default:
          return 0;
      }
    });

    setFilteredDocuments(filtered);
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

  const getDocumentTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      eviction: 'Eviction Notice',
      money_claim: 'Money Claim',
      tenancy_agreement: 'Tenancy Agreement',
    };
    return labels[type] || type;
  };

  const handleDownload = async (doc: Document) => {
    if (!doc.pdf_url) {
      alert('Document file not available');
      return;
    }

    try {
      // Open in new tab for now - in production this would trigger a download
      window.open(doc.pdf_url, '_blank');
    } catch (error) {
      console.error('Failed to download document:', error);
      alert('Failed to download document');
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/documents/${docId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh the list
        fetchDocuments();
      } else {
        alert('Failed to delete document');
      }
    } catch {
      alert('Failed to delete document');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading documents...</p>
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
              <h1 className="text-3xl font-extrabold text-charcoal">Documents</h1>
              <p className="text-gray-600 mt-1">
                {filteredDocuments.length} {filteredDocuments.length === 1 ? 'document' : 'documents'} found
              </p>
            </div>
            <Link href="/wizard">
              <Button variant="primary" size="large">
                + New Document
              </Button>
            </Link>
          </div>
        </Container>
      </div>

      <Container size="large" className="py-8">
        {/* Filters and Sorting */}
        <Card padding="medium" className="mb-6">
          <div className="space-y-4">
            {/* Type Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Document Type
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterType === 'all'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Types
                </button>
                <button
                  onClick={() => setFilterType('eviction')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterType === 'eviction'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Eviction
                </button>
                <button
                  onClick={() => setFilterType('money_claim')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterType === 'money_claim'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Money Claim
                </button>
                <button
                  onClick={() => setFilterType('tenancy_agreement')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterType === 'tenancy_agreement'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Tenancy Agreement
                </button>
              </div>
            </div>

            {/* Controls Row */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Preview Toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPreviewOnly}
                  onChange={(e) => setShowPreviewOnly(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-gray-700">
                  Show preview documents only
                </span>
              </label>

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
                  <option value="title">Title A-Z</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Documents List */}
        {filteredDocuments.length === 0 ? (
          <Card padding="large">
            <div className="text-center py-12">
              <RiFileTextLine className="w-16 h-16 text-[#7C3AED] mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-charcoal mb-2">No documents found</h2>
              <p className="text-gray-600 mb-6">
                {filterType !== 'all' || showPreviewOnly
                  ? 'No documents match your current filters.'
                  : "You haven't generated any documents yet."}
              </p>
              <Link href="/wizard">
                <Button variant="primary">Create Your First Document</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} padding="large">
                <div className="flex items-start justify-between gap-4">
                  {/* Document Info */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-primary-subtle rounded-lg flex items-center justify-center shrink-0">
                      <RiFileTextLine className="w-6 h-6 text-[#7C3AED]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-charcoal truncate">
                          {doc.document_title}
                        </h3>
                        {doc.is_preview && (
                          <Badge variant="warning" size="small">
                            Preview
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {getDocumentTypeLabel(doc.document_type)}
                      </p>
                      <div className="text-xs text-gray-500">
                        Created {formatDate(doc.created_at)}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {doc.case_id && (
                      <Link href={`/dashboard/cases/${doc.case_id}`}>
                        <Button variant="outline" size="small">
                          View Case
                        </Button>
                      </Link>
                    )}
                    {doc.pdf_url && (
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => handleDownload(doc)}
                      >
                        <RiDownloadLine className="w-4 h-4 mr-1 text-[#7C3AED]" />
                        Download
                      </Button>
                    )}
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-2 text-gray-400 hover:text-error transition-colors"
                      title="Delete document"
                    >
                      <RiDeleteBinLine className="w-5 h-5 text-[#7C3AED]" />
                    </button>
                  </div>
                </div>

              </Card>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
