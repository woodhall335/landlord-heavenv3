import React from 'react';

interface AskHeavenCardV3Props {
  children: React.ReactNode;
}

export function AskHeavenCardV3({ children }: AskHeavenCardV3Props) {
  return (
    <section className="rounded-2xl border border-violet-200 bg-white p-2 shadow-[0_8px_20px_rgba(76,29,149,0.08)]">
      {children}
    </section>
  );
}
