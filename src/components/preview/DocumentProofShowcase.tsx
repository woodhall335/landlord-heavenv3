'use client';

import { useEffect, useMemo, useState } from 'react';
import { RiFullscreenLine } from 'react-icons/ri';
import { Modal } from '@/components/ui/Modal';

export interface DocumentProofEntry {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  badge?: string;
}

interface DocumentProofShowcaseProps {
  title?: string;
  description?: string;
  entries: DocumentProofEntry[];
}

export function DocumentProofShowcase({
  title = 'Actual draft proof',
  description = 'These first-page previews are generated from your current answers so you can sense-check the paperwork before payment.',
  entries,
}: DocumentProofShowcaseProps) {
  const [selectedId, setSelectedId] = useState(entries[0]?.id ?? '');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectedEntry = useMemo(
    () => entries.find((entry) => entry.id === selectedId) ?? entries[0] ?? null,
    [entries, selectedId]
  );

  useEffect(() => {
    setSelectedId(entries[0]?.id ?? '');
  }, [entries]);

  if (!selectedEntry) {
    return null;
  }

  return (
    <>
      <section className="rounded-[1.6rem] border border-[#dfe5ff] bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6d28d9]">
              Live preview proof
            </p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-[#111827]">{title}</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d7ccff] bg-[#f7f3ff] px-4 py-2 text-sm font-semibold text-[#5b36b3] transition hover:bg-white"
          >
            <RiFullscreenLine className="h-4 w-4" />
            Open larger proof
          </button>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(240px,0.9fr)_minmax(0,1.4fr)]">
          <div className="space-y-3">
            {entries.map((entry) => {
              const isSelected = entry.id === selectedEntry.id;

              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setSelectedId(entry.id)}
                  className={`w-full rounded-[1.15rem] border px-4 py-4 text-left transition ${
                    isSelected
                      ? 'border-[#cdbbff] bg-[#faf7ff] shadow-[0_12px_30px_rgba(109,40,217,0.08)]'
                      : 'border-[#ebe5ff] bg-white hover:border-[#d5c6ff] hover:bg-[#fcfbff]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#1f1740]">{entry.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{entry.description}</p>
                    </div>
                    {entry.badge ? (
                      <span className="rounded-full border border-[#ddd0ff] bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6b46c1] shadow-sm">
                        {entry.badge}
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="rounded-[1.25rem] border border-[#e4ddff] bg-[#f8f5ff] p-3 shadow-sm">
            <div className="overflow-hidden rounded-[1rem] border border-[#e3dbff] bg-white">
              <img
                src={selectedEntry.thumbnailUrl}
                alt={`${selectedEntry.title} first-page preview`}
                className="h-auto w-full bg-white"
                loading="lazy"
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-[0.95rem] border border-[#e8ddff] bg-white px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-[#1f1740]">{selectedEntry.title}</p>
                <p className="mt-1 text-sm text-slate-600">{selectedEntry.description}</p>
              </div>
              <span className="rounded-full border border-[#ddd0ff] bg-[#f8f3ff] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6b46c1]">
                First-page proof
              </span>
            </div>
          </div>
        </div>
      </section>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedEntry.title}
        size="large"
      >
        <div className="space-y-4">
          <p className="text-sm leading-7 text-slate-600">{selectedEntry.description}</p>
          <div className="overflow-hidden rounded-[1.2rem] border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.08)]">
            <img
              src={selectedEntry.thumbnailUrl}
              alt={`${selectedEntry.title} enlarged first-page preview`}
              className="h-auto w-full bg-white"
              loading="lazy"
            />
          </div>
        </div>
      </Modal>
    </>
  );
}

export default DocumentProofShowcase;
