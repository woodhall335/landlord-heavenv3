import React from 'react';

interface WhyThisMattersV3Props {
  title?: string;
  body?: string;
}

export function WhyThisMattersV3({ title, body }: WhyThisMattersV3Props) {
  if (!body) return null;

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <h4 className="text-sm font-semibold text-amber-900">{title ?? 'Why this matters'}</h4>
      <p className="mt-2 text-sm text-amber-900">{body}</p>
    </section>
  );
}
