import React, { useState } from 'react';
import {
  RiCheckboxCircleLine,
  RiFileList3Line,
  RiFocus3Line,
  RiFullscreenLine,
  RiTimeLine,
} from 'react-icons/ri';
import { Modal } from '@/components/ui/Modal';

import type { WizardProduct } from './stepMetadata';
import { getWizardPackSummary, type WizardSummaryTabState } from './wizardPackSummary';

interface WizardPackSummaryRailProps {
  product: WizardProduct;
  tabs: WizardSummaryTabState[];
  currentStepId?: string;
  currentStepLabel?: string;
  mobile?: boolean;
}

export function WizardPackSummaryRail({
  product,
  tabs,
  currentStepId,
  currentStepLabel,
  mobile = false,
}: WizardPackSummaryRailProps) {
  const summary = getWizardPackSummary(product, tabs, currentStepId);
  const previewEntries = summary.proofPreviews;
  const [selectedPreviewTitle, setSelectedPreviewTitle] = useState<string | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const outstandingCount = summary.outstandingSections.length;
  const attentionCount = summary.sectionsNeedingAttention.length;
  const visibleIncludedDocuments = mobile ? summary.includedDocuments.slice(0, 4) : summary.includedDocuments;
  const hiddenIncludedDocumentCount = summary.includedDocuments.length - visibleIncludedDocuments.length;
  const visibleOutstandingSections = mobile ? summary.outstandingSections.slice(0, 3) : summary.outstandingSections;
  const hiddenOutstandingCount = summary.outstandingSections.length - visibleOutstandingSections.length;
  const cardClassName = mobile
    ? 'rounded-[1.35rem] border border-[#e5dbff] bg-[linear-gradient(180deg,rgba(255,255,255,0.985),rgba(248,243,255,0.955))] p-3.5 shadow-[0_16px_36px_rgba(76,29,149,0.075)]'
    : 'rounded-[1.95rem] border border-[#e5dbff] bg-[linear-gradient(180deg,rgba(255,255,255,0.985),rgba(248,243,255,0.955))] p-5 shadow-[0_22px_64px_rgba(76,29,149,0.11)]';
  const selectedPreview =
    previewEntries.find((entry) => entry.title === selectedPreviewTitle) ?? previewEntries[0] ?? null;

  const content = (
    <>
      <div className={`${cardClassName} relative overflow-hidden`}>
        <div className="pointer-events-none absolute inset-[1px] rounded-[inherit] border border-white/70" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7b56d8]">
              Live pack summary
            </p>
            <h3 className={`mt-2 font-semibold tracking-tight text-[#20103f] ${mobile ? 'text-base' : 'text-lg'}`}>
              {summary.heading}
            </h3>
            <p className={`mt-1 text-[#60597a] ${mobile ? 'text-xs leading-5' : 'text-sm leading-6'}`}>{summary.subheading}</p>
          </div>
          <span className="rounded-full border border-[#ddd0ff] bg-white/92 px-3 py-1 text-xs font-semibold text-[#5b36b3] shadow-sm">
            Live pack
          </span>
        </div>

        {currentStepLabel ? (
          <div className="mt-4 rounded-[1.35rem] border border-[#ece3ff] bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(249,245,255,0.92))] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7b56d8]">
              Current step
            </p>
            <p className={`mt-1 font-medium text-[#241247] ${mobile ? 'text-xs leading-5' : 'text-sm'}`}>{currentStepLabel}</p>
          </div>
        ) : null}

        <section className="mt-5">
          <div className="flex items-center gap-2">
            <RiFocus3Line className="h-4 w-4 text-[#6d28d9]" />
            <h4 className="text-sm font-semibold text-[#241247]">This step shapes</h4>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {summary.currentStepDocuments.map((item) => (
              <span
                key={item}
                className="rounded-full border border-[#ddd0ff] bg-white/92 px-3 py-1.5 text-xs font-semibold text-[#5b36b3] shadow-sm transition-transform duration-200 hover:-translate-y-[1px]"
              >
                {item}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-5">
          <div className="flex items-center gap-2">
            <RiFileList3Line className="h-4 w-4 text-[#6d28d9]" />
            <h4 className="text-sm font-semibold text-[#241247]">Included in your pack</h4>
          </div>
          <ul className={`mt-3 ${mobile ? 'space-y-1.5' : 'space-y-2'}`}>
            {visibleIncludedDocuments.map((item) => (
              <li key={item} className={`flex items-start gap-2 text-[#4f4768] ${mobile ? 'text-xs leading-5' : 'text-sm leading-6'}`}>
                <RiCheckboxCircleLine className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          {hiddenIncludedDocumentCount > 0 ? (
            <p className="mt-2 text-xs font-medium text-[#6a627f]">
              + {hiddenIncludedDocumentCount} more document{hiddenIncludedDocumentCount === 1 ? '' : 's'} in this pack
            </p>
          ) : null}
        </section>

        {!mobile && summary.proofCards.length > 0 ? (
          <section className="mt-5">
            <div className="flex items-center gap-2">
              <RiCheckboxCircleLine className="h-4 w-4 text-[#6d28d9]" />
              <h4 className="text-sm font-semibold text-[#241247]">Document proof</h4>
            </div>
            <div className="mt-3 space-y-3">
              {summary.proofCards.map((card) => (
                <div
                  key={card.title}
                className="rounded-[1.35rem] border border-[#e9e0ff] bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(250,246,255,0.9))] px-4 py-3 shadow-[0_12px_30px_rgba(76,29,149,0.06)]"
              >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#241247]">{card.title}</p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#7b56d8]">
                        {card.detail}
                      </p>
                    </div>
                    <span className="rounded-full border border-[#ddd0ff] bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6b46c1] shadow-sm">
                      Live sample
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#5a546e]">{card.note}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {selectedPreview ? (
          <section className="mt-5">
            <div className="flex items-center gap-2">
              <RiFileList3Line className="h-4 w-4 text-[#6d28d9]" />
              <h4 className="text-sm font-semibold text-[#241247]">Visual document proof</h4>
            </div>
            <div className="mt-3 rounded-[1.45rem] border border-[#e3dbff] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(249,245,255,0.92))] p-3 shadow-[0_14px_34px_rgba(76,29,149,0.07)]">
              <div className="overflow-hidden rounded-[1rem] border border-[#e8ddff] bg-[#f8f5ff]">
                <img
                  src={selectedPreview.thumbnailHref}
                  alt={`${selectedPreview.title} sample thumbnail`}
                  className="h-auto w-full"
                  loading="lazy"
                />
              </div>
              <div className="mt-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#241247]">{selectedPreview.title}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#7b56d8]">
                    {selectedPreview.detail}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#5a546e]">{selectedPreview.note}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(true)}
                  className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#ddd0ff] bg-white/92 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#6b46c1] shadow-sm transition hover:-translate-y-[1px] hover:bg-white"
                >
                  <RiFullscreenLine className="h-3.5 w-3.5" />
                  Open sample
                </button>
              </div>
              {previewEntries.length > 1 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {previewEntries.map((entry) => (
                    <button
                      key={entry.title}
                      type="button"
                      onClick={() => setSelectedPreviewTitle(entry.title)}
                      className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition ${
                        entry.title === selectedPreview.title
                      ? 'border-[#cdbbff] bg-white text-[#5b36b3] shadow-sm'
                          : 'border-[#e4d9ff] bg-[#faf7ff] text-[#766c91] hover:bg-white'
                      }`}
                    >
                      {entry.title}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {summary.outstandingSections.length > 0 ? (
          <section className="mt-5 border-t border-[#ece3ff] pt-5">
            <div className="flex items-center gap-2">
              <RiTimeLine className="h-4 w-4 text-[#6d28d9]" />
              <h4 className="text-sm font-semibold text-[#241247]">Still to complete</h4>
            </div>
            <ul className={`mt-3 ${mobile ? 'space-y-1.5' : 'space-y-2'}`}>
              {visibleOutstandingSections.map((item) => (
                <li key={item} className={`${mobile ? 'text-xs leading-5' : 'text-sm leading-6'} text-[#5d5773]`}>
                  {item}
                </li>
              ))}
            </ul>
            {hiddenOutstandingCount > 0 ? (
              <p className="mt-2 text-xs font-medium text-[#6a627f]">
                + {hiddenOutstandingCount} more section{hiddenOutstandingCount === 1 ? '' : 's'} still to complete
              </p>
            ) : null}
          </section>
        ) : null}

        {summary.sectionsNeedingAttention.length > 0 ? (
          <section className="mt-5 rounded-[1.35rem] border border-amber-200 bg-[linear-gradient(180deg,rgba(255,251,235,0.96),rgba(255,247,214,0.92))] px-4 py-3 shadow-[0_10px_24px_rgba(217,119,6,0.07)]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-900">
              Needs attention
            </p>
            <ul className="mt-2 space-y-1.5">
              {summary.sectionsNeedingAttention.map((item) => (
                <li key={item} className="text-sm leading-6 text-amber-900">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className="mt-5 rounded-[1.3rem] border border-[#efe7ff] bg-white/88 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
          <p className="text-sm leading-6 text-[#5b5670]">
            Preview before payment. You can still change your answers before we prepare the final documents.
          </p>
        </div>
      </div>

      {selectedPreview ? (
        <Modal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          title={selectedPreview.title}
          size="large"
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span>{selectedPreview.detail}</span>
              <span>Embedded sample reader</span>
            </div>
            <div className="overflow-hidden rounded-[1.2rem] border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.08)]">
              <iframe
                key={selectedPreview.embedHref}
                src={selectedPreview.embedHref}
                title={`${selectedPreview.title} embedded sample preview`}
                className="h-[78vh] min-h-[720px] w-full bg-white"
                loading="lazy"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </div>
        </Modal>
      ) : null}
    </>
  );

  if (!mobile) {
    return content;
  }

  return (
    <details className="group">
      <summary className="list-none cursor-pointer rounded-[1.25rem] border border-[#e6dcff] bg-white/90 px-3.5 py-3 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#241247]">Your pack and next steps</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <span className="rounded-full border border-[#ddd0ff] bg-[#f8f3ff] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6b46c1]">
                {summary.currentStepDocuments[0]}
              </span>
              <span className="rounded-full border border-[#e7dbff] bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#62597c]">
                {summary.includedDocuments.length} docs
              </span>
              {outstandingCount > 0 ? (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-900">
                  {outstandingCount} left
                </span>
              ) : null}
              {attentionCount > 0 ? (
                <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-red-900">
                  {attentionCount} warning{attentionCount === 1 ? '' : 's'}
                </span>
              ) : null}
            </div>
          </div>
          <span className="text-sm font-medium text-[#7650cd] transition group-open:rotate-180">⌄</span>
        </div>
      </summary>
      <div className="mt-3">{content}</div>
    </details>
  );
}

export default WizardPackSummaryRail;
