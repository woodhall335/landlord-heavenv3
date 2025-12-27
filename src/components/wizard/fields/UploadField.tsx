// src/components/wizard/fields/UploadField.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { FileUpload } from '@/components/wizard/FileUpload';
import { RiFileTextLine, RiCloseCircleLine } from 'react-icons/ri';

export interface EvidenceFileSummary {
  id: string;
  documentId: string; // documents table id
  questionId?: string;
  fileName: string;
  category?: string;
  url?: string | null;
  uploadedAt?: string;
}

interface UploadFieldProps {
  caseId: string;
  questionId: string;
  label?: string;
  description?: string;
  evidenceCategory?: string;
  required?: boolean;
  disabled?: boolean;
  value?: EvidenceFileSummary[];
  onChange?: (files: EvidenceFileSummary[]) => void;
  onUploadingChange?: (uploading: boolean) => void;
}

export const UploadField: React.FC<UploadFieldProps> = ({
  caseId,
  questionId,
  label,
  description,
  evidenceCategory,
  required = false,
  disabled = false,
  value,
  onChange,
  onUploadingChange,
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<EvidenceFileSummary[]>(value ?? []);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  //
  // Sync external value
  //
  useEffect(() => {
    if (value) {
      setUploadedFiles(value);
    }
  }, [value]);

  //
  // Notify parent when uploading state changes
  //
  useEffect(() => {
    onUploadingChange?.(uploading);
  }, [uploading, onUploadingChange]);

  //
  // Convert backend evidence rows → UI summaries
  //
  const mapEvidenceFiles = (entries: any[], document?: any): EvidenceFileSummary[] => {
    return entries.map((entry) => {
      const fallbackUrl =
        entry.public_url ||
        entry.url ||
        entry.pdf_url ||
        (document && entry.document_id === document.id ? document.pdf_url : null) ||
        document?.pdf_url ||
        null;

      return {
        id: entry.id || entry.document_id || crypto.randomUUID(),
        documentId: entry.document_id || document?.id || entry.id || '',
        questionId: entry.question_id ?? questionId,
        fileName: entry.file_name || document?.document_title || 'Uploaded file',
        category: entry.category || entry.label || evidenceCategory,
        url: fallbackUrl,
        uploadedAt: entry.uploaded_at || document?.created_at,
      };
    });
  };

  //
  // Upload handler
  //
  const handleFilesSelected = async (files: File[]) => {
    if (disabled) return;

    setPendingFiles(files);
    if (files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      let latestSummaries: EvidenceFileSummary[] = uploadedFiles;

      for (const file of files) {
        const formData = new FormData();

        // REQUIRED backend fields
        formData.append('caseId', caseId);
        formData.append('questionId', questionId);

        // Optional category
        if (evidenceCategory) {
          formData.append('category', evidenceCategory);
        }

        // Actual file
        formData.append('file', file);

        const response = await fetch('/api/wizard/upload-evidence', {
          method: 'POST',
          body: formData,
        });

        let data: any = null;
        try {
          data = await response.json();
        } catch {
          // Non-JSON or empty body – we'll fall back to generic messages below
        }

        if (response.status === 401) {
          throw new Error('Please sign in to upload evidence for this case.');
        }

        if (response.status === 403) {
          throw new Error("You don't have permission to upload evidence to this case.");
        }

        if (!response.ok || !data?.success) {
          throw new Error(data?.error || 'Failed to upload file');
        }

        const evidenceFiles: any[] = Array.isArray(data?.evidence?.files)
          ? data.evidence.files
          : [];

        // Filter ONLY this question's evidence entries
        const filtered = evidenceFiles.filter(
          (entry) => entry.question_id === questionId
        );

        const mapped = mapEvidenceFiles(filtered, data.document);

        if (mapped.length > 0) {
          latestSummaries = mapped;
        }
      }

      setUploadedFiles(latestSummaries);
      onChange?.(latestSummaries);
    } catch (uploadError) {
      console.error('Evidence upload failed:', uploadError);
      setError(uploadError instanceof Error ? uploadError.message : 'Upload failed');
    } finally {
      setPendingFiles([]);
      setUploading(false);
    }
  };

  //
  // UI
  //
  return (
    <div className="space-y-4">
      {label && (
        <div className="flex items-center gap-2">
          <p className="text-base font-medium text-charcoal">{label}</p>
          {required && <span className="text-sm text-red-600">(required)</span>}
        </div>
      )}

      {description && <p className="text-sm text-gray-600">{description}</p>}

      <FileUpload
        value={pendingFiles}
        onChange={handleFilesSelected}
        helperText={required ? 'Please provide at least one file.' : undefined}
        disabled={disabled || uploading}
      />

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-charcoal">Uploaded files</p>
          <ul className="space-y-2">
            {uploadedFiles.map((file) => (
              <li
                key={file.id}
                className="flex items-center gap-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2"
              >
                <RiFileTextLine className="h-5 w-5 text-[#7C3AED]" />

                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-charcoal">
                    {file.fileName}
                  </p>
                  {file.category && (
                    <p className="text-xs text-gray-500">Category: {file.category}</p>
                  )}
                </div>

                {file.uploadedAt && (
                  <p className="text-xs text-gray-500">
                    Uploaded {file.uploadedAt}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
          <RiCloseCircleLine className="h-5 w-5 text-[#7C3AED]" />
          <span>{error}</span>
        </div>
      )}

      {uploading && (
        <p className="text-sm text-gray-600">Uploading files, please wait…</p>
      )}
    </div>
  );
};
