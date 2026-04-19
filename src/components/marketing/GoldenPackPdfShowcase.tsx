'use client';

import { useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import type { GoldenPackProofEntry } from '@/lib/marketing/golden-pack-proof';

type PdfEntry = Pick<
  GoldenPackProofEntry,
  'title' | 'categoryLabel' | 'pageCount' | 'pdfHref' | 'thumbnailHref' | 'embedHref'
>;

export function GoldenPackPdfShowcase({ entries }: { entries: PdfEntry[] }) {
  const pdfEntries = useMemo(
    () => entries.filter((entry) => Boolean(entry.pdfHref) && Boolean(entry.embedHref)),
    [entries]
  );
  const [selectedTitle, setSelectedTitle] = useState(pdfEntries[0]?.title ?? '');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectedEntry =
    pdfEntries.find((entry) => entry.title === selectedTitle) ?? pdfEntries[0] ?? null;

  if (!selectedEntry?.pdfHref) {
    return null;
  }

  return (
    <>
      <div className="mt-8 overflow-hidden rounded-[1.85rem] border border-white/12 bg-[#130C25]/45 shadow-[0_18px_52px_rgba(9,6,18,0.24)]">
        <div className="border-b border-white/10 px-5 py-5 md:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#CFC4FF]">
                Real PDF sample
              </p>
              <h4 className="mt-2 text-xl font-semibold text-white md:text-2xl">
                Read the full sample documents on the page
              </h4>
              <p className="mt-2 text-sm leading-7 text-[#ECE8FF] md:text-base">
                These previews render the full current QA sample inside the page, with the browser
                PDF download controls stripped out and the viewer kept focused on reading.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center justify-center rounded-full border border-white/16 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/16"
              >
                Open larger preview
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 px-5 py-5 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.6fr)] md:px-6">
          <div className="rounded-[1.45rem] border border-white/12 bg-white/8 p-4 md:p-5">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#CFC4FF]">
                Documents in this sample pack
              </p>
              <p className="mt-2 text-sm leading-7 text-[#D9D1F8] md:text-base">
                Choose a document from the list to load its full sample preview in the main viewer.
              </p>
            </div>

            <div className="space-y-3 lg:max-h-[760px] lg:overflow-y-auto lg:pr-1">
              {pdfEntries.map((entry) => {
                const isSelected = entry.title === selectedEntry.title;

                return (
                  <button
                    key={entry.title}
                    type="button"
                    onClick={() => setSelectedTitle(entry.title)}
                    className={[
                      'w-full rounded-[1.15rem] border px-4 py-4 text-left transition',
                      isSelected
                        ? 'border-[#CDBBFF] bg-white text-[#261544] shadow-[0_16px_40px_rgba(255,255,255,0.1)]'
                        : 'border-white/12 bg-white/6 text-white hover:bg-white/12',
                    ].join(' ')}
                    aria-pressed={isSelected}
                  >
                    <p
                      className={
                        isSelected
                          ? 'text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6F54C8]'
                          : 'text-[11px] font-semibold uppercase tracking-[0.14em] text-[#CFC4FF]'
                      }
                    >
                      {entry.categoryLabel}
                    </p>
                    <h6 className="mt-2 text-base font-semibold leading-6">{entry.title}</h6>
                    <p
                      className={
                        isSelected ? 'mt-2 text-sm text-[#5E498E]' : 'mt-2 text-sm text-[#E7E0FF]'
                      }
                    >
                      {entry.pageCount ? `${entry.pageCount} pages in sample` : 'Sample document'}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="overflow-hidden rounded-[1.45rem] border border-[#D9D1FF] bg-[#F8F5FF] p-3 shadow-[0_16px_40px_rgba(31,20,59,0.12)]">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-[1rem] border border-[#E3DBFF] bg-white px-4 py-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6F54C8]">
                  Selected sample
                </p>
                <h5 className="mt-1 text-lg font-semibold tracking-tight text-[#261544] md:text-xl">
                  {selectedEntry.title}
                </h5>
              </div>
              <p className="text-sm text-[#5E498E]">
                {selectedEntry.categoryLabel}
                {selectedEntry.pageCount ? ` | ${selectedEntry.pageCount} pages` : ''}
              </p>
            </div>

            <div className="overflow-hidden rounded-[1.1rem] border border-[#E3DBFF] bg-white">
              {selectedEntry.embedHref ? (
                <iframe
                  key={selectedEntry.embedHref}
                  src={selectedEntry.embedHref}
                  title={`${selectedEntry.title} embedded sample preview`}
                  className="h-[760px] w-full bg-white"
                  loading="lazy"
                  sandbox="allow-scripts allow-same-origin"
                />
              ) : (
                <div className="flex h-[520px] items-center justify-center bg-white text-sm text-slate-500">
                  Preview unavailable
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedEntry.title}
        size="large"
      >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span>{selectedEntry.categoryLabel}</span>
              {selectedEntry.pageCount ? <span>{selectedEntry.pageCount} pages</span> : null}
              <span>Embedded sample reader</span>
            </div>
            <div className="overflow-hidden rounded-[1.2rem] border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.08)]">
              {selectedEntry.embedHref ? (
                <iframe
                  key={selectedEntry.embedHref}
                  src={selectedEntry.embedHref}
                  title={`${selectedEntry.title} embedded sample preview`}
                  className="h-[78vh] min-h-[720px] w-full bg-white"
                  sandbox="allow-scripts allow-same-origin"
                />
              ) : null}
            </div>
          </div>
      </Modal>
    </>
  );
}
