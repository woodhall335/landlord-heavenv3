import React from 'react';

interface WhyThisMattersV3Props {
  title?: string;
  body?: string;
}

export function WhyThisMattersV3({ title, body }: WhyThisMattersV3Props) {
  if (!body) return null;
  return (
    <section className="rounded-xl border border-violet-100 bg-white p-4">
      <h4 className="text-sm font-semibold text-violet-900">{title ?? 'Why this matters'}</h4>
      <p className="mt-2 text-sm text-violet-700">{body}</p>
    </section>
  );
}
