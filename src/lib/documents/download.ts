/**
 * Document Download Utilities
 *
 * Centralized helper for resolving document download URLs.
 * This module standardizes URL resolution across all UI surfaces.
 */

/**
 * Document record with URL fields
 */
export interface DocumentRecord {
  id: string;
  pdf_url?: string | null;
  document_title?: string;
  document_type?: string;
  is_preview?: boolean;
}

/**
 * Resolve storage path from pdf_url field
 *
 * The pdf_url field may contain:
 * - Full Supabase public URL (e.g., "https://...supabase.../documents/path/to/file.pdf")
 * - Relative storage path (e.g., "user-id/case-id/document_1234.pdf")
 * - Path with leading slashes (e.g., "/user-id/case-id/document_1234.pdf")
 *
 * This function extracts the storage path suitable for creating signed URLs.
 */
export function resolveStoragePath(pdfUrl?: string | null): string | null {
  if (!pdfUrl) return null;

  // If it's a full Supabase URL, extract the path after /documents/
  if (pdfUrl.includes('/documents/')) {
    const [, path] = pdfUrl.split('/documents/');
    return path || null;
  }

  // Clean leading slashes for relative paths
  const cleaned = pdfUrl.replace(/^\/+/, '');
  return cleaned.length > 0 ? cleaned : null;
}

/**
 * Get the download URL for a document
 *
 * For client-side usage, this returns the API endpoint that will generate
 * a signed URL. The actual signed URL is fetched from the API.
 *
 * @param doc - Document record containing id and pdf_url
 * @returns API endpoint URL for fetching the document with signed URL
 */
export function getDocumentDownloadEndpoint(doc: DocumentRecord): string | null {
  if (!doc.id) return null;
  if (!doc.pdf_url) return null;
  return `/api/documents/${doc.id}`;
}

/**
 * Check if a document has a downloadable file
 */
export function hasDownloadableFile(doc: DocumentRecord): boolean {
  return Boolean(doc.pdf_url);
}

/**
 * Fetch signed download URL for a document
 *
 * This function calls the API to get a signed URL for the document.
 * The signed URL is valid for 1 hour.
 *
 * @param docId - Document ID
 * @returns Promise resolving to signed URL or null if unavailable
 */
export async function fetchDocumentDownloadUrl(docId: string): Promise<string | null> {
  try {
    const response = await fetch(`/api/documents/${docId}`);
    if (!response.ok) {
      console.error('Failed to fetch document:', response.status);
      return null;
    }

    const data = await response.json();
    return data.document?.download_url || null;
  } catch (error) {
    console.error('Error fetching document download URL:', error);
    return null;
  }
}

/**
 * Trigger document download
 *
 * Fetches the signed URL and opens it in a new tab/window.
 *
 * @param docId - Document ID
 * @returns Promise resolving to true if download was triggered, false otherwise
 */
export async function downloadDocument(docId: string): Promise<boolean> {
  const url = await fetchDocumentDownloadUrl(docId);
  if (!url) {
    return false;
  }

  window.open(url, '_blank');
  return true;
}
