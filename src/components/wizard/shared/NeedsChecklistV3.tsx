import React from 'react';
import { RiCheckLine } from 'react-icons/ri';

interface NeedsChecklistV3Props {
  title?: string;
  items?: Array<{ label: string; optional?: boolean }>;
  compact?: boolean;
}

export function NeedsChecklistV3({ title, items, compact = false }: NeedsChecklistV3Props) {
  if (!items?.length) return null;

  return (
    <section className={`border border-[#e6dcff] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(249,244,255,0.94))] ${
      compact
        ? 'rounded-[1.35rem] p-4 shadow-[0_14px_34px_rgba(76,29,149,0.08)]'
        : 'rounded-[1.7rem] p-5 shadow-[0_22px_56px_rgba(76,29,149,0.10)]'
    }`}>
      <h4 className="text-sm font-semibold text-[#241247]">{title ?? "What you'll need"}</h4>
      <ul className={`mt-3 ${compact ? 'space-y-1.5' : 'space-y-2'}`}>
        {items.map((item) => (
          <li key={item.label} className={`text-sm text-[#34215f] ${compact ? 'leading-5' : 'leading-6'}`}>
            <RiCheckLine className="mr-2 inline h-4 w-4 text-emerald-600" />
            {item.label} {item.optional ? <span className="text-[#7a6b9f]">(optional)</span> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
