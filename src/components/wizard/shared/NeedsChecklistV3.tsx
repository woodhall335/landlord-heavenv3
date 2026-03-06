import React from 'react';
import { RiCheckLine } from 'react-icons/ri';

interface NeedsChecklistV3Props {
  title?: string;
  items?: Array<{ label: string; optional?: boolean }>;
}

export function NeedsChecklistV3({ title, items }: NeedsChecklistV3Props) {
  if (!items?.length) return null;

  return (
    <section className="rounded-2xl border border-violet-200 bg-white p-4 shadow-[0_8px_20px_rgba(76,29,149,0.08)]">
      <h4 className="text-sm font-semibold text-violet-900">{title ?? "What you'll need"}</h4>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item.label} className="text-sm text-violet-900">
            <RiCheckLine className="mr-2 inline h-4 w-4 text-emerald-600" />
            {item.label} {item.optional ? <span className="text-violet-500">(optional)</span> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
