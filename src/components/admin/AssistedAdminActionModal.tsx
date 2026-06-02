'use client';

import { useEffect, useState } from 'react';

export function AssistedAdminActionModal({
  open,
  title,
  description,
  noteLabel = 'Internal note',
  noteRequired = false,
  sensitive = false,
  confirmLabel = 'Confirm action',
  submitLabel = 'Submit',
  loading = false,
  onClose,
  onSubmit,
}: {
  open: boolean;
  title: string;
  description: string;
  noteLabel?: string;
  noteRequired?: boolean;
  sensitive?: boolean;
  confirmLabel?: string;
  submitLabel?: string;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (note: string) => void | Promise<void>;
}) {
  const [note, setNote] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (open) {
      setNote('');
      setConfirmed(false);
    }
  }, [open]);

  if (!open) return null;

  const canSubmit = !loading && (!noteRequired || note.trim().length > 0) && (!sensitive || confirmed);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-semibold text-charcoal">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-gray-700">{description}</p>

        <label className="mt-5 block">
          <span className="text-sm font-semibold text-gray-800">
            {noteLabel}{noteRequired ? ' *' : ''}
          </span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={5}
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary"
            placeholder={noteRequired ? 'Add the details the customer needs to see.' : 'Optional note for the case history or email.'}
          />
        </label>

        {sensitive ? (
          <label className="mt-4 flex gap-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
              className="mt-1"
            />
            <span>{confirmLabel}</span>
          </label>
        ) : null}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSubmit(note.trim())}
            disabled={!canSubmit}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Working...' : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
