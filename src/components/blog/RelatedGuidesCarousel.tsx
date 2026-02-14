'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BlogCard } from '@/components/blog/BlogCard';

interface RelatedGuide {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  category: string;
  heroImage: string;
  heroImageAlt: string;
}

interface RelatedGuidesCarouselProps {
  guides: RelatedGuide[];
}

export function RelatedGuidesCarousel({ guides }: RelatedGuidesCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (guides.length === 0) {
    return null;
  }

  return (
    <section className="bg-gray-50 py-12 lg:py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Related Guides</h2>
          <div className="hidden md:flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              aria-label="Scroll related guides left"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:text-primary"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              aria-label="Scroll related guides right"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:text-primary"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute left-0 top-0 hidden h-full w-12 bg-gradient-to-r from-gray-50 to-transparent md:block" />
          <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-12 bg-gradient-to-l from-gray-50 to-transparent md:block" />
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2"
          >
            {guides.map((guide) => (
              <div
                key={guide.slug}
                className="snap-start min-w-[280px] sm:min-w-[320px] lg:min-w-[360px]"
              >
                <BlogCard
                  slug={guide.slug}
                  title={guide.title}
                  description={guide.description}
                  date={guide.date}
                  readTime={guide.readTime}
                  category={guide.category}
                  heroImage={guide.heroImage}
                  heroImageAlt={guide.heroImageAlt}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
