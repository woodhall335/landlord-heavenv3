'use client';

import { useEffect, useId, useState } from 'react';
import { List } from 'lucide-react';

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
  const [isOpen, setIsOpen] = useState(true);
  const panelId = useId();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -80% 0px' },
    );

    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav aria-label="In this article" className="rounded-2xl border border-[#e9dcff] bg-white p-6">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((prev) => !prev)}
        className="mb-4 flex w-full items-center justify-between gap-2 font-semibold text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#692ed4] focus-visible:ring-offset-2"
      >
        <span className="flex items-center gap-2">
          <List className="h-5 w-5" />
          <span>In this article</span>
        </span>
        <span aria-hidden="true" className="text-xs text-gray-500">{isOpen ? 'Hide' : 'Show'}</span>
      </button>

      <ul id={panelId} className={`space-y-2 ${isOpen ? 'block' : 'hidden'}`}>
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`block text-sm transition-colors ${item.level === 3 ? 'pl-4' : ''} ${
                activeId === item.id ? 'font-semibold text-[#692ed4]' : 'text-gray-600 hover:text-[#692ed4]'
              }`}
              onClick={(e) => {
                e.preventDefault();
                const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                document.getElementById(item.id)?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
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
