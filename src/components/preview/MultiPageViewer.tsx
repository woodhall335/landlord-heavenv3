'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Loader2, AlertCircle, ZoomIn, ZoomOut, X } from 'lucide-react';

/** Page metadata from the preview API */
export interface PreviewPage {
  page: number;
  width: number;
  height: number;
  url: string;
  expiresAt?: string;
}

/** Preview manifest from the API */
export interface PreviewManifest {
  status: 'ready' | 'processing' | 'error';
  caseId: string;
  product: string;
  jurisdiction: string;
  pageCount?: number;
  pages?: PreviewPage[];
  error?: string;
  generatedAt?: string;
  expiresAt?: string;
}

interface MultiPageViewerProps {
  /** Case ID for fetching preview */
  caseId: string;
  /** Product type (e.g., 'ast_standard') */
  product: string;
  /** Optional tier override */
  tier?: 'standard' | 'premium';
  /** Callback when viewer is closed */
  onClose?: () => void;
  /** Optional class name for the container */
  className?: string;
  /** Show as modal overlay */
  asModal?: boolean;
}

/** Loading state for each page */
interface PageLoadState {
  loading: boolean;
  error: boolean;
  loaded: boolean;
}

/**
 * Multi-Page Document Viewer
 *
 * Displays watermarked page images with:
 * - Lazy loading via Intersection Observer
 * - Page navigation (prev/next, page indicator)
 * - Zoom controls
 * - Scroll-to-page functionality
 * - Loading and error states
 */
