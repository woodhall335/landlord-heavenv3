'use client';

import { useState } from 'react';
import { Lock, Download, FileText, ClipboardList, CheckSquare, Shield, Scale, FileCheck, Home, Users, BookOpen, Eye, X } from 'lucide-react';

export interface DocumentInfo {
  id: string;
  title: string;
  description: string;
  icon: 'notice' | 'guidance' | 'checklist' | 'compliance' | 'court-form' | 'ai-generated' | 'agreement' | 'schedule' | 'evidence';
  pages?: string;
  category?: string;
  /** Database document ID for fetching thumbnail */
  documentId?: string;
  /** Pre-loaded thumbnail URL (optional) */
  thumbnailUrl?: string;
  /** Full preview URL for watermarked in-page document viewing */
  previewUrl?: string;
}

interface DocumentCardProps {
  document: DocumentInfo;
  isLocked: boolean;
  onUnlock: () => void;
  onDownload?: () => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'notice': FileText,
  'guidance': BookOpen,
  'checklist': CheckSquare,
  'compliance': Shield,
  'court-form': Scale,
  'ai-generated': FileCheck,
  'agreement': Home,
  'schedule': Users,
  'evidence': ClipboardList,
};

export function DocumentCard({ document, isLocked, onUnlock, onDownload }: DocumentCardProps) {
  const IconComponent = iconMap[document.icon] || FileText;
  const [showPreview, setShowPreview] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);

  // Determine thumbnail URL - either pre-loaded or from API
  const thumbnailUrl = document.thumbnailUrl ||
    (document.documentId ? `/api/documents/thumbnail/${document.documentId}` : null);
  const previewUrl = document.previewUrl || null;
  const canPreview = Boolean(previewUrl || thumbnailUrl);

  const handlePreviewClick = () => {
    if (canPreview) {
      setShowPreview(true);
    }
  };

  return (
    <>
      <div
        className={`border rounded-lg p-4 bg-white shadow-sm transition-all ${isLocked ? 'border-gray-200' : 'border-primary/20'} ${canPreview ? 'cursor-pointer hover:shadow-md' : 'hover:shadow-md'}`}
        onClick={canPreview ? handlePreviewClick : undefined}
        onKeyDown={
          canPreview
            ? (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handlePreviewClick();
                }
              }
            : undefined
        }
        role={canPreview ? 'button' : undefined}
        tabIndex={canPreview ? 0 : undefined}
      >
        <div className="flex items-start gap-4">
          {/* Thumbnail or Icon */}
          {thumbnailUrl && !thumbnailError ? (
            <div
              className="relative w-16 h-22 flex-shrink-0 cursor-pointer group overflow-hidden rounded-lg border bg-white shadow-sm"
              onClick={(event) => {
                event.stopPropagation();
                handlePreviewClick();
              }}
            >
              <img
                src={thumbnailUrl}
                alt={`Preview of ${document.title}`}
                className="h-full w-full object-contain bg-white"
                onError={(e) => {
                  // Log thumbnail load failure for debugging (works in both dev and production)
                  const img = e.currentTarget;
                  console.error('[DocumentCard] Thumbnail failed to load:', {
                    url: thumbnailUrl,
                    documentId: document.documentId,
                    title: document.title,
                    naturalWidth: img.naturalWidth,
                    naturalHeight: img.naturalHeight,
                  });

                  // Fetch actual error details - works in both dev AND production for debugging
                  // This helps diagnose Vercel-specific failures
                  if (thumbnailUrl) {
                    fetch(thumbnailUrl)
                      .then(async (res) => {
                        if (!res.ok) {
                          // Try to get response body (limited to prevent huge logs)
                          let bodySnippet = '';
                          try {
                            const text = await res.text();
                            // Only log first 200 chars to avoid dumping large responses
                            bodySnippet = text.substring(0, 200);
                          } catch {
                            bodySnippet = '(could not read body)';
                          }

                          console.error('[DocumentCard] Thumbnail API error:', {
                            status: res.status,
                            statusText: res.statusText,
                            contentType: res.headers.get('content-type'),
                            runtime: res.headers.get('x-thumbnail-runtime'),
                            bodySnippet,
                          });
                        }
                      })
                      .catch(fetchErr => {
                        console.error('[DocumentCard] Thumbnail fetch error:', fetchErr.message);
                      });
                  }

                  setThumbnailError(true);
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors flex items-center justify-center">
                <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {isLocked && (
                <div className="absolute top-1 right-1 bg-white/90 rounded-full p-0.5">
                  <Lock className="w-3 h-3 text-gray-500" />
                </div>
              )}
            </div>
          ) : (
            <div className={`p-3 rounded-xl flex-shrink-0 ${isLocked ? 'bg-gray-100' : 'bg-purple-100'}`}>
              <IconComponent className={`w-6 h-6 ${isLocked ? 'text-gray-400' : 'text-primary'}`} />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{document.title}</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{document.description}</p>
              </div>
              {canPreview ? (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-violet-700">
                  <Eye className="w-3.5 h-3.5" />
                  Preview
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-3 mt-2">
              {document.pages && (
                <span className="text-xs text-gray-400">{document.pages}</span>
              )}
              {document.category && (
                <span className="inline-block px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded">
                  {document.category}
                </span>
              )}
            </div>
          </div>
          <div className="flex-shrink-0">
            {isLocked ? (
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  onUnlock();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors text-sm font-medium"
              >
                <Lock className="w-4 h-4" />
                <span className="hidden sm:inline">Unlock</span>
              </button>
            ) : (
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  onDownload?.();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-primary rounded-lg hover:bg-primary hover:text-white transition-colors text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (previewUrl || thumbnailUrl) && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[92vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-gray-900">{document.title} - Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(92vh-120px)] bg-gray-50">
              {previewUrl ? (
                <iframe
                  src={previewUrl}
                  title={`${document.title} full preview`}
                  className="h-[75vh] w-full rounded-lg border bg-white shadow-lg"
                  loading="lazy"
                  sandbox="allow-scripts allow-same-origin"
                />
              ) : thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt={`Full preview of ${document.title}`}
                  className="mx-auto h-auto max-w-full rounded-lg bg-white shadow-lg"
                />
              ) : null}
            </div>
            <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                This is a watermarked preview. Downloads stay locked until payment.
              </p>
              <button
                onClick={onUnlock}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Unlock Full Document
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
