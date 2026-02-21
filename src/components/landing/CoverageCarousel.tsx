'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CoverageItem {
  icon: ReactNode;
  label: string;
}

interface CoverageCarouselProps {
  items: CoverageItem[];
  renderItem: (item: CoverageItem, index: number) => ReactNode;
}

export function CoverageCarousel({ items, renderItem }: CoverageCarouselProps) {
  const [mobileIndex, setMobileIndex] = useState(0);
  const [desktopIndex, setDesktopIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setMobileIndex((prev) => (prev + 1) % items.length);
    }, 3000);

    return () => window.clearInterval(interval);
  }, [items.length]);

  if (items.length === 0) {
    return null;
  }

  const goDesktop = (direction: 'prev' | 'next') => {
    setDesktopIndex((prev) => {
      if (direction === 'next') {
        return (prev + 1) % items.length;
      }

      return (prev - 1 + items.length) % items.length;
    });
  };

  const desktopVisibleItems = Array.from({ length: Math.min(3, items.length) }, (_, offset) => {
    const index = (desktopIndex + offset) % items.length;
    return { item: items[index], index };
  });

  return (
    <>
      <div className="hidden lg:grid lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:gap-4">
        <button
          type="button"
          onClick={() => goDesktop('prev')}
          aria-label="Show previous coverage statement"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:text-primary"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="grid grid-cols-3 gap-6 xl:gap-8">
          {desktopVisibleItems.map(({ item, index }) => (
            <div key={`desktop-${item.label}-${index}`}>
              {renderItem(item, index)}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => goDesktop('next')}
          aria-label="Show next coverage statement"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:text-primary"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="lg:hidden flex flex-col items-center justify-center">
        <div className="relative overflow-hidden w-full">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${mobileIndex * 100}%)` }}
          >
            {items.map((item, index) => (
              <div key={`mobile-${item.label}-${index}`} className="w-full flex-shrink-0 flex justify-center">
                {renderItem(item, index)}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-1.5 mt-3">
          {items.map((item, index) => (
            <button
              key={`dot-${item.label}-${index}`}
              type="button"
              onClick={() => setMobileIndex(index)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                index === mobileIndex ? 'bg-primary w-4' : 'bg-gray-300'
              }`}
              aria-label={`Go to coverage statement ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export default CoverageCarousel;