export function MultiPageViewer({
  caseId,
  product,
  tier,
  onClose,
  className = '',
  asModal = false,
}: MultiPageViewerProps) {
  const [manifest, setManifest] = useState<PreviewManifest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pageLoadStates, setPageLoadStates] = useState<Map<number, PageLoadState>>(new Map());

  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Polling interval for processing state
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollCountRef = useRef(0);
  const MAX_POLLS = 60; // 5 minutes max (60 * 5s)

  /**
   * Fetch preview manifest from API
   */
  const fetchManifest = useCallback(async () => {
    try {
      const params = new URLSearchParams({ product });
      if (tier) params.set('tier', tier);

      const response = await fetch(`/api/wizard/preview/${caseId}?${params}`);
      const data: PreviewManifest = await response.json();

      if (data.status === 'processing') {
        // Continue polling
        pollCountRef.current += 1;
        if (pollCountRef.current >= MAX_POLLS) {
          setError('Preview generation timed out. Please try again.');
          setLoading(false);
          return;
        }
        return; // Keep polling
      }

      // Stop polling
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }

      if (data.status === 'error') {
        setError(data.error || 'Failed to load preview');
        setLoading(false);
        return;
      }

      setManifest(data);
      setLoading(false);

      // Initialize page load states
      if (data.pages) {
        const states = new Map<number, PageLoadState>();
        data.pages.forEach((_, i) => {
          states.set(i, { loading: false, error: false, loaded: false });
        });
        setPageLoadStates(states);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch preview');
      setLoading(false);
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }
  }, [caseId, product, tier]);

  /**
   * Initial fetch and polling setup
   */
  useEffect(() => {
    fetchManifest();

    // Start polling for processing state
    pollIntervalRef.current = setInterval(fetchManifest, 5000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [fetchManifest]);

  /**
   * Setup Intersection Observer for lazy loading
   */
  useEffect(() => {
    if (!manifest?.pages) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageIndex = parseInt(entry.target.getAttribute('data-page') || '0', 10);
            // Update current page based on most visible
            if (entry.intersectionRatio > 0.5) {
              setCurrentPage(pageIndex);
            }
          }
        });
      },
      {
        root: containerRef.current,
        rootMargin: '100px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    // Observe all page containers
    pageRefs.current.forEach((element) => {
      if (element && observerRef.current) {
        observerRef.current.observe(element);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [manifest]);

  /**
   * Scroll to a specific page
   */
  const scrollToPage = useCallback((pageIndex: number) => {
    const pageElement = pageRefs.current.get(pageIndex);
    if (pageElement) {
      pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setCurrentPage(pageIndex);
    }
  }, []);

  /**
   * Handle page image load
   */
  const handlePageLoad = useCallback((pageIndex: number) => {
    setPageLoadStates((prev) => {
      const newStates = new Map(prev);
      newStates.set(pageIndex, { loading: false, error: false, loaded: true });
      return newStates;
    });
  }, []);

  /**
   * Handle page image error
   */
  const handlePageError = useCallback((pageIndex: number) => {
    setPageLoadStates((prev) => {
      const newStates = new Map(prev);
      newStates.set(pageIndex, { loading: false, error: true, loaded: false });
      return newStates;
    });
  }, []);

  /**
   * Zoom controls
   */
  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 2));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));

  /**
   * Render loading state
   */
  if (loading) {
    return (
      <ViewerContainer asModal={asModal} onClose={onClose} className={className}>
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-gray-600">Generating preview...</p>
          <p className="text-sm text-gray-400">This may take a moment</p>
        </div>
      </ViewerContainer>
    );
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <ViewerContainer asModal={asModal} onClose={onClose} className={className}>
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
          <p className="text-gray-800 font-medium">Preview unavailable</p>
          <p className="text-sm text-gray-500">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              pollCountRef.current = 0;
              fetchManifest();
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
          >
            Try Again
          </button>
        </div>
      </ViewerContainer>
    );
  }

  if (!manifest?.pages || manifest.pages.length === 0) {
    return (
      <ViewerContainer asModal={asModal} onClose={onClose} className={className}>
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
          <AlertCircle className="w-8 h-8 text-yellow-500" />
          <p className="text-gray-600">No preview pages available</p>
        </div>
      </ViewerContainer>
    );
  }

  const pageCount = manifest.pageCount || manifest.pages.length;

  return (
    <ViewerContainer asModal={asModal} onClose={onClose} className={className}>
      {/* Header with controls */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Page navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollToPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium min-w-[80px] text-center">
              Page {currentPage + 1} of {pageCount}
            </span>
            <button
              onClick={() => scrollToPage(Math.min(pageCount - 1, currentPage + 1))}
              disabled={currentPage >= pageCount - 1}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-2 border-l pl-4 border-gray-200">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="text-sm min-w-[50px] text-center">{Math.round(zoom * 100)}%</span>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 2}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Close button (for modal) */}
        {asModal && onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Close preview"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Page content */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-gray-100 p-4"
        style={{ maxHeight: asModal ? 'calc(100vh - 120px)' : '600px' }}
      >
        <div className="flex flex-col items-center gap-4">
          {manifest.pages.map((page, index) => (
            <div
              key={page.page}
              ref={(el) => {
                if (el) pageRefs.current.set(index, el);
              }}
              data-page={index}
              className="relative bg-white shadow-lg rounded-lg overflow-hidden"
              style={{
                width: `${page.width * zoom}px`,
                maxWidth: '100%',
              }}
            >
              {/* Page number badge */}
              <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded z-10">
                {index + 1}
              </div>

              {/* Loading state */}
              {pageLoadStates.get(index)?.loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              )}

              {/* Error state */}
              {pageLoadStates.get(index)?.error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 gap-2">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                  <span className="text-sm text-gray-500">Failed to load</span>
                </div>
              )}

              {/* Page image */}
              <img
                src={page.url}
                alt={`Page ${index + 1} of ${pageCount}`}
                className="w-full h-auto"
                style={{
                  aspectRatio: `${page.width} / ${page.height}`,
                  display: pageLoadStates.get(index)?.error ? 'none' : 'block',
                }}
                loading="lazy"
                onLoad={() => handlePageLoad(index)}
                onError={() => handlePageError(index)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Footer with page indicator */}
      <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex gap-1 justify-center overflow-x-auto">
          {manifest.pages.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToPage(index)}
              className={`w-8 h-8 flex items-center justify-center rounded text-xs font-medium transition ${
                index === currentPage
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              aria-label={`Go to page ${index + 1}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </ViewerContainer>
  );
}

/**
 * Container component that can render as modal or inline
 */
function ViewerContainer({
  children,
  asModal,
  onClose,
  className,
}: {
  children: React.ReactNode;
  asModal?: boolean;
  onClose?: () => void;
  className?: string;
}) {
  if (asModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div
          className={`bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
        {/* Click outside to close */}
        <div className="absolute inset-0 -z-10" onClick={onClose} />
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col ${className}`}>
      {children}
    </div>
  );
}

/**
 * Compact preview card that opens the multi-page viewer
 */
export function MultiPagePreviewCard({
  caseId,
  product,
  tier,
  title,
  description,
  thumbnailUrl,
}: {
  caseId: string;
  product: string;
  tier?: 'standard' | 'premium';
  title: string;
  description?: string;
  thumbnailUrl?: string;
}) {
  const [showViewer, setShowViewer] = useState(false);

  return (
    <>
      <div
        className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-all cursor-pointer"
        onClick={() => setShowViewer(true)}
      >
        <div className="flex items-start gap-4">
          {/* Thumbnail */}
          {thumbnailUrl && (
            <div className="relative w-16 h-22 flex-shrink-0 group">
              <img
                src={thumbnailUrl}
                alt={`Preview of ${title}`}
                className="w-16 h-22 object-cover rounded-lg border shadow-sm"
              />
              <div className="absolute inset-0 bg-black/30 rounded-lg opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <span className="text-white text-xs font-medium">View All Pages</span>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{title}</h3>
            {description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{description}</p>}
            <p className="text-xs text-primary mt-2">Click to view all pages</p>
          </div>
        </div>
      </div>

      {/* Modal viewer */}
      {showViewer && (
        <MultiPageViewer
          caseId={caseId}
          product={product}
          tier={tier}
          onClose={() => setShowViewer(false)}
          asModal
        />
      )}
    </>
  );
}

export default MultiPageViewer;
