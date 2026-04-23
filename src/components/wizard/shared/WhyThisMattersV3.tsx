import React from 'react';

interface WhyThisMattersV3Props {
  title?: string;
  body?: string;
  compact?: boolean;
}

export function WhyThisMattersV3({ title, body, compact = false }: WhyThisMattersV3Props) {
  if (!body) return null;

  return (
    <section className={`border border-[#f0dfb8] bg-[linear-gradient(180deg,rgba(255,251,241,0.98),rgba(255,247,227,0.96))] ${
      compact
        ? 'rounded-[1.35rem] p-4 shadow-[0_12px_30px_rgba(173,122,28,0.07)]'
        : 'rounded-[1.7rem] p-5 shadow-[0_18px_44px_rgba(173,122,28,0.08)]'
    }`}>
      <h4 className="text-sm font-semibold text-amber-900">{title ?? 'Why this matters'}</h4>
      <p className={`mt-2 text-sm text-amber-900 ${compact ? 'leading-5' : 'leading-6'}`}>{body}</p>
    </section>
  );
}
