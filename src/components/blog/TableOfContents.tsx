'use client';

import Image from 'next/image';
import { useEffect, useId, useState } from 'react';

interface TOCItem {
  id: string;
  title: string;
  level: number;
}

interface TableOfContentsProps {
  items: TOCItem[];
}

function toPx(cssLength: string): number {
  const value = cssLength.trim();
  if (!value) return 112;

  if (value.endsWith('px')) {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 112;
  }

  if (value.endsWith('rem')) {
    const parsed = Number.parseFloat(value);
    const rootFont = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
    if (Number.isFinite(parsed) && Number.isFinite(rootFont)) {
      return parsed * rootFont;
    }
  }

  const fallback = Number.parseFloat(value);
  return Number.isFinite(fallback) ? fallback : 112;
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(() => (typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : false));
  const panelId = useId();

  useEffect(() => {
    if (!items.length) return;

    const targets = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (!targets.length) return;

    const updateActiveHeading = () => {
      const stickyOffsetVar = getComputedStyle(document.documentElement).getPropertyValue('--lh-sticky-top');
      const threshold = toPx(stickyOffsetVar) + 22;
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
    <nav aria-label="In this article" className="rounded-2xl border border-[#e4d4ff] bg-[#f8f1ff] p-4 shadow-sm md:p-5" data-blog-sidebar-toc>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((prev) => !prev)}
        className="mb-3 flex w-full items-center justify-between gap-2 rounded-xl border border-[#e4d4ff] bg-white/85 px-3 py-2 text-left text-sm font-semibold text-slate-900 transition hover:border-[#ccb0fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#692ed4] focus-visible:ring-offset-2 lg:cursor-default lg:border-transparent lg:bg-transparent lg:px-0"
      >
        <span className="text-base font-semibold text-slate-900">In this article</span>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 lg:hidden">
          <span>{isOpen ? 'Hide' : 'Show'}</span>
          <Image
            src="/images/wizard-icons/07-review-finish.png"
            alt=""
            aria-hidden
            width={14}
            height={14}
            className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </span>
      </button>

      <ul
        id={panelId}
        className={`space-y-1 overflow-hidden transition-all ${isOpen ? 'block' : 'hidden lg:block'}`}
        data-blog-toc-panel
      >
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`group flex min-h-11 items-center rounded-lg border-l-2 py-2 pr-2 text-sm transition-colors ${item.level === 3 ? 'pl-5' : 'pl-3'} ${
                activeId === item.id
                  ? 'border-[#692ed4] bg-white text-[#692ed4] font-medium'
                  : 'border-transparent text-slate-700 hover:bg-white/80 hover:text-[#692ed4]'
              }`}
              onClick={(e) => {
                e.preventDefault();
                const target = document.getElementById(item.id);
                if (!target) return;
                const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                target.scrollIntoView({ block: 'start', behavior: prefersReducedMotion ? 'auto' : 'smooth' });
                if (window.innerWidth < 1024) {
                  setIsOpen(false);
                }
              }}
            >
              <span
                className={`mr-2 h-1.5 w-1.5 rounded-full ${
                  activeId === item.id ? 'bg-[#692ed4]' : 'bg-[#d9c4fb] group-hover:bg-[#692ed4]'
                }`}
                aria-hidden
              />
              <span className="leading-5">{item.title}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
