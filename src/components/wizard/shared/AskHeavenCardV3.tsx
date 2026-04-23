import React from 'react';

interface AskHeavenCardV3Props {
  children: React.ReactNode;
  compact?: boolean;
}

export function AskHeavenCardV3({ children, compact = false }: AskHeavenCardV3Props) {
  return (
    <section className={`border border-[#e6dcff] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,243,255,0.92))] backdrop-blur-sm ${
      compact
        ? 'rounded-[1.35rem] p-1.5 shadow-[0_14px_34px_rgba(76,29,149,0.08)]'
        : 'rounded-[1.7rem] p-2 shadow-[0_22px_56px_rgba(76,29,149,0.10)]'
    }`}>
      {children}
    </section>
  );
}
