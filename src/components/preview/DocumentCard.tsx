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
  const [thumbnailLoading, setThumbnailLoading] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);

  // Determine thumbnail URL - either pre-loaded or from API
  const thumbnailUrl = document.thumbnailUrl ||
    (document.documentId ? `/api/documents/thumbnail/${document.documentId}` : null);

  const handlePreviewClick = () => {
    if (thumbnailUrl) {
      setShowPreview(true);
    }
  };

  return (
    <>
      <div className={`border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-all ${isLocked ? 'border-gray-200' : 'border-primary/20'}`}>
        <div className="flex items-start gap-4">
          {/* Thumbnail or Icon */}
          {thumbnailUrl && !thumbnailError ? (
            <div
              className="relative w-16 h-22 flex-shrink-0 cursor-pointer group"
              onClick={handlePreviewClick}
            >
              <img
                src={thumbnailUrl}
                alt={`Preview of ${document.title}`}
                className="w-16 h-22 object-cover rounded-lg border shadow-sm"
                onLoad={() => setThumbnailLoading(false)}
                onError={(e) => {
                  // Log thumbnail load failure for debugging
                  const img = e.currentTarget;
                  console.error('[DocumentCard] Thumbnail failed to load:', {
                    url: thumbnailUrl,
                    documentId: document.documentId,
                    title: document.title,
                    naturalWidth: img.naturalWidth,
                    naturalHeight: img.naturalHeight,
                  });

                  // Try to fetch and get actual error details
                  if (thumbnailUrl && process.env.NODE_ENV === 'development') {
                    fetch(thumbnailUrl)
                      .then(res => {
                        if (!res.ok) {
                          return res.json().then(data => {
                            console.error('[DocumentCard] Thumbnail API error:', {
                              status: res.status,
                              statusText: res.statusText,
                              error: data,
                            });
                          }).catch(() => {
                            console.error('[DocumentCard] Thumbnail API error (non-JSON):', {
                              status: res.status,
                              statusText: res.statusText,
                            });
                          });
                        }
                      })
                      .catch(fetchErr => {
                        console.error('[DocumentCard] Thumbnail fetch error:', fetchErr);
                      });
                  }

                  setThumbnailError(true);
                  setThumbnailLoading(false);
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
            <h3 className="font-semibold text-gray-900 truncate">{document.title}</h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{document.description}</p>
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
                onClick={onUnlock}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors text-sm font-medium"
              >
                <Lock className="w-4 h-4" />
                <span className="hidden sm:inline">Unlock</span>
              </button>
            ) : (
              <button
                onClick={onDownload}
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
      {showPreview && thumbnailUrl && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="relative bg-white rounded-xl shadow-2xl max-w-2xl max-h-[90vh] overflow-hidden"
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
            <div className="p-4 overflow-auto max-h-[calc(90vh-120px)]">
              <img
                src={thumbnailUrl}
                alt={`Full preview of ${document.title}`}
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
            <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                This is a watermarked preview of the first page only.
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
