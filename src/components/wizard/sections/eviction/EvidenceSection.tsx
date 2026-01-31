/**
 * Evidence Section - Eviction Wizard
 *
 * Step 8: Collects supporting evidence uploads.
 *
 * CRITICAL: Maintains upload → checkbox truthfulness:
 * - N5B attachment checkboxes (E, F, G) are ONLY ticked if actual files are uploaded
 * - hasUploadForCategory() checks facts.evidence.files[]
 * - Uploading here updates the canonical evidence.files array
 *
 * Evidence Categories:
 * - TENANCY_AGREEMENT: Signed tenancy agreement
 * - DEPOSIT_PROTECTION_CERTIFICATE: Deposit protection cert (S21 - checkbox E)
 * - EPC: Energy Performance Certificate (S21 - checkbox F)
 * - GAS_SAFETY_CERTIFICATE: Gas Safety Cert (S21 - checkbox G)
 * - NOTICE_SERVED_PROOF: Proof of notice service
 * - BANK_STATEMENTS: For arrears evidence
 * - CORRESPONDENCE: Tenant communications
 * - OTHER: Any other supporting docs
 */

'use client';

import React, { useState, useCallback } from 'react';
import type { WizardFacts } from '@/lib/case-facts/schema';
import { EvidenceCategory } from '@/lib/evidence/schema';
import { RiCheckLine } from 'react-icons/ri';

interface EvidenceSectionProps {
  facts: WizardFacts;
  jurisdiction: 'england' | 'wales';
  caseId: string;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

interface UploadedFile {
  id: string;
  filename: string;
  category: string;
  uploadedAt: string;
}

// Evidence categories with descriptions
const EVIDENCE_CATEGORIES = [
  {
    id: 'tenancy_agreement',
    category: EvidenceCategory.TENANCY_AGREEMENT,
    label: 'Tenancy Agreement',
    description: 'Signed tenancy agreement or AST',
    routes: ['section_8', 'section_21'],
    formCheckbox: null,
  },
  {
    id: 'deposit_protection',
    category: EvidenceCategory.DEPOSIT_PROTECTION_CERTIFICATE,
    label: 'Deposit Protection Certificate',
    description: 'Certificate from DPS, MyDeposits, or TDS',
    routes: ['section_21'],
    formCheckbox: 'E (N5B)',
  },
  {
    id: 'epc',
    category: EvidenceCategory.EPC,
    label: 'Energy Performance Certificate (EPC)',
    description: 'Current EPC for the property',
    routes: ['section_21'],
    formCheckbox: 'F (N5B)',
  },
  {
    id: 'gas_safety',
    category: EvidenceCategory.GAS_SAFETY_CERTIFICATE,
    label: 'Gas Safety Certificate',
    description: 'Current CP12 certificate',
    routes: ['section_21'],
    formCheckbox: 'G (N5B)',
  },
  {
    id: 'notice_service',
    category: EvidenceCategory.NOTICE_SERVED_PROOF,
    label: 'Notice Service Proof',
    description: 'Proof of postage, delivery receipt, or photo',
    routes: ['section_8', 'section_21'],
    formCheckbox: null,
  },
  {
    id: 'bank_statements',
    category: EvidenceCategory.BANK_STATEMENTS,
    label: 'Bank Statements / Rent Records',
    description: 'Payment history showing rent received',
    routes: ['section_8'],
    formCheckbox: null,
  },
  {
    id: 'correspondence',
    category: EvidenceCategory.CORRESPONDENCE,
    label: 'Tenant Correspondence',
    description: 'Letters, emails, messages with tenant',
    routes: ['section_8', 'section_21'],
    formCheckbox: null,
  },
  {
    id: 'other',
    category: EvidenceCategory.OTHER,
    label: 'Other Supporting Documents',
    description: 'Any other relevant evidence',
    routes: ['section_8', 'section_21'],
    formCheckbox: null,
  },
];

export const EvidenceSection: React.FC<EvidenceSectionProps> = ({
  facts,
  caseId,
  onUpdate,
}) => {
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  // Local state to track uploaded files for immediate UI updates
  const [localFiles, setLocalFiles] = useState<UploadedFile[]>([]);

  const evictionRoute = facts.eviction_route as 'section_8' | 'section_21' | undefined;

  // Normalize files from facts (handle both snake_case and camelCase)
  const normalizeFile = (f: any): UploadedFile => ({
    id: f.id,
    filename: f.filename || f.file_name || 'Unknown',
    category: f.category || '',
    uploadedAt: f.uploadedAt || f.uploaded_at || new Date().toISOString(),
  });

  // Get existing files from facts, normalized to consistent format
  // Merge with local files for immediate updates
  const factsFiles: UploadedFile[] = (facts.evidence?.files || []).map(normalizeFile);

  // Combine facts files with local files, deduplicating by id
  const existingFiles: UploadedFile[] = React.useMemo(() => {
    const fileMap = new Map<string, UploadedFile>();
    // Add facts files first
    factsFiles.forEach(f => fileMap.set(f.id, f));
    // Add local files (these take precedence for immediate updates)
    localFiles.forEach(f => fileMap.set(f.id, f));
    return Array.from(fileMap.values());
  }, [factsFiles, localFiles]);

  // Filter categories by route
  const relevantCategories = EVIDENCE_CATEGORIES.filter(
    (cat) => !evictionRoute || cat.routes.includes(evictionRoute)
  );

  // Count files per category
  const getFilesForCategory = (category: string): UploadedFile[] => {
    return existingFiles.filter(
      (f) => f.category?.toLowerCase() === category.toLowerCase()
    );
  };

  // Handle file upload
  const handleUpload = useCallback(async (categoryId: string, categoryEnum: string, files: FileList) => {
    if (files.length === 0) return;

    setUploading(categoryId);
    setUploadError(null);

    try {
      const allNewFiles: UploadedFile[] = [];

      // Upload files one at a time (API expects single file per request)
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('caseId', caseId);
        formData.append('questionId', `evidence_section_${categoryEnum}`);
        formData.append('category', categoryEnum);
        formData.append('file', files[i]);

        const response = await fetch('/api/wizard/upload-evidence', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Upload failed');
        }

        const data = await response.json();

        // API returns files under evidence.files, extract the newly added file
        if (data.evidence?.files) {
          // Find the file that was just added (last in the array typically)
          const latestFile = data.evidence.files[data.evidence.files.length - 1];
          if (latestFile) {
            allNewFiles.push({
              id: latestFile.id,
              filename: latestFile.file_name || files[i].name,
              category: latestFile.category || categoryEnum,
              uploadedAt: latestFile.uploaded_at || new Date().toISOString(),
            });
          }
        } else if (data.document) {
          // Fallback: construct from document response
          allNewFiles.push({
            id: data.document.id,
            filename: data.document.document_title || files[i].name,
            category: categoryEnum,
            uploadedAt: data.document.created_at || new Date().toISOString(),
          });
        }
      }

      // Update local state immediately for instant UI feedback
      setLocalFiles(prev => [...prev, ...allNewFiles]);

      // Update facts with new files (normalized format)
      const updatedFiles = [...existingFiles, ...allNewFiles];

      await onUpdate({
        evidence: {
          ...facts.evidence,
          files: updatedFiles,
        },
      });
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(null);
    }
  }, [caseId, existingFiles, facts.evidence, onUpdate]);

