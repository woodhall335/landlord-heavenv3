'use client';

import { useEffect, useMemo, useState } from 'react';
import { RiArrowLeftLine, RiArrowRightLine, RiCloseLine, RiFullscreenLine } from 'react-icons/ri';
import { Modal } from '@/components/ui/Modal';

export interface DocumentProofEntry {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  badge?: string;
  previewUrl?: string;
  groupLabel?: string;
  groupOrder?: number;
}

interface DocumentProofShowcaseProps {
  title?: string;
  description?: string;
  entries: DocumentProofEntry[];
  compact?: boolean;
}

export function DocumentProofShowcase({
  title = 'Review the completed documents',
  description = 'Open the completed documents generated from your current answers and check them before you continue.',
  entries,
  compact = false,
}: DocumentProofShowcaseProps) {
  const orderedEntries = useMemo(
    () =>
      [...entries].sort((left, right) => {
        const leftOrder = left.groupOrder ?? 999;
        const rightOrder = right.groupOrder ?? 999;
        return leftOrder - rightOrder;
      }),
    [entries]
  );
  const [selectedId, setSelectedId] = useState(orderedEntries[0]?.id ?? '');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const resolvedSelectedId = useMemo(
    () => (orderedEntries.some((entry) => entry.id === selectedId) ? selectedId : orderedEntries[0]?.id ?? ''),
    [orderedEntries, selectedId]
  );

  const selectedEntry = useMemo(
    () => orderedEntries.find((entry) => entry.id === resolvedSelectedId) ?? orderedEntries[0] ?? null,
    [orderedEntries, resolvedSelectedId]
  );
  const selectedIndex = useMemo(
    () => orderedEntries.findIndex((entry) => entry.id === selectedEntry?.id),
    [orderedEntries, selectedEntry]
  );
  const groupedModalEntries = useMemo(() => {
    const groups = new Map<string, DocumentProofEntry[]>();

    for (const entry of orderedEntries) {
      const label = entry.groupLabel || 'Pack documents';
      const bucket = groups.get(label) || [];
      bucket.push(entry);
      groups.set(label, bucket);
    }

    return Array.from(groups.entries()).map(([label, groupEntries]) => ({
      label,
      entries: groupEntries,
    }));
  }, [orderedEntries]);
  const hasPrevious = selectedIndex > 0;
  const hasNext = selectedIndex >= 0 && selectedIndex < orderedEntries.length - 1;

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    const handleKeyNavigation = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' && hasPrevious) {
        setSelectedId(orderedEntries[selectedIndex - 1]?.id ?? selectedId);
      }

      if (event.key === 'ArrowRight' && hasNext) {
        setSelectedId(orderedEntries[selectedIndex + 1]?.id ?? selectedId);
      }
    };

    window.addEventListener('keydown', handleKeyNavigation);
    return () => window.removeEventListener('keydown', handleKeyNavigation);
  }, [hasNext, hasPrevious, isModalOpen, orderedEntries, selectedId, selectedIndex]);

  if (!selectedEntry) {
    return null;
  }

  const goToPreviousEntry = () => {
    if (!hasPrevious) return;
    setSelectedId(orderedEntries[selectedIndex - 1]?.id ?? resolvedSelectedId);
  };

  const goToNextEntry = () => {
    if (!hasNext) return;
    setSelectedId(orderedEntries[selectedIndex + 1]?.id ?? resolvedSelectedId);
  };

  return (
    <>
      <section
        className={`border border-[#dfe5ff] bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)] ${
          compact ? 'rounded-[1.35rem] p-4' : 'rounded-[1.6rem] p-5'
        }`}
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h3 className={`font-semibold tracking-tight text-[#111827] ${compact ? 'text-lg' : 'text-xl'}`}>
              {title}
            </h3>
            <p className={`mt-2 text-sm text-slate-600 ${compact ? 'leading-6' : 'leading-7'}`}>{description}</p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className={`inline-flex items-center justify-center gap-2 rounded-full border border-[#d7ccff] bg-[#f7f3ff] text-sm font-semibold text-[#5b36b3] transition hover:bg-white ${
              compact ? 'px-3.5 py-2' : 'px-4 py-2'
            }`}
          >
            <RiFullscreenLine className="h-4 w-4" />
            {selectedEntry.previewUrl ? (compact ? 'Open full form' : 'Open full completed form') : compact ? 'Open proof' : 'Open larger proof'}
          </button>
        </div>

        <div
          className={`mt-5 grid gap-5 ${
            compact ? 'xl:grid-cols-[minmax(220px,0.85fr)_minmax(0,1.2fr)]' : 'lg:grid-cols-[minmax(240px,0.9fr)_minmax(0,1.4fr)]'
          }`}
        >
          <div className={compact ? 'grid gap-3 sm:grid-cols-2 xl:grid-cols-1' : 'space-y-3'}>
            {orderedEntries.map((entry) => {
              const isSelected = entry.id === selectedEntry.id;

              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(entry.id);
                    if (entry.previewUrl) {
                      setIsModalOpen(true);
                    }
                  }}
                  className={`w-full rounded-[1.15rem] border px-4 py-4 text-left transition ${
                    isSelected
                      ? 'border-[#cdbbff] bg-[#faf7ff] shadow-[0_12px_30px_rgba(109,40,217,0.08)]'
                      : 'border-[#ebe5ff] bg-white hover:border-[#d5c6ff] hover:bg-[#fcfbff]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      {entry.groupLabel ? (
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7b56d8]">
                          {entry.groupLabel}
                        </p>
                      ) : null}
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

          <div className={`border border-[#e4ddff] bg-[#f8f5ff] shadow-sm ${compact ? 'rounded-[1.1rem] p-2.5' : 'rounded-[1.25rem] p-3'}`}>
            <div className="overflow-hidden rounded-[1rem] border border-[#e3dbff] bg-white">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="block w-full text-left"
              >
                <img
                  src={selectedEntry.thumbnailUrl}
                  alt={`${selectedEntry.title} first-page preview`}
                  className={`w-full bg-white ${compact ? 'max-h-[22rem] object-contain' : 'h-auto'}`}
                  loading="lazy"
                />
              </button>
            </div>
            <div
              className={`mt-3 flex flex-wrap items-center justify-between gap-3 border border-[#e8ddff] bg-white ${
                compact ? 'rounded-[0.85rem] px-3.5 py-3' : 'rounded-[0.95rem] px-4 py-3'
              }`}
            >
              <div>
                <p className="text-sm font-semibold text-[#1f1740]">{selectedEntry.title}</p>
                <p className="mt-1 text-sm text-slate-600">{selectedEntry.description}</p>
              </div>
              <span className="rounded-full border border-[#ddd0ff] bg-[#f8f3ff] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6b46c1]">
                {selectedEntry.previewUrl ? 'Click to open full form' : 'First-page proof'}
              </span>
            </div>
          </div>
        </div>
      </section>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedEntry.title}
        size="fullscreen"
        panelClassName="bg-[#f5f1ff]"
        headerClassName="bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85"
        bodyClassName="p-0 overflow-hidden"
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-[#e3dbff] bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b46c1]">
                  Completed document viewer
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {selectedIndex + 1} of {orderedEntries.length} in this pack
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={goToPreviousEntry}
                  disabled={!hasPrevious}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#ddd0ff] bg-white px-4 py-2 text-sm font-semibold text-[#5b36b3] transition hover:bg-[#faf7ff] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <RiArrowLeftLine className="h-4 w-4" />
                  Previous
                </button>
                <button
                  type="button"
                  onClick={goToNextEntry}
                  disabled={!hasNext}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#ddd0ff] bg-white px-4 py-2 text-sm font-semibold text-[#5b36b3] transition hover:bg-[#faf7ff] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Next
                  <RiArrowRightLine className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{selectedEntry.description}</p>
            <div className="mt-4 space-y-3">
              {groupedModalEntries.map((group) => (
                <div key={group.label}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7b56d8]">
                    {group.label}
                  </p>
                  <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                    {group.entries.map((entry) => {
                      const isActive = entry.id === selectedEntry.id;

                      return (
                        <button
                          key={entry.id}
                          type="button"
                          onClick={() => setSelectedId(entry.id)}
                          className={`whitespace-nowrap rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
                            isActive
                              ? 'border-[#7c3aed] bg-[#f3ecff] text-[#4c1d95] shadow-sm'
                              : 'border-[#ddd0ff] bg-white text-[#6b46c1] hover:bg-[#faf7ff]'
                          }`}
                        >
                          {entry.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden px-3 py-3 sm:px-4 sm:py-4">
            <div className="h-full overflow-hidden rounded-[1.2rem] border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.08)]">
              {selectedEntry.previewUrl ? (
                <iframe
                  key={selectedEntry.previewUrl}
                  src={selectedEntry.previewUrl}
                  title={`${selectedEntry.title} full completed preview`}
                  className="h-full min-h-[58vh] w-full bg-white sm:min-h-[70vh]"
                  loading="lazy"
                  sandbox="allow-scripts allow-same-origin"
                />
              ) : (
                <div className="h-full overflow-auto">
                  <img
                    src={selectedEntry.thumbnailUrl}
                    alt={`${selectedEntry.title} enlarged first-page preview`}
                    className="h-auto w-full bg-white"
                    loading="lazy"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="sticky bottom-0 border-t border-[#e3dbff] bg-white/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/85 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-600">
                {selectedEntry.groupLabel ? `${selectedEntry.groupLabel}. ` : ''}
                Tap through the documents to review the full completed pack before continuing.
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#ddd0ff] bg-white px-4 py-2 text-sm font-semibold text-[#5b36b3] transition hover:bg-[#faf7ff]"
                >
                  <RiCloseLine className="h-4 w-4" />
                  Back to review
                </button>
                <button
                  type="button"
                  onClick={hasNext ? goToNextEntry : () => setIsModalOpen(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#7c3aed,#5b21b6)] px-4 py-2 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(91,33,182,0.24)] transition hover:brightness-105"
                >
                  {hasNext ? 'Next document' : 'Done reviewing'}
                  <RiArrowRightLine className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default DocumentProofShowcase;
