'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BlogCard } from '@/components/blog/BlogCard';
import { trackEvent } from '@/lib/analytics';

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
  postSlug?: string;
  category?: string;
}

export function RelatedGuidesCarousel({ guides, postSlug, category }: RelatedGuidesCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  if (guides.length === 0) {
    return null;
  }

  return (
    <section className="overflow-x-clip border-y border-[#eadfff] bg-[#f8f1ff]/70 py-12 lg:py-16">
      <div className="container mx-auto min-w-0 px-4">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Related Guides</h2>
          <div className="hidden items-center gap-2 md:flex">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              aria-label="Scroll related guides left"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#deccff] bg-white text-gray-600 shadow-sm transition hover:border-[#692ed4] hover:text-[#692ed4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#692ed4] focus-visible:ring-offset-2"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              aria-label="Scroll related guides right"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#deccff] bg-white text-gray-600 shadow-sm transition hover:border-[#692ed4] hover:text-[#692ed4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#692ed4] focus-visible:ring-offset-2"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="relative min-w-0">
          <div className="pointer-events-none absolute left-0 top-0 hidden h-full w-12 bg-gradient-to-r from-[#f8f1ff] to-transparent md:block" />
          <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-12 bg-gradient-to-l from-[#f8f1ff] to-transparent md:block" />
          <div ref={scrollContainerRef} className="flex min-w-0 gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 sm:gap-6">
            {guides.map((guide) => (
              <div key={guide.slug} className="min-w-0 w-[min(88vw,360px)] max-w-full shrink-0 snap-start sm:w-[320px] lg:w-[360px]">
                <BlogCard
                  slug={guide.slug}
                  title={guide.title}
                  description={guide.description}
                  date={guide.date}
                  readTime={guide.readTime}
                  category={guide.category}
                  heroImage={guide.heroImage}
                  heroImageAlt={guide.heroImageAlt}
                  onClick={() =>
                    trackEvent('click_related_post', {
                      slug: postSlug ?? 'blog',
                      category: category ?? 'unknown',
                      productHref: null,
                      placement: 'related',
                      target: guide.slug,
                    })
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
