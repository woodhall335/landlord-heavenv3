import React from 'react';

interface NeedsChecklistV3Props {
  title?: string;
  items?: Array<{ label: string; optional?: boolean }>;
}

export function NeedsChecklistV3({ title, items }: NeedsChecklistV3Props) {
  if (!items?.length) return null;
  return (
    <section className="rounded-xl border border-violet-100 bg-white p-4">
      <h4 className="text-sm font-semibold text-violet-900">{title ?? "What you'll need"}</h4>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item.label} className="text-sm text-violet-800">
            • {item.label} {item.optional ? <span className="text-violet-500">(optional)</span> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
