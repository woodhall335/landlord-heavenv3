'use client';

import Link from 'next/link';
import { ArrowRight, FileText, Calculator, Scale, Home, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState, useCallback, useRef } from 'react';

interface RelatedLink {
  href: string;
  title: string;
  description?: string;
  icon?: 'document' | 'calculator' | 'legal' | 'home';
  type?: 'product' | 'tool' | 'guide' | 'page';
}

interface RelatedLinksProps {
  title?: string;
  links: RelatedLink[];
  variant?: 'cards' | 'list' | 'inline';
  className?: string;
}

const iconMap = {
  document: FileText,
  calculator: Calculator,
  legal: Scale,
  home: Home,
};

export function RelatedLinks({
  title = 'Related Resources',
  links,
  variant = 'cards',
  className = ''
}: RelatedLinksProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const itemsPerView = isMobile ? 1 : 3;
  const maxIndex = Math.max(0, links.length - itemsPerView);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  // Auto-slide effect
  useEffect(() => {
    if (variant !== 'cards' || isHovered || links.length <= itemsPerView) return;

    const interval = setInterval(() => {
      goToNext();
    }, 4000);

    return () => clearInterval(interval);
  }, [variant, isHovered, links.length, itemsPerView, goToNext]);

  if (variant === 'inline') {
    return (
      <div className={`my-6 ${className}`}>
        <span className="text-gray-600">Related: </span>
        {links.map((link, i) => (
          <span key={link.href}>
            <Link href={link.href} className="text-primary hover:underline">
              {link.title}
            </Link>
            {i < links.length - 1 && <span className="text-gray-400"> &bull; </span>}
          </span>
        ))}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={`my-8 ${className}`}>
        <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                {link.title}
                <ArrowRight className="w-3 h-3" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Cards variant with slider
  const showControls = links.length > itemsPerView;

  return (
    <section className={`pb-16 md:pb-20 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            {showControls && (
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPrev}
                  className="p-2 rounded-full bg-gray-100 hover:bg-primary/10 text-gray-600 hover:text-primary transition-colors"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={goToNext}
                  className="p-2 rounded-full bg-gray-100 hover:bg-primary/10 text-gray-600 hover:text-primary transition-colors"
                  aria-label="Next"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <div
            className="overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div
              ref={sliderRef}
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
              }}
            >
              {links.map((link) => {
                const Icon = link.icon ? iconMap[link.icon] : FileText;
                return (
                  <div
                    key={link.href}
                    className="flex-shrink-0 px-2"
                    style={{ width: `${100 / itemsPerView}%` }}
                  >
                    <Link
                      href={link.href}
                      className="group flex items-start gap-4 p-4 bg-gray-50 hover:bg-primary/5 rounded-xl border border-gray-100 hover:border-primary/20 transition-all h-full"
                    >
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                          {link.title}
                        </h3>
                        {link.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{link.description}</p>
                        )}
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dots indicator */}
          {showControls && (
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex
                      ? 'bg-primary'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
