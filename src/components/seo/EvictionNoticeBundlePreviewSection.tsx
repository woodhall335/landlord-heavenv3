'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Container } from '@/components/ui';
import type { NoticeOnlyPreviewData } from '@/lib/previews/noticeOnlyPreviews';

const WhatsIncludedInteractive = dynamic(
  () => import('@/components/value-proposition/WhatsIncludedInteractive').then((mod) => mod.WhatsIncludedInteractive),
  { ssr: false },
);

type EvictionNoticeBundlePreviewSectionProps = {
  previews: NoticeOnlyPreviewData;
};

export function EvictionNoticeBundlePreviewSection({ previews }: EvictionNoticeBundlePreviewSectionProps) {
  const [isActivated, setIsActivated] = useState(() => typeof window !== 'undefined' && typeof IntersectionObserver === 'undefined');
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || isActivated) {
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsActivated(true);
          observer.disconnect();
        }
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0.1,
      },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, [isActivated]);

  return (
    <section ref={sectionRef} className="py-16 md:py-20 bg-white">
      <Container>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal">What&apos;s included in your eviction notice bundle</h2>
            <p className="mt-3 text-gray-600">Select your jurisdiction, then preview every document before you pay.</p>
          </div>

          {isActivated ? (
            <WhatsIncludedInteractive product="notice_only" defaultJurisdiction="england" previews={previews} />
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-20 text-center">
              <p className="text-sm font-semibold text-charcoal">Preview section loading</p>
              <p className="mt-2 text-xs text-gray-600">Document previews activate as this section enters view.</p>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
