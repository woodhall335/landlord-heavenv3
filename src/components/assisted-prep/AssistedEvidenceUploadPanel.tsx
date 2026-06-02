'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { RiCheckboxCircleLine, RiDownloadLine, RiLoader4Line, RiUploadCloud2Line } from 'react-icons/ri';
import { getSessionTokenHeaders } from '@/lib/session-token';
import {
  ASSISTED_PREP_CHECKLIST_INTRO,
  getAssistedEvidenceUploadSlots,
  getAssistedPrepConfig,
  type AssistedPrepService,
} from '@/lib/assisted-prep';

type EvidenceDocument = {
  id: string;
  document_title?: string | null;
  document_type?: string | null;
  created_at?: string | null;
  document_origin?: string | null;
  metadata?: {
    evidence_category?: string | null;
    question_id?: string | null;
    [key: string]: unknown;
  } | null;
};

export function AssistedEvidenceUploadPanel({
  caseId,
  service,
  compact = false,
}: {
  caseId?: string | null;
  service: AssistedPrepService;
  compact?: boolean;
}) {
  const config = getAssistedPrepConfig(service);
  const slots = getAssistedEvidenceUploadSlots(service);
  const [documents, setDocuments] = useState<EvidenceDocument[]>([]);
  const [loading, setLoading] = useState(Boolean(caseId));
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const evidenceDocuments = useMemo(
    () => documents.filter((doc) => doc.document_origin === 'evidence_upload' || doc.document_type?.startsWith('evidence_')),
    [documents]
  );

  const uploadedCategories = useMemo(
    () => new Set(evidenceDocuments.map((doc) => doc.metadata?.evidence_category).filter(Boolean)),
    [evidenceDocuments]
  );

  const loadEvidence = useCallback(async () => {
    if (!caseId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/documents?case_id=${caseId}&include_uploads=true&latest_per_type=false`);
      if (!response.ok) throw new Error('Could not load uploaded evidence.');
      const payload = await response.json();
      setDocuments(payload.documents || []);
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.message || 'Could not load uploaded evidence.' });
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    loadEvidence();
  }, [loadEvidence]);

  async function handleUpload(slotKey: string, fileList: FileList | null) {
    if (!caseId || !fileList?.length) return;
    const slot = slots.find((item) => item.key === slotKey);
    if (!slot) return;

    setUploadingKey(slot.key);
    setMessage(null);

    try {
      for (const file of Array.from(fileList)) {
        const formData = new FormData();
        formData.append('caseId', caseId);
        formData.append('questionId', slot.questionId);
        formData.append('category', slot.category);
        formData.append('file', file);

        const response = await fetch('/api/wizard/upload-evidence', {
          method: 'POST',
          headers: getSessionTokenHeaders(),
          body: formData,
        });

        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload.error || 'Upload failed. Please try again.');
        }
      }

      setMessage({ type: 'success', text: 'Upload saved. We will review it before or during the callback.' });
      await loadEvidence();
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.message || 'Upload failed. Please try again.' });
    } finally {
      setUploadingKey(null);
    }
  }

  async function openEvidence(doc: EvidenceDocument) {
    try {
      const response = await fetch(`/api/evidence/download?evidenceId=${doc.id}`);
      const payload = await response.json();
      if (!response.ok || !payload.signedUrl) {
        throw new Error(payload.error || 'Could not open this evidence file.');
      }
      window.open(payload.signedUrl, '_blank', 'noopener,noreferrer');
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.message || 'Could not open this evidence file.' });
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className={compact ? '' : 'max-w-3xl'}>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-700">Assisted prep evidence</p>
        <h2 className="mt-2 text-xl font-semibold text-slate-950">What to have ready</h2>
        <p className="mt-3 text-sm leading-6 text-slate-700">{ASSISTED_PREP_CHECKLIST_INTRO}</p>
        <p className="mt-2 text-sm font-medium text-slate-800">
          Upload what you have. Missing documents can be discussed on the callback.
        </p>
      </div>

      {message ? (
        <p className={`mt-4 rounded-lg p-3 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </p>
      ) : null}

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {slots.map((slot) => {
          const uploaded = uploadedCategories.has(slot.category);
          const isUploading = uploadingKey === slot.key;
          return (
            <div key={slot.key} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <span className={uploaded ? 'mt-0.5 text-green-600' : 'mt-0.5 text-slate-400'}>
                  <RiCheckboxCircleLine className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-slate-900">{slot.label}</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-600">{slot.helperText}</p>
                  <label className="mt-3 inline-flex cursor-pointer items-center justify-center rounded-lg bg-violet-700 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-800">
                    {isUploading ? (
                      <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RiUploadCloud2Line className="mr-2 h-4 w-4" />
                    )}
                    {isUploading ? 'Uploading...' : uploaded ? 'Upload another' : 'Upload'}
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      disabled={Boolean(uploadingKey)}
                      onChange={(event) => {
                        handleUpload(slot.key, event.target.files);
                        event.currentTarget.value = '';
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-slate-950">Uploaded evidence</h3>
          {loading ? <RiLoader4Line className="h-4 w-4 animate-spin text-slate-500" /> : null}
        </div>
        {evidenceDocuments.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">
            No evidence uploaded yet for this assisted prep case.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {evidenceDocuments.map((doc) => (
              <li key={doc.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">{doc.document_title || 'Uploaded document'}</p>
                  <p className="text-xs text-slate-500">
                    {doc.metadata?.evidence_category || 'other'}{doc.created_at ? ` · ${new Date(doc.created_at).toLocaleDateString('en-GB')}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openEvidence(doc)}
                  className="inline-flex shrink-0 items-center rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <RiDownloadLine className="mr-1.5 h-4 w-4" />
                  Open
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-4 text-sm font-medium text-slate-800">{config.finalChecklistNote}</p>
    </section>
  );
}