  // Handle file removal
  const handleRemoveFile = useCallback(async (fileId: string) => {
    // Update local state immediately
    setLocalFiles(prev => prev.filter(f => f.id !== fileId));

    const updatedFiles = existingFiles.filter((f) => f.id !== fileId);
    await onUpdate({
      evidence: {
        ...facts.evidence,
        files: updatedFiles,
      },
    });
  }, [existingFiles, facts.evidence, onUpdate]);

  return (
    <div className="space-y-6">
      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <h4 className="text-sm font-medium text-purple-900 mb-2">
          Supporting Evidence
        </h4>
        <p className="text-sm text-purple-800">
          Upload documents to support your case. For Section 21 (N5B form), checkboxes E, F, and G
          declare that specific documents are <strong>attached</strong> to your claim.
          Only upload documents you actually have.
        </p>
      </div>

      {uploadError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{uploadError}</p>
        </div>
      )}

      <div className="space-y-4">
        {relevantCategories.map((category) => {
          const categoryFiles = getFilesForCategory(category.category);
          const isUploading = uploading === category.id;

          return (
            <div
              key={category.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">
                    {category.label}
                    {category.formCheckbox && (
                      <span className="ml-2 text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded">
                        Checkbox {category.formCheckbox}
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {category.description}
                  </p>
                </div>

                <label className={`
                  px-4 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors
                  ${isUploading
                    ? 'bg-gray-100 text-gray-400 cursor-wait'
                    : 'bg-[#7C3AED] text-white hover:bg-[#6D28D9]'}
                `}>
                  {isUploading ? 'Uploading...' : 'Upload'}
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    className="hidden"
                    disabled={isUploading}
                    onChange={(e) => {
                      if (e.target.files) {
                        handleUpload(category.id, category.category, e.target.files);
                        e.target.value = ''; // Reset for re-upload
                      }
                    }}
                  />
                </label>
              </div>

              {/* Uploaded files */}
              {categoryFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {categoryFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between px-3 py-2 bg-green-50 border border-green-200 rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <RiCheckLine className="w-4 h-4 text-[#7C3AED]" />
                        <span className="text-sm text-green-900">{file.filename}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(file.id)}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  {category.formCheckbox && (
                    <p className="text-xs text-green-700 mt-1">
                      ✓ Checkbox {category.formCheckbox} will be ticked on court form
                    </p>
                  )}
                </div>
              )}

              {/* Warning for S21 checkboxes without uploads */}
              {category.formCheckbox && categoryFiles.length === 0 && evictionRoute === 'section_21' && (
                <p className="text-xs text-amber-600 mt-2">
                  ⚠ Without this upload, checkbox {category.formCheckbox} will NOT be ticked.
                  Only tick if document is attached.
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          Upload Summary
        </h4>
        <p className="text-sm text-gray-600">
          {existingFiles.length} document{existingFiles.length !== 1 ? 's' : ''} uploaded
        </p>
        {evictionRoute === 'section_21' && (
          <div className="mt-2 text-xs text-gray-500">
            <p>N5B Attachment Checkboxes:</p>
            <ul className="list-disc list-inside">
              <li>
                E (Deposit Certificate):{' '}
                {getFilesForCategory(EvidenceCategory.DEPOSIT_PROTECTION_CERTIFICATE).length > 0
                  ? '✓ Will be ticked'
                  : '✗ Not ticked'}
              </li>
              <li>
                F (EPC):{' '}
                {getFilesForCategory(EvidenceCategory.EPC).length > 0
                  ? '✓ Will be ticked'
                  : '✗ Not ticked'}
              </li>
              <li>
                G (Gas Safety):{' '}
                {getFilesForCategory(EvidenceCategory.GAS_SAFETY_CERTIFICATE).length > 0
                  ? '✓ Will be ticked'
                  : '✗ Not ticked'}
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default EvidenceSection;
