'use client';

import { useEffect, useId, useState } from 'react';
import { ChevronDown, List } from 'lucide-react';

interface TOCItem {
  id: string;
  title: string;
  level: number;
}

interface TableOfContentsProps {
  items: TOCItem[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!items.length) return;

    const targets = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (!targets.length) return;

    const updateActiveHeading = () => {
      const stickyOffset = Number.parseInt(getComputedStyle(document.documentElement).getPropertyValue('--lh-sticky-top'), 10);
      const threshold = Number.isFinite(stickyOffset) ? stickyOffset + 20 : 160;
      let current = targets[0]?.id ?? '';

      for (const target of targets) {
        if (target.getBoundingClientRect().top <= threshold) {
          current = target.id;
        }
      }

      setActiveId(current);
    };

    let ticking = false;
    const onScrollOrResize = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        updateActiveHeading();
        ticking = false;
      });
    };

    updateActiveHeading();
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);

    return () => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav aria-label="In this article" className="rounded-2xl border border-[#e7d9ff] bg-[#f8f1ff] p-4 shadow-sm md:p-5">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((prev) => !prev)}
        className="mb-3 flex w-full items-center justify-between gap-2 rounded-lg border border-[#e5d8fb] bg-white/80 px-2 py-2 text-left font-semibold text-gray-900 transition hover:border-[#d7c2fb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#692ed4] focus-visible:ring-offset-2 lg:cursor-default lg:border-transparent lg:bg-transparent lg:px-0 lg:py-1"
      >
        <span className="flex items-center gap-2">
          <List className="h-4 w-4 text-[#692ed4]" />
          <span>In this article</span>
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-gray-600">
          <span>{isOpen ? 'Hide' : 'Show'}</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </span>
      </button>

      <ul id={panelId} className={`space-y-1.5 overflow-hidden transition-all ${isOpen ? 'block' : 'hidden lg:block'}`}>
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`block rounded-md border-l-2 py-2 pr-2 text-sm transition-colors ${item.level === 3 ? 'pl-5' : 'pl-3'} ${
                activeId === item.id
                  ? 'border-[#692ed4] bg-white/80 font-semibold text-[#692ed4]'
                  : 'border-transparent text-gray-700 hover:bg-white/70 hover:text-[#692ed4]'
              }`}
              onClick={(e) => {
                e.preventDefault();
                const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                document.getElementById(item.id)?.scrollIntoView({ block: 'start', behavior: prefersReducedMotion ? 'auto' : 'smooth' });
              }}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
