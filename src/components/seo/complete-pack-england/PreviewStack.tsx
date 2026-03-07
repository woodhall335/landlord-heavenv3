'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PackSelector } from './PackSelector';
import {
  section8Documents,
  section21Documents,
  type CompletePackPreviewCategory,
  type CompletePackPreviewDocument,
} from '@/lib/seo/previewManifests/completePackEnglandPreviews';

const categories: CompletePackPreviewCategory[] = ['Notices', 'Court Forms', 'AI-Generated', 'Guidance', 'Evidence'];

function groupedDocuments(documents: CompletePackPreviewDocument[]) {
  return categories.map((category) => ({
    category,
    documents: documents.filter((document) => document.category === category),
  }));
}

export function PreviewStack() {
  const [selectedPack, setSelectedPack] = useState<'section8' | 'section21'>('section8');
  const documents = selectedPack === 'section8' ? section8Documents : section21Documents;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLElement | null>(null);

  const handlePackSelect = (value: 'section8' | 'section21') => {
    setSelectedPack(value);
    setActiveIndex(0);
  };

  useEffect(() => {
    const node = containerRef.current;
    if (!node || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '150px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isInView]);

  const grouped = useMemo(() => groupedDocuments(documents), [documents]);
  const activeDocument = documents[activeIndex];

  return (
    <section ref={containerRef} className="py-14 md:py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-charcoal">What&apos;s included in your Complete Eviction Bundle (England Only)</h2>
          <p className="mt-3 text-gray-600">Choose Section 8 or Section 21. Preview every document before you pay.</p>
          <div className="mt-6">
            <PackSelector selected={selectedPack} onSelect={handlePackSelect} />
          </div>
        </div>

        <div className="mt-8 grid gap-3 grid-cols-2 md:grid-cols-5" aria-label="Document category counts">
          {grouped.map(({ category, documents: categoryDocuments }) => (
            <div key={category} className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center">
              <p className="text-xs uppercase tracking-wide text-gray-500">{category}</p>
              <p className="mt-1 text-xl font-bold text-gray-900">{categoryDocuments.length}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_1.3fr]">
          <div className="order-2 lg:order-1 rounded-xl border border-gray-200 p-4 bg-white">
            <p className="text-sm text-gray-600 mb-3">Click a document to preview</p>
            <div className="max-h-[32rem] overflow-y-auto space-y-5 pr-2">
              {grouped.map(({ category, documents: categoryDocuments }) => (
                <div key={category}>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">{category}</h3>
                  <ul className="space-y-2">
                    {categoryDocuments.map((document) => {
                      const index = documents.findIndex((item) => item.id === document.id);
                      const isActive = index === activeIndex;

                      return (
                        <li key={document.id}>
                          <button
                            type="button"
                            onClick={() => setActiveIndex(index)}
                            className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                              isActive
                                ? 'border-primary bg-primary/5 text-primary font-semibold'
                                : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {document.title}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="order-1 lg:order-2 rounded-xl border border-gray-200 bg-gray-50 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Active preview</p>
                <p className="text-base font-semibold text-gray-900">{activeDocument.title}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveIndex((prev) => (prev === 0 ? documents.length - 1 : prev - 1))}
                  className="rounded-full border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  aria-label="Previous document preview"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveIndex((prev) => (prev === documents.length - 1 ? 0 : prev + 1))}
                  className="rounded-full border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  aria-label="Next document preview"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mt-4 relative overflow-hidden rounded-lg border border-gray-200 bg-white">
              {isInView ? (
                <Image
                  src={activeDocument.previewPath}
                  alt={`${activeDocument.title} preview`}
                  width={1200}
                  height={1680}
                  className="w-full h-auto"
                  loading="lazy"
                />
              ) : (
                <div className="aspect-[5/7] w-full animate-pulse bg-gray-100" aria-hidden="true" />
              )}
            </div>
            <p className="mt-3 text-sm text-gray-600">Click a document to preview</p>
          </div>
        </div>
      </div>
    </section>
  );
}
