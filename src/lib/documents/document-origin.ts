export type DocumentOrigin =
  | 'generated_pack_document'
  | 'evidence_upload'
  | 'preview_sample';

interface DocumentLike {
  document_type?: string | null;
  is_preview?: boolean | null;
  metadata?: Record<string, any> | null;
}

export function getDocumentOrigin(document: DocumentLike): DocumentOrigin {
  if (document.is_preview) {
    return 'preview_sample';
  }

  const explicitOrigin = document.metadata?.document_origin;
  if (explicitOrigin === 'generated_pack_document' || explicitOrigin === 'evidence_upload') {
    return explicitOrigin;
  }

  if (typeof document.document_type === 'string' && document.document_type.startsWith('evidence_')) {
    return 'evidence_upload';
  }

  return 'generated_pack_document';
}

export function isGeneratedPackDocument(document: DocumentLike): boolean {
  return getDocumentOrigin(document) === 'generated_pack_document';
}

export function isEvidenceUploadDocument(document: DocumentLike): boolean {
  return getDocumentOrigin(document) === 'evidence_upload';
}
