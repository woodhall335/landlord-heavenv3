'use client';

import { useEffect, useId, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X } from 'lucide-react';

interface ChecklistPreviewProps {
  imageSrc: string;
  pdfHref: string;
  pdfText: string;
  alt: string;
}

export function ChecklistPreview({ imageSrc, pdfHref, pdfText, alt }: ChecklistPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <div className="rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-4 shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group block w-full overflow-hidden rounded-xl border border-[#E6DBFF] bg-white text-left shadow-sm transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        aria-label={`Expand ${alt}`}
      >
        <span className="relative block aspect-[3/4] w-full">
          <Image src={imageSrc} alt={alt} fill sizes="(min-width: 768px) 320px, 90vw" className="object-contain p-3" />
        </span>
        <span className="block border-t border-[#E6DBFF] bg-[#F8F4FF] px-4 py-3 text-sm font-semibold text-primary transition group-hover:bg-[#F1E9FF]">
          Click to expand checklist
        </span>
      </button>
      <Link href={pdfHref} className="mt-4 block text-sm font-semibold text-primary hover:underline">
        {pdfText}
      </Link>

      {isOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h2 id={titleId} className="text-base font-semibold text-slate-900">
                {alt}
              </h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Close checklist preview"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="max-h-[calc(92vh-57px)] overflow-auto bg-slate-100 p-4">
              <div className="relative mx-auto min-h-[72vh] max-w-3xl bg-white">
                <Image src={imageSrc} alt={alt} fill sizes="90vw" className="object-contain" priority />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
