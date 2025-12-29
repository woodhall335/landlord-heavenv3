// src/components/wizard/fields/UploadField.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { FileUpload } from '@/components/wizard/FileUpload';
import { RiFileTextLine, RiCloseCircleLine } from 'react-icons/ri';
import type { QuestionDefinition } from '@/lib/validators/question-schema';
import { getWizardCta } from '@/lib/checkout/cta-mapper';
import { normalizeJurisdiction } from '@/lib/jurisdiction/normalize';

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
  jurisdiction?: string;
  label?: string;
  description?: string;
  evidenceCategory?: string;
  required?: boolean;
  disabled?: boolean;
  value?: EvidenceFileSummary[];
  onChange?: (files: EvidenceFileSummary[]) => void;
  onUploadingChange?: (uploading: boolean) => void;
}

interface UploadValidationSummary {
  validator_key?: string | null;
  status: string;
  blockers?: Array<{ code: string; message: string }>;
  warnings?: Array<{ code: string; message: string }>;
  upsell?: { product: string; reason: string } | null;
}

export const UploadField: React.FC<UploadFieldProps> = ({
  caseId,
  questionId,
  jurisdiction,
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
  const [validationSummary, setValidationSummary] = useState<UploadValidationSummary | null>(null);
  const [validationRecommendations, setValidationRecommendations] = useState<
    Array<{ code: string; message: string }>
  >([]);
  const [nextQuestions, setNextQuestions] = useState<QuestionDefinition[]>([]);
  const [analysisSummary, setAnalysisSummary] = useState<{ detected_type?: string; confidence?: number } | null>(null);
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, any>>({});
  const [questionErrors, setQuestionErrors] = useState<Record<string, string>>({});
  const [answerSubmitting, setAnswerSubmitting] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  const updateAnswer = (factKey: string, value: any) => {
    setQuestionAnswers((prev) => ({ ...prev, [factKey]: value }));
    setQuestionErrors((prev) => ({ ...prev, [factKey]: '' }));
  };

  const renderQuestionInput = (question: QuestionDefinition) => {
    const value = questionAnswers[question.factKey];

    const baseClassName =
      'mt-1 w-full rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500';

    switch (question.type) {
      case 'yes_no':
        return (
          <select
            className={baseClassName}
            value={value ?? ''}
            onChange={(event) => updateAnswer(question.factKey, event.target.value)}
          >
            <option value="">Select…</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        );
      case 'date':
        return (
          <input
            type="date"
            className={baseClassName}
            value={value ?? ''}
            onChange={(event) => updateAnswer(question.factKey, event.target.value)}
          />
        );
      case 'currency':
        return (
          <input
            type="number"
            step="0.01"
            className={baseClassName}
            value={value ?? ''}
            onChange={(event) => updateAnswer(question.factKey, event.target.value)}
          />
        );
      case 'select':
        return (
          <select
            className={baseClassName}
            value={value ?? ''}
            onChange={(event) => updateAnswer(question.factKey, event.target.value)}
          >
            <option value="">Select…</option>
            {question.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case 'multi_select':
        return (
          <div className="mt-2 space-y-1">
            {question.options?.map((option) => {
              const selected = Array.isArray(value) ? value.includes(option.value) : false;
              return (
                <label key={option.value} className="flex items-center gap-2 text-xs text-gray-700">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={(event) => {
                      const next = new Set(Array.isArray(value) ? value : []);
                      if (event.target.checked) {
                        next.add(option.value);
                      } else {
                        next.delete(option.value);
                      }
                      updateAnswer(question.factKey, Array.from(next));
                    }}
                  />
                  {option.label}
                </label>
              );
            })}
          </div>
        );
      default:
        return (
          <input
            type="text"
            className={baseClassName}
            value={value ?? ''}
            onChange={(event) => updateAnswer(question.factKey, event.target.value)}
          />
        );
    }
  };

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

        if (data?.validation_summary || data?.validation) {
          const summary = (data.validation_summary ?? data.validation) as UploadValidationSummary;
          setValidationSummary(summary);
        }
        if (Array.isArray(data?.recommendations)) {
          setValidationRecommendations(data.recommendations);
        } else if (Array.isArray(data?.validation?.recommendations)) {
          setValidationRecommendations(data.validation.recommendations);
        }
        if (Array.isArray(data?.next_questions)) {
          setNextQuestions(data.next_questions);
        } else if (Array.isArray(data?.validation?.next_questions)) {
          setNextQuestions(data.validation.next_questions);
        }
        if (data?.evidence?.classification) {
          setAnalysisSummary({
            detected_type: data.evidence.classification.docType,
            confidence: data.evidence.classification.confidence,
          });
        } else if (data?.evidence?.analysis) {
          setAnalysisSummary({
            detected_type: data.evidence.analysis.detected_type,
            confidence: data.evidence.analysis.confidence,
          });
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

                <button
                  type="button"
                  onClick={async () => {
                    try {
                      setError(null);
                      const url = new URL('/api/evidence/download', window.location.origin);
                      url.searchParams.set('caseId', caseId);
                      url.searchParams.set('evidenceId', file.id);
                      const response = await fetch(url.toString());
                      const data = await response.json();
                      if (!response.ok) {
                        throw new Error(data?.error || 'Failed to download file');
                      }
                      if (data?.signedUrl) {
                        window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
                      }
                    } catch (downloadError) {
                      console.error('Failed to download evidence', downloadError);
                      setError(
                        downloadError instanceof Error
                          ? downloadError.message
                          : 'Download failed'
                      );
                    }
                  }}
                  className="rounded border border-purple-200 px-2 py-1 text-xs text-purple-700 hover:bg-purple-50"
                >
                  Download
                </button>
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

      {analysisSummary && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm">
          <p className="font-medium text-charcoal">Document classification</p>
          <p className="text-xs text-gray-600">
            {analysisSummary.detected_type || 'unknown'}{' '}
            {analysisSummary.confidence !== undefined && (
              <span className="text-gray-500">({Math.round(analysisSummary.confidence * 100)}% confidence)</span>
            )}
          </p>
        </div>
      )}

      {validationSummary && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm">
          <div className="flex items-center justify-between">
            <p className="font-medium text-charcoal">Validation status</p>
            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
              {validationSummary.status}
            </span>
          </div>

          {validationSummary.blockers && validationSummary.blockers.length > 0 && (
            <div className="mt-3 space-y-1 text-red-700">
              {validationSummary.blockers.map((issue, index) => (
                <p key={`${issue.code}-${index}`}>• {issue.message}</p>
              ))}
            </div>
          )}

          {validationSummary.warnings && validationSummary.warnings.length > 0 && (
            <div className="mt-3 space-y-1 text-amber-700">
              {validationSummary.warnings.map((issue, index) => (
                <p key={`${issue.code}-${index}`}>• {issue.message}</p>
              ))}
            </div>
          )}

          {validationSummary.upsell?.reason && (
            <p className="mt-3 text-xs text-gray-600">{validationSummary.upsell.reason}</p>
          )}

          {validationRecommendations.length > 0 && (
            <div className="mt-3 space-y-1 text-xs text-gray-600">
              {validationRecommendations.map((rec, index) => (
                <p key={`${rec.code}-${index}`}>• {rec.message}</p>
              ))}
            </div>
          )}

          {nextQuestions.length > 0 && (
            <div className="mt-3 space-y-1 text-xs text-gray-600">
              <p className="font-semibold text-gray-700">Re-check document</p>
              {nextQuestions.map((question) => (
                <label key={question.id} className="block">
                  <span className="text-gray-700">• {question.question}</span>
                  {question.helpText && (
                    <span className="block text-[11px] text-gray-400">{question.helpText}</span>
                  )}
                  {renderQuestionInput(question)}
                  {questionErrors[question.factKey] && (
                    <span className="mt-1 block text-[11px] text-red-600">
                      {questionErrors[question.factKey]}
                    </span>
                  )}
                </label>
              ))}
              <button
                type="button"
                disabled={answerSubmitting}
                onClick={async () => {
                  setAnswerSubmitting(true);
                  try {
                    setQuestionErrors({});
                    const response = await fetch('/api/wizard/answer-questions', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        caseId,
                        answers: questionAnswers,
                      }),
                    });
                    const data = await response.json();
                    if (!response.ok) {
                      if (Array.isArray(data?.errors)) {
                        const errorMap: Record<string, string> = {};
                        data.errors.forEach((item: { factKey: string; message: string }) => {
                          errorMap[item.factKey] = item.message;
                        });
                        setQuestionErrors(errorMap);
                      }
                      return;
                    }
                    if (data.validation_summary || data.validation) {
                      const summary = (data.validation_summary ?? data.validation) as UploadValidationSummary;
                      setValidationSummary(summary);
                    }
                    if (Array.isArray(data?.recommendations)) {
                      setValidationRecommendations(data.recommendations);
                    } else if (Array.isArray(data?.validation?.recommendations)) {
                      setValidationRecommendations(data.validation.recommendations);
                    }
                    if (Array.isArray(data?.next_questions)) {
                      setNextQuestions(data.next_questions);
                    } else if (Array.isArray(data?.validation?.next_questions)) {
                      setNextQuestions(data.validation.next_questions);
                    }
                  } catch (err) {
                    console.error('Failed to submit answers', err);
                  } finally {
                    setAnswerSubmitting(false);
                  }
                }}
                className="mt-2 rounded bg-purple-600 px-2 py-1 text-xs text-white disabled:opacity-50"
              >
                {answerSubmitting ? 'Re-checking…' : 'Save answers & re-check'}
              </button>
            </div>
          )}

          <div className="mt-4 space-y-2 rounded-md border border-purple-100 bg-purple-50 p-3 text-xs">
            <p className="font-semibold text-purple-800">Recommended next step</p>
            {(() => {
              const ctas = getWizardCta({
                jurisdiction: normalizeJurisdiction(jurisdiction) ?? jurisdiction ?? undefined,
                validator_key: validationSummary.validator_key,
                validation_summary: validationSummary,
                caseId,
                source: 'validator',
              });
              return (
                <div className="flex flex-wrap gap-2">
                  <a
                    href={ctas.primary.href}
                    className="rounded bg-purple-600 px-3 py-2 text-xs font-medium text-white"
                  >
                    {ctas.primary.label} (£{ctas.primary.price.toFixed(2)})
                  </a>
                  {ctas.secondary && (
                    <a
                      href={ctas.secondary.href}
                      className="rounded border border-purple-300 px-3 py-2 text-xs font-medium text-purple-700"
                    >
                      {ctas.secondary.label} (£{ctas.secondary.price.toFixed(2)})
                    </a>
                  )}
                </div>
              );
            })()}
          </div>

          <div className="mt-3 rounded-md border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-700">Email me my report/checklist</p>
              <button
                type="button"
                className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-700"
                onClick={() => setEmailOpen(true)}
              >
                Email me this report
              </button>
            </div>
            {emailStatus && <p className="mt-2 text-xs text-gray-500">{emailStatus}</p>}
          </div>
        </div>
      )}

      {emailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-lg bg-white p-4 text-sm shadow-lg">
            <div className="flex items-center justify-between">
              <p className="font-semibold">Email me this report</p>
              <button
                type="button"
                className="text-xs text-gray-500"
                onClick={() => setEmailOpen(false)}
              >
                Close
              </button>
            </div>
            <input
              type="email"
              className="mt-3 w-full rounded border border-gray-200 px-2 py-2 text-sm"
              placeholder="you@example.com"
              value={emailInput}
              onChange={(event) => setEmailInput(event.target.value)}
            />
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                className="rounded border border-gray-300 px-3 py-2 text-xs"
                onClick={() => setEmailOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded bg-purple-600 px-3 py-2 text-xs text-white"
                onClick={async () => {
                  try {
                    setEmailStatus(null);
                    const email = emailInput.trim();
                    if (!email) {
                      setEmailStatus('Please enter a valid email.');
                      return;
                    }
                    await fetch('/api/leads/capture', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        email,
                        source: 'validator',
                        jurisdiction: normalizeJurisdiction(jurisdiction) ?? jurisdiction,
                        caseId,
                        tags: ['report'],
                      }),
                    });
                    await fetch('/api/leads/email-report', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        email,
                        source: 'validator',
                        jurisdiction: normalizeJurisdiction(jurisdiction) ?? jurisdiction,
                        caseId,
                      }),
                    });
                    setEmailStatus('Report queued. Check your inbox soon.');
                    setEmailOpen(false);
                  } catch (err) {
                    console.error('Failed to capture email', err);
                    setEmailStatus('Unable to send email right now.');
                  }
                }}
              >
                Send report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
